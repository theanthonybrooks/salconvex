import { DialogTitle } from "@/components/ui/dialog";
import { Filters, SortOptions } from "@/types/thelist";
import { DashIcon } from "@radix-ui/react-icons";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { IoSearch } from "react-icons/io5";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FilterBase } from "@/features/thelist/components/filters/filter-base";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export interface TheListFilterCommandItem {
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

export interface FilterDrawerProps<T extends TheListFilterCommandItem> {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isMobile?: boolean;
  title: string;
  source: T[];
  shortcut?: string;
  placeholder?: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  userType?: string[];
  subStatus?: string | undefined;
  userRole?: string[] | undefined;
  filters: Filters;
  sortOptions: SortOptions;
  onChange: (newFilters: Partial<Filters>) => void;
  onSortChange: (newSort: Partial<SortOptions>) => void;
  onResetFilters: () => void;
  // user: User | null;
  hasActiveFilters: boolean;
}

export const TheListFilterDrawer = <T extends TheListFilterCommandItem>({
  open,
  setOpen,
  title,
  source,
  shortcut = "/",
  isMobile = false,
  userType,
  subStatus,
  userRole,
  // groupName,
  placeholder = `Hello. Is it me you're looking for? Use ctrl + ${shortcut} to search faster.`,
  setSearch,
  filters,
  sortOptions,
  onChange,
  onSortChange,
  onResetFilters,

  hasActiveFilters,
}: FilterDrawerProps<T>) => {
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

  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

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
        className="fixed z-[100] h-[90vh] max-h-[90%] bg-card"
      >
        <div className="relative h-full w-full">
          <div className="flex h-full w-full flex-col gap-3 overflow-hidden rounded-t-2xl pb-6 pt-4">
            <DrawerHeader>
              <DrawerTitle className="sr-only">{title}</DrawerTitle>
            </DrawerHeader>

            {/* <Command shouldFilter={false} className="flex h-full flex-col">
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
                  className="focus:outline-hidden relative z-10 w-full overflow-hidden truncate whitespace-nowrap p-3 pr-12 text-lg selection:italic selection:text-stone-400 placeholder:text-stone-400"
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
            </Command> */}
            <FilterBase
              isMobile={isMobile}
              filters={filters}
              sortOptions={sortOptions}
              hasActiveFilters={hasActiveFilters}
              setOpen={setOpen}
              setValue={setValue}
              value={value}
              shortcut={shortcut}
              placeholder={placeholder}
              onChange={onChange}
              onSortChange={onSortChange}
              onResetFilters={onResetFilters}
            />
            {/* <div className="flex flex-col items-center gap-3 px-5 [&>section]:w-full [&>section]:flex-1">
              <section className="flex flex-col gap-2">
                <Label htmlFor="limit" className="flex items-center gap-2">
                  Results per page:
                </Label>
                <Select
                  name="limit"
                  value={String(filters.limit)}
                  onValueChange={(value) =>
                    onChange({ limit: parseInt(value, 10) })
                  }
                >
                  <SelectTrigger className="w-full text-center">
                    <SelectValue placeholder="Limit" />
                  </SelectTrigger>
                  <SelectContent className="min-w-auto z-top">
                    <SelectItem fit value="1">
                      1
                    </SelectItem>
                    <SelectItem fit value="5">
                      5
                    </SelectItem>
                    <SelectItem fit value="10">
                      10
                    </SelectItem>
                    <SelectItem fit value="25">
                      25
                    </SelectItem>
                  </SelectContent>
                </Select>
              </section>
              <section className="flex flex-col gap-2">
                <Label htmlFor="sortBy" className="flex items-center gap-2">
                  Sort by:
                </Label>
                <Select
                  name="sortBy"
                  value={sortOptions.sortBy}
                  onValueChange={(value) =>
                    onSortChange({ sortBy: value as SortOptions["sortBy"] })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="z-top">
                    <SelectItem value="openCall">Open Call</SelectItem>
                    <SelectItem value="eventStart">Event Start</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </section>

              <section className="flex flex-col gap-2">
                <Label htmlFor="sortOrder" className="flex items-center gap-2">
                  Sort order:
                </Label>
                <Select
                  name="sortOrder"
                  value={sortOptions.sortDirection}
                  onValueChange={(value) =>
                    onSortChange({
                      sortDirection: value as SortOptions["sortDirection"],
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </section>

              <section className="flex flex-col gap-2">
                <Label htmlFor="eventTypes" className="flex items-center gap-2">
                  Event Category:
                </Label>
                <MultiSelect
                  options={eventCategoryOptions}
                  value={filters.eventCategories ?? []}
                  onValueChange={(value) =>
                    onChange({ eventCategories: value as EventCategory[] })
                  }
                  placeholder="Category"
                  variant="basic"
                  selectAll={false}
                  hasSearch={false}
                  className="w-full border bg-card sm:h-9"
                  shortResults
                />
              </section>
              <section className="flex flex-row justify-around gap-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    id="bookmarkedOnly"
                    checked={filters.bookmarkedOnly}
                    onCheckedChange={(checked) =>
                      onChange({ bookmarkedOnly: Boolean(checked) })
                    }
                  />
                  <span className="text-sm">Bookmarked Only</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    id="showHidden"
                    checked={filters.showHidden}
                    onCheckedChange={(checked) =>
                      onChange({ showHidden: Boolean(checked) })
                    }
                  />
                  <span className="text-sm">
                    {filters.showHidden ? "Hide" : "Show"} Hidden
                  </span>
                </label>
                {hasActiveFilters && (
                  <span
                    className="cursor-pointer text-center text-sm text-foreground underline-offset-4 hover:underline"
                    onClick={onResetFilters}
                  >
                    Clear filters
                  </span>
                )}
              </section>
            </div> */}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      shouldFilter={false}
      label={title}
      className="fixed inset-0 z-999 flex items-center justify-center text-foreground"
      onClick={() => setOpen(false)}
    >
      {/* Background overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            className="z-100 fixed inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }} // adjust to your liking
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} // subtler overlay color
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {/* Dialog box */}
        {open && (
          <motion.div
            key="dialogBox"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative flex max-h-[80vh] w-full max-w-[90vw] flex-col rounded-lg border border-stone-300 bg-card p-4 shadow-xl md:max-w-xl"
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
                placeholder={cn(placeholder, !isMobile && "  (Hint: Ctrl + /)")}
                className="focus:outline-hidden relative z-10 w-full bg-card p-3 text-lg selection:italic selection:text-foreground placeholder:text-stone-400"
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
                  Object.entries(groupedItems).map(([groupKey, groupItems]) => (
                    <Command.Group
                      key={groupKey}
                      heading={groupKey.toUpperCase()}
                      className="mb-5 border-t-1.5 border-stone-200 pt-2 text-sm text-stone-400 first:border-t-0"
                    >
                      {groupItems.map((item) => (
                        <Command.Item
                          key={item.path}
                          className="group flex cursor-pointer items-center gap-2 rounded p-2 pl-5 text-sm text-foreground transition-colors hover:bg-stone-100 hover:text-stone-900 data-[selected='true']:bg-salYellow/40"
                          onSelect={() => router.push(item.path)}
                        >
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <Link
                            href={item.path}
                            prefetch={true}
                            onClick={handleLinkClick}
                          >
                            <span>{item.title}</span>
                          </Link>
                          {item.desc && !isMobile && (
                            <span className="inline-flex items-center gap-2 text-stone-600 opacity-0 transition-opacity ease-in-out group-hover:opacity-100">
                              <DashIcon />
                              <span>{item.desc}</span>
                            </span>
                          )}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))
                )}
              </Command.List>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Command.Dialog>
  );
};
