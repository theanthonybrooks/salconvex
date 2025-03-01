import { Button } from "@/components/ui/button"
import Link from "next/link"

type Props = {
  label: string
  href: string
}

const BackButton = ({ label, href }: Props) => {
  return (
    <Button variant='link' size='lg' className='font-normal w-full'>
      <Link href={href}>{label}</Link>
    </Button>
  )
}

export default BackButton
