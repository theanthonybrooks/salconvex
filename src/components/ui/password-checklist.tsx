import { passwordRules } from "@/schemas/auth";
import { Check, X } from "lucide-react";

interface PasswordChecklistProps {
  password: string;
  checkPassword?: string;
  type?: "register" | "update" | "forgot";
}

export const PasswordChecklist = ({
  password,
  checkPassword,
  type,
}: PasswordChecklistProps) => {
  const isRepeatValid = password === checkPassword && password.length > 0;

  return (
    <ul className="!mt-4 ml-3 space-y-1 text-sm">
      {passwordRules.map((rule) => {
        const isValid = rule.test(password);
        return (
          <li key={rule.label} className="flex items-center gap-2">
            {isValid ? (
              <Check className="size-4 text-green-700" />
            ) : (
              <X className="size-4 text-red-500" />
            )}
            <span className={isValid ? "text-green-700" : "text-foreground/70"}>
              {rule.label}
            </span>
          </li>
        );
      })}

      {type !== "register" && (
        <li className="flex items-center gap-2">
          {isRepeatValid ? (
            <Check className="size-4 text-green-700" />
          ) : (
            <X className="size-4 text-red-500" />
          )}
          <span
            className={isRepeatValid ? "text-green-700" : "text-foreground/70"}
          >
            New passwords match
          </span>
        </li>
      )}
    </ul>
  );
};
