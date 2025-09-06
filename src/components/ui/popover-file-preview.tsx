import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DOC_TYPES,
  FILE_TYPE_LABELS,
  IMAGE_TYPES,
} from "@/constants/fileConsts";
import { cn } from "@/lib/utils";
import { Download, Eye } from "lucide-react";
import { useState } from "react";

interface FilePreviewerProps {
  href: string;
  type: string;
  title: string;
  icon?: boolean;
  children?: React.ReactNode;
  isPublic: boolean;
}

export function FilePreviewer({
  href,
  type,
  title,
  icon = true,
  children,
  isPublic = false,
}: FilePreviewerProps) {
  const [open, setOpen] = useState(false);
  const isImage = IMAGE_TYPES.includes(type);
  const isDoc = DOC_TYPES.includes(type);

  return (
    <>
      {icon ? (
        <Eye
          className="mx-auto size-4 cursor-pointer text-blue-600 opacity-70 transition hover:scale-110 hover:opacity-100"
          onClick={() => setOpen(true)}
        />
      ) : (
        <div
          className="mx-auto flex cursor-pointer items-center gap-1 truncate"
          onClick={() => setOpen(true)}
        >
          {children}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={cn(
            "flex h-[90dvh] w-[95vw] max-w-full flex-col gap-0 bg-background p-0",
            isImage && "h-fit w-fit",
          )}
          closeBtnClassName="opacity-100 bg-card "
        >
          <DialogTitle className="sr-only">File Preview</DialogTitle>
          <div className="flex-1">
            {type.startsWith("image/") ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={href}
                  alt="Preview"
                  className="max-h-[90dvh] max-w-full object-contain"
                />
              </>
            ) : type === "application/pdf" ? (
              <iframe
                src={`${href}#zoom=page-width`}
                className="scrollable mini h-full w-full"
                title="PDF Preview"
              />
            ) : isDoc ? (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                  href,
                )}`}
                className="h-full w-full"
                title={FILE_TYPE_LABELS[type] ?? "Office Preview"}
              />
            ) : (
              <p className="p-4 text-center text-muted-foreground">
                Preview not supported for
                <b>{FILE_TYPE_LABELS[type] ?? ` this file type: "${type}"`}</b>
              </p>
            )}
          </div>

          {isPublic && (
            <div className="flex min-h-12 w-full justify-end gap-2 bg-[#3c3c3c] px-4 py-2">
              <Button variant="salWithShadowHidden" type="button">
                <a
                  href={href}
                  download={title}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download
                    className={cn(
                      "mx-auto size-4 cursor-pointer hover:scale-110 active:scale-95",
                    )}
                  />
                </a>
              </Button>
              <DialogClose asChild>
                <Button variant="salWithShadowHidden" type="button">
                  Close Preview
                </Button>
              </DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
