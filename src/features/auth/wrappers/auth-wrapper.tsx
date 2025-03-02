"use client"

import Loader from "@/components/ui/washing-loader"
import { useConvexAuth } from "convex/react"
import { AnimatePresence, motion } from "framer-motion"

export default function ClientAuthWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, isAuthenticated } = useConvexAuth()

  return (
    <AnimatePresence mode='wait'>
      {isLoading ? (
        <motion.div
          key='loader'
          className='flex items-center justify-center min-h-screen'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <Loader />
        </motion.div>
      ) : (
        <motion.div
          key='content'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
