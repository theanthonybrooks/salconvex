import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

import React from "react";

interface SignOutBtnProps {
  children?: React.ReactNode;
}

const SignOutBtn: React.FC<SignOutBtnProps> = ({ children }) => {
  const { signOut } = useAuthActions();
  const router = useRouter();
  return (
    <span
      className="underline-offset-2 hover:cursor-pointer hover:underline"
      onClick={() => {
        sessionStorage.clear();
        signOut();
        router.push("/auth/sign-in");
      }}
    >
      {children}
    </span>
  );
};

export default SignOutBtn;
