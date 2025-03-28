"use client"

import { Separator } from "@/components/ui/separator"
import { faqs } from "@/constants/accordions"
import { AccordionComponent } from "@/features/homepage/accordion-component"
import Pricing from "@/features/homepage/pricing"
import { useEffect } from "react"

export default function PricingPage() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const hash = window.location.hash
    console.log("hash", hash)
    if (hash !== "#plans") return

    let attempts = 0
    const maxAttempts = 10
    console.log("attempts", attempts)

    const scrollToSection = () => {
      const section = document.getElementById("plans")
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" })
        // Optional: Clear hash after scrolling
        window.history.replaceState(null, "", window.location.pathname)
      } else if (attempts < maxAttempts) {
        attempts++
        requestAnimationFrame(scrollToSection)
      }
    }

    scrollToSection()
  }, [])

  return (
    <>
      <div className='container mx-auto'>
        {/*       <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16'>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='space-y-4'>
              <h2 className='text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white'>
                Everything You Need
              </h2>
              <p className='text-gray-600 dark:text-gray-400'>
                Our starter kit comes packed with all the essential features you
                need to build modern web applications. No more wasting time on
                repetitive setups.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {features.map((feature) => (
                <div
                  key={feature}
                  className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                  <Check className='h-5 w-5 shrink-0 text-blue-500' />
                  <span>{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>*/}

        <Pricing />
        <Separator
          thickness={3}
          className='w-1/2 min-w-96 mx-auto my-8 max-w-[90vw] '
        />

        <AccordionComponent src={faqs} />
      </div>
    </>
  )
}
