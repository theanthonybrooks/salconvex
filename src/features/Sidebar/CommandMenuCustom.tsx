import { DialogTitle } from "@/components/ui/dialog";
import { DashIcon } from "@radix-ui/react-icons";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { CircleX, X } from "lucide-react";
import Link from "next/link";
import { IoSearch } from "react-icons/io5";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { searchDialogVariants } from "@/constants/dialogConsts";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { cn } from "@/helpers/utilsFns";
import { usePreloadedQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export interface CommandItem {
  label?: string;
  name?: string;
  icon?: React.ComponentType<{ className?: string }>;
  path?: string;
  href?: string;
  sub?: string[];
  userType: string[];
  sectionCat?: string;
  group?: string;
  desc?: string;
}

interface CommandMenuProps<T extends CommandItem> {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isMobile?: boolean;
  title: string;
  source: T[];
  shortcut?: string;
  placeholder?: string;
  setSearch: Dispatch<React.SetStateAction<string>>;
}

export const CommandMenuCustom = <T extends CommandItem>({
  open,
  setOpen,
  title,
  source,
  shortcut = "/",
  isMobile = false,

  // groupName,
  placeholder = `Hello. Is it me you're looking for? Use ctrl + ${shortcut} to search faster.`,
  setSearch,
}: CommandMenuProps<T>) => {
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const userData = usePreloadedQuery(preloadedUserData);
  const userType = userData?.user?.accountType;
  const userRole = userData?.user?.role;
  const { subStatus } = subData ?? {};
  const userPref = userData?.userPref ?? null;
  const baseFontSize = userPref?.fontSize === "large" ? "text-base" : "text-sm";
  // console.log(subStatus);

  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const shortcutRef = useRef(shortcut);
  const router = useRouter();

  // Update the ref if shortcut changes
  useEffect(() => {
    shortcutRef.current = shortcut;
  }, [shortcut]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [open]);

  // Keyboard shortcut handler (depends only on setOpen)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === shortcutRef.current && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const filteredItems = source.filter((item) => {
    const itemUserType = item?.userType;
    const itemUserSub = item?.sub;
    const isPublic = itemUserType?.includes("public");
    const typeMatch = userType?.some((type) =>
      itemUserType?.some(
        (userType) => userType.toLowerCase() === type.toLowerCase(),
      ),
    );
    const subMatch = itemUserSub?.some(
      (sub) => sub.toLowerCase() === subStatus?.toLowerCase(),
    );

    const isAdmin = userRole?.includes("admin");
    const allSubs = itemUserSub?.includes("all");

    const fitsSubReqs = subMatch || allSubs;

    return (
      (isPublic && typeMatch && fitsSubReqs) ||
      (!isPublic && typeMatch && fitsSubReqs) ||
      (isPublic && allSubs) ||
      isAdmin
    );
  });

  // console.log(filteredItems);

  // Extract fields from source dynamically
  const extractedItems = filteredItems.map((item) => ({
    title: item.label || item.name,
    icon: item.icon || null,
    path: item.path || item.href || "#",
    group: item.sectionCat || item.group || "Other",
    desc: item.desc || "",
  }));

  const searchTerm = value.toLowerCase();

  const handleValueChange = (newValue: string) => {
    setSearch(newValue);
    setValue(newValue);
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  // Group items by group name
  const groups = extractedItems.reduce<Record<string, typeof extractedItems>>(
    (acc, item) => {
      const grp = item.group;
      if (!acc[grp]) acc[grp] = [];
      acc[grp].push(item);
      return acc;
    },
    {},
  );

  // Build groupedItems based on the search term:
  // If the group name includes the search term, include all items;
  // Otherwise, only include items whose title includes the search term.
  const groupedItems = Object.entries(groups).reduce<
    Record<string, typeof extractedItems>
  >((acc, [grpName, items]) => {
    if (grpName.toLowerCase().includes(searchTerm)) {
      acc[grpName] = items;
    } else {
      const filtered = items.filter((item) =>
        item?.title?.toLowerCase().includes(searchTerm),
      );
      if (filtered.length > 0) acc[grpName] = filtered;
    }
    return acc;
  }, {});

  return isMobile ? (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent
        setOpen={setOpen}
        className="fixed z-top h-[90vh] max-h-[90%] bg-card"
      >
        <div className="relative h-full w-full">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-t-2xl pb-6 pt-4">
            <DrawerHeader>
              <DrawerTitle className="sr-only">{title}</DrawerTitle>
            </DrawerHeader>

            <Command shouldFilter={false} className="flex h-full flex-col">
              <div className="relative flex flex-shrink-0 items-center gap-1 border-b border-black/20 px-6 pb-3">
                <IoSearch className="p-1 text-3xl text-stone-400" />
                <Command.Input
                  ref={inputRef}
                  value={value}
                  onValueChange={handleValueChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  placeholder={placeholder}
                  className="focus:outline-hidden relative z-10 w-full overflow-hidden truncate whitespace-nowrap p-3 pr-12 text-lg selection:italic selection:text-foreground placeholder:text-stone-400"
                />
                {value.length > 0 && (
                  <button
                    onClick={() => {
                      setValue("");
                      setSearch("");
                      inputRef.current?.focus();
                    }}
                    className="absolute right-8 z-20 text-stone-400 transition-opacity hover:text-stone-600"
                  >
                    <CircleX className="size-7" />
                  </button>
                )}
              </div>

              <Command.List className="flex-1 overflow-y-auto px-6 py-2">
                {Object.keys(groupedItems).length === 0 ? (
                  <Command.Empty className="py-8 text-center text-base">
                    No results found for{" "}
                    <span className="italic text-violet-500">
                      &quot;{value}&quot;
                    </span>
                  </Command.Empty>
                ) : (
                  Object.entries(groupedItems).map(([groupKey, groupItems]) => (
                    <Command.Group
                      key={groupKey}
                      heading={groupKey.toUpperCase()}
                      className="mb-5 border-t-1.5 border-black/20 pt-2 text-base text-stone-400 first:border-t-0 last:mb-10"
                    >
                      {groupItems.map((item) => (
                        <Command.Item
                          key={item.path}
                          className='flex cursor-pointer items-center gap-2 rounded p-2 pl-5 text-base text-foreground transition-colors hover:bg-stone-100 hover:text-stone-900 data-[selected="true"]:bg-salYellow/40'
                          onSelect={() => {
                            setOpen(false);
                            router.push(item.path);
                          }}
                        >
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <Link
                            href={item.path}
                            prefetch={true}
                            onClick={handleLinkClick}
                          >
                            <span>{item.title}</span>
                          </Link>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))
                )}
              </Command.List>
            </Command>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <AnimatePresence>
      {open && (
        <Command.Dialog
          open
          shouldFilter={false}
          label={title}
          className="fixed inset-0 z-999 flex items-center justify-center text-foreground"
          onClick={() => setOpen(false)}
        >
          <>
            <motion.div
              key="overlay"
              className="z-100 fixed inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            />
            <motion.div
              key="dialogBox"
              variants={searchDialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative flex max-h-[80vh] w-full max-w-[90vw] flex-col rounded-lg border border-stone-300 bg-card p-4 shadow-xl md:max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 z-20 rounded p-1 hover:scale-125 active:scale-110"
              >
                <X className="h-7 w-7 text-stone-600 md:h-5 md:w-5" />
              </button>
              <DialogTitle className="sr-only">{title}</DialogTitle>
              <div className="flex items-center gap-1 border-b border-stone-300">
                <IoSearch className="z-20 p-1 text-3xl text-stone-400" />
                <Command.Input
                  ref={inputRef}
                  value={value}
                  onValueChange={handleValueChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setOpen(false);
                    }
                    if (e.key === "Escape") {
                      setValue("");
                      setSearch("");
                      setOpen(false);
                    }
                  }}
                  placeholder={cn(
                    placeholder,
                    !isMobile && "  (Hint: Ctrl + /)",
                  )}
                  className="focus:outline-hidden relative z-10 w-full bg-card p-3 text-lg selection:italic selection:text-stone-400 placeholder:text-stone-400"
                />
              </div>
              <div className="max-h-60dvh search scrollable mini p-3">
                <Command.List>
                  {Object.keys(groupedItems).length === 0 ? (
                    <Command.Empty>
                      No results found for{" "}
                      <span className="italic text-violet-500">
                        &quot;{value}&quot;
                      </span>
                    </Command.Empty>
                  ) : (
                    Object.entries(groupedItems).map(
                      ([groupKey, groupItems]) => (
                        <Command.Group
                          key={groupKey}
                          heading={groupKey.toUpperCase()}
                          className={cn(
                            "mb-5 border-t-1.5 border-stone-200 pt-2 text-stone-400 first:border-t-0",
                            baseFontSize,
                          )}
                        >
                          {groupItems.map((item) => (
                            <Command.Item
                              key={item.path}
                              className={cn(
                                "group flex cursor-pointer items-start gap-2 rounded p-2 pl-5 text-foreground transition-colors hover:bg-stone-100 hover:text-stone-900 data-[selected='true']:bg-salYellow/40",
                                baseFontSize,
                              )}
                              onSelect={() => router.push(item.path)}
                            >
                              <div className={cn("flex items-center gap-2")}>
                                {item.icon && <item.icon className="size-4" />}
                                <Link
                                  href={item.path}
                                  prefetch={true}
                                  onClick={handleLinkClick}
                                  className="text-nowrap"
                                >
                                  <span>{item.title}</span>
                                </Link>
                              </div>
                              {item.desc && !isMobile && (
                                <span className="inline-flex gap-2 text-stone-600 opacity-0 transition-opacity ease-in-out group-hover:opacity-100">
                                  <DashIcon className={cn("mt-1")} />
                                  <span>{item.desc}</span>
                                </span>
                              )}
                            </Command.Item>
                          ))}
                        </Command.Group>
                      ),
                    )
                  )}
                </Command.List>
              </div>
            </motion.div>
          </>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
};
