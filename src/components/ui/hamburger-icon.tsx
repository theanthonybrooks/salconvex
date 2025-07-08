import { TooltipSimple } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import styles from "./hamburger-icon.module.css";

interface MenuToggleProps {
  className?: string;
  menuState: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
}

const MenuToggle = ({ className, menuState, setState }: MenuToggleProps) => {
  const isActive = menuState === "open";
  return (
    <TooltipSimple content="Open Menu" side="bottom" align="end">
      <button
        className={cn(
          styles.hamburger,
          isActive && styles.active,
          className,
          "active:scale-90",
        )}
        onClick={() => setState(isActive ? "closed" : "open")}
        aria-label="Toggle menu"
      >
        <svg viewBox="0 0 32 32">
          <path
            className={cn(
              styles.line,
              styles.lineTopBottom,
              "stroke-foreground",
            )}
            d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
          />
          <path
            className={cn("stroke-foreground", styles.line)}
            d="M7 16 27 16"
          />
        </svg>
      </button>
    </TooltipSimple>
  );
};

export default MenuToggle;
