import { notFound } from "next/navigation";
import RecapRenderClient from "@/app/render/recap/recap-render-client";

export default async function RecapRenderPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  if (params.token !== "render-token") {
    notFound();
  }

  return <RecapRenderClient />;
}
