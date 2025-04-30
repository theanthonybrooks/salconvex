import { Button } from "@/components/ui/button";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
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
}: Props) => {
  const forOpenCall = purpose === "openCall";
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: {}, //can omit this (supposedly) and it will default to true
        italic: {},

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
      TaskList,
      TaskItem.configure({ nested: true }),
      //note-to-self: replaced this with a simple replace() in the parser as this was breaking lists.
      //   HardBreak.extend({
      //     addKeyboardShortcuts() {
      //       return {
      //         Enter: () => this.editor.commands.setHardBreak(),
      //       };
      //     },
      //   }),
      Placeholder.configure({
        placeholder,
      }),
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
    content: value,
    onBlur: ({ editor }) => {
      const dirty = editor.getHTML();
      const clean = DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
      });
      onChange(clean);
    },
  });

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  console.log(editor?.extensionManager.extensions.map((e) => e.name));

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="rounded border p-2">
      {/* Toolbar */}
      <div className="mb-2 flex gap-2 border-b pb-2">
        <Button
          variant="richTextButton"
          size="richText"
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={
            editor.isActive("bold")
              ? "bg-salYellow/20 font-bold text-black"
              : "text-gray-500"
          }
        >
          <FaBold className="size-4 shrink-0" />
        </Button>
        <Button
          variant="richTextButton"
          size="richText"
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={
            editor.isActive("italic")
              ? "bg-salYellow/20 font-bold text-black"
              : "text-gray-500"
          }
        >
          <FaItalic className="size-4 shrink-0" />
        </Button>
        <Button
          variant="richTextButton"
          size="richText"
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={
            editor.isActive("underline")
              ? "bg-salYellow/20 font-bold text-black"
              : "text-gray-500"
          }
        >
          <FaUnderline className="size-4 shrink-0" />
        </Button>
        <Button
          variant="richTextButton"
          size="richText"
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={
            editor.isActive("bulletList")
              ? "bg-salYellow/20 font-bold text-black"
              : "text-gray-500"
          }
        >
          <FaListUl className="size-4 shrink-0" />
        </Button>
        <Button
          variant="richTextButton"
          size="richText"
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={
            editor.isActive("orderedList")
              ? "bg-salYellow/20 font-bold text-black"
              : "text-gray-500"
          }
        >
          <FaListOl className="size-4 shrink-0" />
        </Button>
        {forOpenCall && (
          <Button
            variant="richTextButton"
            size="richText"
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={
              editor.isActive("taskList")
                ? "bg-salYellow/20 font-bold text-black"
                : "text-gray-500"
            }
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
          className={
            editor.isActive("link")
              ? "bg-salYellow/20 font-bold text-black"
              : "text-gray-500"
          }
        >
          <FaLink className="size-4 shrink-0" />
        </Button>

        <Button
          variant="richTextButton"
          size="richText"
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className={
            editor.isActive("link")
              ? "bg-red-100 font-bold text-black"
              : "text-gray-400"
          }
        >
          <FaUnlink className="size-4 shrink-0" />
        </Button>
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
          className="text-gray-500"
        >
          <FaRemoveFormat className="size-4 shrink-0" />
        </Button>
      </div>
      {showLinkInput && (
        <div className="mb-2 flex flex-col gap-2">
          <div className="grid grid-cols-[30%_70%] gap-2">
            <p>Link:</p>
            <input
              type="url"
              className="w-[250px] rounded border px-2 py-1 text-sm"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-[30%_70%] gap-2">
            <p>Display text:</p>
            <input
              type="text"
              className="w-[250px] rounded border px-2 py-1 text-sm"
              placeholder="Display text"
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
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
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowLinkInput(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <EditorContent editor={editor} className="rich-text min-h-[100px]" />

      {/* Character count */}
      <div className="mt-2 text-right text-sm text-gray-500">
        {editor.storage.characterCount.characters()}/{charLimit}
      </div>
    </div>
  );
};
