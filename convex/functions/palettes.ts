import { v } from "convex/values";
import { internalMutation, mutation, query } from "~/convex/_generated/server";

export const getPalettes = query({
  args: {},
  handler: async (ctx) => {
    const palettes = await ctx.db.query("palettes").collect();
    const swatches = await ctx.db.query("swatches").collect();

    return palettes.map((p) => ({
      ...p,
      colors: swatches.filter((s) => s.paletteId === p._id),
    }));
  },
});

export const addPalette = mutation({
  args: { name: v.string(), value: v.string() },
  handler: async (ctx, { name, value }) => {
    return await ctx.db.insert("palettes", {
      name,
      value,
      createdAt: Date.now(),
    });
  },
});

export const addColor = mutation({
  args: {
    paletteId: v.id("palettes"),
    value: v.string(),
    gradient: v.boolean(),
  },
  handler: async (ctx, { paletteId, value, gradient }) => {
    return await ctx.db.insert("swatches", {
      paletteId,
      value,
      gradient,
      createdAt: Date.now(),
    });
  },
});

export const deleteColor = mutation({
  args: {
    paletteId: v.id("palettes"),
    value: v.string(),
  },
  handler: async (ctx, { paletteId, value }) => {
    const swatch = await ctx.db
      .query("swatches")
      .withIndex("by_paletteId_value", (q) =>
        q.eq("paletteId", paletteId).eq("value", value),
      )
      .first();
    if (!swatch) return null;
    return await ctx.db.delete(swatch._id);
  },
});

export const deletePalette = mutation({
  args: {
    paletteId: v.id("palettes"),
  },
  handler: async (ctx, { paletteId }) => {
    const swatches = await ctx.db
      .query("swatches")
      .withIndex("by_paletteId", (q) => q.eq("paletteId", paletteId))
      .collect();

    for (const swatch of swatches) {
      await ctx.db.delete(swatch._id);
    }

    return await ctx.db.delete(paletteId);
  },
});

export const seedPalettes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Shared helper
    const ensurePalette = async (
      name: string,
      value: string,
      colors: { value: string; gradient?: boolean }[],
    ) => {
      const existing = await ctx.db
        .query("palettes")
        .filter((q) => q.eq(q.field("value"), value))
        .first();

      // If it already exists, do nothing
      if (existing) return existing._id;

      const paletteId = await ctx.db.insert("palettes", {
        name,
        value,
        createdAt: now,
      });

      for (const c of colors) {
        await ctx.db.insert("swatches", {
          paletteId,
          value: c.value,
          gradient: Boolean(c.gradient),
          createdAt: now,
        });
      }

      return paletteId;
    };

    const TAILWIND_COLORS_300 = [
      { value: "#FCA5A5" }, // red-300
      { value: "#FCD34D" }, // amber-300
      { value: "#6EE7B7" }, // emerald-300
      { value: "#93C5FD" }, // blue-300
      { value: "#C4B5FD" }, // violet-300
      { value: "#F9A8D4" }, // pink-300
      { value: "#5EEAD4" }, // teal-300
      { value: "#FDBA74" }, // orange-300
      { value: "#D1D5DB" }, // gray-300
    ];

    // 3) Paste your arrays here (or import them) and insert:
    const COLORS = [
      // Existing gradients
      { value: "linear-gradient(45deg, #ff9a9e, #fad0c4)", gradient: true },
      {
        value: "linear-gradient(45deg, #ff9a9e, #fad0c4, #ffd1ff)",
        gradient: true,
      },
      { value: "linear-gradient(45deg, #f6d365, #fda085)", gradient: true },
      { value: "linear-gradient(45deg, #84fab0, #8fd3f4)", gradient: true },

      // Solid neutrals
      { value: "#FFFFFF" },
      { value: "#F5F5F5" },
      { value: "#6B6E8D" }, // from your original
      { value: "#2D2D2D" },
      { value: "#000000" },

      // Solid accents
      { value: "#79E7D0" },
      { value: "#7AA2F7" },
      { value: "#F87171" }, // red
      { value: "#FACC15" }, // yellow
      { value: "#34D399" }, // green
      { value: "#60A5FA" }, // blue
      { value: "#A78BFA" }, // purple
      { value: "#EC4899" }, // pink

      // Additional gradients
      { value: "linear-gradient(45deg, #a18cd1, #fbc2eb)", gradient: true },
      { value: "linear-gradient(45deg, #f093fb, #f5576c)", gradient: true },
      { value: "linear-gradient(45deg, #4facfe, #00f2fe)", gradient: true },
      { value: "linear-gradient(45deg, #43e97b, #38f9d7)", gradient: true },
      { value: "linear-gradient(45deg, #fa709a, #fee140)", gradient: true },
      { value: "linear-gradient(45deg, #30cfd0, #330867)", gradient: true },
    ];

    const TAILWIND_COLORS = [
      // Tailwind solid accents
      { value: "#EF4444" }, // red-500
      { value: "#F59E0B" }, // amber-500
      { value: "#10B981" }, // emerald-500
      { value: "#3B82F6" }, // blue-500
      { value: "#8B5CF6" }, // violet-500
      { value: "#EC4899" }, // pink-500
      { value: "#14B8A6" }, // teal-500
      { value: "#F97316" }, // orange-500
      // Tailwind-inspired gradients
      { value: "linear-gradient(45deg, #F87171, #DC2626)", gradient: true }, // red-400 → red-600
      { value: "linear-gradient(45deg, #FBBF24, #D97706)", gradient: true }, // amber-400 → amber-600
      { value: "linear-gradient(45deg, #34D399, #059669)", gradient: true }, // emerald-400 → emerald-600
      { value: "linear-gradient(45deg, #60A5FA, #2563EB)", gradient: true }, // blue-400 → blue-600
      { value: "linear-gradient(45deg, #A78BFA, #6D28D9)", gradient: true }, // violet-400 → violet-700
      { value: "linear-gradient(45deg, #F472B6, #DB2777)", gradient: true }, // pink-400 → pink-600
      { value: "linear-gradient(45deg, #2DD4BF, #0D9488)", gradient: true }, // teal-400 → teal-700
      { value: "linear-gradient(45deg, #FB923C, #C2410C)", gradient: true }, // orange-400 → orange-700
      // Neutral solids
      { value: "#FFFFFF" }, // white
      { value: "#F3F4F6" }, // gray-100
      { value: "#9CA3AF" }, // gray-400
      { value: "#374151" }, // gray-700
      { value: "#111827" }, // gray-900
    ];

    // --- Define multiple palettes ---
    const TAILWIND_COLORS_LIGHT = [
      { value: "#FEE2E2" }, // red-200
      { value: "#FEF3C7" }, // amber-200
      { value: "#BBF7D0" }, // green-200
      { value: "#BFDBFE" }, // blue-200
      { value: "#DDD6FE" }, // violet-200
      { value: "#FBCFE8" }, // pink-200
      { value: "#CCFBF1" }, // teal-200
      { value: "#FED7AA" }, // orange-200
    ];

    const CUSTOM_COLORS = [
      { value: "linear-gradient(45deg, #ff9a9e, #fad0c4)", gradient: true },
      { value: "linear-gradient(45deg, #a18cd1, #fbc2eb)", gradient: true },
      { value: "#FFFFFF" },
      { value: "#F5F5F5" },
      { value: "#6B6E8D" },
      { value: "#2D2D2D" },
    ];

    const GRADIENTS = [
      { value: "linear-gradient(45deg, #f6d365, #fda085)", gradient: true },
      { value: "linear-gradient(45deg, #84fab0, #8fd3f4)", gradient: true },
      { value: "linear-gradient(45deg, #f093fb, #f5576c)", gradient: true },
      { value: "linear-gradient(45deg, #4facfe, #00f2fe)", gradient: true },
      { value: "linear-gradient(45deg, #fa709a, #fee140)", gradient: true },
    ];

    // Define palettes + swatches together
    const PALETTES: {
      name: string;
      value: string;
      colors: { value: string; gradient?: boolean }[];
    }[] = [
      {
        name: "Tailwind 300",
        value: "tailwind-300",
        colors: TAILWIND_COLORS_300,
      },
      { name: "Tailwind", value: "tailwind", colors: TAILWIND_COLORS },
      {
        name: "Tailwind Lt",
        value: "tailwind-light",
        colors: TAILWIND_COLORS_LIGHT,
      },
      { name: "Custom", value: "custom", colors: CUSTOM_COLORS },
      { name: "Gradients", value: "gradients", colors: GRADIENTS },
    ];

    // Single pass — no repetition
    for (const p of PALETTES) {
      await ensurePalette(p.name, p.value, p.colors);
    }
  },
});
