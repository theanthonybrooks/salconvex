"use client";

import { MultiSelect } from "@/components/multi-select";
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
import { EventCategory } from "@/types/event";
import { Filters, SortOptions } from "@/types/thelist";

interface Props {
  filters: Filters;
  sortOptions: SortOptions;
  onChange: (newFilters: Partial<Filters>) => void;
  onSortChange: (newSort: Partial<SortOptions>) => void;
  onResetFilters: () => void;
}

export const EventFilters = ({
  filters,
  sortOptions,
  onChange,
  onSortChange,
  onResetFilters,
}: Props) => {
  const hasActiveFilters =
    filters.bookmarkedOnly ||
    filters.showHidden ||
    (filters.eventTypes && filters.eventTypes.length > 0) ||
    (filters.eventCategories && filters.eventCategories.length > 0) ||
    filters.continent !== undefined;

  return (
    <div className="my-6 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
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
        <span className="text-sm">Show Hidden</span>
      </label>

      <Select
        value={sortOptions.sortBy}
        onValueChange={(value) =>
          onSortChange({ sortBy: value as SortOptions["sortBy"] })
        }
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="openCall">Open Call</SelectItem>
          <SelectItem value="eventStart">Event Start</SelectItem>
          <SelectItem value="name">Name</SelectItem>
        </SelectContent>
      </Select>

      <Label htmlFor="limit" className="flex items-center gap-2">
        Results per page:
      </Label>
      <Select
        name="limit"
        value={String(filters.limit)}
        onValueChange={(value) => onChange({ limit: parseInt(value, 10) })}
      >
        <SelectTrigger className="w-max min-w-16">
          <SelectValue placeholder="Limit" />
        </SelectTrigger>
        <SelectContent className="min-w-auto">
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

      {/* <MultiSelect
        options={eventTypeOptions}
        onValueChange={(value) =>
          onChange({ eventTypes: value as EventType[] })
        }
        defaultValue={(filters.eventTypes ?? []).filter(
          (type): type is Exclude<EventType, null> => type !== null
        )}
        placeholder='Filter by Event Type'
      /> */}

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
        className="w-32 border bg-background sm:h-9"
        shortResults
      />

      <Select
        value={sortOptions.sortDirection}
        onValueChange={(value) =>
          onSortChange({ sortDirection: value as SortOptions["sortDirection"] })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <span
          className="cursor-pointer text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={onResetFilters}
        >
          Clear filters
        </span>
      )}
    </div>
  );
};
