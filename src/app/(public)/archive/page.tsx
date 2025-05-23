"use client";

import Pricing from "@/features/homepage/pricing";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function Archive() {
  const features = [
    "Authentication & Authorization",
    "Payment Processing",
    "SEO Optimization",
    "TypeScript Support",
    "Database Integration",
    "Dark Mode Support",
    "Responsive Design",
    "API Integration",
  ];

  return (
    <>
      <>
        <div className="container mx-auto px-4">
          <section className="relative flex flex-col items-center justify-center py-20">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] dark:bg-foreground">
              <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px] dark:bg-blue-500"></div>
            </div>

            <div className="space-y-6 text-center">
              {/* Main heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-linear-to-r animate-gradient-x from-gray-900 via-blue-800 to-gray-900 bg-clip-text pb-2 text-4xl font-bold tracking-tight text-transparent dark:from-white dark:via-blue-300 dark:to-white md:text-6xl lg:text-7xl"
              >
                Archive!
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400 md:text-xl"
              >
                The list of all things that have been, will be, and have yet to
                be found.
              </motion.p>
            </div>
          </section>

          <section className="py-12">
            <div className="mb-16 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-4"
              >
                <h2 className="bg-linear-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:via-blue-300 dark:to-white">
                  Everything You Need
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Our starter kit comes packed with all the essential features
                  you need to build modern web applications. No more wasting
                  time on repetitive setups.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                  >
                    <Check className="h-5 w-5 shrink-0 text-blue-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="py-8">
              <Pricing />
            </div>
          </section>

          <section className="pb-20">
            {/* <AccordionComponent src={faqs} /> */}
          </section>
        </div>
      </>
    </>
  );
}
