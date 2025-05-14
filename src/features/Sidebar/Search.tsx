"use client";

import {
  CommandItem,
  CommandMenuCustom,
} from "@/features/Sidebar/CommandMenuCustom";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";
import { useQuery } from "convex-helpers/react/cache";
import { useState } from "react";
import { FiCommand, FiSearch } from "react-icons/fi";
import { TbWorldSearch } from "react-icons/tb";
import { api } from "~/convex/_generated/api";

interface SearchProps<T extends CommandItem> {
  title: string;
  source: T[];
  shortcut?: string;
  // groupName: string
  className?: string;
  placeholder?: string;
  iconOnly?: boolean;
  isMobile?: boolean;
  user?: User | null;
}

export const Search = <T extends CommandItem>({
  title,
  source,
  shortcut = "/",
  user,
  // groupName,
  iconOnly = false,
  isMobile = false,
  className,
  placeholder,
}: SearchProps<T>) => {
  const subscription = useQuery(api.subscriptions.getUserSubscriptionStatus);
  const subStatus = subscription?.subStatus;

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("Search");
  const userType = user?.accountType;
  const userRole = user?.role;

  return (
    <>
      {!iconOnly && (
        <div
          className={cn(
            "relative flex items-center rounded-lg border-stone-300 bg-primary/10 px-2 py-1.5 text-sm text-foreground hover:bg-primary/20",
            className,
          )}
        >
          <FiSearch
            className="mr-2 h-5 w-5 cursor-pointer"
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
          className={cn("flex items-center gap-x-2", className)}
          onClick={() => setOpen(true)}
        >
          <TbWorldSearch className="size-8 cursor-pointer md:size-5" />
          {value && value !== "Search" && (
            <span className="flex items-center">
              &quot;
              <p className="max-w-[15ch] overflow-hidden truncate whitespace-nowrap">
                {value}
              </p>
              &quot;
            </span>
          )}
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
        userType={userType}
        subStatus={subStatus}
        userRole={userRole}
      />
    </>
  );
};
