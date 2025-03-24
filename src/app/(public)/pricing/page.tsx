"use client"

import { faqs2 } from "@/constants/accordions"
import { AccordionComponent } from "@/features/homepage/accordion-component"
import Pricing from "@/features/homepage/pricing"
import { motion } from "framer-motion"
import { Check, DollarSign } from "lucide-react"
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

  const features = [
    "Authentication & Authorization",
    "Payment Processing",
    "SEO Optimization",
    "TypeScript Support",
    "Database Integration",
    "Dark Mode Support",
    "Responsive Design",
    "API Integration",
  ]

  return (
    <>
      <div className='container mx-auto px-4'>
        <section className='relative flex flex-col items-center justify-center py-20'>
          {/* Background gradient */}
          <div className='absolute inset-0 -z-10 h-full w-full bg-white dark:bg-foreground bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]'>
            <div className='absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 dark:bg-blue-500 opacity-20 blur-[100px]'></div>
          </div>

          <div className='space-y-6 text-center'>
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='mx-auto w-fit rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 px-4 py-1 mb-6'>
              <div className='flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-200'>
                <DollarSign className='h-4 w-4' />
                <span>Simple, Transparent Pricing</span>
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white animate-gradient-x pb-2'>
              Choose Your Perfect Plan
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
              Get started with our powerful Next.js starter kit and build your
              next big idea faster than ever
            </motion.p>
          </div>
        </section>

        <section className='py-12'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16'>
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
          </div>

          <div className='py-8'>
            <Pricing />
          </div>
        </section>

        <section className='pb-20'>
          <AccordionComponent src={faqs2} />
        </section>
      </div>
    </>
  )
}
