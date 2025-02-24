import SignInCard from "@/features/auth/components/sign-in-card"
import React from "react"

interface TestPageProps {
  children?: React.ReactNode
}

const TestPage: React.FC<TestPageProps> = ({ children }) => {
  return (
    <div>
      <SignInCard />
      {children}
    </div>
  )
}

export default TestPage
