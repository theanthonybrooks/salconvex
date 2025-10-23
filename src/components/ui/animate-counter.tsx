import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

interface AnimatedCounterProps {
  to: number;
  duration?: number;
  className?: string;
  plus?: boolean;
}

export function AnimatedCounter({
  to,
  duration = 1,
  className,
  plus = false,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.9 });

  useEffect(() => {
    // console.log("isInView value:", isInView, hasAnimated);
    if (!isInView) return;

    setHasAnimated(true);
    const controls = animate(0, to, {
      duration,
      ease: "easeInOut",
      onUpdate(value) {
        // console.log("Animating value:", value);
        setDisplay(Math.floor(value));
      },
    });
    return controls.stop;
  }, [isInView, to, duration, hasAnimated]);

  //   useEffect(() => {
  //     function logRect() {
  //       if (!ref.current) return;
  //       const rect = ref.current.getBoundingClientRect();
  //       console.log("Counter bounding rect:", rect);
  //       console.log(
  //         "Window innerHeight:",
  //         window.innerHeight,
  //         "ScrollY:",
  //         window.scrollY,
  //       );
  //     }
  //     logRect();
  //     window.addEventListener("scroll", logRect, { passive: true });
  //     window.addEventListener("resize", logRect);

  //     return () => {
  //       window.removeEventListener("scroll", logRect);
  //       window.removeEventListener("resize", logRect);
  //     };
  //   }, []);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString()}
      {plus && "+"}
    </span>
  );
}
