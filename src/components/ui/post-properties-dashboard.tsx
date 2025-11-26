"use client";

import type { PostSettings } from "@/app/(pages)/(artist)/thelist/components/OpenCallSocials";
import type { Swatch } from "@/components/ui/color-picker2";

import { Dispatch, SetStateAction } from "react";

import GradientColorPicker from "@/components/ui/color-picker2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/helpers/utilsFns";

interface PostPropertiesDashboardProps {
  bgColor: string;
  bgColorSwatch?: Swatch;
  onChange: (props: Partial<PostSettings>) => void;
  className?: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const PostPropertiesDashboard = ({
  bgColor,
  bgColorSwatch,
  onChange,
  className,
  open,
  setOpen,
}: PostPropertiesDashboardProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          "scrollable mini max-h-[95dvh] max-w-[95dvw] bg-card sm:-translate-x-3 md:max-w-[50vw]",
          className,
        )}
        overlayClassName="hidden"
      >
        <DialogHeader>
          <DialogTitle>Post Properties</DialogTitle>
        </DialogHeader>

        {/* Background Color Control */}
        {/* <ColorPicker
          selectedColor={bgColor}
          setSelectedColorAction={(newColor) => {
            onChange({ bgColor: newColor });
          }}
        /> */}
        <GradientColorPicker
          selectedColor={bgColor}
          selectedSwatch={bgColorSwatch}
          setSelectedColorAction={(newColor) => {
            onChange({ bgColor: newColor });
          }}
          setSelectedSwatchAction={(newSwatch) => {
            onChange({ bgColorSwatch: newSwatch });
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
