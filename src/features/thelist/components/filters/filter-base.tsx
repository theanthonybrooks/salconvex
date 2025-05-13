import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventCategoryOptions } from "@/constants/thelist";
import { SearchType } from "@/features/thelist/components/filter-drawer";
import { cn } from "@/lib/utils";
import { EventCategory } from "@/types/event";
import { Filters, SortOptions } from "@/types/thelist";
import { LucideFilter } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { FiCommand, FiSearch } from "react-icons/fi";

export interface FilterBaseProps {
  isMobile: boolean;
  filters: Filters;
  sortOptions: SortOptions;
  hasActiveFilters: boolean;

  setOpen: Dispatch<SetStateAction<boolean>>;
  setValue: Dispatch<SetStateAction<string>>;
  searchType?: SearchType;
  setSearchType: Dispatch<SetStateAction<SearchType>>;
  value: string;
  shortcut: string;
  placeholder: string;
  onChange: (newFilters: Partial<Filters>) => void;
  onSortChange: (newSort: Partial<SortOptions>) => void;
  onResetFilters: () => void;
  className?: string;
}

export const FilterBase = ({
  isMobile,
  filters,
  sortOptions,
  hasActiveFilters,
  setOpen,
  setValue,
  searchType,
  setSearchType,
  value,
  placeholder,
  onChange,
  onSortChange,
  onResetFilters,
  className,
  shortcut,
  // user,
}: FilterBaseProps) => {
  const [showFull, setShowFull] = useState(false);
  return (
    <>
      {isMobile ? (
        <div className="flex flex-col items-center gap-3 px-5 sm:hidden [&>section]:w-full [&>section]:flex-1">
          <section className="flex flex-col gap-2">
            <section className="flex flex-col gap-2">
              <div className="flex justify-between gap-3">
                <Label
                  htmlFor="list-search"
                  className="flex items-center gap-2"
                >
                  Search:
                </Label>
                <Label htmlFor="limit" className="flex items-center gap-2">
                  Search Type:
                </Label>
              </div>
              <div className="flex justify-between gap-3">
                <div
                  className={cn(
                    "flex w-full items-center rounded-lg border border-foreground px-2 py-1.5 text-sm text-foreground hover:bg-white/30",
                    className,
                  )}
                >
                  <FiSearch
                    className="mr-2 size-5 cursor-pointer"
                    onClick={() => {
                      setOpen(true);
                    }}
                  />
                  <input
                    type="text"
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    value={value}
                    //   value={value}
                    className="focus:outline-hidden w-full flex-1 bg-transparent placeholder:text-foreground/30"
                  />
                </div>
                <section>
                  <Select
                    name="searchType"
                    value={searchType}
                    onValueChange={(value) =>
                      setSearchType(value as "events" | "loc" | "orgs" | "all")
                    }
                  >
                    <SelectTrigger className="w-32 text-center">
                      <SelectValue placeholder="Search Type" />
                    </SelectTrigger>
                    <SelectContent align="end" className="z-top">
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="orgs">Organizers</SelectItem>
                      <SelectItem value="loc">Location</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </section>
              </div>
            </section>
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
              showArrow={false}
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
        </div>
      ) : (
        <div className="hidden flex-col gap-5 px-5 sm:flex">
          <div className="flex items-center gap-3">
            <section className="flex flex-col gap-2">
              <Label htmlFor="list-search" className="flex items-center gap-2">
                Search:
              </Label>
              <div
                className={cn(
                  "sm:max-w-[max(250px, 30vw)] min-w-50 relative flex w-full max-w-full items-center rounded-lg border border-foreground px-2 py-1.5 text-sm text-foreground hover:bg-white/30",
                  className,
                )}
              >
                <FiSearch
                  className="mr-2 size-5 cursor-pointer"
                  onClick={() => {
                    setOpen(true);
                  }}
                />
                <input
                  onFocus={(e) => {
                    e.target.blur();
                    setOpen(true);
                  }}
                  type="text"
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  //   defaultValue={value}
                  value={value}
                  className="w-full max-w-64 truncate bg-transparent pr-10 placeholder:text-foreground/30"
                />

                <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded bg-transparent p-1 text-xs lg:flex">
                  <FiCommand /> + {shortcut}
                </span>
              </div>
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
                <SelectTrigger className="min-w-50 w-full hover:bg-white/30 sm:h-12">
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
                <SelectTrigger className="w-full min-w-40 hover:bg-white/30 sm:h-12">
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
                placeholder="--Category--"
                variant="basic"
                selectAll={false}
                hasSearch={false}
                textClassName="text-center"
                className="w-40 border bg-transparent hover:bg-white/30 sm:h-12"
                badgeClassName="h-9"
                shortResults
                showArrow={false}
              />
            </section>
            <section className="flex flex-col gap-2">
              <Label htmlFor="limit" className="flex items-center gap-2">
                Per page:
              </Label>
              <Select
                name="limit"
                value={String(filters.limit)}
                onValueChange={(value) =>
                  onChange({ limit: parseInt(value, 10) })
                }
              >
                <SelectTrigger className="w-full min-w-20 text-center hover:bg-white/30 sm:h-12">
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
            <Button
              variant="icon"
              size="icon"
              type="button"
              onClick={() => setShowFull((prev) => !prev)}
              className="mt-4 cursor-pointer active:scale-95"
            >
              <LucideFilter className="size-5" />
            </Button>
          </div>
          {showFull && (
            <div className="flex flex-col gap-3">
              <p className="font-bold">More Filters:</p>
              <div className="flex gap-3">
                <section className="flex flex-row justify-around gap-3">
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
                </section>

                {hasActiveFilters && (
                  <span
                    className="cursor-pointer text-center text-sm text-foreground underline-offset-4 hover:underline"
                    onClick={onResetFilters}
                  >
                    Clear filters
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
