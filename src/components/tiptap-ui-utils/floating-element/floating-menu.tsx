import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";

// --- UI Primitives ---
import { ButtonGroup } from "@/components/tiptap-ui-primitive/button";
import { Toolbar } from "@/components/tiptap-ui-primitive/toolbar";
// --- Tiptap UI ---
import { FloatingElement } from "@/components/tiptap-ui-utils/floating-element";
import { MarkButton } from "@/components/tiptap-ui/mark-button";

// --- Tiptap Node ---
// import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

export const FloatingElementExample = () => {
  const editor = useEditor({
    immediatelyRender: false,
    content: `<h2>Floating Element Example</h2>
      <p>Try selecting some text in this editor. A simple formatting toolbar will appear above your selection. 
      The FloatingElement component positions UI elements relative to the text selection or cursor position. 
      It's commonly used for contextual toolbars, menus, and other elements that should appear near the current editing context.</p>`,
    extensions: [StarterKit],
  });

  return (
    <EditorContext.Provider value={{ editor }}>
      <EditorContent editor={editor} role="presentation" />

      <FloatingElement editor={editor}>
        <Toolbar variant="floating">
          <ButtonGroup orientation="horizontal">
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="strike" />
            <MarkButton type="underline" />
            <MarkButton type="superscript" />
            <MarkButton type="subscript" />
          </ButtonGroup>
        </Toolbar>
      </FloatingElement>
    </EditorContext.Provider>
  );
};
