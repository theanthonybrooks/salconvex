import { cn } from "@/helpers/utilsFns";
import { ReactNode } from "react";
import { FaCheckCircle } from "react-icons/fa";

interface FormSuccessProps {
  message?: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export const FormSuccess = ({ message, className, icon }: FormSuccessProps) => {
  if (!message) return null;
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-x-2 rounded-md border-2 border-emerald-500/30 bg-emerald-500/15 p-3 text-sm font-medium text-emerald-700",
        className,
      )}
    >
      {icon ? icon : <FaCheckCircle className="size-4" />}
      <span className="text-balance text-center"> {message}</span>
    </div>
  );
};
