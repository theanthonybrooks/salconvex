"use client";

import { Dispatch, SetStateAction } from "react";

import { ColorPicker } from "@/components/ui/color-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectSimple } from "@/components/ui/select";
import { cn } from "@/helpers/utilsFns";

interface PostPropertiesDashboardProps {
  fontSize: number;
  bgColor: string;
  budget: boolean;
  onChange: (props: {
    fontSize?: number;
    bgColor?: string;
    budget?: boolean;
  }) => void;
  className?: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const fontSizeOptions = [
  { label: "12 px", value: "12" },
  { label: "14 px", value: "14" },
  { label: "16 px", value: "16" },
  { label: "18 px", value: "18" },
  { label: "20 px", value: "20" },
  { label: "24 px", value: "24" },
  { label: "26 px", value: "26" },
  { label: "28 px", value: "28" },
  { label: "30 px", value: "30" },
  { label: "32 px", value: "32" },
  { label: "34 px", value: "34" },
  { label: "36 px", value: "36" },
];

export const PostPropertiesDashboard = ({
  fontSize,
  bgColor,
  budget,
  onChange,
  className,
  open,
  setOpen,
}: PostPropertiesDashboardProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn("max-w-lg bg-card sm:-translate-x-3", className)}
        overlayClassName="hidden"
      >
        <DialogHeader>
          <DialogTitle>Post Properties</DialogTitle>
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
                onChange({ fontSize: parseInt(val, 10) })
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
              onChangeAction={(val) => onChange({ budget: val === "true" })}
              placeholder="Select budget"
            />
          </div>
        </div>

        {/* Background Color Control */}
        <ColorPicker
          selectedColor={bgColor}
          setSelectedColorAction={(newColor) => {
            onChange({ bgColor: newColor });
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
