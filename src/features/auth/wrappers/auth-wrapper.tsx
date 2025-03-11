"use client"

import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

export default function ClientAuthWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  // const { theme } = useTheme()
  // const { isLoading } = useConvexAuth()
  const targetRef = useRef(null)

  const invisScrollPages = ["/", "/auth"]

  const isInvisScrollPage =
    pathname === "/" ||
    invisScrollPages.some((path) => path !== "/" && pathname.startsWith(path))

  useEffect(() => {
    if (isInvisScrollPage) {
      document.body.classList.add("invis")
    } else {
      document.body.classList.remove("invis")
    }

    // No need for a cleanup function because it's handled by the else condition
  }, [pathname, isInvisScrollPage])
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
      </AnimatePresence>
    </div>
  )
}
