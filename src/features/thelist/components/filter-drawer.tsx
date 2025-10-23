"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { usePreloadedQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, X } from "lucide-react";
import { BiSolidQuoteLeft, BiSolidQuoteRight } from "react-icons/bi";
import { IoSearch } from "react-icons/io5";

import { Link } from "@/components/ui/custom-link";
import { DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FlairBadge } from "@/components/ui/flair-badge";
import { Input } from "@/components/ui/input";
import { SelectSimple } from "@/components/ui/select";
import { FilterBase } from "@/features/thelist/components/filters/filter-base";
import { useConvexPreload } from "@/features/wrapper-elements/convex-preload-context";
import { formatEventLink, getOpenCallStatusLabel } from "@/helpers/eventFns";
import { getSearchLocationString } from "@/helpers/locations";
import { cn } from "@/helpers/utilsFns";
import { searchDialogVariants } from "@/constants/dialogConsts";
import {
  FilterDrawerProps,
  SearchType,
  searchTypeOptions,
  TheListFilterCommandItem,
} from "@/constants/filterConsts";

export const TheListFilterDrawer = <T extends TheListFilterCommandItem>({
  open,
  setOpen,
  title,
  // source,
  shortcut = "/",
  isMobile = false,

  // groupName,
  placeholder = `Hello. Is it me you're looking for? Use ctrl + ${shortcut} to search faster.`,
  search,
  filters,
  sortOptions,
  onSearchChange,
  onChange,
  onSortChange,
  onResetFilters,
  isLoading,
  hasActiveFilters,
  view,
  localValue,
  setLocalValue,
  searchType,
  setSearchType,
  results: searchResults,
}: FilterDrawerProps<T>) => {
  // const searchType = search.searchType ?? "all";
  const eventView = view === "event";
  const router = useRouter();
  const { preloadedSubStatus, preloadedUserData } = useConvexPreload();
  const subData = usePreloadedQuery(preloadedSubStatus);
  const { hasActiveSubscription } = subData ?? {};
  const userData = usePreloadedQuery(preloadedUserData);
  const userPref = userData?.userPref ?? null;
  const baseFontSize = userPref?.fontSize === "large" ? "text-base" : "text-sm";
  // const smFontSize = userPref?.fontSize === "large" ? "text-sm" : "text-xs";
  const subFontColor = "text-stone-500";

  // const hasActiveSubscription = subData?.hasActiveSubscription;
  // const isArtist = userData?.user?.accountType?.includes("artist");
  // const paidUser = isArtist && hasActiveSubscription;
  // console.log(subStatus);
  const shortcutRef = useRef(shortcut);
  const inputRef = useRef<HTMLInputElement>(null);

  function getSearchTypeOptions(view: string) {
    switch (view) {
      case "organizer":
        // Remove "events"
        return searchTypeOptions.filter((opt) =>
          ["events", "orgs", "loc"].includes(opt.value),
        );
      case "archive":
        return searchTypeOptions.filter((opt) => !["all"].includes(opt.value));
      case "event":
        return searchTypeOptions.filter((opt) => !["all"].includes(opt.value));

      default:
        return searchTypeOptions;
    }
  }
  // const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

  // const { data: searchResults } = useQueryWithStatus(
  //   api.events.event.globalSearch,
  //   value.trim().length >= 2
  //     ? {
  //         searchTerm: localValue,
  //         searchType,
  //         activeSub: paidUser,
  //       }
  //     : "skip",
  // );

  // useEffect(() => {
  //   const handler = debounce((nextValue: string) => {
  //     setDebouncedValue(nextValue);
  //   }, 300);

  //   handler(value);

  //   return () => {
  //     handler.cancel();
  //   };
  // }, [value]);

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
    if (view === "orgView") return;

    const down = (e: KeyboardEvent) => {
      if (e.key === shortcutRef.current && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen, view]);

  const handleValueChange = (newValue: string) => {
    // onSearchChange({ searchTerm: newValue });
    setLocalValue(newValue);
  };

  // const handleLinkClick = () => {
  //   setOpen(false);
  // };

  const groupedItems: Record<string, TheListFilterCommandItem[]> = {};
  // useEffect(() => {
  //   // if searchResults?.results?.length === 0 {
  //   //   return;
  //   // }
  //   // console.log(searchResults, value);
  // }, [searchResults, value]);
  // Location search
  if (
    Array.isArray(searchResults) &&
    search?.searchTerm !== "" &&
    searchType === "loc"
  ) {
    // const { organizers = [], events = [] } = searchResults;

    groupedItems["Organizers"] = searchResults
      .filter((item, index, self) => {
        const id = item.orgData?.mainOrgId;
        if (!id) return false;
        return index === self.findIndex((t) => t.orgData?.mainOrgId === id);
      })
      .map((org) => ({
        name: org?.orgData?.orgName,
        path: `/thelist/organizer/${org?.orgData?.orgSlug}`,
        meta:
          getSearchLocationString(
            org?.orgData?.orgLocation ?? org?.location,
            true,
          ) ||
          org.location?.full ||
          "",
      }));

    groupedItems["Events"] = searchResults.map((event) => ({
      name: event.name,
      path: formatEventLink(
        event,
        hasActiveSubscription,
        hasActiveSubscription && eventView,
      ),
      meta:
        getSearchLocationString(event.location, true) ||
        event.location?.full ||
        "",
      ocStatus: getOpenCallStatusLabel({ event }),
      orgName: event.orgData?.orgName,
    }));
  }

  //TODO: Split this up and add the logic for displaying the organizations.
  if (
    Array.isArray(searchResults) &&
    search?.searchTerm !== "" &&
    searchType === "orgs"
  ) {
    groupedItems["Organizers"] = searchResults
      .filter((item, index, self) => {
        const id = item.orgData?.mainOrgId;
        if (!id) return false;
        return index === self.findIndex((t) => t.orgData?.mainOrgId === id);
      })
      .map((event) => ({
        name: event.orgData?.orgName ?? "",
        path: formatEventLink(
          event,
          hasActiveSubscription,
          hasActiveSubscription && eventView,
        ),
        meta:
          getSearchLocationString(
            event.orgData?.orgLocation ?? event.location,
          ) ||
          event.location?.full ||
          "",
      }));
    groupedItems["Events by Organizer"] = searchResults.map((event) => ({
      name: event.name,
      path: formatEventLink(
        event,
        hasActiveSubscription,
        hasActiveSubscription && eventView,
      ),
      meta:
        getSearchLocationString(event.location) || event.location?.full || "",
      orgName: event.orgData?.orgName ?? "",
    }));
  }

  if (
    Array.isArray(searchResults) &&
    search?.searchTerm !== "" &&
    searchType === "events"
  ) {
    groupedItems["Events"] = searchResults.map((event) => ({
      name: event.name,
      path: formatEventLink(
        event,
        hasActiveSubscription,
        hasActiveSubscription && eventView,
      ),
      meta:
        getSearchLocationString(event.location) || event.location?.full || "",
      ocStatus: getOpenCallStatusLabel({ event }),
      edition: event.dates?.edition,
      orgName: event.orgData?.orgName,
    }));

    groupedItems["Organizers"] = searchResults.map((org) => {
      const locationString = getSearchLocationString(
        org.orgData?.orgLocation ?? org.location,
      );

      return {
        name: org.orgData?.orgName,
        path: `/thelist/organizer/${org?.orgData?.orgSlug}`,
        meta: locationString ?? org.location?.full ?? "",
        category: org.category.toUpperCase(),
      };
    });
  }

  // if (
  //   searchResults?.label === "Organizers" &&
  //   Array.isArray(searchResults.results)
  // ) {
  //   const organizers = searchResults.results as OrgResult[];
  //   console.log(organizers);
  //   groupedItems["Organizers"] = organizers.map((organizer) => ({
  //     name: organizer.name,
  //     path: `/thelist/organizer/${organizer.slug}`,
  //     meta:
  //       getSearchLocationString(
  //         organizer.location?.city,
  //         organizer.location?.countryAbbr,
  //         organizer.location?.stateAbbr,
  //       ) ??
  //       organizer.location?.full ??
  //       "",
  //   }));
  // }

  if (
    Array.isArray(searchResults) &&
    search?.searchTerm !== "" &&
    searchType === "all"
  ) {
    groupedItems["Events"] = searchResults.map((event) => {
      const locationString = getSearchLocationString(event.location);

      // const typeLabel =
      //   event.category === "event" && event.type?.length
      //     ? event.type.map((t) => getEventTypeLabel(t)).join(" | ")
      //     : "";

      return {
        name: event.name,
        path: formatEventLink(
          event,
          hasActiveSubscription,
          hasActiveSubscription && eventView,
        ),
        meta: locationString ?? event.location?.full ?? "",
        category: event.category.toUpperCase(),
        edition: event.dates?.edition,
        ocStatus: getOpenCallStatusLabel({ event }),
        orgName: event.orgData?.orgName,
        // meta: `${event.category.toUpperCase()}${typeLabel ? ": " + typeLabel : ""} — ${locationString ?? event.location?.full ?? ""}`,
        // edition: event.dates?.edition,
      };
    });
    // });

    groupedItems["Organizers"] = searchResults
      .filter((item, index, self) => {
        const id = item.orgData?.mainOrgId;
        if (!id) return false;
        return index === self.findIndex((t) => t.orgData?.mainOrgId === id);
      })
      .map((org) => ({
        name: org.orgData?.orgName ?? "",
        path: `/thelist/organizer/${org.orgData?.orgSlug}`,
        meta:
          getSearchLocationString(
            org.orgData?.orgLocation ?? org.location,
            true,
          ) ??
          org.location?.full ??
          "",
      }));

    // groupedItems["Events by Location"] = searchResults.map((event) => {
    //   const locationString = getSearchLocationString(event.location);

    //   return {
    //     name: event.name,
    //     path: formatEventLink(event, hasActiveSubscription),
    //     meta: locationString ?? event.location?.full ?? "",
    //     category: event.category.toUpperCase(),
    //     edition: event.dates?.edition,
    //     ocStatus: getOpenCallStatusLabel({ event }),
    //   };
    // });

    // groupedItems["Organizers by Location"] = searchResults
    //   .filter((item, index, self) => {
    //     const id = item.orgData?.mainOrgId;
    //     if (!id) return false;
    //     return index === self.findIndex((t) => t.orgData?.mainOrgId === id);
    //   })
    //   .map((org) => ({
    //     name: org.orgData?.orgName ?? "",
    //     path: `/thelist/organizer/${org.slug}`,
    //     meta:
    //       getSearchLocationString(org.orgData?.orgLocation ?? org.location) ??
    //       org.location?.full ??
    //       "",
    //   }));
  }

  return isMobile ? (
    <>
      <div className="flex items-center gap-1 rounded-lg border p-2 px-3">
        <IoSearch className="size-7 shrink-0 p-1 text-foreground" />
        <Input
          value={localValue}
          readOnly
          onClick={() => setOpen(true)}
          placeholder={cn(placeholder)}
          className="focus:outline-hidden relative z-10 w-full border-none bg-transparent p-3 text-lg selection:italic selection:text-foreground placeholder:text-foreground/40"
        />
        {localValue?.trim().length > 0 && (
          <button
            onClick={() => {
              // onSearchChange({ searchTerm: "" });
              setLocalValue("");
            }}
            className="rounded p-1 px-2 hover:scale-125 active:scale-110"
          >
            <X className="size-7 text-stone-600 hover:scale-105 hover:text-red-600 active:scale-95 sm:size-5" />
          </button>
        )}
      </div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent
          setOpen={setOpen}
          className="fixed z-[100] h-[90vh] max-h-[90%] bg-card"
        >
          <div className="scrollable relative h-full w-full">
            <div className="flex h-full w-full flex-col gap-3 overflow-hidden rounded-t-2xl pb-6 pt-4">
              <DrawerHeader>
                <DrawerTitle className="sr-only">{title}</DrawerTitle>
              </DrawerHeader>

              <FilterBase
                isMobile={isMobile}
                search={search}
                filters={filters}
                sortOptions={sortOptions}
                hasActiveFilters={hasActiveFilters}
                setOpen={setOpen}
                shortcut={shortcut}
                hasShortcut={false}
                placeholder={placeholder}
                onSearchChange={onSearchChange}
                onChange={onChange}
                onSortChange={onSortChange}
                onResetFilters={onResetFilters}
                isLoading={isLoading}
                groupedResults={groupedItems}
                view={view}
                localValue={localValue}
                setLocalValue={setLocalValue}
                searchType={searchType}
                setSearchType={setSearchType}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
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
            className="relative flex max-h-[80dvh] w-full max-w-[90vw] flex-col rounded-lg border border-stone-300 bg-card p-4 shadow-xl md:max-w-[min(60vw,60rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <div className="flex items-center gap-1 border-b border-stone-300 pr-2">
              {isLoading ? (
                <LoaderCircle className="size-6 shrink-0 animate-spin p-1" />
              ) : (
                <IoSearch className="size-7 shrink-0 p-1 text-stone-400" />
              )}
              <Command.Input
                ref={inputRef}
                value={localValue}
                onValueChange={handleValueChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setOpen(false);
                  }
                  if (e.key === "Escape") {
                    setLocalValue("");
                    // onSearchChange({ searchTerm: "" });

                    setOpen(false);
                  }
                }}
                placeholder={cn(placeholder)}
                className="focus:outline-hidden relative z-10 w-full bg-card p-3 text-lg selection:italic selection:text-foreground placeholder:text-stone-400"
              />

              {localValue?.trim().length > 0 && (
                <button
                  onClick={() => {
                    setLocalValue("");
                    setOpen(false);
                    // onSearchChange({ searchTerm: "" });
                  }}
                  className="rounded p-1 px-2 hover:scale-125 active:scale-110"
                >
                  <X className="size-7 text-stone-600 hover:scale-105 hover:text-red-700 active:scale-95 sm:size-5" />
                </button>
              )}

              <SelectSimple
                options={[...getSearchTypeOptions(view)]}
                value={searchType}
                onChangeAction={(value) => setSearchType(value as SearchType)}
                placeholder="Search Type"
                className="w-50"
              />
            </div>
            <div
              className={cn(
                "max-h-60dvh search scrollable mini p-3",
                isLoading && "invisible",
              )}
            >
              <Command.List>
                {Object.values(groupedItems).every(
                  (items) => items.length === 0,
                ) ? (
                  <>
                    {localValue?.trim().length > 0 && !isLoading ? (
                      <Command.Empty className="flex flex-col items-center gap-5">
                        <span className="inline-flex items-center gap-2">
                          No results found for
                          <span className="inline-flex items-center gap-[1px] italic">
                            <BiSolidQuoteLeft className="size-1 -translate-y-1" />
                            {localValue}
                            <BiSolidQuoteRight className="ml-[2px] size-1 -translate-y-1" />
                          </span>
                        </span>

                        <p
                          className={cn(
                            "italic text-foreground/60",
                            baseFontSize,
                          )}
                        >
                          If you&apos;re an organizer, you can submit your
                          event, project, or open call{" "}
                          <Link href="/submit" className="font-bold uppercase">
                            here
                          </Link>
                          .
                        </p>
                      </Command.Empty>
                    ) : isLoading ? (
                      <Command.Empty>
                        {/* <span className="text-foreground/60">Loading...</span> */}
                      </Command.Empty>
                    ) : (
                      <Command.Empty>
                        <span className="text-foreground/60">
                          Search for{" "}
                          {view === "event" || view === "openCall"
                            ? "active "
                            : null}
                          {view !== "openCall" ? "events" : "open calls"},
                          organizers, or locations.{" "}
                        </span>
                        {view !== "archive" && hasActiveSubscription && (
                          <span className="mt-2 text-sm text-foreground/50">
                            To search the full database, including past events
                            and archived open calls, switch to the Archive view
                          </span>
                        )}
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
                        className={cn(
                          "mb-5 border-t-1.5 border-stone-200 pt-2 text-stone-400 first:border-t-0",
                          baseFontSize,
                        )}
                      >
                        {groupItems.map((item) => {
                          return (
                            <Command.Item
                              key={`${groupKey}-${item.path}`}
                              value={`${groupKey}-${item.path}`}
                              className={cn(
                                "group flex cursor-pointer items-center rounded p-2 pl-5 text-foreground transition-colors hover:bg-stone-100 hover:text-stone-900 data-[selected='true']:bg-salYellow/40",
                                baseFontSize,
                              )}
                              onSelect={() => {
                                router.push(item.path || "/thelist");
                                setOpen(false);
                              }}
                            >
                              {groupKey.startsWith("Events") ? (
                                <div className="grid w-full grid-cols-[1fr_72px_auto_auto_1fr] items-center gap-2">
                                  <span className="flex items-center gap-1 truncate text-wrap">
                                    {item.name}
                                  </span>
                                  {item.ocStatus === 2 ? (
                                    <FlairBadge className="mx-auto bg-green-500/20">
                                      Open Call
                                    </FlairBadge>
                                  ) : (
                                    <span />
                                  )}
                                  {item.edition ? (
                                    <span
                                      className={cn(
                                        "text-center",
                                        subFontColor,
                                        baseFontSize,
                                      )}
                                    >
                                      {item.edition}
                                    </span>
                                  ) : (
                                    <span />
                                  )}

                                  {item.category ? (
                                    <span
                                      className={cn(
                                        "flex items-center gap-2 text-center",
                                        subFontColor,
                                        baseFontSize,
                                      )}
                                    >
                                      |<p>{item.category}</p>
                                    </span>
                                  ) : null}

                                  {item.orgName && view !== "openCall" && (
                                    <span
                                      className={cn(
                                        "flex items-center gap-2 text-center",
                                        subFontColor,
                                        baseFontSize,
                                      )}
                                    >
                                      <p>{item.orgName}</p>
                                    </span>
                                  )}
                                  <span
                                    className={cn(
                                      "truncate text-right",
                                      subFontColor,
                                      baseFontSize,
                                    )}
                                  >
                                    {item.meta}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex w-full justify-between gap-2">
                                  <span className="truncate">{item.name}</span>
                                  <span
                                    className={cn(
                                      "truncate text-right",
                                      subFontColor,
                                      baseFontSize,
                                    )}
                                  >
                                    {item.meta}
                                  </span>
                                </div>
                              )}
                            </Command.Item>
                          );
                        })}
                      </Command.Group>
                    ))
                )}
              </Command.List>
            </div>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
};
