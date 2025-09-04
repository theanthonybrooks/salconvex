import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

interface FormErrorProps {
  message?: ReactNode;
  className?: string;
  icon?: boolean;
}

export const FormError = ({
  message,
  className,
  icon = true,
}: FormErrorProps) => {
  if (!message) return null;
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-x-3 rounded-md border-2 border-destructive/30 bg-destructive/15 p-4 text-sm font-medium text-destructive",
        className,
      )}
    >
      {icon && <FaExclamationTriangle className={cn("size-10 shrink-0")} />}
      <span className="text-balance text-center"> {message}</span>
    </div>
  );
};
