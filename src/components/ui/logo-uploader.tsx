"use client";

import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

export default function AvatarUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative flex size-20 items-center justify-center rounded-full border-2 border-dashed ${
          dragActive ? "border-emerald-400 bg-emerald-50" : ""
        } hover:cursor-pointer`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <Image
            src={previewUrl}
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
        <label htmlFor="urlInput" className="text-xs font-medium text-gray-600">
          or paste image URL
        </label>
        <input
          id="urlInput"
          type="url"
          placeholder="https://example.com/image.jpg"
          onChange={(e) => setPreviewUrl(e.target.value)}
          className="w-64 rounded-md border px-2 py-1 text-sm shadow-sm focus:border-emerald-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
