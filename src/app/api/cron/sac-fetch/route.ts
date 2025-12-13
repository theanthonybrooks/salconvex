import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { syncSacData } from "@/lib/jobs/syncSacData";

export const maxDuration = 60;

export async function GET() {
  const hdrs = await headers();
  const auth = hdrs.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await syncSacData();

  return NextResponse.json({ ok: true });
}
