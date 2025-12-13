import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { syncSacData } from "@/lib/jobs/syncSacData";

export const maxDuration = 60;

export async function GET() {
  const hdrs = await headers();
  const key = hdrs.get("x-cron-key");

  if (!key || key !== process.env.SAC_CRON_KEY) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await syncSacData();

  return NextResponse.json({ ok: true });
}
