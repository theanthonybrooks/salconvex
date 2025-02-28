// import { AuthScreen } from "@/features/auth/components/auth-screen"
import AuthScreen from "@/features/auth/components/auth-screen"
import React from "react"

interface AuthPageProps {}

const AuthPage: React.FC<AuthPageProps> = () => {
  return (
    <div className='h-screen'>
      <AuthScreen />
    </div>
  )
}

export default AuthPage
