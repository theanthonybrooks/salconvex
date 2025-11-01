"use client";

import { useEffect, useRef, useState } from "react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/helpers/utilsFns";

interface MobileTimePickerProps {
  date?: Date;
  minDate?: number;
  onChange: (newDate: Date) => void;
}

export function MobileTimePicker({
  date,
  minDate,
  onChange,
}: MobileTimePickerProps) {
  const current = date ?? new Date();
  const hour12 = ((current.getHours() + 11) % 12) + 1;
  const minute = current.getMinutes();
  const period = current.getHours() >= 12 ? "PM" : "AM";

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const periods = ["AM", "PM"];

  const updateDate = (h: string, m: string, p: string) => {
    const base = date ? new Date(date) : new Date();
    let hour = parseInt(h, 10);
    const minute = parseInt(m, 10);
    if (p === "PM" && hour < 12) hour += 12;
    if (p === "AM" && hour === 12) hour = 0;

    const newDate = new Date(base);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    newDate.setSeconds(0);

    if (minDate && newDate.getTime() < minDate) return;
    onChange(newDate);
  };

  return (
    <div className="h-30 relative flex w-full max-w-[80dvw] items-center justify-center gap-2 overflow-hidden rounded-xl border-1.5 bg-card p-2">
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex h-8 items-center justify-center bg-gradient-to-b from-card to-transparent" />
      <Dial
        items={hours}
        selected={hour12.toString()}
        onSelect={(val) =>
          updateDate(val, minute.toString().padStart(2, "0"), period)
        }
      />
      <Separator orientation="vertical" thickness={2} className="mx-2" />
      <Dial
        items={minutes}
        selected={minute.toString().padStart(2, "0")}
        onSelect={(val) => updateDate(hour12.toString(), val, period)}
      />
      <Separator orientation="vertical" thickness={2} className="mx-2" />
      <Dial
        items={periods}
        selected={period}
        onSelect={(val) =>
          updateDate(hour12.toString(), minute.toString().padStart(2, "0"), val)
        }
      />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-8 items-center justify-center bg-gradient-to-t from-card to-transparent" />
    </div>
  );
}

interface DialProps {
  items: string[];
  selected: string;
  onSelect: (val: string) => void;
}

function Dial({ items, selected, onSelect }: DialProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 120;
  const VISIBLE_COUNT = 1;
  const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;
  const CENTER_Y = CONTAINER_HEIGHT / 2;
  const SNAP_THRESHOLD = ITEM_HEIGHT - 2;

  const [isSnapping, setIsSnapping] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = () => {
    if (isSnapping) return;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      if (!ref.current) return;

      const scrollTop = ref.current.scrollTop;
      const nearestIndex = Math.round(
        (scrollTop + CENTER_Y - ITEM_HEIGHT / 2) / ITEM_HEIGHT,
      );
      // const nearestIndex = Math.round(
      //   (scrollTop - (CENTER_Y - ITEM_HEIGHT / 2) + CENTER_Y) / ITEM_HEIGHT,
      // );

      const bounded = Math.max(0, Math.min(nearestIndex, items.length - 1));

      const itemCenter =
        bounded * ITEM_HEIGHT + ITEM_HEIGHT / 2 - (scrollTop + CENTER_Y);
      const diff = Math.abs(itemCenter);

      // Only snap if very close to center
      if (diff < SNAP_THRESHOLD) {
        const newValue = items[bounded];
        setIsSnapping(true);
        ref.current.scrollTo({
          top: bounded * ITEM_HEIGHT - (CENTER_Y - ITEM_HEIGHT / 2),
          behavior: "auto",
        });
        if (newValue !== selected) onSelect(newValue);
        setTimeout(() => setIsSnapping(false), 60);
      }
    }, 50);
  };

  useEffect(() => {
    if (!ref.current) return;
    const index = items.indexOf(selected);
    if (index !== -1) {
      ref.current.scrollTop =
        index * ITEM_HEIGHT - (CENTER_Y - ITEM_HEIGHT / 2);
    }
  }, [selected, items, CENTER_Y]);

  return (
    <div className="h-30 relative flex w-fit flex-col items-center overflow-hidden">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="scrollable mini invis block w-full scroll-smooth"
      >
        {/* top spacer so first can center */}
        <div style={{ minHeight: CENTER_Y - ITEM_HEIGHT / 2 }} />
        {items.map((item) => (
          <div
            key={item}
            style={{ minHeight: ITEM_HEIGHT }}
            className={cn(
              "flex w-full items-center justify-center text-5xl font-medium transition-colors",
              item === selected ? "text-foreground" : "text-foreground/40",
            )}
          >
            {item}
          </div>
        ))}
        {/* bottom spacer so last can center */}
        <div style={{ minHeight: CENTER_Y - ITEM_HEIGHT / 2 }} />
      </div>

      {/* center indicator
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 border-y border-foreground/30 py-2" /> */}
    </div>
  );
}
