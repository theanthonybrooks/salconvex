import { useEffect, useState } from "react";

import { useDevice } from "@/providers/device-provider";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query, matches]);

  return matches;
}

export function useIsMobile(maxHeight?: number): boolean {
  const { isMobile: isMobileDevice } = useDevice();
  const isMobileSize = useMediaQuery(`(max-width: ${maxHeight ?? 1024}px)`);
  return isMobileDevice || isMobileSize;
}
