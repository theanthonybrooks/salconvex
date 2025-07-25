import { useSalBackNavigation } from "@/hooks/use-back-navigation";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { IoIosArrowRoundBack } from "react-icons/io";

interface SalBackNavigationProps {
  className?: string;
  format: "desktop" | "mobile";
  user: User | null;
  activeSub?: boolean;
  isOwner?: boolean;
}

export const SalBackNavigation = ({
  className,
  format = "desktop",
  user,
  // activeSub,
  isOwner,
}: SalBackNavigationProps) => {
  const router = useRouter();
  const desktopMode = format === "desktop";
  const navText = "back to The List";
  const isOrganizer = user?.accountType?.includes("organizer") && isOwner;
  const onBackClick = useSalBackNavigation();

  return (
    <>
      {desktopMode ? (
        <div className="mx-auto flex w-fit items-center gap-2">
          <div
            onClick={onBackClick}
            className={cn(
              "col-start-1 row-span-1 mx-auto flex w-max cursor-pointer items-center justify-start gap-x-2 py-6 underline-offset-2 hover:underline active:scale-95",
              className,
            )}
          >
            <IoIosArrowRoundBack className="size-6" />
            {navText}
          </div>
          {isOrganizer && (
            <>
              <p>|</p>
              <div
                onClick={() => router.push("/dashboard/organizer/events")}
                className={cn(
                  "col-start-1 row-span-1 mx-auto flex w-max cursor-pointer items-center justify-start gap-x-2 py-6 underline-offset-2 hover:underline active:scale-95",
                  className,
                )}
              >
                to Organizer Dashboard
              </div>
            </>
          )}
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
