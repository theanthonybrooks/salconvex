import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import DOMPurify from "dompurify";
import { debounce } from "lodash"; // already assumed installed
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaRemoveFormat, FaUnlink } from "react-icons/fa";

import {
  FaBold,
  FaItalic,
  FaLink,
  FaListCheck,
  FaListOl,
  FaListUl,
  FaUnderline,
} from "react-icons/fa6";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  charLimit?: number;
  purpose?: string;
  asModal?: boolean;
  title?: string;
  subtitle?: string;
}

export const ALLOWED_TAGS = [
  "a",
  "b",
  "i",
  "em",
  "strong",
  "p",
  "u",
  "ul",
  "ol",
  "li",
  "br",
];
export const ALLOWED_ATTR = ["href", "target", "rel"];

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Start typing…",
  charLimit = 500,
  purpose,
  asModal = true,
  title,
  subtitle,
}: Props) => {
  const [open, setOpen] = useState(false);
  const forOpenCall = purpose === "openCall";

  const debouncedOnChange = useRef(
    debounce((html: string) => {
      const normalized = html.trim() === "<p></p>" ? "" : html.trim();
      onChange(normalized);
    }, 300),
  ).current;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: {},
        italic: {},
        paragraph: {},
        strike: false,
        code: false,
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: {},
        bulletList: {},
        orderedList: {},
      }),
      Underline,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount.configure({
        limit: charLimit,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "underline",
        },
      }),
    ],

    onBlur: ({ editor }) => {
      const dirty = editor.getHTML();
      const clean = DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
      });
      const normalized = clean.trim() === "<p></p>" ? "" : clean.trim();

      onChange(normalized);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedOnChange(html);
    },
  });
  const hasFormatting =
    editor?.isActive("bold") ||
    editor?.isActive("italic") ||
    editor?.isActive("underline") ||
    editor?.isActive("bulletList") ||
    editor?.isActive("orderedList") ||
    editor?.isActive("taskList");
  const hasLink = editor?.isActive("link");
  const [hoverPreview, setHoverPreview] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;
  const buttonClass = cn(
    asModal &&
      "p-3 transition-all duration:300 ease-in-out hover:-translate-y-1 ",
    "active:scale-95 text-foreground/60",
  );

  const activeButtonClass = cn(
    " bg-salYellow/20 font-bold text-black border-b-2 border-foreground",
  );

  const EditorUI = (
    <div
      className={cn(
        "flex flex-col rounded p-2",
        !asModal && "border",
        asModal && "rich-modal-cont",
      )}
    >
      {/* Toolbar */}
      <div
        className={cn(
          "mb-2 flex gap-2 border-b pb-2",
          asModal && "justify-between p-2",
        )}
      >
        <div className="scrollable mini justx flex flex-wrap items-center gap-2 p-2 pr-8 sm:pr-2">
          <Button
            variant="richTextButton"
            size="richText"
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              buttonClass,
              editor.isActive("bold") && activeButtonClass,
            )}
          >
            <FaBold className="size-4 shrink-0" />
          </Button>
          <Button
            variant="richTextButton"
            size="richText"
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              buttonClass,
              editor.isActive("italic") && activeButtonClass,
            )}
          >
            <FaItalic className="size-4 shrink-0" />
          </Button>
          <Button
            variant="richTextButton"
            size="richText"
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              buttonClass,
              editor.isActive("underline") && activeButtonClass,
            )}
          >
            <FaUnderline className="size-4 shrink-0" />
          </Button>
          <Button
            variant="richTextButton"
            size="richText"
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              buttonClass,
              editor.isActive("bulletList") && activeButtonClass,
            )}
          >
            <FaListUl className="size-4 shrink-0" />
          </Button>
          <Button
            variant="richTextButton"
            size="richText"
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              buttonClass,
              editor.isActive("orderedList") && activeButtonClass,
            )}
          >
            <FaListOl className="size-4 shrink-0" />
          </Button>
          {forOpenCall && (
            <Button
              variant="richTextButton"
              size="richText"
              type="button"
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={cn(
                buttonClass,
                editor.isActive("taskList")
                  ? activeButtonClass
                  : "text-gray-500",
              )}
            >
              <FaListCheck className="size-4 shrink-0" />
            </Button>
          )}

          <Button
            variant="richTextButton"
            size="richText"
            type="button"
            onClick={() => {
              const { from, to } = editor.state.selection;
              const selectedText = editor.state.doc.textBetween(from, to);
              setLinkUrl(editor.getAttributes("link")?.href || "");
              setDisplayText(selectedText || "");
              setShowLinkInput(true);
            }}
            className={cn(
              buttonClass,
              editor.isActive("link") && activeButtonClass,
            )}
          >
            <FaLink className="size-4 shrink-0" />
          </Button>

          {hasLink && (
            <Button
              variant="richTextButton"
              size="richText"
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className={cn(
                buttonClass,
                editor.isActive("link")
                  ? "border-red-800 bg-red-50 font-bold text-black hover:bg-red-100"
                  : "text-gray-400",
              )}
            >
              <FaUnlink className="size-4 shrink-0" />
            </Button>
          )}
          {hasFormatting && (
            <Button
              variant="richTextButton"
              size="richText"
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .clearNodes() // reset block-level nodes like lists/headings
                  .unsetAllMarks() // remove inline formatting like bold/italic
                  .run()
              }
              className={cn(buttonClass, "text-gray-500")}
            >
              <FaRemoveFormat className="size-4 shrink-0" />
            </Button>
          )}
        </div>
        {asModal && (
          <span
            className={cn(
              "mr-10 hidden flex-col items-end gap-1 border-foreground/30 pr-4 md:flex",
              (subtitle || title) && "border-r-2",
            )}
          >
            <p className="font-bold capitalize">{title}</p>{" "}
            <p className="text-sm">{subtitle}</p>
          </span>
        )}
      </div>
      <Dialog open={showLinkInput} onOpenChange={setShowLinkInput}>
        <DialogContent className="flex flex-col gap-2 rounded-lg bg-dashboardBgLt">
          <DialogTitle className="sr-only">Link Dialog</DialogTitle>
          <div className={cn("mb-2 flex flex-col gap-2 px-4 pt-3")}>
            <label htmlFor="link-url">Link URL:</label>
            <input
              id="link-url"
              type="url"
              className="h-10 w-full rounded border px-2 py-1 text-base sm:text-sm"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <label htmlFor="display-text">Display text:</label>
            <input
              id="display-text"
              type="text"
              className="h-10 w-full rounded border px-2 py-1 text-base sm:text-sm"
              placeholder="Display text"
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
            />

            <div className="flex gap-2 pt-4">
              <Button
                size="lg"
                className="flex-1 bg-salPinkLtHover"
                variant="salWithShadowHiddenYlw"
                onClick={() => setShowLinkInput(false)}
              >
                Cancel
              </Button>
              <Button
                variant="salWithShadowHidden"
                size="lg"
                className="flex-1"
                onClick={() => {
                  const { from, to } = editor.state.selection;
                  const chain = editor.chain().focus();

                  if (linkUrl && displayText) {
                    chain
                      .insertContentAt(
                        { from, to },
                        {
                          type: "text",
                          text: displayText,
                          marks: [
                            {
                              type: "link",
                              attrs: {
                                href: linkUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                class: "underline",
                              },
                            },
                          ],
                        },
                      )
                      .run();
                  } else {
                    chain.unsetLink().run();
                  }

                  setShowLinkInput(false);
                  setLinkUrl("");
                  setDisplayText("");
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditorContent
        editor={editor}
        className={cn(
          "rich-text min-h-[100px] flex-1",
          asModal && "rich-modal [&_div.ProseMirror]:max-h-[calc(90dvh-140px)]",
        )}
      />

      <div className="mt-2 p-1 text-right text-sm text-gray-500">
        {editor.storage.characterCount.characters()}/{charLimit}
      </div>
    </div>
  );
  if (asModal) {
    return (
      <>
        <div
          className="relative cursor-pointer rounded border p-2"
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHoverPreview(true)}
          onMouseLeave={() => setHoverPreview(false)}
        >
          <div className="text-sm text-muted-foreground">
            {value ? (
              <div
                className="rich-text__preview-wrapper prose max-h-20 min-h-16 max-w-none truncate text-foreground"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            ) : (
              <span className="italic text-gray-400">{placeholder}</span>
            )}
          </div>
          {hoverPreview && (
            <div className="absolute bottom-1/2 left-1/2 right-0 flex h-1 w-fit -translate-x-1/2 translate-y-1/2 items-center justify-center gap-2 rounded-lg border bg-card px-7 py-5 text-center text-xs text-foreground/70 shadow-sm hover:scale-105 active:scale-95">
              <Pencil className="size-4 shrink-0" />
              View/Edit Full Text
            </div>
          )}
          <div className="absolute bottom-1 right-1 p-1 text-right text-xs text-foreground/60">
            {editor.storage.characterCount.characters()}/{charLimit}
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="h-[90dvh] w-[90vw] max-w-full rounded-lg bg-card p-0 sm:w-[95vw]"
            overlayClassName="z-[31]"
          >
            <DialogTitle className="sr-only">Text Editor</DialogTitle>
            {EditorUI}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return EditorUI;
};
