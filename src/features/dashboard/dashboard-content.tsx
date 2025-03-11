"use client"

interface DashboardContentProps {
  children: React.ReactNode
  //   setIsScrolled?: (value: boolean) => void
}

export default function DashboardContent({
  children,
}: //   setIsScrolled,
DashboardContentProps) {
  return <main className='flex-1 scrollable '>{children}</main>
}
