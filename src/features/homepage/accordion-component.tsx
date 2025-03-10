"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/mapped-accordion"
import { AccordionSection } from "@/constants/accordions"
import { motion } from "framer-motion"
import { HelpCircle } from "lucide-react"

interface AccordionComponentProps {
  src: AccordionSection
}

const AccordionContainer = motion.section

export function AccordionComponent({ src }: AccordionComponentProps) {
  const defaultValue = src.firstOpen ? "item-1" : undefined

  return (
    <AccordionContainer className='accordion-cont px-4 py-24'>
      <div className='mx-auto  max-w-[80vw]'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className={`text-center ${src.title ? "mb-16" : "mb-4"}`}>
          {/* Pill badge */}
          {src.name && (
            <div className='mx-auto mb-6 w-fit rounded-full border border-blue-200 bg-blue-50 px-4 py-1 dark:border-blue-900 dark:bg-blue-900/30'>
              <div className='flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-200'>
                <HelpCircle className='h-4 w-4' />
                <span>{src.name}</span>
              </div>
            </div>
          )}

          {src.title && (
            <h2 className='bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text pb-2 text-3xl font-bold text-transparent dark:from-white dark:via-blue-300 dark:to-white md:text-4xl'>
              {src.title}
            </h2>
          )}
          {src.description && (
            <p className='mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-300'>
              {src.description}
            </p>
          )}
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className='flex justify-center'>
          <Accordion
            type='single'
            collapsible
            className='w-[90vw] md:w-[80vw] lg:w-[60vw] xl:w-[50vw]'
            defaultValue={defaultValue}>
            {src.items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index + 1}`}
                className='mb-4 rounded-lg border border-gray-200 px-2 dark:border-gray-800'>
                <AccordionTrigger
                  className='px-2 py-4 hover:no-underline'
                  iconOpen={src.iconOpen}
                  iconClosed={src.iconClosed}
                  icon={src.icon}>
                  <span className='pr-3 text-left font-medium text-gray-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400'>
                    {item.subtitle}
                  </span>
                </AccordionTrigger>
                <AccordionContent className='px-2 pb-4'>
                  {Array.isArray(item.text) && src.isList ? (
                    <ul className={`${src.listStyle} list-inside`}>
                      {item.text.map((entry, i) => (
                        <li
                          key={i}
                          className='mb-3 text-gray-600 dark:text-gray-300'>
                          {entry}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='text-gray-600 dark:text-gray-300'>
                      {item.text}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </AccordionContainer>
  )
}
