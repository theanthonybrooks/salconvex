import {
  AnimationOptions,
  DOMKeyframesDefinition,
  ElementOrSelector,
  useAnimate,
} from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

const TRANSITION: AnimationOptions = {
  ease: "easeInOut",
  duration: 0.5,
};

export const TimelineExample = () => {
  const scope = useMotionTimeline(
    [
      [".bar-2", { height: 48 }, TRANSITION],
      [
        [".bar-1", { x: -24 }, TRANSITION],
        [".bar-3", { x: 24 }, TRANSITION],
      ],
      [
        [".bar-1", { height: 48, rotate: 90 }, TRANSITION],
        [".bar-3", { height: 48, rotate: -90 }, TRANSITION],
      ],
      [
        [".bar-1", { x: 48 }, TRANSITION],
        [".bar-3", { x: -48 }, TRANSITION],
      ],
      [
        [".bar-1", { rotate: 120, background: "#059669" }, TRANSITION],
        [".bar-2", { rotate: -120, background: "#34d399" }, TRANSITION],
        [".bar-3", { rotate: 90 }, TRANSITION],
      ],
      [
        [
          ".bar-1",
          { rotate: 0, x: 0, height: 96, background: "#FFFFFF" },
          { ...TRANSITION, delay: 2 },
        ],
        [
          ".bar-2",
          { rotate: 0, height: 96, background: "#FFFFFF" },
          { ...TRANSITION, delay: 2 },
        ],
        [
          ".bar-3",
          { rotate: 0, x: 0, height: 96, background: "#FFFFFF" },
          { ...TRANSITION, delay: 2 },
        ],
      ],
    ],
    Infinity,
  );

  return (
    <div
      ref={scope}
      className="bg-grid-zinc-900 flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950"
    >
      <div
        style={{
          width: 48,
          height: 96,
        }}
        className="bar-1 bg-white"
      />
      <div
        style={{
          width: 48,
          height: 96,
        }}
        className="bar-2 bg-white"
      />
      <div
        style={{
          width: 48,
          height: 96,
        }}
        className="bar-3 bg-white"
      />
    </div>
  );
};

type AnimateParams = [
  ElementOrSelector,
  DOMKeyframesDefinition,
  (AnimationOptions | undefined)?,
];

type Animation = AnimateParams | Animation[];

export const useMotionTimeline = (
  keyframes: Animation[],
  count: number = 1,
) => {
  const mounted = useRef(true);

  const [scope, animate] = useAnimate();

  const isAnimationArray = (animation: Animation): animation is Animation[] => {
    return Array.isArray(animation[0]);
  };

  const processAnimation = useCallback(
    async (animation: Animation) => {
      if (isAnimationArray(animation)) {
        await Promise.all(animation.map(processAnimation));
      } else {
        await animate(...animation);
      }
    },
    [animate],
  );

  const handleAnimate = useCallback(async () => {
    for (let i = 0; i < count; i++) {
      for (const animation of keyframes) {
        if (!mounted.current) return;
        await processAnimation(animation);
      }
    }
  }, [count, keyframes, processAnimation]);

  useEffect(() => {
    mounted.current = true;

    handleAnimate();

    return () => {
      mounted.current = false;
    };
  }, [handleAnimate]);

  return scope;
};
