import chromium from "@sparticuz/chromium";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  const isDev = process.env.NODE_ENV !== "production";

  const browser = await (isDev
    ? puppeteer.launch({
        headless: true,
        defaultViewport: { width: 500, height: 625, deviceScaleFactor: 2 },
      })
    : puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: { width: 500, height: 625, deviceScaleFactor: 2 },
        executablePath: await chromium.executablePath(),
        headless: true,
      }));

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });

  const element = await page.$("#post-root");
  if (!element) {
    await browser.close();
    return NextResponse.json({ error: "No #post-root found" }, { status: 404 });
  }

  const buffer = await element.screenshot({ type: "jpeg", quality: 95 });

  await browser.close();

  return new NextResponse(Buffer.from(buffer), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": "inline; filename=post.jpg",
    },
  });
}
