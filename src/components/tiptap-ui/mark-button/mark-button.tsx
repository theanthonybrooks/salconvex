"use client";

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button";
// --- Tiptap UI ---
import type { Mark, UseMarkConfig } from "@/components/tiptap-ui/mark-button";

import { forwardRef, useCallback } from "react";
// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor";

// --- UI Primitives ---
import { Badge } from "@/components/tiptap-ui-primitive/badge";
// import { Button } from "@/components/tiptap-ui-primitive/button";
import {
  MARK_SHORTCUT_KEYS,
  useMark,
} from "@/components/tiptap-ui/mark-button";
// --- Lib ---
import { Button } from "@/components/ui/button";
import { cn } from "@/helpers/utilsFns";
import { parseShortcutKeys } from "@/lib/tiptap-utils";

export interface MarkButtonProps
  extends Omit<ButtonProps, "type">,
    UseMarkConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string;
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
}

export function MarkShortcutBadge({
  type,
  shortcutKeys = MARK_SHORTCUT_KEYS[type],
}: {
  type: Mark;
  shortcutKeys?: string;
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for toggling marks in a Tiptap editor.
 *
 * For custom button implementations, use the `useMark` hook instead.
 */
export const MarkButton = forwardRef<HTMLButtonElement, MarkButtonProps>(
  (
    {
      editor: providedEditor,
      type,
      text,
      icon,
      hideWhenUnavailable = false,
      onToggled,
      showShortcut = false,
      onClick,
      children,
      className,
      disabled,

      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const {
      isVisible,
      handleMark,
      label,
      canToggle,
      isActive,
      Icon,
      shortcutKeys,
    } = useMark({
      editor,
      type,
      hideWhenUnavailable,
      onToggled,
    });
    const IconToRender = icon ?? Icon;

    console.log(isVisible, handleMark, label, canToggle, isActive, Icon);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleMark();
      },
      [handleMark, onClick],
    );

    const buttonClass = cn(
      "duration:300 p-3 transition-all ease-in-out hover:-translate-y-1",
      "text-foreground/60 active:scale-95",
      // readOnly && "pointer-events-none cursor-default opacity-50",
    );

    const activeButtonClass = cn(
      "border-b-2 border-foreground bg-salYellow/20 font-bold text-black",
    );

    if (!isVisible) {
      return null;
    }

    return (
      <Button
        type="button"
        size="richText"
        disabled={!canToggle || disabled}
        // data-style="ghost"
        variant="richTextButton"
        data-active-state={isActive ? "on" : "off"}
        data-disabled={!canToggle}
        role="button"
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
        className={cn(buttonClass, isActive && activeButtonClass, className)}
      >
        {children ?? (
          <>
            <IconToRender className="size-4 shrink-0" />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && (
              <MarkShortcutBadge type={type} shortcutKeys={shortcutKeys} />
            )}
          </>
        )}
      </Button>
    );
  },
);

MarkButton.displayName = "MarkButton";
