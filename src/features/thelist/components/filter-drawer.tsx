"use client";
import { DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FlairBadge } from "@/components/ui/flair-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterBase } from "@/features/thelist/components/filters/filter-base";
import { getSearchLocationString } from "@/lib/locations";
import { cn } from "@/lib/utils";
import { EventCategory, EventType } from "@/types/event";
import { Filters, SortOptions } from "@/types/thelist";
import { Command } from "cmdk";
import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex-helpers/react/cache";
import { AnimatePresence, motion } from "framer-motion";
import { debounce } from "lodash";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { BiSolidQuoteLeft, BiSolidQuoteRight } from "react-icons/bi";
import { IoSearch } from "react-icons/io5";
import { api } from "~/convex/_generated/api";

export interface TheListFilterCommandItem {
  label?: string;
  name?: string;
  icon?: React.ComponentType<{ className?: string }>;
  path?: string;
  href?: string;
  group?: string;
  meta?: string;
  edition?: number;
  ocStatus?: number;
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
  searchType: SearchType;
  setSearchType: React.Dispatch<React.SetStateAction<SearchType>>;
  onResetFilters: () => void;
  // user: User | null;
  hasActiveFilters: boolean | undefined;
}

export type SearchType = "events" | "orgs" | "loc" | "all";

type Location = {
  full?: string;
  city?: string;
  stateAbbr?: string;
  countryAbbr?: string;
};

type EventResult = {
  name: string;
  slug: string;
  category: EventCategory;
  type?: EventType[];
  dates?: { edition?: number };
  location?: Location;
  ocStatus: number;
};

type OrgResult = {
  name: string;
  slug: string;
  location?: Location;
};

type AllSearchResults = {
  eventName: EventResult[];
  orgName: OrgResult[];
  eventLoc: EventResult[];
  orgLoc: OrgResult[];
};

export const TheListFilterDrawer = <T extends TheListFilterCommandItem>({
  open,
  setOpen,
  title,
  // source,
  shortcut = "/",
  isMobile = false,

  // groupName,
  placeholder = `Hello. Is it me you're looking for? Use ctrl + ${shortcut} to search faster.`,
  setSearch,
  filters,
  sortOptions,
  onChange,
  onSortChange,
  onResetFilters,
  searchType,
  setSearchType,

  hasActiveFilters,
}: FilterDrawerProps<T>) => {
  const router = useRouter();
  // console.log(subStatus);
  const shortcutRef = useRef(shortcut);
  const inputRef = useRef<HTMLInputElement>(null);
  const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState(value);

  const { data: searchResults } = useQueryWithStatus(
    api.events.event.globalSearch,
    value.trim().length >= 3
      ? {
          searchTerm: debouncedValue,
          searchType,
        }
      : "skip",
  );

  useEffect(() => {
    const handler = debounce((nextValue: string) => {
      setDebouncedValue(nextValue);
    }, 300);

    handler(value);

    return () => {
      handler.cancel();
    };
  }, [value]);

  useEffect(() => {
    shortcutRef.current = shortcut;
  }, [shortcut]);

  useEffect(() => {
    if (open && !isMobile) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [open, isMobile]);

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

  const handleValueChange = (newValue: string) => {
    setSearch(newValue);
    setValue(newValue);
  };

  // const handleLinkClick = () => {
  //   setOpen(false);
  // };

  const groupedItems: Record<string, TheListFilterCommandItem[]> = {};
  useEffect(() => {
    // if searchResults?.results?.length === 0 {
    //   return;
    // }
    // console.log(searchResults, value);
  }, [searchResults, value]);
  // Location search
  if (
    searchResults?.label === "Location" &&
    typeof searchResults.results === "object" &&
    !Array.isArray(searchResults.results)
  ) {
    const { organizers = [], events = [] } = searchResults.results;

    groupedItems["Organizers"] = organizers.map((org) => ({
      name: org.name,
      path: `/thelist/organizer/${org.slug}`,
      meta: org.location?.full || "",
    }));

    groupedItems["Events"] = events.map((event) => ({
      name: event.name,
      path:
        event.ocStatus === 2 || event.ocStatus === 3
          ? `/thelist/event/${event.slug}/${event.dates?.edition}/call`
          : `/thelist/event/${event.slug}/${event.dates?.edition}`,
      meta: event.location?.full || "",
      ocStatus: event.ocStatus,
    }));
  }

  if (
    searchResults?.label === "Events" &&
    Array.isArray(searchResults.results)
  ) {
    const events = searchResults.results as EventResult[]; // 👈 Explicit assertion
    console.log(events);
    groupedItems["Events"] = events.map((event) => ({
      name: event.name,
      path:
        event.ocStatus === 2 || event.ocStatus === 3
          ? `/thelist/event/${event.slug}/${event.dates?.edition}/call`
          : `/thelist/event/${event.slug}/${event.dates?.edition}`,
      meta:
        getSearchLocationString(
          event.location?.city,
          event.location?.countryAbbr,
          event.location?.stateAbbr,
        ) ??
        event.location?.full ??
        "",
      edition: event.dates?.edition,
      ocStatus: event.ocStatus,
    }));
  }

  if (
    searchResults?.label === "Organizers" &&
    Array.isArray(searchResults.results)
  ) {
    const organizers = searchResults.results as OrgResult[];
    console.log(organizers);
    groupedItems["Organizers"] = organizers.map((organizer) => ({
      name: organizer.name,
      path: `/thelist/organizer/${organizer.slug}`,
      meta:
        getSearchLocationString(
          organizer.location?.city,
          organizer.location?.countryAbbr,
          organizer.location?.stateAbbr,
        ) ??
        organizer.location?.full ??
        "",
    }));
  }

  if (searchType === "all" && searchResults?.label === "All") {
    const allResults = searchResults.results as AllSearchResults;

    groupedItems["Events by Name"] = allResults.eventName.map((event) => {
      const locationString = getSearchLocationString(
        event.location?.city,
        event.location?.countryAbbr,
        event.location?.stateAbbr,
      );

      // const typeLabel =
      //   event.category === "event" && event.type?.length
      //     ? event.type.map((t) => getEventTypeLabel(t)).join(" | ")
      //     : "";

      return {
        name: event.name,
        path:
          event.ocStatus === 2 || event.ocStatus === 3
            ? `/thelist/event/${event.slug}/${event.dates?.edition}/call`
            : `/thelist/event/${event.slug}/${event.dates?.edition}`,
        meta: `${event.category.toUpperCase()} — ${locationString ?? event.location?.full ?? ""}`,
        edition: event.dates?.edition,
        ocStatus: event.ocStatus,
        // meta: `${event.category.toUpperCase()}${typeLabel ? ": " + typeLabel : ""} — ${locationString ?? event.location?.full ?? ""}`,
        // edition: event.dates?.edition,
      };
    });

    groupedItems["Organizers by Name"] = allResults.orgName.map((org) => ({
      name: org.name,
      path: `/thelist/organizer/${org.slug}`,
      meta:
        getSearchLocationString(
          org.location?.city,
          org.location?.countryAbbr,
          org.location?.stateAbbr,
        ) ??
        org.location?.full ??
        "",
    }));

    groupedItems["Events by Location"] = allResults.eventLoc.map((event) => {
      const locationString = getSearchLocationString(
        event.location?.city,
        event.location?.countryAbbr,
        event.location?.stateAbbr,
      );

      return {
        name: event.name,
        path: event.ocStatus
          ? `/thelist/event/${event.slug}/${event.dates?.edition}/call`
          : `/thelist/event/${event.slug}/${event.dates?.edition}`,
        meta: `${event.category.toUpperCase()} — ${locationString ?? event.location?.full ?? ""}`,
        edition: event.dates?.edition,
        ocStatus: event.ocStatus,
      };
    });

    groupedItems["Organizers by Location"] = allResults.orgLoc.map((org) => ({
      name: org.name,
      path: `/thelist/organizer/${org.slug}`,
      meta:
        getSearchLocationString(
          org.location?.city,
          org.location?.countryAbbr,
          org.location?.stateAbbr,
        ) ??
        org.location?.full ??
        "",
    }));
  }

  return isMobile ? (
    <>
      <div className="flex items-center gap-1 rounded-lg border p-2 px-3">
        <IoSearch className="size-7 shrink-0 p-1 text-foreground" />
        <Input
          value={value}
          readOnly
          onClick={() => setOpen(true)}
          placeholder={cn(placeholder)}
          className="focus:outline-hidden relative z-10 w-full border-none bg-transparent p-3 text-lg selection:italic selection:text-foreground placeholder:text-foreground/40"
        />
        {value?.trim().length > 0 && (
          <button
            onClick={() => {
              setValue("");
              setSearch("");
            }}
            className="rounded p-1 px-2 hover:scale-125 active:scale-110"
          >
            <X className="size-7 text-stone-600 hover:scale-105 hover:text-red-700 active:scale-95 sm:size-5" />
          </button>
        )}
      </div>
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

              <FilterBase
                isMobile={isMobile}
                filters={filters}
                sortOptions={sortOptions}
                hasActiveFilters={hasActiveFilters}
                setOpen={setOpen}
                setValue={setValue}
                searchType={searchType}
                setSearchType={setSearchType}
                value={value}
                shortcut={shortcut}
                placeholder={placeholder}
                onChange={onChange}
                onSortChange={onSortChange}
                onResetFilters={onResetFilters}
                groupedResults={groupedItems}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
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
            className="relative flex max-h-[80dvh] w-full max-w-[90vw] flex-col rounded-lg border border-stone-300 bg-card p-4 shadow-xl md:max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <div className="flex items-center gap-1 border-b border-stone-300 pr-2">
              <IoSearch className="size-7 shrink-0 p-1 text-stone-400" />
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
                placeholder={cn(placeholder)}
                className="focus:outline-hidden relative z-10 w-full bg-card p-3 text-lg selection:italic selection:text-foreground placeholder:text-stone-400"
              />
              {value?.trim().length > 0 && (
                <button
                  onClick={() => {
                    setValue("");
                    setSearch("");
                  }}
                  className="rounded p-1 px-2 hover:scale-125 active:scale-110"
                >
                  <X className="size-7 text-stone-600 hover:scale-105 hover:text-red-700 active:scale-95 sm:size-5" />
                </button>
              )}
              <Select
                name="searchType"
                value={searchType}
                onValueChange={(value) =>
                  setSearchType(value as "events" | "loc" | "orgs" | "all")
                }
              >
                <SelectTrigger className="w-50 text-center">
                  <SelectValue placeholder="Search Type" />
                </SelectTrigger>
                <SelectContent align="end" className="z-top">
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="orgs">Organizers</SelectItem>
                  <SelectItem value="loc">Location</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="max-h-60dvh search scrollable mini p-3">
              <Command.List>
                {Object.values(groupedItems).every(
                  (items) => items.length === 0,
                ) ? (
                  <>
                    {value.length !== 0 ? (
                      <Command.Empty>
                        <span className="inline-flex items-center gap-2">
                          No results found for
                          <span className="inline-flex items-center gap-[1px] italic">
                            <BiSolidQuoteLeft className="size-1 -translate-y-1" />
                            {value}
                            <BiSolidQuoteRight className="ml-[2px] size-1 -translate-y-1" />
                          </span>
                        </span>
                      </Command.Empty>
                    ) : (
                      <Command.Empty>
                        <span className="text-foreground/60">
                          Search for events, organizers, or locations
                        </span>
                      </Command.Empty>
                    )}
                  </>
                ) : (
                  Object.entries(groupedItems)
                    .filter(([, items]) => items.length > 0)
                    .map(([groupKey, groupItems]) => (
                      <Command.Group
                        key={groupKey}
                        heading={groupKey.toUpperCase()}
                        className="mb-5 border-t-1.5 border-stone-200 pt-2 text-sm text-stone-400 first:border-t-0"
                      >
                        {groupItems.map((item) => (
                          <Command.Item
                            key={item.path}
                            className="group flex cursor-pointer items-center rounded p-2 pl-5 text-sm text-foreground transition-colors hover:bg-stone-100 hover:text-stone-900 data-[selected='true']:bg-salYellow/40"
                            onSelect={() => {
                              router.push(item.path || "/thelist");
                              setOpen(false);
                            }}
                          >
                            {groupKey.startsWith("Events") ? (
                              <div className="grid w-full grid-cols-[1.2fr_auto_1fr] items-center gap-2">
                                <span className="flex items-center gap-1 truncate">
                                  {item.name}
                                  {item.ocStatus === 2 && (
                                    <FlairBadge className="bg-green-500/20">
                                      Open Call
                                    </FlairBadge>
                                  )}
                                </span>
                                {item.edition ? (
                                  <span className="text-center text-xs text-stone-500">
                                    {item.edition}
                                  </span>
                                ) : (
                                  <span />
                                )}
                                <span className="truncate text-right text-xs text-stone-500">
                                  {item.meta}
                                </span>
                              </div>
                            ) : (
                              <div className="flex w-full justify-between gap-2">
                                <span className="truncate">{item.name}</span>
                                <span className="truncate text-xs text-stone-500">
                                  {item.meta}
                                </span>
                              </div>
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
