"use client";

import { Button } from "@/components/ui/button";
import { CropModal } from "@/components/ui/crop-modal";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

type AvatarUploaderProps = {
  onChange: (base64Image: string) => void;
  initialImage?: string;
};

export default function AvatarUploader({
  onChange,
  initialImage,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageForCropping, setImageForCropping] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(
    initialImage ?? null,
  );
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(
    initialImage ?? null,
  );

  const [editMode, setEditMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const openCropperWithFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setOriginalImage(objectUrl);
    setImageForCropping(objectUrl);
    setEditMode(true);
  };

  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    if (url) {
      setOriginalImage(url);
      setImageForCropping(url);
      setEditMode(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) openCropperWithFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) openCropperWithFile(file);
  };

  const handleSaveCropped = async (blob: Blob) => {
    const base64 = await blobToBase64(blob);
    setCroppedPreviewUrl(base64); // for the UI
    onChange(base64); // send to react-hook-form
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div
          className={`relative flex size-20 items-center justify-center rounded-full border-2 border-dashed ${
            dragActive ? "border-emerald-400 bg-emerald-50" : ""
          } hover:cursor-pointer`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {croppedPreviewUrl ? (
            <Image
              src={croppedPreviewUrl}
              alt="Avatar preview"
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <span className="text-sm text-gray-400">+ Upload</span>
          )}

          <div className="absolute right-0 top-4 flex size-6 translate-x-[45%] items-center justify-center overflow-hidden rounded-full border-1.5 bg-emerald-500 hover:scale-110 hover:cursor-pointer hover:bg-emerald-400 active:scale-95">
            <PlusIcon className="size-4 text-white" />
          </div>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="urlInput"
            className="text-xs font-medium text-gray-600"
          >
            or paste image URL
          </label>
          <input
            id="urlInput"
            type="url"
            placeholder="https://example.com/image.jpg"
            onBlur={handleUrlInput}
            className="w-64 rounded-md border px-2 py-1 text-sm shadow-sm focus:border-emerald-400 focus:outline-none"
          />
          <Button
            variant="salWithShadow"
            onClick={() => {
              if (originalImage) {
                setImageForCropping(originalImage);
                setEditMode(true);
              }
            }}
          >
            Edit
          </Button>
        </div>
      </div>

      {imageForCropping && editMode && (
        <CropModal
          imageSrc={imageForCropping}
          onClose={() => {
            setEditMode(false);
            setImageForCropping(null);
          }}
          onSave={handleSaveCropped}
        />
      )}
    </>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
