import {
  EuropeanCountries,
  EuropeanEUCountries,
  EuropeanNonEUCountries,
} from "@/lib/locations";
import { CheckIcon, XIcon } from "lucide-react";

interface EligibilityLabelProps {
  type: string | null;
  whom: string[];
  format?: "desktop" | "mobile";
  preview?: boolean;
  eligible?: boolean;
  publicView?: boolean;
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
  publicView,
}: EligibilityLabelProps) => {
  const international = type === "International";
  const national = type === "National";
  const multipleWhom = whom.length > 1;
  const mobilePreview = format === "mobile" && preview;
  const isMobile = format === "mobile";
  const isDesktop = format === "desktop";

  if (!type || !whom) return null;
  const parts: string[] = [];

  if (type !== "International" && type !== "Other") {
    if (national) {
      if (!mobilePreview) {
        parts.push(`${type}:`);
      }
    } else {
      parts.push(type);
    }
  }
  if (whom.length === 0 || type === "International" || type === "Other") {
    if (type === "International") {
      // return "International (all)";
      if (mobilePreview) {
        parts.push("International");
      } else {
        parts.push("International (all)");
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
    // if (mobilePreview && type !== "National") {
    //   parts.push(type);
    // } else {
    //   parts.push(whom[0]);
    // }
    parts.push(whom[0]);
  } else if (multipleWhom) {
    const groupLabel = getGroupEligibilityLabel(whom);

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
            <div className="flex gap-1">
              <span>{type}:</span>
              {groupLabel && <span className="font-medium">{groupLabel}</span>}

              {!groupLabel && (
                <ul>
                  {whom.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}

              {(international || eligible) && !publicView && (
                <CheckIcon className="size-4 shrink-0 translate-y-0.5 text-emerald-800" />
              )}
              {national && eligible === false && !publicView && (
                <XIcon className="size-4 shrink-0 translate-y-1 text-red-600" />
              )}
            </div>
          );
        }
      }
    }
  }

  return (
    <span className="flex items-center gap-1">
      {parts.join(" ")}
      {(international || eligible) && !publicView && (
        <CheckIcon className="size-4 shrink-0 text-emerald-800" />
      )}
      {national && eligible === false && !publicView && (
        <XIcon className="size-4 shrink-0 text-red-600" />
      )}
    </span>
  );
};
