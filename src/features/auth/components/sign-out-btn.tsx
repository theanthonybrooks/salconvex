import React from "react";
import { usePathname, useRouter } from "next/navigation";

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
  const pathname = usePathname();
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
        localStorage.clear();

        await signOut();
        // console.log({ pathname, thelist: pathname.includes("/thelist") });
        if (pathname.includes("/thelist")) {
          router.push("/auth/sign-in");
        }
      }}
    >
      {children}
    </span>
  );
};

export default SignOutBtn;
