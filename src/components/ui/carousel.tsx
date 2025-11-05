"use client";

import type { UseEmblaCarouselType } from "embla-carousel-react";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { cn } from "@/helpers/utilsFns";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
  onSelectIndexChange?: (index: number) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollSnaps: number[];
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      onSelectIndexChange,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins,
    );
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onSelect = useCallback(
      (api: CarouselApi) => {
        if (!api) {
          return;
        }

        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
        setSelectedIndex(api.selectedScrollSnap());

        if (typeof onSelectIndexChange === "function") {
          onSelectIndexChange(api.selectedScrollSnap() + 1);
        }
      },
      [onSelectIndexChange],
    );

    const scrollPrev = useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext],
    );

    useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      setScrollSnaps(api.scrollSnapList());
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      return () => {
        api?.off("select", onSelect);
        api?.off("reInit", onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          selectedIndex,
          scrollSnaps,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    rounded?: "sm" | "both";
  }
>(({ className, rounded, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className={cn(
        "h-full overflow-hidden",
        rounded === "sm"
          ? "rounded-xl sm:rounded-none"
          : rounded === "both"
            ? "rounded-xl"
            : "",
      )}
    >
      <div
        ref={ref}
        className={cn(
          "flex h-full",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "h-full min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = "CarouselItem";
type CarouselButtonProps = React.ComponentProps<typeof Button> & {
  inset?: boolean;
};
const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  CarouselButtonProps
>(
  (
    { className, variant = "outline", size = "icon", inset = true, ...props },
    ref,
  ) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute size-10 rounded-full border-0 hover:scale-105 hover:bg-background active:scale-95 disabled:opacity-0",
          orientation === "horizontal"
            ? "top-1/2 translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          inset && orientation === "horizontal" && "left-6 md:left-10",
          !inset && orientation === "horizontal" && "-left-6 md:-left-10",
          className,
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <FaChevronLeft className="size-6" />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  },
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselButtonProps>(
  (
    { className, variant = "outline", size = "icon", inset = true, ...props },
    ref,
  ) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute size-10 rounded-full border-0 hover:scale-105 hover:bg-background active:scale-95 disabled:opacity-0",
          orientation === "horizontal"
            ? "top-1/2 translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          inset && orientation === "horizontal" && "right-6 md:right-10",
          !inset && orientation === "horizontal" && "-right-6 md:-right-10",

          className,
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <FaChevronRight className="size-6" />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  },
);
CarouselNext.displayName = "CarouselNext";

type CarouselDotsProps = {
  className?: string;
};
function CarouselDots({ className }: CarouselDotsProps) {
  const { scrollSnaps, selectedIndex, api } = useCarousel();

  return (
    <div className={cn("mx-auto mt-4 flex justify-center gap-2", className)}>
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          onClick={() => api?.scrollTo(index)}
          className={cn(
            "size-2 rounded-full transition-all duration-300",

            index === selectedIndex
              ? "scale-150 bg-foreground/50"
              : "bg-foreground/50 hover:bg-foreground/50",
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}

CarouselDots.displayName = "CarouselDots";

export {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
};
