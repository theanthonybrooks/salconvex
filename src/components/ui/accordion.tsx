"use client"

import { cn } from "@/lib/utils"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import * as React from "react"

interface CustomAccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  iconClosed?: React.ReactNode
  iconOpen?: React.ReactNode
  icon?: React.ReactNode
}

function generateDataStateClasses() {
  return `
    [&[data-state=closed]>svg.closed]:rotate-0 
    [&[data-state=open]>svg.closed]:rotate-90 
    [&[data-state=closed]>svg.open]:rotate-90 
    [&[data-state=open]>svg.open]:rotate-0 
    [&[data-state=open]>svg.open]:opacity-100
    [&[data-state=open]>svg.closed]:opacity-0
    [&[data-state=closed]>svg.open]:opacity-0
    [&[data-state=closed]>svg.closed]:opacity-100
  `
}

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  CustomAccordionTriggerProps
>(({ className, iconClosed, iconOpen, icon, children, ...props }, ref) => (
  <AccordionPrimitive.Header className='flex'>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
        generateDataStateClasses(),
        className
      )}
      {...props}>
      {children}
      {icon ? icon : null}
      {iconClosed ? iconClosed : null}
      {iconOpen ? iconOpen : null}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className='overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'
    {...props}>
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
