import { CheckIcon, XIcon } from "lucide-react";

interface EligibilityLabelProps {
  type: string | null;
  whom: string[];
  format?: "desktop" | "mobile";
  preview?: boolean;
  eligible?: boolean;
}

export const EligibilityLabel = ({
  type,
  whom,
  format,
  preview = false,
  eligible,
}: EligibilityLabelProps) => {
  const international = type === "International";
  const national = type === "National";
  const multipleWhom = whom.length > 1;
  const mobilePreview = format === "mobile" && preview;
  const isMobile = format === "mobile";
  const isDesktop = format === "desktop";

  if (!type || !whom) return null;
  const parts: string[] = [];

  if (
    (isDesktop || !mobilePreview) &&
    type !== "International" &&
    type !== "Other"
  ) {
    parts.push(`${type}:`);
  }
  if (whom.length === 0 || type === "International" || type === "Other") {
    if (type === "International") {
      // return "International (all)";
      parts.push("International (all)");
    }
    if (type === "Other") {
      if (preview) {
        return "Other (see details)";
      } else {
        return "See details below";
      }
    }
  } else if (whom.length === 1) {
    // if (mobilePreview) {
    //   parts.push(type);
    // } else {
    //   parts.push(whom[0]);
    // }
    parts.push(whom[0]);
  } else if (multipleWhom) {
    if (preview) {
      if (whom.length > 2) {
        parts.push("See app details");
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
              : `${whom.slice(0, -1).join(", ")}, or ${whom[whom.length - 1]}`;
          parts.push(whomString);
        } else {
          return (
            <div className="flex gap-1">
              <span>{type}:</span>
              <ul>
                {whom.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>

              {(international || eligible) && (
                <CheckIcon className="size-4 shrink-0 translate-y-0.5 text-emerald-800" />
              )}
              {national && eligible === false && (
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
      {(international || eligible) && (
        <CheckIcon className="size-4 shrink-0 text-emerald-800" />
      )}
      {national && eligible === false && (
        <XIcon className="size-4 shrink-0 text-red-600" />
      )}
    </span>
  );
};
