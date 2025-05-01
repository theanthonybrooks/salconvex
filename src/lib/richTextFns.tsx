import { Checkbox } from "@/components/ui/checkbox";
import { ALLOWED_ATTR, ALLOWED_TAGS } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import parse, { DOMNode, domToReact, Element } from "html-react-parser";

interface RichTextDisplayProps {
  html: string;
  className?: string;
}

export const RichTextDisplay = ({ html, className }: RichTextDisplayProps) => {
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

  return (
    <span className={cn("rich-text", className)}>
      {parse(normalized, {
        replace: (domNode: DOMNode) => {
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
                className="mb-1 flex gap-1 first:mt-2"
              >
                <Checkbox
                  className="rich-check flex gap-x-1"
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
                {domToReact(domNode.children as DOMNode[])}
              </li>
            );
          }

          return undefined;
        },
      })}
    </span>
  );
};
