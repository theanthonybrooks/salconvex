import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DebouncedControllerInput } from "@/components/ui/debounced-form-input";
import { autoHttps } from "@/lib/linkFns";
import { cn } from "@/lib/utils";
import { BiExpandVertical } from "react-icons/bi";

interface ExternalLinksInputProps {
  name: `openCall.requirements.links`;
  handleCheckSchema?: () => void;
  disabled?: boolean;
}

export const ExternalLinksInput = ({
  name,
  handleCheckSchema,
  disabled,
}: ExternalLinksInputProps) => {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ name, control });

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isParentOpen, setIsParentOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(fields.length);

  useEffect(() => {
    if (isParentOpen && openIndex !== null) {
      const target = itemRefs.current[openIndex];
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [isParentOpen, openIndex]);

  useEffect(() => {
    if (fields.length > prevLengthRef.current) {
      setOpenIndex(fields.length - 1);
    }
    prevLengthRef.current = fields.length;
  }, [fields.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenIndex(null);
        setIsParentOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenIndex(null);
        setIsParentOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const watchedLinks = watch(name); // reactively observe all links
  const last = watchedLinks?.[watchedLinks.length - 1];
  const showAddButton = last?.title?.trim() && last?.href?.trim();

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          "mx-auto flex min-h-12 w-full cursor-pointer flex-col justify-center gap-2 rounded border border-foreground bg-card px-4 py-2 lg:min-w-[300px] lg:max-w-md",
          disabled && "pointer-events-none border-foreground/30 opacity-50",
        )}
      >
        {fields.length > 0 ? (
          <Collapsible open={isParentOpen} onOpenChange={setIsParentOpen}>
            <CollapsibleTrigger asChild>
              <span
                className={cn(
                  "flex w-full items-center justify-between gap-2",
                  isParentOpen && "mb-2",
                )}
              >
                <p className="text-sm text-foreground hover:scale-105 active:scale-95">
                  {`${fields.length} External Link${fields.length > 1 ? "s" : ""}`}
                </p>
                <BiExpandVertical className="size-4" />
              </span>
            </CollapsibleTrigger>

            <CollapsibleContent asChild>
              <div className="mb-2 flex w-full flex-col gap-3">
                {fields.map((item, index) => {
                  const isOpen = openIndex === index;

                  return (
                    <Collapsible
                      key={item.id}
                      open={isOpen}
                      onOpenChange={(open) => setOpenIndex(open ? index : null)}
                    >
                      <div
                        ref={(el) => {
                          itemRefs.current[index] = el;
                        }}
                        className="relative flex w-full flex-col rounded border border-border px-3 py-3"
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex items-start justify-between gap-2">
                            {!isOpen && (
                              <>
                                <Controller
                                  name={`${name}.${index}`}
                                  control={control}
                                  render={({ field: { value } }) => (
                                    <p>
                                      {value?.title ||
                                        value?.href ||
                                        "Untitled Link"}
                                    </p>
                                  )}
                                />

                                <div className="flex items-center gap-1">
                                  <span className="flex cursor-pointer items-center gap-1 text-sm text-foreground/60 hover:scale-105 hover:text-destructive active:scale-95 sm:text-xs">
                                    <Trash2
                                      className="size-4"
                                      onClick={() => remove(index)}
                                    />
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="mt-2 space-y-2">
                          <Controller
                            name={`${name}.${index}.title`}
                            control={control}
                            render={({ field }) => (
                              <DebouncedControllerInput
                                field={field}
                                placeholder="Link title (e.g. 'Call Guidelines')"
                                className="w-full rounded border border-input px-3 py-2 sm:text-sm"
                              />
                            )}
                          />
                          <Controller
                            name={`${name}.${index}.href`}
                            control={control}
                            render={({ field }) => (
                              <DebouncedControllerInput
                                field={field}
                                placeholder="https://example.com/resource"
                                transform={autoHttps}
                                className="w-full rounded border border-input px-3 py-2 text-sm"
                                onBlur={() => {
                                  field.onBlur?.();
                                  handleCheckSchema?.();
                                }}
                              />
                            )}
                          />
                          <div className="flex gap-1 justify-self-end">
                            {/* <button
                              type="button"
                              aria-label="Edit link"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="size-4" />
                            </button> */}
                            <span className="flex cursor-pointer items-center gap-1 text-sm text-foreground/60 hover:scale-105 hover:text-destructive active:scale-95 sm:text-xs">
                              <p>Delete link</p>

                              <Trash2
                                className="size-4"
                                onClick={() => remove(index)}
                              />
                            </span>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
                {showAddButton && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="mx-auto self-start px-0 text-base text-muted-foreground underline underline-offset-2 hover:text-foreground sm:text-sm"
                    onClick={() => append({ title: "", href: "" })}
                  >
                    + Add another link
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div
            className="mx-auto flex w-full max-w-[74dvw] cursor-pointer flex-col items-center justify-between gap-2 px-4 py-2 lg:min-w-[300px] lg:max-w-md"
            onClick={() => append({ title: "", href: "" })}
          >
            <p className="text-sm text-foreground/60 hover:scale-105 active:scale-95">
              + Add External link
            </p>
          </div>
        )}
      </div>
    </>
  );
};
