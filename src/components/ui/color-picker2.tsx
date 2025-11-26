import type { JSX } from "react";

import React, { useCallback, useEffect, useRef, useState } from "react";
import slugify from "slugify";

import {
  Check,
  Copy,
  LoaderCircle,
  Palette as PaletteIcon,
  Plus,
  Save,
  SlidersHorizontal,
  SwatchBook,
  Trash2,
  X,
} from "lucide-react";

import type { Doc } from "~/convex/_generated/dataModel";
import { cn } from "@/helpers/utilsFns";

import { api } from "~/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface HSLA {
  h: number;
  s: number;
  l: number;
  a: number;
}

interface GradientStop {
  id: string;
  offset: number;
  color: RGBA;
}

export type Swatch = Pick<Doc<"swatches">, "_id" | "value" | "paletteId">;

type GradientType = "linear" | "radial" | "solid";
type ColorMode = "rgba" | "hsla" | "css";
type RightPanelTab = "stops" | "library";

interface GradientColorPickerProps {
  selectedColor?: string;
  selectedSwatch?: Swatch;
  setSelectedColorAction?: (color: string) => void;
  setSelectedSwatchAction: (swatch: Swatch) => void;
  options?: {
    showPreview?: boolean;
    showCode?: boolean;
    defaultPalette?: string;
  };
}

/* -------------------------------------------------------------------------- */
/* UTILS                                                                      */
/* -------------------------------------------------------------------------- */

const parseGradientStopsFromCss = (gradientString: string): GradientStop[] => {
  if (!gradientString || !gradientString.includes("(")) return [];

  // 1. Get content inside outermost parentheses of linear-gradient(...)
  const content = gradientString.substring(
    gradientString.indexOf("(") + 1,
    gradientString.lastIndexOf(")"),
  );

  // 2. Remove angle if present
  const stopsString = content.replace(/^(\d+deg|to\s+[a-z\s]+)\s*,\s*/i, "");

  // 3. Split by comma, respecting parentheses
  const rawStops: string[] = [];
  let depth = 0;
  let current = "";

  for (let i = 0; i < stopsString.length; i++) {
    const char = stopsString[i];
    if (char === "(") depth++;
    if (char === ")") depth--;

    if (char === "," && depth === 0) {
      rawStops.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current) rawStops.push(current.trim());

  // 4. Process each stop string to separate Color vs Percentage
  return rawStops.map((stopStr, index) => {
    let colorStr = stopStr;
    let offsetStr = "";

    // --- NEW LOGIC START ---
    // Safely separate color from offset by respecting parentheses
    const lastParenIdx = stopStr.lastIndexOf(")");

    if (lastParenIdx !== -1) {
      // It is a functional color (rgba, hsl). The offset (if any) is AFTER the function.
      colorStr = stopStr.substring(0, lastParenIdx + 1).trim();
      offsetStr = stopStr.substring(lastParenIdx + 1).trim();
    } else {
      // It is a Hex or Named color (e.g. "#fff 50%" or "red 100%")
      // Split by whitespace. If the last part is a %, it's the offset.
      const parts = stopStr.split(/\s+/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes("%")) {
        offsetStr = lastPart;
        colorStr = stopStr.substring(0, stopStr.lastIndexOf(lastPart)).trim();
      }
    }
    // --- NEW LOGIC END ---

    // Calculate Offset
    let offset = 0;
    const percentMatch = offsetStr.match(/(-?[\d.]+)%/);

    if (percentMatch) {
      offset = parseFloat(percentMatch[1]);
    } else {
      // Fallback: Distribute evenly
      if (index === 0) offset = 0;
      else if (index === rawStops.length - 1) offset = 100;
      else offset = (index / (rawStops.length - 1)) * 100;
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      offset: Math.min(100, Math.max(0, offset)),
      color: stringToRgba(colorStr),
    };
  });
};

const isGradient = (val: string) =>
  val.startsWith("linear-gradient") || val.startsWith("radial-gradient");

/* -------------------------------------------------------------------------- */
/* COLOR UTILS                                                                */
/* -------------------------------------------------------------------------- */

const stringToRgba = (str: string): RGBA => {
  if (!str) return { r: 0, g: 0, b: 0, a: 1 };
  if (isGradient(str)) return { r: 0, g: 0, b: 0, a: 1 };

  if (str.startsWith("rgb")) {
    const parts = str.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      return {
        r: parseFloat(parts[0]),
        g: parseFloat(parts[1]),
        b: parseFloat(parts[2]),
        a: parts[3] ? parseFloat(parts[3]) : 1,
      };
    }
  }

  if (str.startsWith("hsl")) {
    const parts = str.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      const h = parseFloat(parts[0]);
      const s = parseFloat(parts[1]);
      const l = parseFloat(parts[2]);
      const a = parts[3] ? parseFloat(parts[3]) : 1;

      return hslaToRgba({ h, s, l, a });
    }
  }

  if (
    !str.startsWith("#") &&
    !str.startsWith("rgb") &&
    !str.startsWith("hsl")
  ) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  return hexToRgba(str);
};

const hexToRgba = (hex: string): RGBA => {
  if (!hex || isGradient(hex)) return { r: 0, g: 0, b: 0, a: 1 };

  let c: string[] | number = hex.startsWith("#")
    ? hex.substring(1).split("")
    : [];

  // Fix: Removed the fallback to stringToRgba here to stop infinite loops
  if (c.length === 0) return { r: 0, g: 0, b: 0, a: 1 };

  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  const hexValue = parseInt("0x" + c.join(""), 16);
  return {
    r: (hexValue >> 16) & 255,
    g: (hexValue >> 8) & 255,
    b: hexValue & 255,
    a: 1,
  };
};

const rgbaToHex = ({ r, g, b }: RGBA): string => {
  const toHex = (n: number): string => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const rgbaToHsla = ({ r, g, b, a }: RGBA): HSLA => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a,
  };
};

const hslaToRgba = ({ h, s, l, a }: HSLA): RGBA => {
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;
  let r: number, g: number, b: number;

  if (sNorm === 0) {
    r = g = b = lNorm;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    r = hue2rgb(p, q, hNorm + 1 / 3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a,
  };
};

const rgbaToString = ({ r, g, b, a }: RGBA): string =>
  `rgba(${r}, ${g}, ${b}, ${Math.round(a * 100) / 100})`;
const hslaToString = ({ h, s, l, a }: HSLA): string =>
  `hsla(${h}, ${s}%, ${l}%, ${Math.round(a * 100) / 100})`;

const interpolateColor = (stops: GradientStop[], offset: number): RGBA => {
  const sorted = [...stops].sort((a, b) => a.offset - b.offset);
  if (sorted.length === 0) return { r: 0, g: 0, b: 0, a: 1 };
  if (offset <= sorted[0].offset) return { ...sorted[0].color };
  if (offset >= sorted[sorted.length - 1].offset)
    return { ...sorted[sorted.length - 1].color };

  for (let i = 0; i < sorted.length - 1; i++) {
    const s1 = sorted[i];
    const s2 = sorted[i + 1];
    if (offset >= s1.offset && offset <= s2.offset) {
      const totalDist = s2.offset - s1.offset;
      if (totalDist === 0) return { ...s1.color };
      const ratio = (offset - s1.offset) / totalDist;
      return {
        r: Math.round(s1.color.r + (s2.color.r - s1.color.r) * ratio),
        g: Math.round(s1.color.g + (s2.color.g - s1.color.g) * ratio),
        b: Math.round(s1.color.b + (s2.color.b - s1.color.b) * ratio),
        a: s1.color.a + (s2.color.a - s1.color.a) * ratio,
      };
    }
  }
  return { ...sorted[0].color };
};

/* -------------------------------------------------------------------------- */
/* PARSING UTILS                                                              */
/* -------------------------------------------------------------------------- */

// improved regex to find the angle
const getGradientAngle = (str: string): number => {
  const angleMatch = str.match(/(\d+)deg/);
  if (angleMatch) return parseInt(angleMatch[1]);

  // Handle "to right", "to bottom", etc if needed, otherwise default to 90 (standard linear default)
  if (str.includes("to right")) return 90;
  if (str.includes("to bottom")) return 180;
  if (str.includes("to left")) return 270;
  if (str.includes("to top")) return 0;

  return 45;
};

const normalizeGradientString = (str: string): string => {
  if (!isGradient(str)) {
    return rgbaToString(stringToRgba(str));
  }

  const isRadial = str.includes("radial-gradient");
  const angle = getGradientAngle(str);

  // parse exact stops with offsets
  const stops = parseGradientStopsFromCss(str);

  if (stops.length === 0) return str;

  const stopsStr = stops
    .map((s) => `${rgbaToString(s.color)} ${s.offset}%`)
    .join(", ");

  if (isRadial) {
    return `radial-gradient(circle, ${stopsStr})`;
  } else {
    return `linear-gradient(${angle}deg, ${stopsStr})`;
  }
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function GradientColorPicker({
  selectedColor,
  setSelectedColorAction,
  selectedSwatch,
  setSelectedSwatchAction,
  options,
}: GradientColorPickerProps): JSX.Element {
  const {
    showPreview,
    showCode,
    defaultPalette = "tailwind-light",
  } = options ?? {};

  // --- CONVEX HOOKS ---
  const palettes = useQuery(api.functions.palettes.getPalettes);
  const addPalette = useMutation(api.functions.palettes.addPalette);
  const deletePalette = useMutation(api.functions.palettes.deletePalette);
  const addSwatchMutation = useMutation(api.functions.palettes.addColor);
  const deleteSwatchMutation = useMutation(api.functions.palettes.deleteColor);

  // --- STATE ---
  // ... inside GradientColorPicker component ...

  // --- INITIALIZATION LOGIC ---
  // Parse the incoming prop to determine starting state
  // --- INITIALIZATION LOGIC ---
  const getInitialState = useCallback(() => {
    // ... (Your existing Defaults object) ...
    const defaultSolidRgba = hslaToRgba({ h: 50, s: 100, l: 72, a: 1 });
    const defaults = {
      type: "solid" as GradientType,
      angle: 45,
      stops: [
        { id: "1", offset: 0, color: { r: 246, g: 211, b: 101, a: 1 } },
        { id: "2", offset: 100, color: { r: 253, g: 160, b: 133, a: 1 } },
      ],
      solid: defaultSolidRgba,
    };

    if (!selectedColor) return defaults;

    // 2. Parse Gradient
    if (isGradient(selectedColor)) {
      // --- NEW LOGIC HERE ---
      const parsedStops = parseGradientStopsFromCss(selectedColor);

      // Safety check
      if (parsedStops.length < 2) return defaults;

      const type = selectedColor.includes("radial") ? "radial" : "linear";
      const angle = getGradientAngle(selectedColor);

      return {
        type: type as GradientType,
        angle,
        stops: parsedStops,
        solid: parsedStops[0].color,
      };
      // ---------------------
    }

    // 3. Parse Solid
    else {
      // ... existing solid logic
      const color = stringToRgba(selectedColor);
      return { ...defaults, type: "solid" as GradientType, solid: color };
    }
  }, [selectedColor]);

  const firstRender = useRef(true);
  const seedData = useRef(getInitialState()).current;

  const [gradientType, setGradientType] = useState<GradientType>(seedData.type);
  const [angle, setAngle] = useState<number>(seedData.angle);
  const [stops, setStops] = useState<GradientStop[]>(seedData.stops);
  const [solidColor, setSolidColor] = useState<RGBA>(seedData.solid);
  const [activeStopId, setActiveStopId] = useState<string>("1");
  const [colorMode, setColorMode] = useState<ColorMode>("hsla");
  const [copied, setCopied] = useState<"css" | "hex" | false>(false);
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>(
    seedData.type === "solid" ? "library" : "stops",
  );

  // Palette Selection
  const [activePaletteValue, setActivePaletteValue] = useState<string>("");
  const [newPaletteName, setNewPaletteName] = useState("");
  const [isAddingPalette, setIsAddingPalette] = useState(false);

  // Swatch Selection

  // --- ACTIVE STATE HELPERS ---
  const activeStop = stops.find((s) => s.id === activeStopId) || stops[0];
  const activeColorRgba =
    gradientType === "solid" ? solidColor : activeStop.color;
  const activeColorHsla = rgbaToHsla(activeColorRgba);
  const activeHex = rgbaToHex(activeColorRgba);

  const activePalette = palettes?.find((p) => p.value === activePaletteValue);

  // --- GENERATOR ACTIONS ---

  const handleStopChange = (
    id: string,
    changes: Partial<GradientStop>,
  ): void => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...changes } : s)),
    );
  };

  const handleActiveColorChange = (newRgba: RGBA): void => {
    if (gradientType === "solid") {
      setSolidColor(newRgba);
    } else {
      handleStopChange(activeStopId, { color: newRgba });
    }
  };

  const addStop = (
    offset: number = 50,
    customColor: RGBA | null = null,
  ): void => {
    const newId = Math.random().toString(36).substr(2, 9);
    let newColor = customColor;
    if (!newColor) newColor = interpolateColor(stops, offset);
    setStops((prev) =>
      [...prev, { id: newId, offset, color: newColor! }].sort(
        (a, b) => a.offset - b.offset,
      ),
    );
    setActiveStopId(newId);
  };

  const deleteStop = (id: string): void => {
    if (stops.length <= 2) return;
    const newStops = stops.filter((s) => s.id !== id);
    setStops(newStops);
    if (activeStopId === id) setActiveStopId(newStops[0].id);
  };

  const generateCSS = useCallback((): string => {
    if (gradientType === "solid") return rgbaToString(solidColor);
    const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);
    const stopStr = sortedStops
      .map((s) => `${rgbaToString(s.color)} ${s.offset}%`)
      .join(", ");
    if (gradientType === "radial") return `radial-gradient(circle, ${stopStr})`;
    return `linear-gradient(${angle}deg, ${stopStr})`;
  }, [stops, angle, gradientType, solidColor]);

  // Sync to parent
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (setSelectedColorAction) {
      const css = generateCSS();
      if (selectedColor !== css) setSelectedColorAction(css);
    }
  }, [
    stops,
    angle,
    gradientType,
    solidColor,
    setSelectedColorAction,
    selectedColor,
    generateCSS,
  ]);

  useEffect(() => {
    if (activeStopId !== "1" || gradientType === "solid") return;
    if (selectedSwatch && stops.length > 0) {
      setActiveStopId(stops[0].id);
    }
  }, [gradientType, selectedSwatch, stops, activeStopId]);

  const copyCSS = (): void => {
    navigator.clipboard.writeText(`background: ${generateCSS()};`);
    setCopied("css");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTypeSwitch = (type: GradientType) => {
    setGradientType(type);
    if (type === "solid" && gradientType !== "solid") {
      console.log(activeStop);
      setSolidColor(activeStop.color);
      setRightPanelTab("library");
    }
  };

  const currentCSS = generateCSS();

  const matchingSwatch =
    selectedSwatch &&
    selectedSwatch.paletteId === activePalette?._id &&
    normalizeGradientString(selectedSwatch.value) === currentCSS
      ? selectedSwatch
      : undefined;

  useEffect(() => {
    if (!palettes || activePalette) return;
    if (selectedSwatch) {
      const paletteForSwatch = palettes.find(
        (p) => p._id === selectedSwatch.paletteId,
      );

      if (paletteForSwatch) {
        setActivePaletteValue(paletteForSwatch.value);
        return;
      }
    }

    setActivePaletteValue(palettes?.[0]?.value ?? "tailwind-light");
  }, [palettes, selectedSwatch, activePalette]);

  // --- LIBRARY ACTIONS ---

  const handleAddPalette = async () => {
    if (!newPaletteName.trim()) return;
    try {
      await addPalette({
        name: newPaletteName,
        value: slugify(newPaletteName),
      });
      setNewPaletteName("");
      setActivePaletteValue(slugify(newPaletteName));
      setIsAddingPalette(false);
    } catch (e) {
      console.error("Failed to add palette", e);
    }
  };

  const handleDeletePalette = async () => {
    if (!activePalette) return;
    try {
      await deletePalette({ paletteId: activePalette._id });
      setActivePaletteValue(palettes?.[0]?.value ?? defaultPalette);
    } catch (e) {
      console.error("Failed to delete palette", e);
    }
  };

  const handleAddSwatch = async () => {
    if (!activePalette) return;
    if (matchingSwatch || !selectedColor) return; // Already exists

    const valueToSave = selectedColor;
    const gradient = isGradient(valueToSave);

    try {
      await addSwatchMutation({
        paletteId: activePalette._id,
        value: valueToSave,
        gradient: gradient,
      });
    } catch (e) {
      console.error("Failed to add swatch", e);
    }
  };

  const handleDeleteSwatch = async () => {
    if (!activePalette || !matchingSwatch) return;
    try {
      await deleteSwatchMutation({
        paletteId: activePalette._id,
        value: matchingSwatch.value,
      });
    } catch (e) {
      console.error("Failed to delete swatch", e);
    }
  };

  const handleSwatchClick = (swatch: Swatch) => {
    // 1. Strict check: Is this actually a complex gradient string?
    if (!activePalette) return;
    const colorVal = swatch.value;
    if (isGradient(colorVal)) {
      const parsedStops = parseGradientStopsFromCss(colorVal);

      // Edge Case: Single color gradient -> Solid
      if (parsedStops.length === 1) {
        handleActiveColorChange(parsedStops[0].color);
        setSelectedSwatchAction({
          value: normalizeGradientString(colorVal),
          _id: swatch._id,
          paletteId: activePalette._id,
        });
        return;
      }

      if (parsedStops.length > 0) {
        // A. Extract and Set Angle
        const newAngle = getGradientAngle(colorVal);
        setAngle(newAngle);

        // B. Set Stops (using the ones with correct offsets)
        setStops(parsedStops);
        setActiveStopId(parsedStops[0].id);

        // C. Set Type
        if (colorVal.includes("radial")) setGradientType("radial");
        else setGradientType("linear");
      }
    } else {
      // 2. It is a solid color
      const newColor = stringToRgba(colorVal);
      handleActiveColorChange(newColor);
    }

    // Set the active swatch ID/Value for UI highlighting
    setSelectedSwatchAction({
      value: colorVal,
      _id: swatch._id,
      paletteId: activePalette._id,
    });
  };

  if (palettes === undefined) {
    return (
      <div className="flex min-h-[400px] items-center justify-center gap-2 bg-slate-50 text-slate-400">
        <LoaderCircle className="animate-spin" /> Loading Library...
      </div>
    );
  }

  return (
    <>
      {/* Main Preview Area */}
      {showPreview && (
        <div
          className="mb-8 h-64 w-full rounded-2xl border-4 border-white shadow-lg transition-all duration-300 md:h-80"
          style={{ background: generateCSS() }}
        />
      )}

      {/* Top */}
      <div className="flex flex-col items-start justify-around gap-6 border-b border-slate-100 pb-6 sm:flex-row">
        {/* Gradient Slider Area */}
        <div className="w-full flex-1 pl-6 sm:max-w-70">
          {gradientType !== "solid" ? (
            <GradientSlider
              stops={stops}
              activeStopId={activeStopId}
              onStopChange={handleStopChange}
              onSelect={setActiveStopId}
              onAdd={addStop}
            />
          ) : (
            <div className="flex h-12 items-center rounded-lg border border-slate-100 bg-slate-50 px-4 text-xs text-slate-500">
              Gradient controls are disabled in Solid mode. Use the Color Picker
              below.
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex w-full items-center justify-around gap-6 sm:w-auto",
          )}
        >
          <div
            className={cn(
              "flex w-fit min-w-10 items-center gap-2 rounded-lg bg-slate-100 p-1",
              gradientType === "radial" && "pointer-events-none invisible",
              gradientType === "solid" && "hidden",
            )}
          >
            <div className="group relative flex size-8 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-white shadow-sm">
              <div
                className="absolute h-[2px] w-full bg-slate-800"
                style={{ transform: `rotate(${angle}deg)` }}
              />
              <div className="z-10 size-2 rounded-full bg-blue-500" />
            </div>
            <input
              type="number"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full max-w-11 bg-transparent text-right text-sm font-medium focus:outline-none"
            />
            {/* <span className="text-xs text-slate-400">°</span> */}
          </div>

          {/* Type & Rotation */}
          <div className="flex flex-wrap items-center justify-end gap-4">
            <div className="flex rounded-lg bg-slate-100 p-1">
              {(["linear", "radial", "solid"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeSwitch(t)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-all ${gradientType === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Main */}
      <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">
        {/* Left: Color Picker */}
        <div
          className={cn(
            "scrollable mini max-h-96 p-6",
            gradientType === "solid" ? "mx-auto w-full max-w-lg" : "",
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Color Picker
            </span>
            <div className="flex rounded-md bg-slate-100 p-0.5">
              {(["rgba", "hsla", "css"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setColorMode(mode)}
                  className={`rounded px-2 py-0.5 text-[10px] uppercase transition-colors ${colorMode === mode ? "bg-white text-blue-600 shadow" : "text-slate-500"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <AdvancedColorPicker
            color={activeColorHsla}
            onChange={(hsla) => handleActiveColorChange(hslaToRgba(hsla))}
          />

          <div className="mt-6 space-y-4">
            {/* Hex Input */}
            <div className="flex items-center gap-3">
              <div className="w-16 text-xs font-bold text-slate-400">HEX</div>
              <div className="flex flex-1 items-center rounded border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="mr-1 text-slate-400">#</span>
                <input
                  type="text"
                  value={
                    copied === "hex" ? "Copied!" : activeHex.replace("#", "")
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                      if (val.length === 6)
                        handleActiveColorChange(hexToRgba("#" + val));
                    }
                  }}
                  className="w-full bg-transparent font-mono text-sm uppercase focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeHex).then(() => {
                      setCopied("hex");
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  className={cn(
                    "rounded-mdpx-3 flex items-center gap-2 py-1.5 text-xs font-bold transition-all",
                    copied === "hex"
                      ? "text-green-700"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {copied === "hex" ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* RGBA / HSLA Inputs */}
            {colorMode === "rgba" ? (
              <div className="grid grid-cols-4 gap-2">
                {(["r", "g", "b"] as const).map((c) => (
                  <div
                    key={c}
                    className="rounded border border-slate-200 bg-slate-50 p-1 text-center"
                  >
                    <div className="mb-1 text-[10px] uppercase text-slate-400">
                      {c}
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={activeColorRgba[c]}
                      onChange={(e) =>
                        handleActiveColorChange({
                          ...activeColorRgba,
                          [c]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-transparent text-center font-mono text-sm focus:outline-none"
                    />
                  </div>
                ))}
                <div className="rounded border border-slate-200 bg-slate-50 p-1 text-center">
                  <div className="mb-1 text-[10px] uppercase text-slate-400">
                    A
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(activeColorRgba.a * 100)}
                    onChange={(e) =>
                      handleActiveColorChange({
                        ...activeColorRgba,
                        a: parseInt(e.target.value) / 100 || 0,
                      })
                    }
                    className="w-full bg-transparent text-center font-mono text-sm focus:outline-none"
                  />
                </div>
              </div>
            ) : colorMode === "hsla" ? (
              <div className="grid grid-cols-4 gap-2">
                {(["h", "s", "l"] as const).map((c) => (
                  <div
                    key={c}
                    className="rounded border border-slate-200 bg-slate-50 p-1 text-center"
                  >
                    <div className="mb-1 text-[10px] uppercase text-slate-400">
                      {c}
                    </div>
                    <input
                      type="number"
                      min="0"
                      max={c === "h" ? 360 : 100}
                      value={activeColorHsla[c]}
                      onChange={(e) =>
                        handleActiveColorChange(
                          hslaToRgba({
                            ...activeColorHsla,
                            [c]: parseInt(e.target.value) || 0,
                          }),
                        )
                      }
                      className="w-full bg-transparent text-center font-mono text-sm focus:outline-none"
                    />
                  </div>
                ))}
                <div className="rounded border border-slate-200 bg-slate-50 p-1 text-center">
                  <div className="mb-1 text-[10px] uppercase text-slate-400">
                    A
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(activeColorHsla.a * 100)}
                    onChange={(e) =>
                      handleActiveColorChange(
                        hslaToRgba({
                          ...activeColorHsla,
                          a: parseInt(e.target.value) / 100 || 0,
                        }),
                      )
                    }
                    className="w-full bg-transparent text-center font-mono text-sm focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <pre className="scrollable justx mini relative break-all rounded bg-slate-900 pl-3 pr-12 pt-3 font-mono text-sm leading-relaxed text-slate-300">
                <button
                  onClick={copyCSS}
                  className={cn(
                    "absolute right-0 flex items-center gap-2 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-bold transition-all",
                    copied === "css"
                      ? "text-green-400"
                      : "text-slate-400 hover:bg-slate-700 hover:text-white",
                  )}
                >
                  {copied === "css" ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <p className="absolute left-2 top-0 text-2xs text-green-400">
                  CSS Preview
                </p>
                {generateCSS()};
              </pre>
            )}
          </div>
        </div>

        {/* Right: Stops List / Swatch Library */}

        <div className="flex h-full max-h-96 flex-col bg-slate-50/50">
          {/* Tabs Switcher */}
          <div className="flex border-b border-slate-200">
            <button
              disabled={gradientType === "solid"}
              onClick={() => setRightPanelTab("stops")}
              className={cn(
                "flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors disabled:pointer-events-none disabled:opacity-50",
                rightPanelTab === "stops"
                  ? "border-b-2 border-blue-600 bg-white text-blue-600"
                  : "text-slate-400 hover:bg-slate-100/50 hover:text-slate-600",
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <SlidersHorizontal size={14} /> Stops
              </div>
            </button>
            <button
              onClick={() => setRightPanelTab("library")}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${rightPanelTab === "library" ? "border-b-2 border-blue-600 bg-white text-blue-600" : "text-slate-400 hover:bg-slate-100/50 hover:text-slate-600"}`}
            >
              <div className="flex items-center justify-center gap-2">
                <SwatchBook size={14} /> Library
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="scrollable mini flex-1 p-6">
            {/* STOPS VIEW */}
            {rightPanelTab === "stops" && (
              <div className="space-y-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Stops
                  </span>
                  <button
                    onClick={() => addStop()}
                    className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>

                <div className="space-y-2">
                  {[...stops]
                    .sort((a, b) => a.offset - b.offset)
                    .map((stop) => (
                      <div
                        key={stop.id}
                        onClick={() => setActiveStopId(stop.id)}
                        className={`group flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-all ${activeStopId === stop.id ? "border-blue-400 bg-white shadow-sm" : "border-transparent bg-transparent hover:bg-slate-100"}`}
                      >
                        <div
                          className="h-8 w-8 rounded border border-slate-200 shadow-sm"
                          style={{ background: rgbaToString(stop.color) }}
                        />
                        <div className="flex-1 font-mono text-xs uppercase text-slate-600">
                          {rgbaToHex(stop.color)}
                        </div>
                        <div className="relative w-16">
                          <input
                            type="number"
                            value={Math.round(stop.offset)}
                            onChange={(e) => {
                              const val = Math.max(
                                0,
                                Math.min(100, parseInt(e.target.value) || 0),
                              );
                              handleStopChange(stop.id, { offset: val });
                            }}
                            className="w-full rounded bg-slate-100 px-2 py-1 text-right text-xs font-medium focus:outline-blue-500"
                          />
                          <span className="pointer-events-none absolute right-6 top-1.5 text-[10px] text-slate-400">
                            %
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteStop(stop.id);
                          }}
                          className="rounded-md p-1.5 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                          disabled={stops.length <= 2}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* LIBRARY VIEW */}
            {rightPanelTab === "library" && activePalette && (
              <div className="space-y-6">
                {/* Palette Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Palette
                    </label>
                    <div className="flex gap-1">
                      {!isAddingPalette && (
                        <>
                          <button
                            onClick={() => setIsAddingPalette(true)}
                            className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            title="Create New Palette"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={handleDeletePalette}
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            disabled={!palettes || palettes.length <= 1}
                            title="Delete Current Palette"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isAddingPalette ? (
                    <div className="flex gap-2 duration-200 animate-in fade-in slide-in-from-top-2">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Palette Name..."
                        value={newPaletteName}
                        onChange={(e) => setNewPaletteName(e.target.value)}
                        className="flex-1 rounded border border-slate-300 bg-white px-2 py-1.5 text-sm focus:outline-blue-500"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddPalette()
                        }
                      />
                      <button
                        onClick={handleAddPalette}
                        className="rounded bg-blue-600 p-1.5 text-white hover:bg-blue-700"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setIsAddingPalette(false)}
                        className="rounded bg-slate-200 p-1.5 text-slate-600 hover:bg-slate-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={activePaletteValue}
                        onChange={(e) => setActivePaletteValue(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        {palettes.map((p) => (
                          <option key={p._id} value={p.value}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-2.5 text-slate-400">
                        <PaletteIcon size={14} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Swatches Grid */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {activePalette.colors?.length || 0} Swatches
                    </span>
                    <button
                      onClick={
                        matchingSwatch ? handleDeleteSwatch : handleAddSwatch
                      }
                      className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-bold transition-colors ${
                        matchingSwatch
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      }`}
                      title={
                        matchingSwatch
                          ? "Delete this color from library"
                          : "Add currently selected color to library"
                      }
                    >
                      {matchingSwatch ? (
                        <Trash2 size={12} />
                      ) : (
                        <Save size={12} />
                      )}
                      {matchingSwatch ? "Delete Swatch" : "Save Color"}
                    </button>
                  </div>

                  {!activePalette.colors ||
                  activePalette.colors.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                      No colors yet.
                      <br />
                      Save the current color!
                    </div>
                  ) : (
                    <div className="grid grid-cols-6 gap-2">
                      {activePalette.colors.map((swatch, idx) => (
                        <div
                          key={`${swatch.value}-${idx}`}
                          className={`group relative aspect-square w-full cursor-pointer overflow-hidden rounded-md border shadow-sm transition-all ${
                            swatch.value === selectedSwatch?.value
                              ? "z-10 scale-105 border-blue-500 ring-2 ring-blue-500"
                              : "border-slate-200 ring-0 hover:z-10 hover:ring-2 hover:ring-blue-300"
                          }`}
                          style={{ background: swatch.value }}
                          onClick={() => handleSwatchClick(swatch)}
                          title={swatch.value}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Output */}
      {showCode && (
        <div className="group relative mt-8 rounded-xl bg-slate-900 p-6 shadow-2xl">
          <div className="absolute left-0 top-0 h-1 w-full rounded-t-xl bg-gradient-to-r from-blue-500 to-purple-500" />
          <div className="mb-2 flex items-start justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              CSS Code
            </label>
            <button
              onClick={copyCSS}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${copied === "css" ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"}`}
            >
              {copied === "css" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "css" ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-slate-300">
            <span className="text-purple-400">background</span>: {generateCSS()}
            ;
          </pre>
        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* SUB-COMPONENTS                                                             */
/* -------------------------------------------------------------------------- */

interface GradientSliderProps {
  stops: GradientStop[];
  activeStopId: string;
  onStopChange: (id: string, changes: Partial<GradientStop>) => void;
  onSelect: (id: string) => void;
  onAdd: (offset: number) => void;
}

function GradientSlider({
  stops,
  activeStopId,
  onStopChange,
  onSelect,
  onAdd,
}: GradientSliderProps): JSX.Element {
  const sliderRef = useRef<HTMLDivElement>(null);

  // --- DRAG HANDLER (Unchanged) ---
  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    id: string,
  ): void => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(id);

    const handleMove = (moveEvent: MouseEvent): void => {
      if (sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        const percent = Math.max(
          0,
          Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100),
        );
        onStopChange(id, { offset: percent });
      }
    };

    const handleUp = (): void => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
      onAdd(percent);
    }
  };

  return (
    <div
      ref={sliderRef}
      className="group relative flex h-16 select-none items-center"
    >
      <div
        className="absolute inset-x-0 top-3 h-6 cursor-crosshair rounded-full"
        onClick={handleBarClick}
      >
        {/* Checkerboard Pattern */}
        <div className="absolute inset-0 h-full w-full rounded-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIklEQVQYV2NkYGRkYIAAdiCkIP6HwgcY0ISQBTBw//9PAwA8RgfN890tNwAAAABJRU5ErkJggg==')] opacity-30" />

        <div
          className="absolute inset-0 h-full w-full rounded-full border border-black/5 shadow-inner"
          style={{
            background: `linear-gradient(to right, ${stops
              .sort((a, b) => a.offset - b.offset)
              .map((s) => `${rgbaToString(s.color)} ${s.offset}%`)
              .join(", ")})`,
          }}
        />
      </div>

      {stops.map((stop) => (
        <div
          key={stop.id}
          className="absolute top-0 z-10 flex w-4 flex-col items-center"
          style={{ left: `calc(${stop.offset}% - 8px)` }}
        >
          <div
            className="cursor-grab hover:z-20 active:cursor-grabbing"
            onMouseDown={(e) => handleMouseDown(e, stop.id)}
          >
            <div
              className={`flex flex-col items-center justify-center transition-transform ${
                activeStopId === stop.id ? "z-30 scale-110" : "scale-100"
              }`}
            >
              <div
                className={`h-11 w-4 rounded-lg border-2 shadow-sm ring-slate-800/20 ${
                  activeStopId === stop.id
                    ? "border-slate-800 ring-2"
                    : "border-white ring-1"
                }`}
                style={{ backgroundColor: rgbaToString(stop.color) }}
              />
            </div>
          </div>

          <input
            type="number"
            min={0}
            max={100}
            value={Math.round(stop.offset)}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(stop.id);
            }}
            onChange={(e) => {
              const val = Math.max(
                0,
                Math.min(100, parseInt(e.target.value) || 0),
              );
              onStopChange(stop.id, { offset: val });
            }}
            className={`arrowless mt-2 min-w-8 rounded border bg-white p-1 text-center text-xs font-medium shadow-sm focus:border-border focus:text-sm focus:outline-none focus:ring-1 focus:ring-foreground ${
              activeStopId === stop.id
                ? "border-slate-800 text-slate-900"
                : "border-slate-200 text-slate-500"
            }`}
          />
        </div>
      ))}
    </div>
  );
}

interface EyeDropper {
  open(options?: { signal?: AbortSignal }): Promise<{ sRGBHex: string }>;
}

declare global {
  interface Window {
    EyeDropper: new () => EyeDropper;
  }
}

interface AdvancedColorPickerProps {
  color: HSLA;
  onChange: (color: HSLA) => void;
}

function AdvancedColorPicker({
  color,
  onChange,
}: AdvancedColorPickerProps): JSX.Element {
  const satRectRef = useRef<HTMLDivElement>(null);
  const hueRectRef = useRef<HTMLDivElement>(null);
  const alphaRectRef = useRef<HTMLDivElement>(null);

  const getHsvCoords = () => {
    const sNorm = color.s / 100;
    const lNorm = color.l / 100;
    const v = lNorm + sNorm * Math.min(lNorm, 1 - lNorm);
    const sHsv = v === 0 ? 0 : 2 * (1 - lNorm / v);
    return { x: sHsv * 100, y: (1 - v) * 100 };
  };

  const cursorCoords = getHsvCoords();

  const handleSatDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    const handleMove = (moveEvent: MouseEvent): void => {
      if (satRectRef.current) {
        const rect = satRectRef.current.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (moveEvent.clientX - rect.left) / rect.width),
        );
        const y = Math.max(
          0,
          Math.min(1, (moveEvent.clientY - rect.top) / rect.height),
        );
        const sVal = x * 100;
        const vVal = (1 - y) * 100;
        const lVal = vVal - (vVal * sVal) / 100 / 2;
        const finalS =
          lVal === 0 || lVal === 100
            ? 0
            : ((vVal - lVal) / Math.min(lVal, 100 - lVal)) * 100;
        onChange({ ...color, s: Math.round(finalS), l: Math.round(lVal) });
      }
    };
    const handleUp = (): void => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    handleMove(e.nativeEvent);
  };

  const handleHueDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    const handleMove = (moveEvent: MouseEvent): void => {
      if (hueRectRef.current) {
        const rect = hueRectRef.current.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (moveEvent.clientX - rect.left) / rect.width),
        );
        onChange({ ...color, h: Math.round(x * 360) });
      }
    };
    const handleUp = (): void => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    handleMove(e.nativeEvent);
  };

  const handleAlphaDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    const handleMove = (moveEvent: MouseEvent): void => {
      if (alphaRectRef.current) {
        const rect = alphaRectRef.current.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (moveEvent.clientX - rect.left) / rect.width),
        );
        onChange({ ...color, a: Math.round(x * 100) / 100 });
      }
    };
    const handleUp = (): void => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    handleMove(e.nativeEvent);
  };

  const handleEyedrop = async () => {
    // 1. Check feature support
    if (!window.EyeDropper) {
      console.warn("EyeDropper API is not supported in this browser.");
      return;
    }

    try {
      // 2. Instantiate using the new type definition
      const eyeDropper = new window.EyeDropper();

      // 3. Open the picker
      const { sRGBHex } = await eyeDropper.open();

      // 4. Convert and update (Assuming your conversion functions are typed)
      const rgba = hexToRgba(sRGBHex);
      const hsla = rgbaToHsla(rgba);

      onChange(hsla);
    } catch (e) {
      // User cancelled the selection
      console.log("EyeDropper cancelled", e);
    }
  };

  return (
    <div className="select-none space-y-4">
      <div
        ref={satRectRef}
        className="relative h-32 w-full cursor-crosshair overflow-hidden rounded-lg shadow-inner"
        style={{
          backgroundColor: `hsl(${color.h}, 100%, 50%)`,
          backgroundImage:
            "linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)",
        }}
        onMouseDown={handleSatDown}
      >
        <div
          className="pointer-events-none absolute -ml-2 -mt-2 h-4 w-4 rounded-full border-2 border-white shadow-md"
          style={{ left: `${cursorCoords.x}%`, top: `${cursorCoords.y}%` }}
        />
      </div>
      <div className="grid grid-cols-[1fr_auto] items-center gap-4">
        <div className="space-y-3">
          <div
            ref={hueRectRef}
            className="relative h-3 cursor-pointer rounded-full shadow-inner"
            style={{
              background:
                "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
            }}
            onMouseDown={handleHueDown}
          >
            <div
              className="absolute top-0 h-3 w-3 rounded-full border border-slate-300 bg-white shadow"
              style={{ left: `calc(${color.h / 3.6}% - 6px)` }}
            />
          </div>
          <div
            ref={alphaRectRef}
            className="relative h-3 cursor-pointer rounded-full bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIklEQVQYV2NkYGRkYIAAdiCkIP6HwgcY0ISQBTBw//9PAwA8RgfN890tNwAAAABJRU5ErkJggg==')] shadow-inner"
            onMouseDown={handleAlphaDown}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `linear-gradient(to right, transparent, ${hslaToString({ ...color, a: 1 })})`,
              }}
            />
            <div
              className="absolute top-0 h-3 w-3 rounded-full border border-slate-300 bg-white shadow"
              style={{ left: `calc(${color.a * 100}% - 6px)` }}
            />
          </div>
        </div>
        <div
          className="h-10 w-10 rounded-full border border-slate-200 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIklEQVQYV2NkYGRkYIAAdiCkIP6HwgcY0ISQBTBw//9PAwA8RgfN890tNwAAAABJRU5ErkJggg==')] shadow-sm hover:cursor-pointer"
          onClick={handleEyedrop}
        >
          <div
            className="h-full w-full rounded-full"
            style={{ backgroundColor: hslaToString(color) }}
          />
        </div>
      </div>
    </div>
  );
}
