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
              restrictPosition={true}
            />
          )}
        </div>

        <div className="mt-4 flex flex-col items-center">
          <label htmlFor="zoom" className="mb-1 text-sm text-foreground">
            Zoom
          </label>
          <DiscreteSlider
            value={zoom}
            onChange={setZoom}
            marks={[
              { value: 1, label: "Original" },
              { value: 2.5, label: "2.5x" },
              { value: 5, label: "5x" },
              { value: 10, label: "10x" },
            ]}
            step={0.1}
            min={1}
            max={10}
            prefix=""
            suffix="x"
            label="Zoom"
            width={200}
            labelDisplay="auto"
            className="w-full max-w-[80%]"
          />
        </div>
        <div className="flex items-center justify-center gap-x-3">
          <label htmlFor="color" className="mb-1 text-sm text-foreground">
            Background Color
          </label>
          <input
            id="color"
            type="color"
            value={paddingColor}
            onChange={(e) => setPaddingColor(e.target.value)}
            className="size-10 w-full max-w-40 cursor-pointer rounded-md border border-foreground px-2 py-1 text-sm shadow-sm focus:outline-none"
          />
        </div>
        <div className="mt-4 flex justify-between">
          <Button type="button" variant="salWithShadowPink" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} variant="salWithShadowYlw">
            Crop & Save
          </Button>
        </div>
      </div>
    </div>
  );
}
