import { cn } from "@/lib/utils";
import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

interface FormErrorProps {
  message?: React.ReactNode;
  className?: string;
}

export const FormError = ({ message, className }: FormErrorProps) => {
  if (!message) return null;
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-x-3 rounded-md bg-destructive/15 p-4 text-sm text-destructive",
        className,
      )}
    >
      <FaExclamationTriangle className={cn("size-10 shrink-0")} />
      <span className="text-center"> {message}</span>
    </div>
  );
};
