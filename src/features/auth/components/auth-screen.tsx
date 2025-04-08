"use client";

import ForgotPassword from "@/features/auth/components/forgot-password";
import RegisterForm from "@/features/auth/components/register-form";
import SignInCard from "@/features/auth/components/sign-in-card";
import { cn } from "@/lib/utils";

import { usePathname, useRouter } from "next/navigation";

export default function AuthScreen() {
  const router = useRouter();
  const pathname = usePathname();
  // const callbackUrl = useSearchParams().get("src")

  // Create booleans based on the URL.
  const isRegister = pathname.endsWith("/register");
  const isForgotPassword = pathname.endsWith("/forgot-password");
  // const isSignIn = !isRegister && !isForgotPassword // default

  const switchFlow = (target: "signIn" | "register" | "forgotPassword") => {
    let targetPath = "/auth/sign-in"; // default
    if (target === "register") {
      targetPath = "/auth/register";
    } else if (target === "forgotPassword") {
      targetPath = "/auth/forgot-password";
    }

    router.push(targetPath);
  };

  return (
    <div
      className={cn(
        "auth-cont scrollable invis grid h-dvh place-items-center overflow-y-auto bg-salYellow",
      )}
    >
      {/* //note-to-self: this md:py value is a hack to center the auth card vertically. The 900px portion is the ~height of the card element (for the register card). The 40px is the min height.  */}
      <div className="grid place-items-center md:h-auto md:w-[500px] md:py-10">
        {isRegister ? (
          <RegisterForm switchFlow={() => switchFlow("signIn")} />
        ) : isForgotPassword ? (
          <ForgotPassword switchFlow={() => switchFlow("signIn")} />
        ) : (
          <SignInCard
            // For the sign-in card, you might want to provide both options:
            switchFlow={() => switchFlow("register")}
            forgotPasswordHandler={() => switchFlow("forgotPassword")}
          />
        )}
      </div>
    </div>
  );
}
