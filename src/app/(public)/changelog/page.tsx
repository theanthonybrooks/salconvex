"use client";

import { iconClosedClass, iconOpenClass } from "@/constants/accordions";
import { AccordionComponent } from "@/features/homepage/accordion-component";
import { cn } from "@/lib/utils";
import { useQuery } from "convex-helpers/react/cache";
// import { useQuery } from "convex-helpers/react/cache"
// import { useQuery } from "convex/react"
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { api } from "~/convex/_generated/api";

export default function Changelog() {
  const changelogTasks = useQuery(
    api.kanban.display.getCompletedTasksChangelog,
  );

  return (
    <div>
      <div className="container mx-auto px-4">
        <section className="relative flex flex-col items-center justify-center py-20">
          <div className="space-y-6 text-center">
            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="pb-2 font-tanker text-4xl tracking-wide md:text-6xl lg:text-7xl"
            >
              Changelog
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400 md:text-xl"
            >
              What I&apos;ve been up to and what&apos;s in the works.
            </motion.p>
          </div>
        </section>
      </div>

      {changelogTasks && (
        <AccordionComponent
          className="pt-0"
          src={{
            description: "2025",
            iconClosed: (
              <Plus className={cn("mr-1 h-4 w-4", iconClosedClass)} />
            ),
            iconOpen: <Minus className={cn("mr-1 h-4 w-4", iconOpenClass)} />,
            firstOpen: true,
            isList: true,
            listStyle: "list-none",
            accordionWidth: "w-3xl max-w-[90vw]",
            items: changelogTasks,
          }}
        />
      )}
    </div>
  );
}
