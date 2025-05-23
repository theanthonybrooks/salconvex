"use client";

import { iconClosedClass, iconOpenClass } from "@/constants/accordions";
import { AccordionComponent } from "@/features/homepage/accordion-component";
import { cn } from "@/lib/utils";
import { useQuery } from "convex-helpers/react/cache";
// import { useQuery } from "convex-helpers/react/cache"
// import { useQuery } from "convex/react"
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import GitHubCalendar from "react-github-calendar";
import { api } from "~/convex/_generated/api";

export default function Changelog() {
  const changelogTasks = useQuery(
    api.kanban.display.getCompletedTasksChangelog,
  );

  const explicitTheme = {
    light: ["#ffe770", " #fbb2fb", "#ff7bff", "#e151e1", "#a917a9"],
    dark: ["#e4f0d1", "#c6e48b", "#7bc96f", "#239a3b", "#196127"],
  };

  return (
    <div>
      <div className="container mx-auto mt-8 px-4">
        <section className="relative flex flex-col items-center justify-center pb-20">
          <div className="space-y-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center font-tanker text-3xl lowercase tracking-wide lg:text-[5rem] lg:leading-[6.5rem]"
            >
              Changelog
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto max-w-2xl text-lg text-foreground"
            >
              What I&apos;ve been up to and what&apos;s in the works.
            </motion.p>
          </div>
        </section>
      </div>
      <GitHubCalendar
        username="theanthonybrooks"
        theme={explicitTheme}
        colorScheme="light"
        year={2025}
        style={{ margin: "0 auto", maxWidth: "90vw" }}
      />

      {changelogTasks && (
        <AccordionComponent
          className="pt-5"
          src={{
            sectionTitle: "2025",
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
