import { useSalBackNavigation } from "@/hooks/use-back-navigation";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { IoIosArrowRoundBack } from "react-icons/io";

interface SalBackNavigationProps {
  className?: string;
  format: "desktop" | "mobile";
  user: User | null;
  activeSub?: boolean;
}

export const SalBackNavigation = ({
  className,
  format = "desktop",
  user,
  activeSub,
}: SalBackNavigationProps) => {
  const desktopMode = format === "desktop";
  const navText = "back to The List";
  const isOrganizerOnly =
    user?.accountType?.includes("organizer") && !activeSub;
  const onBackClick = useSalBackNavigation("/thelist", isOrganizerOnly);

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
          <IoIosArrowRoundBack className="size-6" />{" "}
          {isOrganizerOnly ? "Back to my dashboard" : navText}
        </div>
      ) : (
        <div
          onClick={onBackClick}
          className={cn(
            "flex cursor-pointer items-center justify-start gap-x-2 py-6 underline-offset-2 hover:underline active:scale-95 lg:hidden",
            className,
          )}
        >
          <IoIosArrowRoundBack className="size-6" />{" "}
          {isOrganizerOnly ? "Back to my dashboard" : navText}
        </div>
      )}
    </>
  );
};
