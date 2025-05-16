import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export function LightboxGallery({
  images,
}: {
  images: { title: string; href: string }[];
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex !== null ? images[selectedIndex] : null;

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) =>
          prev !== null ? (prev + 1) % images.length : null,
        );
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) =>
          prev !== null ? (prev - 1 + images.length) % images.length : null,
        );
      } else if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, images.length]);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedIndex(i);
            }}
            className="focus:outline-none"
          >
            <Image
              src={img.href}
              alt={img.title}
              width={200}
              height={200}
              className="h-40 w-60 rounded object-cover shadow transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={() => setSelectedIndex(null)}
      >
        <DialogContent
          onPointerDownOutside={() => {
            console.log("clicky");
            setSelectedIndex(null);
          }}
          onInteractOutside={() => {
            console.log("clicky");
            setSelectedIndex(null);
          }}
          className="max-w-fit bg-card shadow-xl"
        >
          <div className="relative h-full max-h-[90vh] w-full max-w-[90vw] rounded">
            <DialogTitle className="sr-only">{selected?.title}</DialogTitle>

            {selected && (
              <>
                <Image
                  src={selected.href}
                  alt={selected.title}
                  width={800}
                  height={800}
                  className="max-h-[80vh] max-w-full object-contain"
                />
                <div className="mt-2 text-center text-sm">{selected.title}</div>
                {images.length > 1 && (
                  <>
                    <button
                      className="absolute -left-1 bottom-1 translate-y-1/2 hover:scale-110 active:scale-95"
                      onClick={() =>
                        setSelectedIndex((prev) =>
                          prev !== null
                            ? (prev - 1 + images.length) % images.length
                            : 0,
                        )
                      }
                    >
                      <ArrowLeft />
                    </button>
                    <button
                      className="absolute -right-1 bottom-1 translate-y-1/2 hover:scale-110 active:scale-95"
                      onClick={() =>
                        setSelectedIndex((prev) =>
                          prev !== null ? (prev + 1) % images.length : 0,
                        )
                      }
                    >
                      <ArrowRight />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
