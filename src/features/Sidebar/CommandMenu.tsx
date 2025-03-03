import { DialogTitle } from "@/components/ui/dialog";
import { Command } from "cmdk";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FiEye, FiLink, FiLogOut, FiPhone, FiPlus } from "react-icons/fi";

export const CommandMenu = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [value, setValue] = useState("");

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 flex items-center justify-center bg-stone-950/50"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mx-auto mt-12 w-full max-w-xl overflow-hidden rounded-lg border border-stone-300 bg-white shadow-xl"
      >
        <DialogTitle className="sr-only"> Global Command Menu</DialogTitle>

        <Command.Input
          value={value}
          onValueChange={setValue}
          placeholder="What do you need?"
          className="relative w-full border-b border-stone-300 p-3 text-lg placeholder:text-stone-400 focus:outline-none"
        />
        <Command.List className="p-3">
          <Command.Empty>
            No results found for{" "}
            <span className="text-violet-500">"{value}"</span>
          </Command.Empty>

          <Command.Group heading="Team" className="mb-3 text-sm text-stone-400">
            <Command.Item className="flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-stone-950 transition-colors hover:bg-stone-200">
              <FiPlus />
              Invite Member
            </Command.Item>
            <Command.Item className="flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-stone-950 transition-colors hover:bg-stone-200">
              <FiEye />
              See Org Chart
            </Command.Item>
          </Command.Group>

          <Command.Group
            heading="Integrations"
            className="mb-3 text-sm text-stone-400"
          >
            <Command.Item className="flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-stone-950 transition-colors hover:bg-stone-200">
              <FiLink />
              Link Services
            </Command.Item>
            <Command.Item className="flex cursor-pointer items-center gap-2 rounded p-2 text-sm text-stone-950 transition-colors hover:bg-stone-200">
              <FiPhone />
              Contact Support
            </Command.Item>
          </Command.Group>

          <Command.Item className="flex cursor-pointer items-center gap-2 rounded bg-stone-950 p-2 text-sm text-stone-50 transition-colors hover:bg-stone-700">
            <FiLogOut />
            Sign Out
          </Command.Item>
        </Command.List>
      </div>
    </Command.Dialog>
  );
};
