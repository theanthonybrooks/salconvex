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
        // replace: (domNode: DOMNode) => {
        //   if (
        //     domNode instanceof Element &&
        //     domNode.name === "li" &&
        //     domNode.attribs?.["data-type"] === "taskItem"
        //   ) {
        //     const checked = domNode.attribs["data-checked"] === "true";

        //     return (
        //       <li
        //         data-type="taskItem"
        //         data-checked={checked}
        //         className="mb-1 flex gap-1 first:mt-2"
        //       >
        //         <Checkbox
        //           className="rich-check"
        //           defaultChecked={checked}
        //           onCheckedChange={(newChecked) => {
        //             const parent = document.activeElement?.closest("li");
        //             if (parent) {
        //               parent.setAttribute(
        //                 "data-checked",
        //                 newChecked ? "true" : "false",
        //               );
        //             }
        //           }}
        //         />
        //         {domToReact(domNode.children as DOMNode[])}
        //       </li>
        //     );
        //   }

        //   return undefined;
        // },
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
                {domToReact(domNode.children as DOMNode[])}
              </li>
            );
          }

          // Add this for general elements that might overflow
          if (
            domNode instanceof Element &&
            ["p", "li", "ul", "ol", "a", "div", "span"].includes(domNode.name)
          ) {
            const commonClasses = "break-words max-w-full whitespace-normal";
            const children = domToReact(domNode.children as DOMNode[]);

            switch (domNode.name) {
              case "p":
                return <p className={commonClasses}>{children}</p>;
              case "li":
                return <li className={commonClasses}>{children}</li>;
              case "ul":
                return <ul className={commonClasses}>{children}</ul>;
              case "ol":
                return <ol className={commonClasses}>{children}</ol>;
              case "a":
                return (
                  <a className={commonClasses} href={domNode.attribs?.href}>
                    {children}
                  </a>
                );
              case "div":
                return <div className={commonClasses}>{children}</div>;
              case "span":
                return <span className={commonClasses}>{children}</span>;
              default:
                return undefined;
            }
          }

          return undefined;
        },
      })}
    </span>
  );
};
