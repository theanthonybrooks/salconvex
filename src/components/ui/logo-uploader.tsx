"use client";

import { Button } from "@/components/ui/button";
import { CropModal } from "@/components/ui/crop-modal";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type AvatarUploaderProps = {
  // onChange: (base64Image: string) => void;
  onChange: (imageBlob: Blob) => void;
  onRemove?: () => void;
  initialImage?: string;
  title?: string;
  required?: boolean;
  imageOnly?: boolean;
  className?: string;
  reset?: boolean;
  size?: number;
};

export default function AvatarUploader({
  reset,
  onChange,
  onRemove,
  initialImage,
  className,
  title,
  required,
  size = 80,
  imageOnly = false,
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
    onChange(blob); // send to react-hook-form
  };

  const handleReset = () => {
    setImageForCropping(null);
    setOriginalImage(null);
    setCroppedPreviewUrl(null);
  };

  useEffect(() => {
    if (initialImage) {
      setImageForCropping(initialImage);
      setOriginalImage(initialImage);
      setCroppedPreviewUrl(initialImage);
    }
  }, [initialImage]);

  useEffect(() => {
    if (reset) {
      handleReset();
    }
  }, [reset]);

  return (
    <>
      <div className={cn("flex items-center gap-6", className)}>
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full border-1.5 hover:cursor-pointer hover:bg-salYellow/50",
            dragActive && "border-emerald-400 bg-emerald-50",
            imageForCropping ? "border-solid" : "border-dashed",
          )}
          style={{ height: size, width: size }}
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
              width={size}
              height={size}
              className="rounded-full object-cover"
            />
          ) : (
            <span className="text-sm text-gray-400">+ Upload</span>
          )}

          <div className="absolute bottom-0 right-3 flex size-5 translate-x-[45%] items-center justify-center overflow-hidden rounded-full border-1.5 bg-emerald-500 hover:scale-110 hover:cursor-pointer hover:bg-emerald-400 active:scale-95">
            <PlusIcon className="size-4 text-white" />
          </div>
        </div>
        {!imageOnly && (
          <div className="flex flex-col gap-3">
            <p>
              {title}{" "}
              <span className="text-xs italic text-muted-foreground">
                {required ? "(required)" : "(optional)"}
              </span>
            </p>

            {!imageForCropping && !originalImage && (
              <div className="flex flex-col gap-3">
                <label
                  htmlFor="urlInput"
                  className="text-xs font-medium text-gray-600"
                >
                  Upload image or paste image URL
                </label>
                <input
                  id="urlInput"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onBlur={handleUrlInput}
                  className="w-64 rounded-md border px-2 py-1 text-sm shadow-sm focus:border-emerald-400 focus:outline-none"
                />
              </div>
            )}
            {(imageForCropping || originalImage) && (
              <div className="flex w-max items-center gap-2">
                <Button
                  variant="salWithShadowHidden"
                  onClick={() => {
                    if (originalImage) {
                      setImageForCropping(originalImage);
                      setEditMode(true);
                    }
                  }}
                  className="w-40"
                >
                  Edit
                </Button>
                <Button
                  variant="salWithShadowHidden"
                  onClick={() => {
                    if (originalImage) {
                      handleReset();
                      onRemove?.();
                    }
                  }}
                  className="flex-1 bg-destructive/50"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        )}
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
