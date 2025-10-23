"use client";

import { useState } from "react";
import { FiCommand, FiSearch } from "react-icons/fi";
import { TbWorldSearch } from "react-icons/tb";

import { TooltipSimple } from "@/components/ui/tooltip";
import {
  CommandItem,
  CommandMenuCustom,
} from "@/features/Sidebar/CommandMenuCustom";
import { cn } from "@/helpers/utilsFns";

interface SearchProps<T extends CommandItem> {
  title: string;
  source: T[];
  shortcut?: string;
  // groupName: string
  className?: string;
  placeholder?: string;
  iconOnly?: boolean;
  isMobile?: boolean;
  invisible?: boolean;
  pageType?: "page" | "dashboard";
}

export const Search = <T extends CommandItem>({
  title,
  source,
  shortcut = "/",
  iconOnly = false,
  isMobile = false,
  invisible = false,
  className,
  placeholder,
  pageType,
}: SearchProps<T>) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("Search");
  const dashboardPg = pageType === "dashboard";

  return (
    <>
      {!iconOnly && (
        <div
          className={cn(
            "relative flex items-center rounded-lg border-stone-300 bg-primary/10 px-2 py-1.5 text-sm text-foreground hover:bg-primary/20",
            invisible && "invisible",
            className,
          )}
        >
          <FiSearch
            className="mr-2 size-5 cursor-pointer"
            onClick={() => setOpen(true)}
          />
          <input
            onFocus={(e) => {
              e.target.blur();
              setOpen(true);
            }}
            type="text"
            placeholder={placeholder}
            defaultValue={value}
            className="focus:outline-hidden w-full bg-transparent placeholder:text-stone-400"
          />

          <span
            className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded bg-background p-1 text-xs shadow-sm hover:scale-105 hover:cursor-pointer hover:bg-primary/10 active:scale-90"
            onClick={() => setOpen(true)}
          >
            <FiCommand /> + {shortcut}
          </span>
        </div>
      )}
      {iconOnly && (
        <div
          className={cn(
            "flex items-center gap-x-2 hover:scale-110 active:scale-95",
            invisible && "invisible",

            className,
          )}
          onClick={() => setOpen(true)}
        >
          {dashboardPg ? (
            <FiSearch className="size-8 cursor-pointer md:size-6" />
          ) : (
            <TooltipSimple content="Search Site" align="start" side="bottom">
              <TbWorldSearch className="size-8 cursor-pointer md:size-6" />
            </TooltipSimple>
          )}
          {/* {value && value !== "Search" && (
            <span className="flex items-center">
              &quot;
              <p className="max-w-[15ch] overflow-hidden truncate whitespace-nowrap">
                {value}
              </p>
              &quot;
            </span>
          )} */}
        </div>
      )}

      <CommandMenuCustom
        open={open}
        setOpen={setOpen}
        title={title}
        source={source}
        shortcut={shortcut}
        // groupName={groupName}
        placeholder={placeholder}
        setSearch={setValue}
        isMobile={isMobile}
      />
    </>
  );
};
