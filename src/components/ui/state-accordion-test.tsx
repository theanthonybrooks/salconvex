"use client";

import { cn } from "@/helpers/utilsFns";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Minus, Plus } from "lucide-react";
import * as React from "react";

interface AccordionItemContextProps {
  value: string;
  triggerProps?: Partial<AccordionTriggerProps>;
}

const AccordionItemContext = React.createContext<AccordionItemContextProps>({
  value: "",
});
const AccordionItemUpdateContext = React.createContext<{
  setTriggerProps?: (props: Partial<AccordionTriggerProps>) => void;
}>({});

const Accordion = AccordionPrimitive.Root;

interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  value: string;
}

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, value, ...props }, ref) => {
  const [triggerProps, setTriggerProps] = React.useState<
    Partial<AccordionTriggerProps>
  >({});

  return (
    <AccordionItemContext.Provider value={{ value, triggerProps }}>
      <AccordionItemUpdateContext.Provider value={{ setTriggerProps }}>
        <AccordionPrimitive.Item
          ref={ref}
          value={value}
          className={cn(
            "border-b-2 border-dotted border-foreground/20",
            className,
          )}
          {...props}
        />
      </AccordionItemUpdateContext.Provider>
    </AccordionItemContext.Provider>
  );
});
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  title: string;
  hasPreview?: boolean;
  hidePreview?: boolean;
  fontSize?: string;
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
      fontSize = "text-sm",
      ...props
    },
    ref,
  ) => {
    // const { value } = React.useContext(AccordionItemContext);
    const { setTriggerProps } = React.useContext(AccordionItemUpdateContext);
    React.useEffect(() => {
      setTriggerProps?.({ hidePreview, hasPreview, title });
    }, [hidePreview, hasPreview, title, setTriggerProps]);

    // console.log("hasPreview", hasPreview, title);

    return (
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          ref={ref}
          className={cn(
            "group relative flex flex-1 items-start py-4 text-left text-sm font-medium transition-all",
            !hasPreview && className,
            hasPreview && "flex-col gap-y-2",
            hasPreview && !hidePreview && "pb-0 pt-4",
          )}
          {...props}
        >
          <div className="flex w-full items-center justify-between">
            <span className={cn("hover:underline", fontSize)}>{title}</span>
            <span className="absolute right-2">
              <Minus className="ralph size-4 shrink-0 origin-center text-muted-foreground transition-transform ease-in hover:scale-125 group-data-[state=closed]:hidden" />
              <Plus className="mert size-4 shrink-0 origin-center text-muted-foreground transition-transform ease-in hover:scale-125 group-data-[state=open]:hidden" />
            </span>
          </div>

          <span
            className={cn(
              className,

              hasPreview && "w-full group-data-[state=closed]:block",
              hidePreview && "group-data-[state=open]:hidden",
              !hidePreview && "group-data-[state=open]:block",
            )}
          >
            {children}
          </span>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    );
  },
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const { triggerProps } = React.useContext(AccordionItemContext);

  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden pb-4 text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        triggerProps?.hasPreview && "pt-2",
        className,
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
