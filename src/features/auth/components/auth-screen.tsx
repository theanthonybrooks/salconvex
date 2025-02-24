"use client"

import SignInCard from "@/features/auth/components/sign-in-card"
import SignUpCard from "@/features/auth/components/sign-up-card"
import { SignInFlow } from "@/features/auth/types"
import { useState } from "react"

export const AuthScreen = () => {
  const [state, setState] = useState<SignInFlow>("signIn")
  return (
    <div
      className='h-full flex items-center justify-center '
      style={{ backgroundColor: "#5c3b58" }}>
      <div className='md:h-auto md:w-[420px]'>
        {state === "signIn" ? (
          <SignInCard setState={setState} />
        ) : (
          <SignUpCard setState={setState} />
        )}
      </div>
    </div>
  )
}
