// TODO: Add a floating menu on new lines. Use the purpose of the menu to determine whether to show it or not, and what options to show. This will be super useful for the open call requirements, especially. https://tiptap.dev/docs/editor/extensions/functionality/floatingmenu

// TODO: Add this:https://tiptap.dev/docs/editor/extensions/functionality/table-of-contents#install later. It's a plugin that adds a table of contents to the editor.

//note-to-self: is the "Editable" toggle useful for this? Perhaps it could be used to show/hide text. I already have something that displays it, though, so I'm not really sure.

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPrimaryAction,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { RichTextDisplay } from "@/lib/richTextFns";
import { cn } from "@/lib/utils";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu, Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import DOMPurify from "dompurify";
import { CheckIcon, LoaderCircle, Pencil } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaRemoveFormat, FaUnlink } from "react-icons/fa";

import {
  FaBold,
  FaItalic,
  FaLink,
  FaListCheck,
  FaListOl,
  FaListUl,
  FaStrikethrough,
  FaUnderline,
} from "react-icons/fa6";
import { toast } from "react-toastify";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  charLimit?: number;
  purpose?: string;
  asModal?: boolean;
  title?: string;
  subtitle?: string;
  noList?: boolean;
  readOnly?: boolean;
  inputPreview?: boolean;
  inputPreviewClassName?: string;
  tabIndex?: number;
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
  onBlur,
  placeholder = "Start typing…",
  charLimit = 500,
  purpose,
  asModal = true,
  title,
  subtitle,
  noList,
  readOnly,
  inputPreview,
  inputPreviewClassName,
  tabIndex,
}: Props) => {
  const linkDialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const [hoverPreview, setHoverPreview] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [tempContent, setTempContent] = useState(value);
  const [linkUrl, setLinkUrl] = useState("");
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pending, setPending] = useState(false);
  const forOpenCall = purpose === "openCall";
  const plainText = (tempContent || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const count = plainText.length;

  const editor = useEditor({
    content: tempContent,
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        bold: {},
        italic: {},
        paragraph: {},
        strike: {},
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

    onUpdate: ({ editor }) => {
      if (readOnly) return;
      const html = editor.getHTML();
      setTempContent(html);
      const count = editor.storage.characterCount.characters();
      if (count === charLimit) {
        toast.warning(
          `Character limit already reached (${count}/${charLimit}). Please remove some text if you would like to add more.`,
          {
            toastId: "char-limit",
          },
        );
      }
    },
    editorProps: {
      handleKeyDown(view, event) {
        const isCmdEnter = event.metaKey && event.key === "Enter";
        const isCtrlEnter = event.ctrlKey && event.key === "Enter";

        if ((isCmdEnter || isCtrlEnter) && hasUnsavedChanges) {
          event.preventDefault();
          handleAccept();
          return true;
        }

        return false;
      },
    },
  });
  const hasFormatting =
    (editor && selectionHasAnyMarks(editor)) ||
    editor?.isActive("bold") ||
    editor?.isActive("italic") ||
    editor?.isActive("strike") ||
    editor?.isActive("underline") ||
    editor?.isActive("bulletList") ||
    editor?.isActive("orderedList") ||
    editor?.isActive("taskList");
  const hasLink = editor?.isActive("link");

  const handleLink = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const chain = editor.chain().focus();

    if (linkUrl && displayText) {
      const normalizedUrl = /^(https?:)?\/\//i.test(linkUrl)
        ? linkUrl
        : `https://${linkUrl}`;

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
                  href: normalizedUrl,
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
  }, [editor, linkUrl, displayText]);

  const handleAccept = useCallback(() => {
    setPending(true);
    const clean = DOMPurify.sanitize(tempContent, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    }).trim();
    onChange(clean === "<p></p>" ? "" : clean);
    onBlur?.();

    setTimeout(() => {
      setPending(false);
      setOpen(false);
    }, 1000);
  }, [tempContent, onChange, onBlur]);

  const handleDiscard = () => {
    setTempContent(value);
    setOpen(false);
  };

  function selectionHasAnyMarks(editor: Editor) {
    const { from, to } = editor.state.selection;
    let hasMarks = false;

    editor.state.doc.nodesBetween(from, to, (node) => {
      if (node.marks?.length) {
        hasMarks = true;
        return false; // stop traversal early
      }
      return true;
    });

    return hasMarks;
  }

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdEnter = e.metaKey && e.key === "Enter";
      const isCtrlEnter = e.ctrlKey && e.key === "Enter";

      if ((isCmdEnter || isCtrlEnter) && hasUnsavedChanges) {
        e.preventDefault();
        handleAccept();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, hasUnsavedChanges, handleAccept]);

  useEffect(() => {
    if (open && editor) {
      setTempContent(value);
      editor.commands.setContent(value);
    }
  }, [open, editor, value]);

  useEffect(() => {
    if (!open) return;
    if (tempContent !== value && open) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [tempContent, value, open]);

  useEffect(() => {
    if (!editor) return;

    const view = editor.view;

    const handlePaste = (event: ClipboardEvent) => {
      const pastedText = event.clipboardData?.getData("text/plain") ?? "";
      const pastedLength = pastedText.length;
      const currentLength = count;

      const projectedLength = currentLength + pastedLength;

      if (projectedLength > charLimit) {
        event.preventDefault();
        if (charLimit - currentLength <= 0) {
          toast.warning(
            `You've reached the maximum number of characters allowed for this field. Please remove some text and try again.`,
            {
              toastId: "char-limit",
            },
          );
        }

        {
          toast.warning(
            `Pasted content is too long at ${pastedLength} characters, while only ${charLimit - currentLength} ${currentLength > 0 && "more"} characters are allowed.`,
            {
              toastId: "char-limit",
            },
          );
        }
      }
    };

    view.dom.addEventListener("paste", handlePaste);
    return () => view.dom.removeEventListener("paste", handlePaste);
  }, [editor, charLimit, count]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLink();
      }
    };

    const dialogNode = linkDialogRef.current;
    if (showLinkInput && dialogNode) {
      dialogNode.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      dialogNode?.removeEventListener("keydown", handleKeyDown);
    };
  }, [showLinkInput, linkUrl, displayText, editor, handleLink]);

  const handleDialogChange = (next: boolean) => {
    if (!next && tempContent !== value) {
      setShowUnsavedDialog(true);
    } else {
      setOpen(next);
    }
  };

  if (!editor) return null;
  const buttonClass = cn(
    asModal &&
      "p-3 transition-all duration:300 ease-in-out hover:-translate-y-1 ",
    "active:scale-95 text-foreground/60",
    readOnly && "pointer-events-none opacity-50 cursor-default",
  );

  const activeButtonClass = cn(
    " bg-salYellow/20 font-bold text-black border-b-2 border-foreground",
  );

  const disabledButtonClass = cn(
    "pointer-events-none cursor-default opacity-50",
  );

  const noListButtonClass = cn(noList && "!hidden");

  const EditorUI = (
    <div
      className={cn(
        "relativè flex flex-col rounded p-2",
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
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              buttonClass,
              editor.isActive("strike") && activeButtonClass,
            )}
          >
            <FaStrikethrough className="size-4 shrink-0" />
          </Button>

          <Separator orientation="vertical" className="mx-2 hidden sm:block" />
          <Button
            variant="richTextButton"
            size="richText"
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              buttonClass,
              editor.isActive("bulletList") && activeButtonClass,
              noListButtonClass,
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
              noListButtonClass,
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
                noListButtonClass,
              )}
            >
              <FaListCheck className="size-4 shrink-0" />
            </Button>
          )}
          <Separator
            orientation="vertical"
            className={cn("mx-2 hidden sm:block", noListButtonClass)}
          />

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
              !hasLink && disabledButtonClass,
            )}
          >
            <FaUnlink className="size-4 shrink-0" />
          </Button>
          <Separator orientation="vertical" className="mx-2 hidden sm:block" />

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
            className={cn(
              buttonClass,
              "text-gray-500",
              !hasFormatting && disabledButtonClass,
            )}
          >
            <FaRemoveFormat className="size-4 shrink-0" />
          </Button>
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
        <DialogContent
          ref={linkDialogRef}
          className="flex flex-col gap-2 rounded-lg bg-dashboardBgLt"
        >
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
                className="flex-1 bg-salPinkLt"
                variant="salWithShadowHiddenYlw"
                onClick={() => setShowLinkInput(false)}
              >
                Cancel
              </Button>
              <Button
                variant="salWithShadowHidden"
                size="lg"
                className="flex-1"
                onClick={handleLink}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex gap-1 rounded-lg border border-foreground/40 bg-card p-2">
            <Button
              variant="richTextButton"
              size="richText"
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                buttonClass,
                editor.isActive("bold") && activeButtonClass,
                "p-2",
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
                "p-2",
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
                "p-2",
              )}
            >
              <FaUnderline className="size-4 shrink-0" />
            </Button>
            <Button
              variant="richTextButton"
              size="richText"
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={cn(
                buttonClass,
                editor.isActive("strike") && activeButtonClass,
                "p-2",
              )}
            >
              <FaStrikethrough className="size-4 shrink-0" />
            </Button>
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
                "p-2",
              )}
            >
              <FaLink className="size-4 shrink-0" />
            </Button>
          </div>
        </BubbleMenu>
      )}
      <EditorContent
        editor={editor}
        className={cn(
          "rich-text min-h-[100px] flex-1",
          asModal && "rich-modal [&_div.ProseMirror]:max-h-[calc(90dvh-140px)]",
          readOnly && "pointer-events-none cursor-default",
        )}
      />

      <div className="absolute bottom-4 right-4 flex flex-col gap-2 rounded bg-card">
        <p className="mr-1 text-right text-sm text-gray-500">
          {editor.storage.characterCount.characters()}/{charLimit}
        </p>

        <div className="flex items-center gap-1">
          {hasUnsavedChanges && (
            <Button variant="salWithShadowHidden" onClick={handleDiscard}>
              Discard
            </Button>
          )}
          <Button
            variant="salWithShadowHiddenYlw"
            onClick={() => {
              if (hasUnsavedChanges) {
                handleAccept();
              } else {
                setOpen(false);
              }
            }}
          >
            {hasUnsavedChanges ? "Save" : readOnly ? "Close" : "Cancel"}
            {hasUnsavedChanges && !pending && (
              <CheckIcon className="ml-1 size-4 shrink-0" />
            )}
            {pending && (
              <LoaderCircle className="ml-1 size-4 shrink-0 animate-spin" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
  if (asModal) {
    return (
      <>
        <div
          className={cn(
            "relative cursor-pointer rounded border bg-card p-2",
            readOnly && "pointer-events-none border-foreground/50 opacity-50",
            "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            inputPreviewClassName,
          )}
          tabIndex={tabIndex}
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHoverPreview(true)}
          onMouseLeave={() => setHoverPreview(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        >
          <div
            className={cn(
              "scrollable justy mini max-h-20 min-h-14 text-sm text-muted-foreground",
              inputPreview && "line-clamp-1 max-h-5 min-h-0",
            )}
          >
            {value ? (
              <div
                className={cn(
                  "rich-text__preview-wrapper prose max-w-none text-foreground",
                  inputPreview && "max-w-10ch truncate",
                )}
              >
                <RichTextDisplay html={value} />
              </div>
            ) : (
              <span className="italic text-gray-400">
                <p>{placeholder}</p>
                {!inputPreview && <p>{`Limit (${charLimit} characters)`}</p>}
              </span>
            )}
          </div>
          {!inputPreview && hoverPreview && value?.trim().length > 0 && (
            <div className="absolute bottom-1/2 left-1/2 right-0 flex h-1 w-fit -translate-x-1/2 translate-y-1/2 items-center justify-center gap-2 rounded-lg border bg-card px-6 py-4 text-center text-xs text-foreground/70 shadow-sm hover:scale-105 active:scale-95">
              <Pencil className="size-4 shrink-0" />
              View/Edit Full Text
            </div>
          )}
          {!inputPreview && (
            <div className="absolute bottom-1 right-1 rounded bg-card p-1 text-right text-xs text-foreground/60">
              {editor.storage.characterCount.characters()}/{charLimit}
            </div>
          )}
        </div>

        {/* <Dialog open={open} onOpenChange={setOpen}> */}
        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogContent
            className="h-[90dvh] w-[90vw] max-w-full rounded-lg bg-card p-0 sm:w-[95vw]"
            overlayClassName="z-[31]"
          >
            <DialogTitle className="sr-only">Text Editor</DialogTitle>
            {EditorUI}
          </DialogContent>
        </Dialog>
        <AlertDialog
          open={showUnsavedDialog}
          onOpenChange={setShowUnsavedDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard changes?</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Do you want to discard or save them?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDiscard}
                variant="salWithShadowHiddenYlw"
              >
                Discard
              </AlertDialogAction>
              <AlertDialogPrimaryAction onClick={handleAccept} className="w-30">
                Save
              </AlertDialogPrimaryAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return EditorUI;
};
