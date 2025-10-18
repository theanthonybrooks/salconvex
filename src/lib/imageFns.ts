import { Area } from "react-easy-crop";

export function waitForImagesToLoad(nodes: HTMLElement[]): Promise<void> {
  const images = nodes.flatMap((node) =>
    Array.from(node.querySelectorAll("img")),
  );
  if (images.length === 0) return Promise.resolve();

  const promises = images.map((img) => {
    if (img.complete && img.naturalWidth !== 0) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  });

  // Wait for all images
  return Promise.all(promises).then(() => {});
}

export async function getCroppedImg(
  imageSrc: string,
  cropArea: Area,
  targetSize: number = 256,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const { width, height, x, y } = cropArea;

  const aspectRatio = width / height;
  let outputWidth = targetSize;
  let outputHeight = targetSize;

  if (aspectRatio > 1) {
    outputHeight = targetSize / aspectRatio;
  } else {
    outputWidth = targetSize * aspectRatio;
  }
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx?.drawImage(image, x, y, width, height, 0, 0, outputWidth, outputHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas is empty"));
    }, "image/jpeg");
  });
}

export async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

export async function padImageToSquare(
  imageSrc: string,
  backgroundColor: string = "#ffffff",
  paddingSize: number = 100,
): Promise<string> {
  const image = await createImage(imageSrc);

  const baseSize = Math.max(image.width, image.height);
  const paddedSize = baseSize + paddingSize;

  const canvas = document.createElement("canvas");
  canvas.width = paddedSize;
  canvas.height = paddedSize;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, paddedSize, paddedSize);

  const offsetX = (paddedSize - image.width) / 2;
  const offsetY = (paddedSize - image.height) / 2;
  ctx.drawImage(image, offsetX, offsetY);

  return canvas.toDataURL("image/jpeg");
}

export async function fetchImageAsObjectURL(url: string): Promise<{
  objectUrl: string;
  blob: Blob;
}> {
  try {
    const response = await fetch(url, { mode: "cors" });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();

    if (!blob.type.startsWith("image/")) {
      throw new Error("URL does not point to a valid image.");
    }

    const objectUrl = URL.createObjectURL(blob);

    return { objectUrl, blob };
  } catch (error) {
    console.error("Image fetch error:", error);
    throw error;
  }
}
