"use client"

import RegisterForm from "@/components/auth/register-form"
import SignInCard from "@/features/auth/components/sign-in-card"
import { SignInFlow } from "@/features/auth/types"
import { useState } from "react"

export const AuthScreen = () => {
  const [state, setState] = useState<SignInFlow>("signIn")
  return (
    <div className='h-full flex items-center justify-center bg-[#5c3b58]'>
      <div className='md:h-auto md:w-[420px]'>
        {state === "signIn" ? (
          <SignInCard setState={setState} />
        ) : (
          <RegisterForm setState={setState} />
        )}
      </div>
    </div>
  )
}
