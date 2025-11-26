"use client";

import type { PostSettings } from "@/app/(pages)/(artist)/thelist/components/OpenCallSocials";

import { Dispatch, SetStateAction } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectSimple } from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";

const fontSizeOptions = [
  { label: "12 px", value: "12" },
  { label: "14 px", value: "14" },
  { label: "16 px", value: "16" },
  { label: "18 px", value: "18" },
  { label: "20 px", value: "20" },
  { label: "22 px", value: "22" },
  { label: "24 px", value: "24" },
  { label: "26 px", value: "26" },
  { label: "28 px", value: "28" },
  { label: "30 px", value: "30" },
  { label: "32 px", value: "32" },
  { label: "34 px", value: "34" },
  { label: "36 px", value: "36" },
  { label: "38 px", value: "38" },
  { label: "40 px", value: "40" },
  { label: "42 px", value: "42" },
  { label: "44 px", value: "44" },
  { label: "46 px", value: "46" },
  { label: "48 px", value: "48" },
];

type PostOptionDialogProps = {
  onChangeAction: (props: Partial<PostSettings>) => void;
  settings: PostSettings;
  className?: string;
  open: boolean;
  setOpenAction: Dispatch<SetStateAction<boolean>>;
};

export const PostOptionDialog = ({
  onChangeAction,
  settings,
  className,
  open,
  setOpenAction,
}: PostOptionDialogProps) => {
  const { fontSize, budget } = settings;
  return (
    <Dialog open={open} onOpenChange={setOpenAction}>
      <DialogContent
        className={cn(
          "w-full bg-card sm:max-h-[80dvh] sm:max-w-fit",
          className,
        )}
        overlayClassName="hidden"
      >
        <DialogHeader>
          <DialogTitle>Post Options</DialogTitle>
        </DialogHeader>
        <div className="flex w-full items-center justify-center gap-4">
          {/* Font Size Control */}
          <div className="min-w-40">
            <label className="mb-1 block text-sm font-medium">
              Title Font Size
            </label>
            <SelectSimple
              options={fontSizeOptions}
              value={String(fontSize)}
              onChangeAction={(val) =>
                onChangeAction({ fontSize: parseInt(val, 10) })
              }
              placeholder="Select font size"
            />
          </div>

          {/* Budget Control */}
          <div className="min-w-40">
            <label className="mb-1 block text-sm font-medium">Budget</label>
            <SelectSimple
              options={[
                { label: "Hide", value: "false" },
                { label: "Show", value: "true" },
              ]}
              value={String(budget)}
              onChangeAction={(val) =>
                onChangeAction({ budget: val === "true" })
              }
              placeholder="Select budget"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
