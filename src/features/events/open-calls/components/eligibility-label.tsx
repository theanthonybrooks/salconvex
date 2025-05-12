interface EligibilityLabelProps {
  type: string | null;
  whom: string[];
  format?: "desktop" | "mobile";
  preview?: boolean;
}

export const EligibilityLabel = ({
  type,
  whom,
  format,
  preview = false,
}: EligibilityLabelProps) => {
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
  if (whom.length === 0 || type === "International") {
    if (type === "International") {
      return "International (all)";
    }
    if (type === "Other") {
      if (preview) {
        return "Other (see details)*";
      } else {
        return "See details below";
      }
    }
  } else if (whom.length === 1) {
    if (!preview) {
      parts.push("Artists from/residing in " + whom[0]);
    } else {
      parts.push(whom[0]);
    }
    // parts.push(whom[0]);
  } else if (multipleWhom) {
    if (preview) {
      if (whom.length > 2) {
        parts.push("See app details*");
      } else if (isDesktop && whom.length <= 2) {
        // parts.push("Artists from/residing in ");
        const whomString = whom.join(" & ");
        parts.push(whomString);
      }
    } else {
      if (isDesktop) {
        parts.push("Artists from/residing in ");
        const whomString =
          whom.length === 2
            ? whom.join(" & ")
            : `${whom.slice(0, -1).join(", ")}, and ${whom[whom.length - 1]}`;
        parts.push(whomString);
      } else if (isMobile) {
        if (whom.length === 2) {
          const whomString =
            whom.length === 2
              ? whom.join(" & ")
              : `${whom.slice(0, -1).join(", ")}, and ${whom[whom.length - 1]}`;
          parts.push(whomString);
        } else {
          return (
            <div className="grid grid-cols-[auto,1fr] gap-x-2">
              <span>{type}:</span>
              <ul>
                {whom.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          );
        }
      }
    }
  }

  return <>{parts.join(" ")}</>;
};
