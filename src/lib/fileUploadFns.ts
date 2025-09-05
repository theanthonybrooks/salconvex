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
  }

  return { logoStorageId, timezone, timezoneOffset };
}

export async function handleOrgFileUrl({
  data,
  generateUploadUrl,
}: {
  data: {
    files?: (Blob | string | null)[];
  };
  generateUploadUrl: () => Promise<string>;
}) {
  const uploadedFiles: {
    storageId: Id<"_storage">;
    fileName: string;
    lastModified: number;
    fileSize: number;
    fileType: string;
  }[] = [];

  if (!data.files?.length) return [];

  for (const file of data.files) {
    if (!file || typeof file === "string" || !(file instanceof File)) continue;

    try {
      const uploadUrl = await generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        toast.error(`Failed to upload file: ${file.name}`, {
          autoClose: 2000,
          pauseOnHover: false,
          hideProgressBar: true,
        });
        continue;
      }

      const { storageId } = await uploadRes.json();

      uploadedFiles.push({
        storageId,
        fileName: file.name,
        lastModified: file.lastModified,
        fileSize: file.size,
        fileType: file.type,
      });
      // console.log(uploadedFiles);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(
        `Error uploading file: ${file instanceof File ? file.name : "unknown"}`,
        {
          autoClose: 2000,
          pauseOnHover: false,
          hideProgressBar: true,
        },
      );
    }
  }

  return uploadedFiles;
}
