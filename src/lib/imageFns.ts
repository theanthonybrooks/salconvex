import { Area } from "react-easy-crop";

export async function getCroppedImg(
  imageSrc: string,
  cropArea: Area,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const { width, height, x, y } = cropArea;
  canvas.width = width;
  canvas.height = height;

  ctx?.drawImage(image, x, y, width, height, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas is empty"));
    }, "image/jpeg");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
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
): Promise<string> {
  const image = await createImage(imageSrc);

  const size = Math.max(image.width, image.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, size, size);

  const offsetX = (size - image.width) / 2;
  const offsetY = (size - image.height) / 2;
  ctx.drawImage(image, offsetX, offsetY);

  return canvas.toDataURL("image/jpeg");
}
