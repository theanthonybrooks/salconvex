import { toast } from "react-toastify";
import { Id } from "~/convex/_generated/dataModel";

export async function handleFileUrl({
  data,
  generateUploadUrl,
  getTimezone,
}: {
  data: {
    logo?: Blob | string | null;
    location?: { coordinates?: { latitude: number; longitude: number } };
  };
  generateUploadUrl: () => Promise<string>;
  getTimezone: (args: { latitude: number; longitude: number }) => Promise<{
    zoneName?: string;
    gmtOffset?: number;
  }>;
}) {
  let logoUrl = "/1.jpg";
  let logoStorageId: Id<"_storage"> | undefined;
  let timezone: string | undefined;
  let timezoneOffset: number | undefined;

  if (data.location?.coordinates) {
    const tz = await getTimezone({
      latitude: data.location.coordinates.latitude,
      longitude: data.location.coordinates.longitude,
    });
    timezone = tz?.zoneName;
    timezoneOffset = tz?.gmtOffset;
  }

  if (data.logo && typeof data.logo !== "string") {
    const uploadUrl = await generateUploadUrl();
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": data.logo.type },
      body: data.logo,
    });

    if (!uploadRes.ok) {
      toast.error("Failed to upload logo", {
        autoClose: 2000,
        pauseOnHover: false,
        hideProgressBar: true,
      });
      return null;
    }

    const { storageId } = await uploadRes.json();
    logoStorageId = storageId;
  } else if (data.logo && typeof data.logo === "string") {
    logoUrl = data.logo;
  }

  return { logoUrl, logoStorageId, timezone, timezoneOffset };
}
