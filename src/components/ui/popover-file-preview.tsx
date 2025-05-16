import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { useState } from "react";

export function FilePreviewer({ href, type }: { href: string; type: string }) {
  const [open, setOpen] = useState(false);
  const isImage = type?.startsWith("image/");
  return (
    <>
      <Eye
        className="mx-auto size-4 cursor-pointer text-blue-600 opacity-70 transition hover:scale-110 hover:opacity-100"
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "h-[90dvh] w-[90vw] max-w-full bg-background p-0",
            isImage && "h-fit w-fit",
          )}
        >
          <DialogTitle className="sr-only">File Preview</DialogTitle>
          {type.startsWith("image/") ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={href}
                alt="Preview"
                className="max-h-full max-w-full object-contain"
              />
            </>
          ) : type === "application/pdf" ? (
            <iframe
              src={href}
              className="h-full w-full"
              title="PDF Preview"
              frameBorder="0"
            />
          ) : (
            <p className="p-4 text-center text-muted-foreground">
              Preview not supported
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
