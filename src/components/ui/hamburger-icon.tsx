import { cn } from "@/lib/utils";

interface MenuToggleProps {
  className?: string;
  menuState: string;
  setState: React.Dispatch<React.SetStateAction<string>>;
}

const MenuToggle = ({ className, menuState, setState }: MenuToggleProps) => {
  return (
    <button
      className={cn(
        `hamburger ${menuState === "open" ? "active" : ""}`,
        className,
      )}
      onClick={() => setState(menuState === "open" ? "closed" : "open")}
      aria-label="Toggle menu"
    >
      <svg viewBox="0 0 32 32">
        <path
          className="line line-top-bottom stroke-foreground"
          d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
        />
        <path className="line stroke-foreground" d="M7 16 27 16" />
      </svg>
    </button>
  );
};

export default MenuToggle;
