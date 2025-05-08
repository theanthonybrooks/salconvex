import { useEffect } from "react";

export function useScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
}
