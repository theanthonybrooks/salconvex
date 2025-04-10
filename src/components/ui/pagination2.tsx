"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TiArrowLeftOutline, TiArrowRightOutline } from "react-icons/ti";

interface BasicPaginationProps {
  page: number;
  totalPages: number;
  totalResults: number;
  bottomPag?: boolean;
  className?: string;

  onPageChange: (page: number) => void;
}

export const BasicPagination = ({
  page,
  totalPages,
  totalResults,
  bottomPag = false,
  className,

  onPageChange: setPage,
}: BasicPaginationProps) => {
  const firstPage = page === 1;
  const lastPage = page === totalPages;
  const singlePage = totalPages === 1;

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
            "my-6 flex w-full max-w-[min(70vw,1200px)] grid-cols-[30%_40%_30%] flex-col items-center justify-center gap-4 sm:grid sm:gap-0",
            className,
            totalPages === 0 && "justify-center sm:flex",
          )}
        >
          {!bottomPag && totalPages !== 0 && (
            <p className={cn("mx-auto text-center")}>
              Total Results: {totalResults}
            </p>
          )}
          {totalPages !== 0 ? (
            <div className="col-start-2 flex items-center justify-center gap-4">
              <span
                onClick={() => {
                  setPage(page - 1);
                }}
                className={cn(
                  "cursor-pointer px-3 py-1",
                  firstPage && "pointer-events-none opacity-0",
                )}
              >
                <TiArrowLeftOutline className="size-6 text-foreground hover:scale-110" />
              </span>

              <span className="flex flex-row items-center gap-2">
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
                of {totalPages}
              </span>

              <span
                onClick={() => {
                  setPage(page + 1);
                }}
                className={cn(
                  "cursor-pointer px-3 py-1",
                  (lastPage || singlePage) && "pointer-events-none opacity-0",
                )}
              >
                <TiArrowRightOutline className="size-6 text-foreground hover:scale-110" />
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
            <p
              className={cn(
                "col-start-3 hidden opacity-0 sm:block",
                lastPage && !firstPage && totalPages > 2
                  ? "cursor-pointer decoration-2 underline-offset-2 opacity-100 hover:underline"
                  : "pointer-events-none",
              )}
              onClick={() => setPage(1)}
            >
              (Back to Start)
            </p>
          )}
        </motion.div>
      )}
    </>
  );
};
