import type { RecapData } from "@/app/render/recap/recap-render-client";

import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { events, displayRange, source, fontSize } = await req.json();

    // if (!events?.length) {
    //   return NextResponse.json(
    //     { error: "No events provided" },
    //     { status: 400 },
    //   );
    // }
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      throw new Error("Missing NEXT_PUBLIC_SITE_URL");
    }

    const isDev = process.env.NODE_ENV !== "production";
    const puppeteer = isDev
      ? (await import("puppeteer")).default
      : (await import("puppeteer-core")).default;

    let browser;
    try {
      browser = await (isDev
        ? puppeteer.launch({
            headless: true,
            defaultViewport: {
              width: 1000,
              height: 1400,
              deviceScaleFactor: 2,
            },
          })
        : puppeteer.launch({
            args: chromium.args,
            defaultViewport: {
              width: 1000,
              height: 1400,
              deviceScaleFactor: 2,
            },
            executablePath: (await chromium.executablePath()) || undefined,
            headless: true,
          }));
    } catch (err) {
      throw new Error("Failed to launch Puppeteer: " + (err as Error).message);
    }

    const page = await browser.newPage();
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/render/recap?token=render-token`;

    try {
      const payload = JSON.parse(
        JSON.stringify({ events, displayRange, source, fontSize }),
      );
      await page.evaluateOnNewDocument((data: RecapData) => {
        (window as unknown as { __RECAP_DATA__: RecapData }).__RECAP_DATA__ =
          data;
      }, payload);
    } catch (err) {
      await browser.close();
      throw new Error(
        "Failed to inject data into page: " + (err as Error).message,
      );
    }
    // Navigate to your actual Next.js render page
    try {
      await page.goto(url, { waitUntil: "networkidle0" });
    } catch (err) {
      await browser.close();
      throw new Error(
        "Failed to load /render/recap: " + (err as Error).message,
      );
    }

    try {
      await page.waitForSelector('[id^="recap-"]', { timeout: 30000 });
    } catch (err) {
      await browser.close();
      throw new Error(
        "Timed out waiting for recap elements" + (err as Error).message,
      );
    }

    let ids: string[];
    try {
      ids = await page.$$eval('[id^="recap-"]', (els) =>
        els.map((el) => (el as HTMLElement).id),
      );
    } catch (err) {
      await browser.close();
      throw new Error(
        "Failed to collect recap element IDs" + (err as Error).message,
      );
    }

    const zip = new JSZip();

    for (const id of ids) {
      const el = await page.$(`#${id}`);
      if (!el) continue;
      const buffer = await el.screenshot({ type: "jpeg", quality: 95 });
      zip.file(`${id}.jpg`, buffer);
    }

    await browser.close();
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Always create a real ArrayBuffer
    const arrayBuffer = new ArrayBuffer(zipBuffer.byteLength);
    const view = new Uint8Array(arrayBuffer);
    view.set(zipBuffer);

    // Now arrayBuffer is guaranteed to be a plain ArrayBuffer
    const safeDisplayRange = displayRange.replace(/[^\x00-\x7F]/g, "-");

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeDisplayRange}-recap.zip"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to generate screenshots" },
      { status: 500 },
    );
  }
}
