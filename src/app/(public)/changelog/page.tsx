"use client"

import { KanbanBoard } from "@/components/ui/kanban-board"
import { changelog2024, changelog2025 } from "@/constants/accordions"
import { AccordionComponent } from "@/features/homepage/accordion-component"
import { useQuery } from "@/helpers/convexHelpers"
// import { useQuery } from "convex-helpers/react/cache"
// import { useQuery } from "convex/react"
import { motion } from "framer-motion"
import { api } from "~/convex/_generated/api"
// import { api } from "../../../../convex/_generated/api"

export default function Changelog() {
  const userData = useQuery(api.users.getCurrentUser, {})
  return (
    <>
      <>
        <KanbanBoard userRole={userData?.user?.role?.[0]} />
        <div className='container mx-auto px-4'>
          <section className='relative flex flex-col items-center justify-center py-20'>
            {/* Background gradient */}
            <div className='absolute inset-0 -z-10 h-full w-full bg-white dark:bg-foreground bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]'>
              <div className='absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 dark:bg-blue-500 opacity-20 blur-[100px]'></div>
            </div>

            <div className='space-y-6 text-center'>
              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className='text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white animate-gradient-x pb-2'>
                Changelog!
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className='text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
                What I&apos;ve been up to and what&apos;s in the works.
              </motion.p>
            </div>
          </section>
        </div>

        <AccordionComponent src={changelog2025} />
        <AccordionComponent src={changelog2024} />
      </>
    </>
  )
}
