"use client";

import { ColorMode, colorModes } from "@/constants/colorConsts";

import { useRef, useState } from "react";
import Color from "color";
import { html } from "common-tags";
import slugify from "slugify";

import { BiColor } from "react-icons/bi";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  LoaderCircle,
  Minus,
  Plus,
  SwatchBook,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectSimple } from "@/components/ui/select";
import { TooltipSimple } from "@/components/ui/tooltip";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";

type Color = { value: string; gradient?: boolean };

export type BaseColorProps = {
  selectedColor: string;
  type?: "trigger" | "preview";
  defaultColor?: string;
  defaultPalette?: string;
};

export interface ColorPickerProps extends BaseColorProps {
  setSelectedColorAction: (color: string) => void;
  label?: string;
}

export interface ColorSwatchesProps extends BaseColorProps {
  handleColorSelect: (color: Color) => void;
  colors: Color[];
}

export const ColorPicker = ({
  selectedColor,
  setSelectedColorAction,
  label = "Background Color",
  defaultColor = "hsla(50, 100%, 72%, 1.0)",
  defaultPalette = "tailwind-light",
}: ColorPickerProps) => {
  const minL = 30;
  const maxL = 95;
  const addPalette = useMutation(api.functions.palettes.addPalette);
  const addSwatch = useMutation(api.functions.palettes.addColor);
  const deleteSwatch = useMutation(api.functions.palettes.deleteColor);
  const deletePalette = useMutation(api.functions.palettes.deletePalette);
  const [colorMode, setColorMode] = useState<ColorMode>("hsl");
  const [modalOpen, setModalOpen] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState("");
  const [addPaletteDialogOpen, setAddPaletteDialogOpen] = useState(false);
  const [deletePaletteDialogOpen, setDeletePaletteDialogOpen] = useState(false);
  const [addSwatchDialogOpen, setAddSwatchDialogOpen] = useState(false);
  const [deleteSwatchDialogOpen, setDeleteSwatchDialogOpen] = useState(false);

  const [palette, setPalette] = useState(defaultPalette);
  const [hue, setHue] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [copied, setCopied] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const palettes = useQuery(api.functions.palettes.getPalettes);

  const currentPalette = palettes?.find((p) => p.value === palette);

  // Haptic feedback :)
  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  const handleColorSelect = (color: Color) => {
    setSelectedColorAction(color.value);
    const c = Color(color.value);
    const h = c.hue() || 0;
    const a = Math.round(c.alpha() * 100);

    setHue(h);
    setOpacity(a);
    setLightness(c.lightness());
    vibrate();
  };

  const handleSliderMove = (event: MouseEvent | TouchEvent) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const clientX =
        "touches" in event ? event.touches[0].clientX : event.clientX;
      const clientY =
        "touches" in event ? event.touches[0].clientY : event.clientY;
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

      const newHue = Math.round(x * 360);
      const newOpacity = Math.round((1 - y) * 100) / 100;
      const newLightness = Math.round(minL + y * (maxL - minL));

      // const base = Color.hsl(newHue, 100, 50).alpha(newOpacity);
      const base = Color.hsl(newHue, 100, newLightness);

      let outputColorValue: string;

      switch (colorMode) {
        case "hsl":
          outputColorValue = base.hsl().string();
          break;
        case "rgb":
          outputColorValue = base.rgb().string();
          break;
        case "hex":
          outputColorValue = base.hex();
          break;
        default:
          outputColorValue = base.hsl().string();
      }

      setHue(newHue);
      setOpacity(newOpacity * 100);
      setLightness(newLightness);
      setSelectedColorAction(outputColorValue);
      vibrate();
    }
  };

  const handleModeChange = (newMode: ColorMode) => {
    setColorMode(newMode);

    try {
      const c = Color(selectedColor);

      let converted: string;
      switch (newMode) {
        case "hsl":
          converted = c.hsl().string();
          break;
        case "rgb":
          converted = c.rgb().string();
          break;
        case "hex":
          converted = c.hex();
          break;
        default:
          converted = selectedColor;
      }

      setSelectedColorAction(converted);
    } catch {
      setSelectedColorAction(selectedColor);
    }
  };

  const isGradient = (val: string) =>
    val.startsWith("linear-gradient") || val.startsWith("radial-gradient");

  if (!palettes)
    return (
      <div>
        Loading...
        <LoaderCircle className="size-5 animate-spin" />
      </div>
    );

  const handleAddPalette = async () => {
    if (!newPaletteName) return;
    await addPalette({ name: newPaletteName, value: slugify(newPaletteName) });
    setNewPaletteName("");
    setAddPaletteDialogOpen(false);
  };

  const handleAddSwatch = async () => {
    if (!selectedColor) return;
    if (!currentPalette) return;
    await addSwatch({
      paletteId: currentPalette._id,
      value: selectedColor,
      gradient: isGradient(selectedColor),
    });
    setAddSwatchDialogOpen(false);
  };
  const handleDeleteSwatch = async () => {
    if (!selectedColor) return;
    if (!currentPalette) return;
    await deleteSwatch({
      paletteId: currentPalette._id,
      value: selectedColor,
    });
    setDeleteSwatchDialogOpen(false);
  };
  const handleDeletePalette = async () => {
    if (!currentPalette) return;
    await deletePalette({ paletteId: currentPalette._id });
    setPalette(defaultPalette);
    setDeletePaletteDialogOpen(false);
  };

  const handleColorCopy = async () => {
    if (!selectedColor) return;
    setCopied(true);
    await navigator.clipboard.writeText(selectedColor);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {!modalOpen && (
        <div
          className={cn(
            "mb-1 flex w-full items-center justify-between pr-4 text-sm",
          )}
        >
          <label className="block font-medium">{label}</label>
          <span
            className="hover:cursor-pointer"
            onClick={() => setModalOpen((prev) => !prev)}
          >
            Open Color Picker
          </span>
        </div>
      )}
      {modalOpen === false ? (
        <div className={cn("flex items-center gap-2")}>
          <SelectSimple
            options={palettes.map((p) => ({ label: p.name, value: p.value }))}
            value={palette}
            onChangeAction={(val) => setPalette(val)}
            placeholder="Select Palette"
          />
          <TooltipSimple content={selectedColor}>
            <div
              className={cn("flex items-center gap-2")}
              onClick={() => setModalOpen(!modalOpen)}
            >
              <PreviewColor selectedColor={selectedColor} type="trigger" />
            </div>
          </TooltipSimple>
          <ColorSwatches
            handleColorSelect={handleColorSelect}
            selectedColor={selectedColor}
            colors={palettes.find((p) => p.value === palette)?.colors ?? []}
            type="trigger"
          />
        </div>
      ) : (
        <div className="relative w-full space-y-8 rounded-3xl bg-white/80 p-8 dark:bg-neutral-900 sm:min-w-[400px]">
          {/* <X
            className={cn(
              "absolute right-4 top-4 cursor-pointer hover:scale-105 hover:text-red-600 active:scale-95",
            )}
            onClick={() => setModalOpen(!modalOpen)}
          /> */}
          <span
            className={cn(
              "absolute right-4 top-4 cursor-pointer text-sm hover:scale-105 hover:text-red-600 active:scale-95",
            )}
            onClick={() => setModalOpen(!modalOpen)}
          >
            Collapse
          </span>

          <div className="flex items-center gap-1">
            <SelectSimple
              options={[...colorModes]}
              value={colorMode}
              onChangeAction={(val) => handleModeChange(val as ColorMode)}
              placeholder="Color Mode"
              className="!h-8 w-25"
            />
            <input
              type="text"
              value={selectedColor}
              onChange={(e) => setSelectedColorAction(e.target.value)}
              className={cn(
                "h-8 w-full rounded-md border border-neutral-300 bg-transparent p-1 text-center text-sm text-neutral-700 dark:border-neutral-600 dark:text-neutral-300",
              )}
              placeholder="Enter CSS color"
            />
            <Button
              variant="default"
              size="sm"
              className="h-8 flex-1 border-neutral-300"
              onClick={handleColorCopy}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Clipboard className="size-4" />
              )}
            </Button>
          </div>
          <div className={cn("flex items-center gap-1")}>
            <Button
              variant="salWithShadowHiddenBg"
              className={cn("w-full")}
              disabled={!defaultColor || defaultColor === selectedColor}
              onClick={() => {
                if (defaultColor) {
                  setSelectedColorAction(defaultColor);
                }
              }}
            >
              Reset
            </Button>
            <PaletteDialog
              paletteDialogOpen={addPaletteDialogOpen}
              setPaletteDialogOpen={setAddPaletteDialogOpen}
              newPaletteName={newPaletteName}
              setNewPaletteName={setNewPaletteName}
              handlePaletteAction={handleAddPalette}
            />
            <PaletteDialog
              paletteDialogOpen={deletePaletteDialogOpen}
              setPaletteDialogOpen={setDeletePaletteDialogOpen}
              newPaletteName={palette}
              setNewPaletteName={setNewPaletteName}
              handlePaletteAction={handleDeletePalette}
              palette={currentPalette}
              type="delete"
            />
            <SwatchDialog
              swatchDialogOpen={addSwatchDialogOpen}
              setSwatchDialogOpen={setAddSwatchDialogOpen}
              selectedColor={selectedColor}
              handleSwatchAction={handleAddSwatch}
              palette={currentPalette}
            />

            <SwatchDialog
              swatchDialogOpen={deleteSwatchDialogOpen}
              setSwatchDialogOpen={setDeleteSwatchDialogOpen}
              selectedColor={selectedColor}
              handleSwatchAction={handleDeleteSwatch}
              palette={currentPalette}
              type="delete"
            />
          </div>

          {/* 2-axis slider */}
          <div
            ref={sliderRef}
            className="relative h-[20dvh] max-h-25 cursor-crosshair overflow-hidden rounded-md"
            onMouseDown={(e) => {
              handleSliderMove(e.nativeEvent);
              const handleMouseMove = (e: MouseEvent) => handleSliderMove(e);
              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
              };
              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
            onTouchStart={(e) => {
              handleSliderMove(e.nativeEvent);
              const handleTouchMove = (e: TouchEvent) => handleSliderMove(e);
              const handleTouchEnd = () => {
                document.removeEventListener("touchmove", handleTouchMove);
                document.removeEventListener("touchend", handleTouchEnd);
              };
              document.addEventListener("touchmove", handleTouchMove);
              document.addEventListener("touchend", handleTouchEnd);
            }}
            aria-valuetext={`Hue: ${hue}, Opacity: ${opacity}%, lightness: ${lightness}%`}
            aria-valuemin={0}
            aria-valuemax={360}
            onKeyDown={(e) => {
              const step = 5;
              switch (e.key) {
                case "ArrowLeft":
                  setHue((h) => Math.max(0, h - step));
                  break;
                case "ArrowRight":
                  setHue((h) => Math.min(360, h + step));
                  break;
                case "ArrowUp":
                  // setOpacity((o) => Math.min(100, o + step));
                  setLightness((l) => Math.min(100, l + step));
                  break;
                case "ArrowDown":
                  // setOpacity((o) => Math.max(0, o - step));
                  setLightness((l) => Math.max(0, l - step));
                  break;
                default:
                  break;
              }
            }}
          >
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: html`
                  linear-gradient(to bottom, #00000043 0%, transparent 50%),
                  linear-gradient(to top, #ffffffe6 0%, transparent 50%),
                  linear-gradient( to right, hsl(0, 100%, 50%), hsl(60, 100%,
                  50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%,
                  50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%) )
                `,
                backgroundBlendMode: "multiply, screen, normal",
              }}
            />

            <div
              className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2 border-white shadow-lg dark:border-black"
              style={{
                left: `${(hue / 360) * 100}%`,
                // top: `${100 - opacity}%`,
                top: `${((lightness - minL) / (maxL - minL)) * 100}%`,
              }}
            />
          </div>
          <div className={cn("flex w-full items-center gap-2")}>
            <SelectSimple
              options={palettes.map((p) => ({
                label: p.name,
                value: p.value,
              }))}
              value={palette}
              onChangeAction={(val) => setPalette(val)}
              placeholder="Select Palette"
            />
            <ColorSwatches
              handleColorSelect={handleColorSelect}
              selectedColor={selectedColor}
              colors={palettes.find((p) => p.value === palette)?.colors ?? []}
            />
          </div>
        </div>
      )}
    </>
  );
};

export const PreviewColor = ({
  selectedColor,
  type = "preview",
}: BaseColorProps) => {
  return (
    <div className="flex justify-center">
      <div
        className={cn(
          "relative size-7 overflow-hidden rounded-full border-2 border-white shadow-xl shadow-neutral-400/50 ring-1.5 ring-foreground/50 dark:border-white/80 dark:shadow-none",
          type === "trigger" &&
            "size-8 cursor-pointer hover:scale-105 active:scale-95",
        )}
      >
        <div
          className="z-10 size-full opacity-100"
          style={{ background: selectedColor }}
        />
      </div>
    </div>
  );
};

const ColorSwatches = ({
  handleColorSelect,
  selectedColor,
  colors,
  type = "preview",
}: ColorSwatchesProps) => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 6;
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + visibleCount < colors.length;
  const visibleColors = colors.slice(startIndex, startIndex + visibleCount);

  const goPrev = () => {
    if (canGoPrev) {
      setStartIndex((i) => Math.max(0, i - visibleCount));
    }
  };
  const goNext = () => {
    if (canGoNext) {
      setStartIndex((i) =>
        Math.min(colors.length - visibleCount, i + visibleCount),
      );
    }
  };
  return (
    <div className="relative flex items-center gap-1">
      <button
        type="button"
        onClick={goPrev}
        disabled={!canGoPrev}
        className="text-neutral-400 hover:scale-110 hover:text-neutral-600 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft className="size-6" />
        <span className="sr-only">Previous colors</span>
      </button>
      <div className="flex w-full justify-evenly gap-1">
        {type === "preview" && <PreviewColor selectedColor={selectedColor} />}
        {visibleColors.map((color, index) => (
          <button
            type="button"
            key={`${index}-${color}`}
            onClick={() => handleColorSelect(color)}
            className={cn(
              "size-7 rounded-full transition-transform hover:scale-110",
              selectedColor === color.value
                ? "border-2 border-white shadow-lg ring-[1.5px] ring-foreground/15"
                : "outline-transparent",
            )}
            style={{ background: color.value }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={goNext}
        disabled={!canGoNext}
        className="text-neutral-400 hover:scale-110 hover:text-neutral-600 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight className="size-6" />
        <span className="sr-only">Next colors</span>
      </button>
    </div>
  );
};

interface PaletteDialogProps {
  paletteDialogOpen: boolean;
  setPaletteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newPaletteName: string;
  setNewPaletteName: React.Dispatch<React.SetStateAction<string>>;
  handlePaletteAction: () => void;
  type?: "add" | "delete";
  palette?: {
    _id: string;
    name: string;
    value: string;
    colors: Color[];
  };
}

const PaletteDialog = ({
  paletteDialogOpen,
  setPaletteDialogOpen,
  newPaletteName,
  setNewPaletteName,
  handlePaletteAction,
  type = "add",
  palette,
}: PaletteDialogProps) => {
  const addType = type === "add";
  const isValid = newPaletteName.trim().length > 0;
  return (
    <Dialog open={paletteDialogOpen} onOpenChange={setPaletteDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <TooltipSimple
            content={addType ? "Add Palette" : "Delete Palette"}
            side="top"
          >
            <div>
              <SwatchBook className="size-5" />
              {addType ? (
                <Plus className="absolute right-1.5 top-1.5 size-3" />
              ) : (
                <Minus className="absolute right-1.5 top-1.5 size-3" />
              )}
            </div>
          </TooltipSimple>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {addType ? "Create a New Palette" : "Delete Palette"}
          </DialogTitle>
        </DialogHeader>
        {addType ? (
          <Input
            value={newPaletteName}
            onChange={(e) => setNewPaletteName(e.target.value)}
            placeholder="Palette name"
            className="mt-4"
          />
        ) : (
          <p className="text-center">
            Are you sure that you want to delete <b>{palette?.name}</b>?
          </p>
        )}
        <DialogFooter>
          <Button
            variant={
              addType && isValid ? "salWithShadow" : "salWithShadowHidden"
            }
            onClick={handlePaletteAction}
          >
            {addType ? "Save" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface SwatchDialogProps {
  swatchDialogOpen: boolean;
  setSwatchDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedColor: string;
  handleSwatchAction: () => void;
  palette?: {
    _id: string;
    name: string;
    value: string;
    colors: Color[];
  };
  type?: "add" | "delete";
}

const SwatchDialog = ({
  swatchDialogOpen,
  setSwatchDialogOpen,
  selectedColor,
  handleSwatchAction,
  palette,
  type = "add",
}: SwatchDialogProps) => {
  const addType = type === "add";
  const swatchExists = palette?.colors.some((c) => c.value === selectedColor);

  return (
    <Dialog open={swatchDialogOpen} onOpenChange={setSwatchDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative"
          disabled={
            !selectedColor ||
            (addType && swatchExists) ||
            (!addType && !swatchExists)
          }
        >
          <TooltipSimple
            content={addType ? "Add Swatch" : "Delete Swatch"}
            side="top"
          >
            <div>
              <BiColor className="size-5" />
              {addType ? (
                <Plus className="absolute right-1.5 top-1.5 size-3" />
              ) : (
                <Minus className="absolute right-1.5 top-1.5 size-3" />
              )}
            </div>
          </TooltipSimple>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {addType ? "Add" : "Remove"} Swatch {addType ? "to" : "from"}{" "}
            {palette?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex items-center gap-2">
          <PreviewColor selectedColor={selectedColor} />
          <p>Value: {selectedColor}</p>
        </div>
        <DialogFooter>
          <Button variant="salWithShadowHidden" onClick={handleSwatchAction}>
            {addType ? "Save" : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
