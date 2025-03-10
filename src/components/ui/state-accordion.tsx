"use client"

import { cn } from "@/lib/utils"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { Minus, Plus } from "lucide-react"
import * as React from "react"

interface AccordionProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>,
    "type" | "value" | "defaultValue" | "onValueChange"
  > {
  defaultValue?: string
  collapsible?: boolean
}

const AccordionContext = React.createContext<{
  openValue?: string
  setOpenValue: (value?: string) => void
}>({
  openValue: undefined,
  setOpenValue: () => {},
})

interface AccordionItemContextProps {
  value: string
  triggerProps?: Partial<AccordionTriggerProps>
}

const AccordionItemContext = React.createContext<AccordionItemContextProps>({
  value: "",
})
const AccordionItemUpdateContext = React.createContext<{
  setTriggerProps?: (props: Partial<AccordionTriggerProps>) => void
}>({})

const Accordion = ({ children, defaultValue, ...props }: AccordionProps) => {
  const [openValue, setOpenValue] = React.useState<string | undefined>(
    defaultValue
  )

  return (
    <AccordionContext.Provider value={{ openValue, setOpenValue }}>
      <AccordionPrimitive.Root
        type='single'
        value={openValue}
        onValueChange={(value) =>
          setOpenValue(openValue === value ? "" : value)
        }
        collapsible
        {...props}>
        {children}
      </AccordionPrimitive.Root>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  value: string
}

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, value, ...props }, ref) => {
  const [triggerProps, setTriggerProps] = React.useState<
    Partial<AccordionTriggerProps>
  >({})

  return (
    <AccordionItemContext.Provider value={{ value, triggerProps }}>
      <AccordionItemUpdateContext.Provider value={{ setTriggerProps }}>
        <AccordionPrimitive.Item
          ref={ref}
          value={value}
          className={cn("border-b-2 border-dotted border-black/20", className)}
          {...props}
        />
      </AccordionItemUpdateContext.Provider>
    </AccordionItemContext.Provider>
  )
})
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  title: string
  hasPreview?: boolean
  hidePreview?: boolean
}

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(
  (
    {
      hidePreview = false,
      className,
      children,
      title,
      hasPreview = false,
      ...props
    },
    ref
  ) => {
    const { openValue } = React.useContext(AccordionContext)
    const { value } = React.useContext(AccordionItemContext)
    const isOpen = openValue === value
    const { setTriggerProps } = React.useContext(AccordionItemUpdateContext)
    React.useEffect(() => {
      setTriggerProps?.({ hidePreview, hasPreview, title })
    }, [hidePreview, hasPreview, title, setTriggerProps])

    return (
      <AccordionPrimitive.Header className='flex'>
        <AccordionPrimitive.Trigger
          ref={ref}
          className={cn(
            "group flex flex-1 items-start  py-4 text-sm font-medium transition-all  text-left",
            className,
            hasPreview && "flex-col gap-y-2",
            isOpen && hasPreview && !hidePreview && "pt-4 pb-0"
          )}
          {...props}>
          <div className='flex justify-between items-center w-full'>
            <span className={cn(" hover:underline")}> {title}</span>
            {isOpen ? (
              <Minus className='h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200' />
            ) : (
              <Plus className='h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200' />
            )}
          </div>
          {(!isOpen || (isOpen && !hidePreview)) && (
            <span className='font-normal flex flex-col gap-y-2'>
              {children}
            </span>
          )}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    )
  }
)
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { triggerProps } = React.useContext(AccordionItemContext)

  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
        className
      )}
      {...props}>
      <div className={cn("pb-4 pt-0", triggerProps?.hasPreview && "pt-2")}>
        {/* {triggerProps?.hasPreview && (
          <div className='text-muted-foreground text-sm mb-2'>
            Preview enabled: {triggerProps.title}
          </div>
        )} */}
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
})
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
