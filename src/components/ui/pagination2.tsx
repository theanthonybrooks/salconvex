"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewOptions } from "@/features/events/event-list-client";
import { cn } from "@/helpers/utilsFns";
import { motion } from "framer-motion";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TiArrowLeftOutline, TiArrowRightOutline } from "react-icons/ti";
interface BasicPaginationProps {
  page: number;
  totalPages: number;
  totalResults: number;
  totalOpenCalls?: number;
  totalActive?: number;
  totalArchived?: number;
  bottomPag?: boolean;
  className?: string;

  onPageChange: (page: number) => void;
  viewType: ViewOptions;
  setViewAction: Dispatch<SetStateAction<ViewOptions>>;
}

export const BasicPagination = ({
  page,
  totalPages,
  totalResults,
  totalOpenCalls,
  totalActive,
  // totalArchived,
  bottomPag = false,
  className,

  onPageChange: setPage,
  viewType,
  // setViewAction,
}: BasicPaginationProps) => {
  const showOCTotal = viewType === "openCall";
  const firstPage = page === 1;
  const lastPage = page === totalPages;
  const singlePage = totalPages === 1;
  const backTrigger = page > 2;

  // const [prevTotal, setPrevTotal] = useState(totalPages);

  const [inputVal, setInputVal] = useState(page);

  useEffect(() => {
    setInputVal(page);
  }, [page]);

  return (
    <>
      {((bottomPag && totalPages !== 0) || !bottomPag) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={totalPages >= 1 && { opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={cn(
            "my-6 mb-14 flex w-full grid-cols-[30%_40%_30%] flex-col items-center justify-center gap-4 sm:mb-6 sm:grid sm:max-w-[min(70vw,1200px)] sm:gap-0",
            className,
            totalPages === 0 && "justify-center sm:flex",
          )}
        >
          {!bottomPag && totalPages !== 0 && (
            <div className="mb-3 flex w-full items-center justify-around gap-4 sm:mb-0 sm:w-auto sm:gap-2">
              {viewType !== "openCall" && (
                <p className={cn("mx-auto text-nowrap text-center")}>
                  Results: {totalResults}
                </p>
              )}
              {showOCTotal && totalOpenCalls && (
                <p className={cn("mx-auto text-nowrap text-center")}>
                  Active Calls: {totalOpenCalls}
                </p>
              )}
              {viewType === "archive" && typeof totalActive === "number" && (
                <p className={cn("mx-auto text-nowrap text-center")}>
                  Total Active: {totalActive}
                </p>
              )}
            </div>
          )}
          {totalPages !== 0 ? (
            <div className="col-start-2 flex items-center justify-center gap-4">
              <span
                onClick={() => {
                  setPage(page - 1);
                }}
                className={cn(
                  "-translate-y-0.5 cursor-pointer",
                  firstPage && "pointer-events-none opacity-0",
                )}
              >
                <TiArrowLeftOutline className="size-9 text-foreground hover:scale-110 sm:size-6" />
              </span>

              <span className="flex select-none flex-row items-center gap-2">
                Page
                <Select
                  value={String(inputVal)}
                  onValueChange={(val) => {
                    const parsed = Number(val);
                    setInputVal(parsed);
                    setPage(parsed);
                  }}
                >
                  <SelectTrigger
                    className="w-fit border-2 border-foreground px-4 text-center text-2xl font-bold hover:bg-white/40 disabled:opacity-100 disabled:hover:bg-transparent sm:text-xl [&>svg]:hidden"
                    disabled={singlePage}
                  >
                    <SelectValue placeholder={`Page ${inputVal}`} />
                  </SelectTrigger>
                  <SelectContent className="min-w-auto">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <SelectItem
                          key={pageNum}
                          value={String(pageNum)}
                          indicator={false}
                        >
                          {pageNum}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <span className="text-nowrap">of {totalPages}</span>
              </span>

              <span
                onClick={() => {
                  setPage(page + 1);
                }}
                className={cn(
                  "-translate-y-0.5 cursor-pointer",
                  (lastPage || singlePage) && "pointer-events-none opacity-0",
                )}
              >
                <TiArrowRightOutline className="size-9 text-foreground hover:scale-110 sm:size-6" />
              </span>
            </div>
          ) : (
            <section className="flex flex-col items-center gap-6">
              <span className="flex flex-col items-center gap-2">
                <p className="text-3xl font-bold">No results found</p>
                <p className="text-sm text-foreground">
                  Try adjusting your filters or search term.
                </p>
              </span>
              <Image
                src="/gifs/nothinghere.gif"
                alt="No results found"
                width={400}
                height={400}
                className="rounded-full"
              />
            </section>
          )}
          {!bottomPag && (
            <>
              <p
                className={cn(
                  "col-start-3 hidden opacity-0 sm:block",
                  backTrigger && totalPages > 2
                    ? "cursor-pointer decoration-2 underline-offset-2 opacity-100 hover:underline"
                    : "pointer-events-none",
                )}
                onClick={() => setPage(1)}
              >
                (Back to Start)
              </p>

              {/* 
              <Tabs
                value={viewType}
                onValueChange={(val) => setViewAction(val as viewOptions)}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="event">Events</TabsTrigger>
                  <TabsTrigger value="openCall">Open Calls</TabsTrigger>
                  <TabsTrigger value="archive">Archive</TabsTrigger>
                  <TabsTrigger value="organizer">Org</TabsTrigger>
                </TabsList>
              </Tabs> */}
            </>
          )}
        </motion.div>
      )}
    </>
  );
};
