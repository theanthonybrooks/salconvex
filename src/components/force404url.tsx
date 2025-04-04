// components/Fake404Url.tsx
"use client";

import { useEffect } from "react";

export default function Fake404Url() {
  useEffect(() => {
    if (window.location.pathname !== "/404-not-found") {
      window.history.replaceState(null, "", "/404-not-found");
    }
  }, []);

  return null;
}
