"use client";

import { ColorPicker } from "@/components/ui/color-picker";
import { SelectSimple } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Dispatch, forwardRef, SetStateAction } from "react";

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
  setOpen?: Dispatch<SetStateAction<boolean>>;
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
];

export const PostPropertiesDashboard = forwardRef<
  HTMLDivElement,
  PostPropertiesDashboardProps
>(({ fontSize, bgColor, budget, onChange, className, setOpen }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col items-center gap-4 rounded-md border-1.5 bg-card p-4 shadow-lg",
        className,
      )}
    >
      {setOpen && (
        <X
          className="absolute right-4 top-4 cursor-pointer hover:scale-105 hover:text-red-600 active:scale-95"
          onClick={() => setOpen(false)}
        />
      )}
      <h2 className="text-lg font-semibold">Post Properties</h2>
      <div className={cn("flex w-full items-center justify-center gap-4")}>
        {/* Font Size Control */}
        <div className={cn("min-w-40")}>
          <label className="mb-1 block text-sm font-medium">
            Title Font Size
          </label>
          <SelectSimple
            options={fontSizeOptions}
            value={String(fontSize)}
            onChangeAction={(val) => onChange({ fontSize: parseInt(val, 10) })}
            placeholder="Select font size"
          />
        </div>
        <div className={cn("min-w-40")}>
          <label className="mb-1 block text-sm font-medium">Budget</label>
          <SelectSimple
            options={[
              { label: "Hide", value: "false" },
              { label: "Show", value: "true" },
            ]}
            value={String(budget)}
            onChangeAction={(val) => onChange({ budget: val === "true" })}
            placeholder="Select font size"
          />
        </div>

        {/* Background Color Control */}
      </div>

      <ColorPicker
        selectedColor={bgColor}
        setSelectedColorAction={(newColor) => {
          onChange({ bgColor: newColor });
        }}
      />
    </div>
  );
});

PostPropertiesDashboard.displayName = "PostPropertiesDashboard";
