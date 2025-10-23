"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import slugify from "slugify";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/mapped-accordion";
import { cn } from "@/helpers/utilsFns";
import { AccordionSection } from "@/constants/accordions";

interface AccordionComponentProps {
  src: AccordionSection;
  className?: string;
  fontSize?: string;
}

const AccordionContainer = motion.section;
export function AccordionComponent({
  src,
  className,
  fontSize,
}: AccordionComponentProps) {
  const sectionSlug = slugify(
    src?.title ?? src?.sectionTitle ?? `section ${+1}`,
    { lower: true, strict: true },
  );
  // console.log(sectionSlug);
  const [openItem, setOpenItem] = useState<string | undefined>(
    src.firstOpen ? `${sectionSlug}-item-1` : undefined,
  );

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const matchIndex = src.items.findIndex(
      (item, i) => (item.id ?? `item-${i + 1}`) === hash,
    );
    if (matchIndex !== -1) {
      setOpenItem(`${sectionSlug}-item-${matchIndex + 1}`);
    }
  }, [src, sectionSlug]);

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
          {src.sectionTitle && (
            <h2 className="font-tanker text-3xl lowercase tracking-wide text-foreground">
              {src.sectionTitle}
            </h2>
          )}
          {src.description && (
            <p
              className={cn("mx-auto mt-4 max-w-2xl font-bold text-foreground")}
            >
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
            // defaultValue={defaultValue}
            value={openItem}
            onValueChange={setOpenItem}
          >
            {src.items.map((item, index) => {
              const anchorId = item.id ?? `item-${index + 1}`;
              return (
                <AccordionItem
                  key={anchorId}
                  value={`${sectionSlug}-item-${index + 1}`}
                  className="mb-4 rounded-lg border-2 border-foreground/30 px-2 hover:bg-card/20 data-[state=open]:bg-card/50"
                >
                  <AccordionTrigger
                    className="px-2 py-4 hover:no-underline"
                    iconOpen={src.iconOpen}
                    iconClosed={src.iconClosed}
                    icon={src.icon}
                    id={anchorId}
                  >
                    <span className="pr-7 text-left font-medium text-foreground transition-colors md:pr-3">
                      {item.subtitle}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className={cn("px-2 pb-4", fontSize)}>
                    {Array.isArray(item.text) && src.isList ? (
                      <ul className={`${src.listStyle} list-inside`}>
                        {item.text.map((entry, i) => (
                          <li key={i} className="mb-3 text-foreground">
                            {entry}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-foreground">{item.text}</span>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </motion.div>
      </div>
    </AccordionContainer>
  );
}
