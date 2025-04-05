"use client";

interface DashboardContentProps {
  children: React.ReactNode;
  //   setIsScrolled?: (value: boolean) => void
}

export default function DashboardContent({
  children,
}: //   setIsScrolled,
DashboardContentProps) {
  return (
    <main className="scrollable bg-dashboardBgLt max-h-[calc(100dvh-80px)] flex-1 white:bg-stone-200">
      {children}
    </main>
  );
}
