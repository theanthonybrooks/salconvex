import chromium from "@sparticuz/chromium";

import { api } from "~/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

export const dynamic = "force-dynamic";

type SacApiItem = {
  id: string;
  dataCollectionId: string;
  data: {
    _id: string;
    _owner: string;
    festivalName: string;
    slug: string;
    about: string;
    city?: string;
    country: string;
    openCallDeadLine?: {
      $date: string;
    };
    email?: string;
    websiteUrl?: string;
    applyHere?: string;
    accommodation?: string;
    materials?: string;
    transportation?: string;
    festivalDate?: string;
    nutritions?: string;
    artistFeeHonorarium?: string;

    "link-festival-list-festivalName": string;
    _updatedDate?: { $date: string };
    _createdDate: { $date: string };
  };
};

type SacApiResponse = {
  dataItems: SacApiItem[];
  pagingMetadata: {
    count: number;
    offset: number;
    total: number;
    tooManyToCount: boolean;
    cursors: Record<string, unknown>;
    hasNext: boolean;
  };
};

export async function syncSacData(): Promise<SacApiResponse> {
  const isDev = process.env.NODE_ENV !== "production";

  const puppeteer = isDev
    ? (await import("puppeteer")).default
    : (await import("puppeteer-core")).default;

  const browser = await (isDev
    ? puppeteer.launch({
        headless: true,
      })
    : puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      }));

  const page = await browser.newPage();

  let resolveCapturedData!: (value: SacApiResponse) => void;

  const capturedDataPromise = new Promise<SacApiResponse>((resolve) => {
    resolveCapturedData = resolve;
  });

  page.on("response", async (response) => {
    const url = response.url();

    if (url.includes("/_api/cloud-data/v2/items/query")) {
      try {
        const json = (await response.json()) as SacApiResponse;
        resolveCapturedData(json);
      } catch {
        // ignore
      }
    }
  });

  await page.goto("https://www.streetartcalls.com/festival-list", {
    waitUntil: "networkidle0",
    timeout: 15_000,
  });

  const capturedData = await capturedDataPromise;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  await browser.close();

  if (!capturedData) {
    throw new Error("Failed to capture StreetArtCalls data");
  }

  const items = (capturedData.dataItems ?? []).map((item) => {
    const d = item.data;
    const openCallDeadline = d.openCallDeadLine?.$date ?? "";
    const isPastDeadline = Date.now() > Date.parse(openCallDeadline);
    const hasOpenCall = d.applyHere !== undefined;

    const openCallData = {
      past: isPastDeadline,
      deadline: openCallDeadline,
      applicationLink: d.applyHere ?? "",
      provided: {
        food: d.nutritions !== undefined ? d.nutritions : false,
        artistFee:
          d.artistFeeHonorarium !== undefined ? d.artistFeeHonorarium : false,
        transportation:
          d.transportation !== undefined ? d.transportation : false,
        accommodation: d.accommodation !== undefined ? d.accommodation : false,
        materials: d.materials !== undefined ? d.materials : false,
      },
    };

    return {
      sacId: d._id,
      dataCollectionId: item.dataCollectionId,
      location: {
        city: d.city ?? "",
        country: d.country,
      },
      event: {
        name: d.festivalName,
        slug: d.slug,
        about: d.about,
        date: d.festivalDate ?? "",
      },
      openCall: hasOpenCall ? openCallData : undefined,
      contact: {
        email: d.email ?? "",
        website: d.websiteUrl ?? "",
      },
      createdAt: d._createdDate.$date,
      updatedAt: d._updatedDate?.$date,
    };
  });

  await fetchMutation(api.sac.sacData.upsertManyBySacId, { items });

  return capturedData;
}
