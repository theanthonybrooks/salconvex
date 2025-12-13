// app/api/admin/sac-fetch/route.ts
import { NextResponse } from "next/server";

import { syncSacData } from "@/lib/jobs/syncSacData";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "~/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function POST() {
  const token = await convexAuthNextjsToken();

  const isAdmin = await fetchQuery(api.users.isAdmin, {}, { token });

  if (!isAdmin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const data = await syncSacData();
  return NextResponse.json(data);
}
