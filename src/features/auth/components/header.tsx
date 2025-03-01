import { cn } from "@/lib/utils"
import { Poppins } from "next/font/google"
import Link from "next/link"

const font = Poppins({ subsets: ["latin"], weight: "600" })

interface HeaderProps {
  label: string
  hasHeader?: boolean
}

export const Header = ({ label, hasHeader }: HeaderProps) => {
  return (
    <>
      {hasHeader ? (
        <div className='w-full flex flex-col gap-y-4 items-center justify-center'>
          <h1 className={cn("text-3xl font-semibold ", font.className)}>
            🔐 Auth
          </h1>
          <p className='text-muted-foreground text-sm'>{label}</p>
        </div>
      ) : (
        <div className='w-full flex flex-col gap-y-4 items-center justify-center'>
          <h1 className={cn("text-2xl font-semibold ", font.className)}>
            {label}
          </h1>
          <p className='text-muted-foreground text-sm'>
            Read more about account types{" "}
            <Link href='/pricing' className='hover:underline'>
              here
            </Link>
          </p>
        </div>
      )}
    </>
  )
}
