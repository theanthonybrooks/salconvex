import { cn } from "@/helpers/utilsFns";

// app/(public)/links/layout.tsx
export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className={cn(
        "scrollable [@media(max-width:640px)]:mini relative flex h-full w-full flex-1 flex-col items-center gap-3 px-6 py-10",
      )}
    >
      {children}
    </main>
  );
}
