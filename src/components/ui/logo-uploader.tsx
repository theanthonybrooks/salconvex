"use client";

import { Button } from "@/components/ui/button";
import { CropModal } from "@/components/ui/crop-modal";
import { fetchImageAsObjectURL } from "@/lib/imageFns";
import { cn } from "@/lib/utils";
import { LoaderCircle, PlusIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

type AvatarUploaderProps = {
  // onChange: (base64Image: string) => void;
  id: string;
  onChange: (imageBlob: Blob) => void;
  onRemove?: () => void;
  initialImage?: string;
  imageOnly?: boolean;
  className?: string;
  reset?: boolean;
  size?: number;
  disabled?: boolean;
  tabIndex?: number;
  loading?: boolean;
};

export default function AvatarUploader({
  id,
  reset,
  onChange,
  onRemove,
  initialImage,
  className,
  tabIndex,
  disabled,
  size = 80,
  imageOnly = false,
  loading = false,
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

  const handleUrlInput = async (rawUrl: string) => {
    const url = rawUrl.trim();
    if (!url) return;

    try {
      const { objectUrl } = await fetchImageAsObjectURL(url);
      setOriginalImage(objectUrl);
      setImageForCropping(objectUrl);
      setEditMode(true);
    } catch (error) {
      console.error("Failed to fetch image:", error);
      toast.error(
        "Could not load image from URL. Make sure it's a valid, public image",
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) openCropperWithFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
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
    if (reset && !!croppedPreviewUrl) {
      handleReset();
    }
  }, [reset, croppedPreviewUrl]);

  return (
    <>
      <div className={cn("flex items-center gap-6", className)}>
        <div
          className={cn(
            "relative flex shrink-0 cursor-pointer items-center justify-center rounded-full border-1.5 hover:bg-salYellow/50 focus:bg-salYellow/50 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1",
            dragActive && "border-emerald-400 bg-emerald-50",
            imageForCropping ? "border-solid" : "border-dashed",
            disabled &&
              "cursor-default text-muted-foreground hover:bg-transparent",
          )}
          style={{ height: size, width: size }}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={tabIndex}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
        >
          <input
            id={id}
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />

          {croppedPreviewUrl ? (
            <Image
              src={croppedPreviewUrl}
              alt="Avatar preview"
              width={size}
              height={size}
              className="rounded-full bg-card object-cover"
            />
          ) : (
            <span className="text-center text-sm text-gray-400">+ Upload</span>
          )}

          <div
            className={cn(
              "absolute bottom-0 right-3 flex size-5 translate-x-[45%] cursor-pointer items-center justify-center overflow-hidden rounded-full border-1.5 bg-emerald-500 hover:scale-110 hover:bg-emerald-400 active:scale-95",
              disabled &&
                "cursor-default bg-muted-foreground hover:scale-100 hover:bg-muted-foreground",
            )}
          >
            <PlusIcon className="size-4 text-white" />
          </div>
        </div>
        {!imageOnly && (
          <>
            {!imageForCropping && !originalImage && (
              <div className="flex flex-col gap-3">
                <label
                  htmlFor="urlInput"
                  className={cn(
                    "text-xs font-medium text-foreground",
                    disabled && "text-muted-foreground",
                  )}
                >
                  Upload image or paste image URL
                </label>
                <input
                  id="urlInput"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onBlur={(e) => handleUrlInput(e.target.value)}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text");
                    handleUrlInput(pasted);
                  }}
                  className="rounded-md border bg-card px-2 py-1 text-sm shadow-sm focus:border-emerald-400 focus:outline-none disabled:border-muted-foreground disabled:text-muted-foreground lg:w-64"
                  disabled={disabled}
                  tabIndex={tabIndex ? tabIndex + 1 : -1}
                />
              </div>
            )}
            {(imageForCropping || originalImage) && (
              <div className="flex w-full items-center gap-2">
                <Button
                  type="button"
                  variant="salWithShadowHidden"
                  onClick={() => {
                    if (originalImage) {
                      setImageForCropping(originalImage);
                      setEditMode(true);
                    }
                  }}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="flex flex-row items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                  ) : (
                    `Edit`
                  )}
                </Button>
                <Button
                  type="button"
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
          </>
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
