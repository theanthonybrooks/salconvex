import { Button } from "@/components/ui/button"
import { useAuthActions } from "@convex-dev/auth/react"

import React from "react"

interface SignOutBtnProps {
  children?: React.ReactNode
}

const SignOutBtn: React.FC<SignOutBtnProps> = ({ children }) => {
  const { signOut } = useAuthActions()
  return (
    <span
      className='hover:underline underline-offset-2 hover:cursor-pointer'
      onClick={() => signOut()}>
      {children}
    </span>
  )
}

export default SignOutBtn
