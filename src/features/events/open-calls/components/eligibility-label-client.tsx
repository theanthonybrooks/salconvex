import { PopoverSimple } from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/state-accordion-test";
import {
  EuropeanCountries,
  EuropeanEUCountries,
  EuropeanNonEUCountries,
} from "@/constants/locationConsts";
import { getDemonym } from "@/helpers/locations";
import { cn } from "@/helpers/utilsFns";
import { EligibilityType } from "@/types/openCallTypes";
import { CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";

export interface EligibilityLabelBaseProps {
  type: EligibilityType | null;
  whom: string[];
  hasDetails?: boolean;
}
interface EligibilityLabelProps extends EligibilityLabelBaseProps {
  format?: "desktop" | "mobile";
  preview?: boolean;
  eligible?: boolean;

  publicView?: boolean;
  socialPost?: boolean;
}

function getGroupEligibilityLabel(whom: string[]): string | null {
  if (arraysEqualSet(whom, EuropeanEUCountries)) return "EU Artists";
  if (arraysEqualSet(whom, EuropeanNonEUCountries))
    return "European artists in non-EU countries";
  if (arraysEqualSet(whom, EuropeanCountries)) return "European Artists";
  return null;
}

function arraysEqualSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  const setB = new Set(b);
  for (const val of setA) if (!setB.has(val)) return false;
  return true;
}

export const EligibilityLabel = ({
  type,
  whom,
  format,
  preview = false,
  eligible,
  hasDetails,
  publicView,
  socialPost,
}: EligibilityLabelProps) => {
  const unknownType = type === "Unknown";
  const internationalType = type === "International";
  const nationalType = type === "National";
  const regionalType = type === "Regional/Local";
  const multipleWhom = whom.length > 1;
  const mobilePreview = format === "mobile" && preview;
  const isMobile = format === "mobile";
  const isDesktop = format === "desktop";
  const [fullListIsOpen, setFullListIsOpen] = useState(false);

  if (!type || !whom) return null;

  if (unknownType) {
    return "Not Specified";
  }
  const parts: string[] = [];
  const groupLabel = getGroupEligibilityLabel(whom);

  if (socialPost) {
    if (internationalType) {
      return (
        <p>
          International (All)
          {hasDetails && <sup>*</sup>}
        </p>
      );
    } else if (nationalType) {
      if (whom.length === 1) {
        return (
          <p>
            {getDemonym(whom[0])} Artists
            {hasDetails && <sup>*</sup>}
          </p>
        );
      } else {
        return "See Caption for more details";
      }
    } else if (type === "Regional/Local") {
      return (
        <p>
          Regional/Local<sup>*</sup>
        </p>
      );
    } else {
      return "See Caption for more details";
    }
  }

  if (type !== "International" && type !== "Other" && !groupLabel) {
    if (nationalType) {
      if (!mobilePreview) {
        parts.push(`${type}:`);
      }
    } else if (regionalType) {
      if (!mobilePreview) {
        parts.push(`${type}${whom.length > 0 ? ":" : ""}`);
      } else {
        parts.push(type);
      }
    } else {
      parts.push(type);
    }
  }
  if (internationalType || type === "Other") {
    if (internationalType) {
      // return "International (all)";
      if (mobilePreview) {
        parts.push(`International${hasDetails ? "*" : ""}`);
      } else {
        parts.push(`International (all)${hasDetails ? "*" : ""}`);
      }
    }
    if (type === "Other") {
      if (preview) {
        return "Other (see details)";
      } else {
        return "See details below";
      }
    }
  } else if (whom.length === 1) {
    if (nationalType || (regionalType && !mobilePreview)) {
      parts.push(`${getDemonym(whom[0])} Artists`);
      if (hasDetails && (eligible !== false || regionalType)) {
        parts.push("*");
      }
    } else {
      parts.push(whom[0]);
    }

    // if (mobilePreview && type !== "National") {
    //   parts.push(type);
    // } else {
    //   parts.push(whom[0]);
    // }
  } else if (multipleWhom) {
    if (preview) {
      if (whom.length > 2) {
        if (groupLabel) {
          parts.push(groupLabel);
        } else {
          parts.push("See app details");
        }
      } else if (isDesktop && whom.length <= 2) {
        // parts.push("Artists from/residing in ");
        const whomString = whom.join(" or ");
        parts.push(whomString);
      } else if (mobilePreview) {
        // parts.push(type);
        parts.push(`${type}+`);
      }
    } else {
      if (isDesktop) {
        // parts.push("Artists from/residing in ");
        const whomString =
          whom.length === 2
            ? whom.join(" or ")
            : `${whom.slice(0, -1).join(", ")}, or ${whom[whom.length - 1]}`;
        parts.push(whomString);
      } else if (isMobile) {
        if (whom.length === 2) {
          const whomString =
            whom.length === 2
              ? whom.join(" or ")
              : groupLabel
                ? groupLabel
                : `${whom.slice(0, -1).join(", ")}, or ${whom[whom.length - 1]}`;
          parts.push(whomString);
        } else {
          if (groupLabel) {
            parts.push(groupLabel);
          }
          return (
            <div className="w-full">
              <section className={cn("flex gap-1")}>
                <span>{type}:</span>
                {groupLabel && (
                  <span className="font-medium">{groupLabel}</span>
                )}

                {!groupLabel && (
                  <ul>
                    {whom.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                )}
              </section>
              {groupLabel && (
                <Accordion type="multiple">
                  <AccordionItem value="eligibility-list">
                    <AccordionTrigger
                      title={`
                        ${fullListIsOpen ? "Hide" : "View"} Full List
                      `}
                      onClick={() => setFullListIsOpen(!fullListIsOpen)}
                    />
                    <AccordionContent>
                      <ul>
                        {whom.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* {preview && (
                <>
                  {(internationalType || eligible) && !publicView && (
                    <CheckIcon className="size-4 shrink-0 translate-y-0.5 text-emerald-800" />
                  )}
                  {nationalType && eligible === false && !publicView && (
                    <XIcon className="size-4 shrink-0 translate-y-1 text-red-600" />
                  )}
                </>
              )} */}
            </div>
          );
        }
      }
    }
  }

  return (
    <div className={cn("flex items-start gap-0.5", preview && "items-center")}>
      <section className={cn("flex items-start gap-1")}>
        {groupLabel && (
          <>
            {!mobilePreview && <span>{type}:</span>}
            <span className="font-medium">
              <PopoverSimple
                content={parts.join(" ")}
                className="w-full max-w-xl"
                disabled={preview}
              >
                <span className="flex items-center gap-1">
                  <p>{groupLabel}</p>
                  {!preview && (
                    <p className="text-xs italic text-foreground/50">
                      - Hover to view full list
                    </p>
                  )}
                </span>
              </PopoverSimple>
            </span>
          </>
        )}

        {!groupLabel && parts.join(" ")}
      </section>

      {preview && (
        <>
          {(internationalType || eligible) && !publicView && !hasDetails && (
            <CheckIcon className="size-4 shrink-0 text-emerald-800" />
          )}
          {nationalType && eligible === false && !publicView && (
            <XIcon className="size-4 shrink-0 text-red-600" />
          )}
        </>
      )}
    </div>
  );
};
