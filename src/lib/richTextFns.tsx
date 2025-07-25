import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@/components/ui/custom-link";
import { ALLOWED_ATTR, ALLOWED_TAGS } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import parse, { DOMNode, domToReact, Element, Text } from "html-react-parser";
import { JSX } from "react";
import truncatise, { TruncatiseOptions } from "truncatise";
interface RichTextDisplayProps {
  html: string;
  className?: string;
  maxChars?: number;
}

export const RichTextDisplay = ({
  html,
  className,
  maxChars,
}: RichTextDisplayProps) => {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...ALLOWED_TAGS, "input"],
    ALLOWED_ATTR: [
      ...ALLOWED_ATTR,
      "type",
      "checked",
      "data-type",
      "data-checked",
    ],
  });

  const normalized = clean.replace(/<p>\s*<\/p>/g, "<br>");
  const truncateOptions = {
    TruncateLength: maxChars ?? 300,
    TruncateBy: "characters",
    StripHTML: false,
    Strict: false,
    Suffix: "…",
  } as TruncatiseOptions;
  const truncated =
    typeof maxChars === "number"
      ? truncatise(normalized, truncateOptions)
      : normalized;

  function replace(domNode: DOMNode): JSX.Element | null {
    // Task items
    if (
      domNode instanceof Element &&
      domNode.name === "li" &&
      domNode.attribs?.["data-type"] === "taskItem"
    ) {
      const checked = domNode.attribs["data-checked"] === "true";
      return (
        <li
          data-type="taskItem"
          data-checked={checked}
          className="mb-1 flex max-w-full gap-1 whitespace-normal break-words first:mt-2"
        >
          <Checkbox
            className="rich-check"
            defaultChecked={checked}
            onCheckedChange={(newChecked) => {
              const parent = document.activeElement?.closest("li");
              if (parent) {
                parent.setAttribute(
                  "data-checked",
                  newChecked ? "true" : "false",
                );
              }
            }}
          />
          {domToReact(domNode.children as DOMNode[], { replace })}
        </li>
      );
    }

    // General block elements
    if (
      domNode instanceof Element &&
      ["p", "li", "ul", "ol", "a", "div", "span"].includes(domNode.name)
    ) {
      const commonClasses = "break-words max-w-full whitespace-normal";
      const children = domToReact(domNode.children as DOMNode[], { replace });

      if (domNode.name === "a") {
        const firstChild = domNode.children[0];
        if (
          domNode.children.length === 1 &&
          firstChild &&
          firstChild.type === "text"
        ) {
          const text = (firstChild as Text).data;
          const cleanedText = text.replace(/"?https?:\/\/|www\./g, "");
          const maxLength = 30;
          const hasNoSpaces = !text.includes(" ");
          if (cleanedText.length > maxLength && hasNoSpaces) {
            const displayText =
              cleanedText.slice(0, 20) + "…" + cleanedText.slice(-10);
            return (
              <a
                className={cn("mr-1 font-semibold", commonClasses)}
                href={domNode.attribs?.href}
                title={cleanedText}
              >
                {displayText}
              </a>
            );
          }
        }
        return (
          <Link
            className={cn("font-semibold", commonClasses)}
            href={domNode.attribs?.href}
          >
            {children}
          </Link>
        );
      }

      switch (domNode.name) {
        case "p":
          return <p className={commonClasses}>{children}</p>;
        case "li":
          return <li className={commonClasses}>{children}</li>;
        case "ul":
          return <ul className={commonClasses}>{children}</ul>;
        case "ol":
          return <ol className={commonClasses}>{children}</ol>;
        case "div":
          return <div className={commonClasses}>{children}</div>;
        case "span":
          return <span className={commonClasses}>{children}</span>;
        default:
          return null;
      }
    }

    return null;
  }

  return (
    <span
      className={cn(
        "rich-text rich-text__preview-wrapper space-y-2",
        className,
      )}
    >
      {parse(truncated, { replace })}
    </span>
  );
};

export function trimTrailingEmptyParagraphs(html: string): string {
  return html.replace(/(?:<p>\s*<\/p>)+$/g, "");
}
