import { cn } from "@/helpers/utilsFns";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";

import React from "react";
import { api } from "~/convex/_generated/api";

interface SignOutBtnProps {
  children?: React.ReactNode;
  email?: string;
  className?: string;
}

const SignOutBtn = ({ children, email, className }: SignOutBtnProps) => {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const updateLastActive = useMutation(api.users.updateUserLastActive);
  return (
    <span
      className={cn(
        "underline-offset-2 hover:cursor-pointer hover:underline",
        className,
      )}
      onClick={async () => {
        await updateLastActive({ email: email ?? "" });
        sessionStorage.clear();

        await signOut();
        router.push("/auth/sign-in");
      }}
    >
      {children}
    </span>
  );
};

export default SignOutBtn;
