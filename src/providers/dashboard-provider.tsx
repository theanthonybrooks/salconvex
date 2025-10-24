// app/components/BodyClassSync.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function DashboardClassSync() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    const isDashboard = pathname.startsWith("/dashboard");

    // Toggle classes directly on the real DOM
    html.classList.toggle("overflow-hidden", isDashboard);
    document.body.classList.toggle("scrollable", !isDashboard);
  }, [pathname]);

  return null;
}
