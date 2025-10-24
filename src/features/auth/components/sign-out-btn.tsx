import React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/helpers/utilsFns";

import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "~/convex/_generated/api";
import { useMutation } from "convex/react";

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
        // localStorage.clear(); //!add this back if I keep running into issues with the wrong theme popping up occasionally

        await signOut();
        router.push("/auth/sign-in");
      }}
    >
      {children}
    </span>
  );
};

export default SignOutBtn;
