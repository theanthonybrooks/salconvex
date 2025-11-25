// TODO: Add a floating menu on new lines. Use the purpose of the menu to determine whether to show it or not, and what options to show. This will be super useful for the open call requirements, especially. https://tiptap.dev/docs/editor/extensions/functionality/floatingmenu

// TODO: Add this:https://tiptap.dev/docs/editor/extensions/functionality/table-of-contents#install later. It's a plugin that adds a table of contents to the editor.

//note-to-self: is the "Editable" toggle useful for this? Perhaps it could be used to show/hide text. I already have something that displays it, though, so I'm not really sure.

import { useCallback, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-media-query";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import {
  EditorContent,
  EditorContext,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { toast } from "react-toastify";

import { FaRedo, FaRemoveFormat, FaUndo, FaUnlink } from "react-icons/fa";
import { FaListCheck, FaListOl, FaListUl } from "react-icons/fa6";
import { IoOptions } from "react-icons/io5";
import { Check, CheckIcon, LoaderCircle, Pencil } from "lucide-react";

import { MarkButton } from "@/components/tiptap-ui/mark-button";
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
import {
  cleanHtml,
  RichTextDisplay,
  trimTrailingEmptyParagraphs,
} from "@/helpers/richTextFns";
import { cn } from "@/helpers/utilsFns";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  requiredChars?: number;
  charLimit?: number;
  purpose?: string;
  asModal?: boolean;
  bgClassName?: string;
  title?: string;
  subtitle?: string;
  noList?: boolean;
  readOnly?: boolean;
  inputPreview?: boolean;
  inputPreviewContainerClassName?: string;
  formInputPreview?: boolean;
  formInputPreviewClassName?: string;
  dialogClassName?: string;
  tabIndex?: number;
  withTaskList?: boolean;
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
  "s",
  "strike",
];
export const ALLOWED_ATTR = ["href", "target", "rel"];

type EditorInstance = NonNullable<ReturnType<typeof useEditor>>;

export const RichTextEditor = ({
  value,
  onChange,
  onBlur,
  placeholder = "Start typing…",
  charLimit = 500,
  requiredChars,
  purpose,
  asModal = true,
  // bgClassName,
  title,
  subtitle,
  noList,
  readOnly,
  inputPreview,
  inputPreviewContainerClassName,
  formInputPreview,
  formInputPreviewClassName,
  dialogClassName,
  tabIndex,
  withTaskList,
}: Props) => {
  const isMobile = useIsMobile(768);
  const previewRef = useRef<HTMLDivElement>(null);

  const linkDialogRef = useRef<HTMLDivElement>(null);

  const [editorOpen, setEditorOpen] = useState(false);

  const [showMarkButtons, setShowMarkButtons] = useState(!isMobile);
  const [hoverPreview, setHoverPreview] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [tempContent, setTempContent] = useState(value);
  const [linkUrl, setLinkUrl] = useState("");
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pending, setPending] = useState(false);
  const [reqCharsMet, setReqCharsMet] = useState(requiredChars ? false : true);
  const forOpenCall = purpose === "openCall";
  const plainText = (tempContent || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const count = plainText.length;

  const initialContent = tempContent === value;

  const editor = useEditor({
    content: tempContent,
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
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
        placeholder: requiredChars
          ? `${placeholder} (Minimum ${requiredChars} characters*)`
          : placeholder,
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
      // UiState,
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
      attributes: {
        class: "scrollable justy mini darkbar p-4 h-full",
      },
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
  const isFocused = editor?.isFocused;
  const { canUndo, canRedo } = useEditorState({
    editor,
    selector: (ctx) => ({
      canUndo: (ctx?.editor?.can().undo() && !initialContent) ?? false,
      canRedo: ctx?.editor?.can().redo() ?? false,
    }),
  }) ?? { canUndo: false, canRedo: false };

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
    let clean = cleanHtml(tempContent).trim();
    clean = trimTrailingEmptyParagraphs(clean);
    onChange(clean === "<p></p>" ? "" : clean);
    onBlur?.();

    setTimeout(() => {
      setPending(false);
      setEditorOpen(false);
    }, 1000);
  }, [tempContent, onChange, onBlur]);

  const handleDiscard = () => {
    setTempContent(value);
    setEditorOpen(false);
  };

  function selectionHasAnyMarks(editor: EditorInstance) {
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
    if (!editorOpen) return;

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
  }, [editorOpen, hasUnsavedChanges, handleAccept]);

  useEffect(() => {
    if (editorOpen && editor) {
      setTempContent(value);
      editor.commands.setContent(value);
      setTimeout(() => {
        editor.commands.focus("end");
      }, 50);
    }
  }, [editorOpen, editor, value]);

  useEffect(() => {
    if (!editorOpen) return;
    if (tempContent !== value && editorOpen) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [tempContent, value, editorOpen]);

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

  useEffect(() => {
    if (!requiredChars) {
      setReqCharsMet(true);
      return;
    }

    if (count >= requiredChars) {
      setReqCharsMet(true);
    } else {
      setReqCharsMet(false);
    }
  }, [requiredChars, count]);

  const handleDialogChange = (next: boolean) => {
    if (!next && tempContent !== value) {
      setShowUnsavedDialog(true);
    } else {
      setEditorOpen(next);
      if (!next) {
        previewRef.current?.focus();
      }
    }
  };

  if (!editor) return null;

  const buttonClass = cn(
    asModal &&
      "duration:300 p-3 transition-all ease-in-out hover:-translate-y-1",
    "text-foreground/60 active:scale-95",
    readOnly && "pointer-events-none cursor-default opacity-50",
  );

  const activeButtonClass = cn(
    "border-b-2 border-foreground bg-salYellow/20 font-bold text-black",
  );

  const disabledButtonClass = cn(
    "pointer-events-none cursor-default opacity-50",
  );

  const noListButtonClass = cn(noList && "!hidden");

  // function insertLabeledListItem(editor: Editor, label: string) {
  //   editor
  //     .chain()
  //     .focus()
  //     .insertContent({
  //       type: "paragraph",
  //       content: [
  //         {
  //           type: "text",
  //           marks: [{ type: "bold" }],
  //           text: label,
  //         },
  //       ],
  //     })
  //     .run();
  // }

  const EditorUI = (
    <EditorContext.Provider value={{ editor }}>
      <div
        className={cn(
          "flex h-full flex-col rounded p-2",
          !asModal && "border",
          asModal &&
            "rich-modal-cont w-full items-center overflow-hidden px-0 sm:items-start",
          // bgClassName,
        )}
      >
        {/* Toolbar */}
        <div
          className={cn(
            "mb-2 flex w-full gap-2 border-b pb-2",
            asModal && "justify-between p-2",
          )}
        >
          <div className="scrollable mini justx flex flex-wrap items-center gap-2 p-2 pr-10 sm:pr-2">
            <Button
              variant="richTextButton"
              size="richText"
              type="button"
              disabled={!canUndo}
              onClick={() => editor.commands.undo()}
              className={cn(buttonClass)}
            >
              <FaUndo className="size-4 shrink-0" />
            </Button>
            <Button
              variant="richTextButton"
              size="richText"
              type="button"
              disabled={!canRedo}
              onClick={() => editor.commands.redo()}
              className={cn(buttonClass)}
            >
              <FaRedo className="size-4 shrink-0" />
            </Button>
            <Separator
              orientation="vertical"
              className={cn("mx-2 hidden sm:block", noListButtonClass)}
            />
            <MarkButton type="bold" />
            <MarkButton type="italic" />

            <Button
              variant="icon"
              onClick={() => setShowMarkButtons((prev) => !prev)}
              className="sm:hidden"
            >
              <IoOptions className="size-6" />
            </Button>
            {showMarkButtons && (
              <>
                <MarkButton type="underline" />
                <MarkButton type="strike" />

                <Separator
                  orientation="vertical"
                  className="mx-2 hidden sm:block"
                />
                <Button
                  variant="richTextButton"
                  size="richText"
                  type="button"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  className={cn(
                    buttonClass,
                    // markIsActiveAtCursor("bulletList") && activeButtonClass,
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
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  className={cn(
                    buttonClass,
                    // markIsActiveAtCursor("orderedList") && activeButtonClass,
                    editor.isActive("orderedList") && activeButtonClass,
                    noListButtonClass,
                  )}
                >
                  <FaListOl className="size-4 shrink-0" />
                </Button>
                {forOpenCall ||
                  (withTaskList && (
                    <Button
                      variant="richTextButton"
                      size="richText"
                      type="button"
                      onClick={() =>
                        editor.chain().focus().toggleTaskList().run()
                      }
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
                  ))}
                <Separator
                  orientation="vertical"
                  className={cn("mx-2 hidden sm:block", noListButtonClass)}
                />

                <MarkButton
                  onClick={() => {
                    const { from, to } = editor.state.selection;
                    const selectedText = editor.state.doc.textBetween(from, to);
                    setLinkUrl(editor.getAttributes("link")?.href || "");
                    setDisplayText(selectedText || "");
                    setShowLinkInput(true);
                  }}
                  type="link"
                />
                <MarkButton
                  onClick={() => editor.chain().focus().unsetLink().run()}
                  type="link"
                  className={cn(
                    "data-[active-state=on]:border-red-800 data-[active-state=on]:bg-red-50 data-[active-state=on]data-[active-state=on]:text-black data-[active-state=on]:hover:bg-red-100",
                  )}
                  disabled={!hasLink}
                  icon={FaUnlink}
                />

                <Separator
                  orientation="vertical"
                  className="mx-2 hidden sm:block"
                />

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
              </>
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
          <DialogContent
            ref={linkDialogRef}
            className="top-4 flex translate-y-0 flex-col gap-2 rounded-lg bg-dashboardBgLt sm:top-1/2 sm:-translate-y-1/2"
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
          <>
            <BubbleMenu editor={editor} options={{ placement: "top-start" }}>
              <div className="flex gap-1 rounded-lg border border-foreground/40 bg-card p-2">
                <MarkButton type="bold" />
                <MarkButton type="italic" />
                <MarkButton type="underline" />
                <MarkButton type="strike" />

                <MarkButton
                  onClick={() => {
                    const { from, to } = editor.state.selection;
                    const selectedText = editor.state.doc.textBetween(from, to);
                    setLinkUrl(editor.getAttributes("link")?.href || "");
                    setDisplayText(selectedText || "");
                    setShowLinkInput(true);
                  }}
                  type="link"
                />
              </div>
            </BubbleMenu>
            {/* <FloatingElementExample /> */}
            {/* <FloatingMenu editor={editor}>
              <div className="flex items-center gap-1 rounded-lg border border-foreground/40 bg-card p-2">
                <Button
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .insertContent([
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Section title" }],
                        },
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Body text here…" }],
                        },
                      ])
                      .run();
                  }}
                >
                  Insert Artist Info
                </Button>
                <Button
                  onClick={() => insertLabeledListItem(editor, "Artist Info")}
                >
                  Insert Artist Info
                </Button>
              </div>
            </FloatingMenu> */}
            {/* <DragContextMenu editor={editor} /> */}
          </>
        )}
        <EditorContent
          editor={editor}
          className={cn(
            "rich-text scrollable invis w-full flex-1 md:px-4",
            // asModal && "rich-modal [&_div.ProseMirror]:h-full",
            readOnly && "pointer-events-none cursor-default",
          )}
        />

        <div
          className={cn(
            "flex w-full max-w-[81dvw] flex-col gap-2 rounded bg-card pb-2 sm:w-auto sm:self-end sm:pr-4",
            // bgClassName,
          )}
        >
          <p
            className={cn(
              "mr-1 flex items-center justify-end gap-1 text-right text-sm text-gray-500",
              requiredChars && !reqCharsMet && "text-red-500",
              requiredChars && reqCharsMet && "text-emerald-500",
            )}
          >
            {editor.storage.characterCount.characters()}/{charLimit}
            {requiredChars && reqCharsMet && (
              <Check className="size-3 text-emerald-500" />
            )}
          </p>

          <div className="flex flex-col items-center justify-end gap-3 sm:flex-row">
            {!reqCharsMet && (
              <p className="text-nowrap text-xs text-red-500 sm:text-sm">
                Content is too short. Must be at least {requiredChars}{" "}
                characters.
              </p>
            )}
            <div className="flex w-full items-center gap-2">
              {hasUnsavedChanges && (
                <Button variant="salWithShadowHidden" onClick={handleDiscard}>
                  Discard
                </Button>
              )}
              <Button
                disabled={!reqCharsMet}
                variant="salWithShadowHiddenYlw"
                onClick={() => {
                  if (hasUnsavedChanges) {
                    handleAccept();
                  } else {
                    setEditorOpen(false);
                  }
                }}
                className="flex-1 sm:flex-none"
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
      </div>
    </EditorContext.Provider>
  );
  if (asModal) {
    return (
      <>
        <div
          className={cn(
            "relative cursor-pointer rounded border bg-card p-2",
            readOnly && "pointer-events-none border-foreground/50 opacity-50",
            "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            inputPreviewContainerClassName,
          )}
          ref={previewRef}
          tabIndex={tabIndex ?? 0}
          role="button"
          aria-label="Edit Text"
          onClick={() => setEditorOpen(true)}
          onMouseEnter={() => setHoverPreview(true)}
          onMouseLeave={() => setHoverPreview(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setEditorOpen(true);
            }
          }}
        >
          <div
            className={cn(
              "scrollable justy mini min-h-14 text-sm text-muted-foreground",
              !value && "line-clamp-5",
              ((formInputPreview && !editorOpen) || inputPreview) &&
                "line-clamp-3 max-h-25",
              formInputPreviewClassName,
            )}
          >
            {value ? (
              <div
                className={cn(
                  "prose max-w-auto text-foreground",
                  inputPreview && "max-w-10ch truncate",
                )}
              >
                <RichTextDisplay html={value} maxChars={250} />
              </div>
            ) : (
              <span className="italic text-gray-400">
                <p className="inline-flex gap-1">{placeholder}</p>
                {requiredChars && (
                  <p> {`Minimum (${requiredChars} characters)`}</p>
                )}
                {!inputPreview && <p>{`Limit ${charLimit} characters`}</p>}
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
            <div
              className={cn(
                "absolute bottom-1 right-1 flex items-center gap-1 rounded bg-card p-1 text-right text-xs text-foreground/60",
                requiredChars && !reqCharsMet && "text-red-500",
                requiredChars && reqCharsMet && "text-emerald-500",
              )}
            >
              {editor.storage.characterCount.characters()}/{charLimit}
              {requiredChars && reqCharsMet && (
                <Check className="size-3 text-emerald-500" />
              )}
            </div>
          )}
        </div>

        <Dialog open={editorOpen} onOpenChange={handleDialogChange}>
          <DialogContent
            className={cn(
              "h-dvh w-screen max-w-full bg-card p-0 sm:h-[90dvh] sm:w-[95vw] sm:rounded-lg",
              "top-0 translate-y-0 sm:top-1/2 sm:-translate-y-1/2",
              isFocused && isMobile && "h-[61svh]",
              dialogClassName,
            )}
            overlayClassName={cn("z-[31]")}
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
              <AlertDialogPrimaryAction
                onClick={handleAccept}
                className="md:w-30"
                disabled={!reqCharsMet}
              >
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
