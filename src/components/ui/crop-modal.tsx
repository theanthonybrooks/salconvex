import { getCroppedImg } from "@/lib/imageFns";
import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

type CropModalProps = {
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedImage: Blob) => void;
};

export function CropModal({ imageSrc, onClose, onSave }: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    onSave(croppedImage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-[90vw] max-w-md rounded-md bg-white p-4 shadow-xl">
        <div className="relative h-64 w-full bg-gray-200">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="mt-4 flex justify-between">
          <button onClick={onClose} className="rounded bg-gray-300 px-3 py-1">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-emerald-500 px-3 py-1 text-white"
          >
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
}
