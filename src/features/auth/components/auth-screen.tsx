"use client"

import RegisterForm from "@/components/auth/register-form"
import ForgotPassword from "@/features/auth/components/forgot-password"
import SignInCard from "@/features/auth/components/sign-in-card"

import { usePathname, useRouter } from "next/navigation"

export default function AuthScreen() {
  const router = useRouter()
  const pathname = usePathname()

  // Create booleans based on the URL.
  const isRegister = pathname.endsWith("/register")
  const isForgotPassword = pathname.endsWith("/forgot-password")
  const isSignIn = !isRegister && !isForgotPassword // default

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
    <div className='h-full flex items-center justify-center bg-[#5c3b58]'>
      <div className='md:h-auto md:w-[420px]'>
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
