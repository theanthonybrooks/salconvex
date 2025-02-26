import { Button } from "@/components/ui/button"
import { useAuthActions } from "@convex-dev/auth/react"

import React from "react"

interface SignOutBtnProps {}

const SignOutBtn: React.FC<SignOutBtnProps> = () => {
  const { signOut } = useAuthActions()
  return (
    <Button variant='destructive' onClick={() => signOut()}>
      Sign Out
    </Button>
  )
}

export default SignOutBtn
