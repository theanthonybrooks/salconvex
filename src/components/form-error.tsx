import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

interface FormErrorProps {
  message?: React.ReactNode;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;
  return (
    <div className="flex items-center justify-center gap-x-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
      <FaExclamationTriangle className="size-8 shrink-0 pl-3" />
      <span className="text-center"> {message}</span>
    </div>
  );
};
