import { cn } from "@/helpers/utilsFns";
import { Poppins } from "next/font/google";
import Link from "next/link";

const font = Poppins({ subsets: ["latin"], weight: "600" });

interface HeaderProps {
  label: string;
  hasHeader?: boolean;
}

export const Header = ({ label, hasHeader }: HeaderProps) => {
  return (
    <>
      {hasHeader ? (
        <div className="flex w-full flex-col items-center justify-center gap-y-4">
          <h1 className={cn("text-3xl font-semibold", font.className)}>
            🔐 Auth
          </h1>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-y-4">
          <h1 className={cn("text-2xl font-semibold", font.className)}>
            {label}
          </h1>
          <p className="text-sm text-muted-foreground">
            Read more about account types{" "}
            <Link href="/pricing" className="hover:underline">
              here
            </Link>
          </p>
        </div>
      )}
    </>
  );
};
