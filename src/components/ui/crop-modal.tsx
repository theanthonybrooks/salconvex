import { Button } from "@/components/ui/button";
import DiscreteSlider from "@/components/ui/slider";
import { getCroppedImg, padImageToSquare } from "@/lib/imageFns";
import { useCallback, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

type CropModalProps = {
  imageSrc: string;
  onClose: () => void;
  onSave: (croppedImage: Blob) => void;
};

export function CropModal({ imageSrc, onClose, onSave }: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [paddedImage, setPaddedImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [paddingColor, setPaddingColor] = useState("#ffffff");

  const onCropComplete = useCallback((_: Area, croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels || !paddedImage) return;
    const croppedImage = await getCroppedImg(paddedImage, croppedAreaPixels);
    onSave(croppedImage);
    onClose();
  };

  useEffect(() => {
    padImageToSquare(imageSrc, paddingColor).then(setPaddedImage);
  }, [imageSrc, paddingColor]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-[90vw] max-w-md rounded-md bg-white p-4 shadow-xl">
        <div className="relative h-64 w-full bg-gray-200">
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="h-64 w-64 rounded-full border-2 shadow-inner" />
          </div>
          {paddedImage && (
            <Cropper
              image={paddedImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              restrictPosition={false}
            />
          )}
        </div>
        <input
          type="color"
          value={paddingColor}
          onChange={(e) => setPaddingColor(e.target.value)}
          className="mt-4 size-6 w-full rounded-full"
        />
        <div className="mt-4 flex flex-col items-center">
          <label htmlFor="zoom" className="mb-1 text-sm text-foreground">
            Zoom
          </label>
          <DiscreteSlider
            value={zoom}
            onChange={setZoom}
            marks={[
              { value: 1, label: "1x" },

              { value: 100, label: "2x" },
            ]}
            step={0.1}
            prefix=""
            suffix="x"
            label="Zoom"
            width={200}
            labelDisplay="auto"
          />
        </div>
        <div className="mt-4 flex justify-between">
          <Button variant="salWithShadowPink" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="salWithShadowYlw">
            Crop & Save
          </Button>
        </div>
      </div>
    </div>
  );
}
