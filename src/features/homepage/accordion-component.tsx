"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/mapped-accordion";
import { AccordionSection } from "@/constants/accordions";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AccordionComponentProps {
  src: AccordionSection;
  className?: string;
}

const AccordionContainer = motion.section;

export function AccordionComponent({
  src,
  className,
}: AccordionComponentProps) {
  const defaultValue = src.firstOpen ? "item-1" : undefined;

  return (
    <AccordionContainer className={cn("accordion-cont px-4 py-24", className)}>
      <div className="mx-auto max-w-[80vw]">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className={`text-center ${src.title ? "mb-16" : "mb-4"}`}
        >
          {src.title && (
            <h2 className="font-tanker text-[4em] lowercase tracking-wide text-foreground">
              {src.title}
            </h2>
          )}
          {src.description && (
            <p className="mx-auto mt-4 max-w-2xl text-sm font-bold text-foreground">
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
          className="flex justify-center"
        >
          <Accordion
            type="single"
            collapsible
            className="w-[90vw] md:w-[80vw] lg:w-[60vw] xl:w-[50vw]"
            defaultValue={defaultValue}
          >
            {src.items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index + 1}`}
                className="mb-4 rounded-lg border border-foreground/50 px-2 hover:bg-card/20 data-[state=open]:bg-card/50"
              >
                <AccordionTrigger
                  className="px-2 py-4 hover:no-underline"
                  iconOpen={src.iconOpen}
                  iconClosed={src.iconClosed}
                  icon={src.icon}
                >
                  <span className="pr-3 text-left font-medium text-foreground transition-colors">
                    {item.subtitle}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-4">
                  {Array.isArray(item.text) && src.isList ? (
                    <ul className={`${src.listStyle} list-inside`}>
                      {item.text.map((entry, i) => (
                        <li key={i} className="mb-3 text-foreground">
                          {entry}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-foreground">{item.text}</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </AccordionContainer>
  );
}
