import { useSalBackNavigation } from "@/hooks/use-back-navigation";
import { cn } from "@/lib/utils";
import { IoIosArrowRoundBack } from "react-icons/io";

interface SalBackNavigationProps {
  className?: string;
  format: "desktop" | "mobile";
}

export const SalBackNavigation = ({
  className,
  format = "desktop",
}: SalBackNavigationProps) => {
  const onBackClick = useSalBackNavigation();
  const desktopMode = format === "desktop";
  const navText = "back to The List";

  return (
    <>
      {desktopMode ? (
        <div
          onClick={onBackClick}
          className={cn(
            "col-start-1 row-span-1 mx-auto flex w-max cursor-pointer items-center justify-start gap-x-2 py-6 underline-offset-2 hover:underline active:scale-95",
            className,
          )}
        >
          <IoIosArrowRoundBack className="size-6" /> {navText}
        </div>
      ) : (
        <div
          onClick={onBackClick}
          className={cn(
            "flex cursor-pointer items-center justify-start gap-x-2 py-6 underline-offset-2 hover:underline active:scale-95 lg:hidden",
            className,
          )}
        >
          <IoIosArrowRoundBack className="size-6" /> {navText}
        </div>
      )}
    </>
  );
};
