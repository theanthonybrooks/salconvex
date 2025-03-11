"use client"

import Loader from "@/components/ui/washing-loader"
import { useConvexAuth } from "convex/react"
import { AnimatePresence, motion } from "framer-motion"
import { useRef } from "react"

export default function ClientAuthWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  // const pathname = usePathname()
  // const { theme } = useTheme()
  const { isLoading } = useConvexAuth()
  const targetRef = useRef(null)
  // const { scrollYProgress } = useScroll({ target: targetRef })
  // useMotionValueEvent(scrollYProgress, "change", (latest) => {
  //   console.log("Page scroll: ", latest)
  // })

  // const smoothScrollProgress = useSpring(scrollYProgress, {
  //   stiffness: 100, // Lower stiffness for a softer feel
  //   damping: 20, // Higher damping to prevent jumpiness
  //   mass: 0.4, // Controls weight of the movement
  // })

  // const isPublicPage = !pathname.startsWith("/thelist")

  return (
    <div>
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
            ref={targetRef}
            key='content'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}>
            {/* {isPublicPage && (
              <motion.div
                id='scroll-indicator'
                // initial={{ opacity: 0 }}
                className={cn(
                  "z-20",
                  theme === "default" ? "bg-salPink" : "bg-salProgress"
                )}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                  scaleX: smoothScrollProgress,
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 10,
                  originX: 0,
                }}
              />
            )} */}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
