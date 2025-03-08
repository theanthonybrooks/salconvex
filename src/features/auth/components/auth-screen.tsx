"use client"

import ForgotPassword from "@/features/auth/components/forgot-password"
import RegisterForm from "@/features/auth/components/register-form"
import SignInCard from "@/features/auth/components/sign-in-card"
import { cn } from "@/lib/utils"

import { usePathname, useRouter } from "next/navigation"

export default function AuthScreen() {
  const router = useRouter()
  const pathname = usePathname()

  // Create booleans based on the URL.
  const isRegister = pathname.endsWith("/register")
  const isForgotPassword = pathname.endsWith("/forgot-password")
  // const isSignIn = !isRegister && !isForgotPassword // default

  const switchFlow = (target: "signIn" | "register" | "forgotPassword") => {
    let targetPath = "/auth/sign-in" // default
    if (target === "register") {
      targetPath = "/auth/register"
    } else if (target === "forgotPassword") {
      targetPath = "/auth/forgot-password"
    }
    router.push(targetPath)
  }

  return (
    <div
      className={cn(
        "h-dvh  sm: min-h-screen flex overflow-y-auto justify-center items-start mt-4 sm:items-center sm:mt-0  bg-salYellow auth-cont scrollable invis"
      )}>
      <div className='md:h-auto md:w-[500px] md:py-10'>
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
  )
}
