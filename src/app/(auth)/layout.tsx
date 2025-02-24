import React from "react"

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen  items-center justify-center bg-slate-400 '>
      {children}
    </div>
  )
}

export default AuthLayout
