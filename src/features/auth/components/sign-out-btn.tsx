import { Button } from "@/components/ui/button"
import { useAuthActions } from "@convex-dev/auth/react"

import React from "react"

interface SignOutBtnProps {
  children?: React.ReactNode
}

const SignOutBtn: React.FC<SignOutBtnProps> = ({ children }) => {
  const { signOut } = useAuthActions()
  return (
    <Button variant='link' onClick={() => signOut()}>
      {children}
    </Button>
  )
}

export default SignOutBtn
