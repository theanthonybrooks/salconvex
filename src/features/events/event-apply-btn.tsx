import { Button } from "@/components/ui/button"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

interface ApplyButtonProps {
  id: number
  status: "accepted" | "rejected" | "pending" | null
  openCall: boolean
  publicView?: boolean
}

const ApplyButton: React.FC<ApplyButtonProps> = ({
  id,
  status,
  openCall,
  publicView,
}) => {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const statusText =
    status === "accepted"
      ? "Applied: Accepted"
      : status === "rejected"
      ? "Applied: Rejected"
      : "Applied: Pending"

  const initialText = status === null && openCall ? "Apply" : statusText

  const shouldHoverSwap = status !== null

  const textToShow = shouldHoverSwap && isHovered ? "View more" : initialText

  return (
    <Button
      variant='salWithShadowHidden'
      size='lg'
      className='bg-white/60 relative overflow-hidden'
      onClick={
        publicView
          ? () => router.push("/pricing")
          : () => router.push(`/thelist/event/${id}`)
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <AnimatePresence mode='wait' initial={false}>
        <motion.span
          key={textToShow}
          initial={{ opacity: 1, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2, type: "tween" }}
          className='absolute inset-0 flex items-center justify-center'>
          {textToShow}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

export default ApplyButton
