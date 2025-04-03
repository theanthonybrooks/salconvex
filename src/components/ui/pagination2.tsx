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
import { useEffect, useState } from "react";
import { TiArrowLeftOutline, TiArrowRightOutline } from "react-icons/ti";

interface BasicPaginationProps {
  page: number;
  totalPages: number;

  onPageChange: (page: number) => void;
}

export const BasicPagination = ({
  page,
  totalPages,

  onPageChange: setPage,
}: BasicPaginationProps) => {
  const firstPage = page === 1;
  const lastPage = page === totalPages;
  const singlePage = totalPages === 1;

  // const [prevTotal, setPrevTotal] = useState(totalPages);

  // console.log(firstPage, lastPage, page, currentPage, totalPages);

  const [inputVal, setInputVal] = useState(page);

  useEffect(() => {
    setInputVal(page);
  }, [page]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={totalPages >= 1 && { opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="my-6 flex grid-cols-[30%_70%_30%] items-center justify-center gap-4 sm:grid"
    >
      <p
        className={cn(
          "hidden opacity-0 sm:block",
          lastPage && !firstPage
            ? "cursor-pointer opacity-100"
            : "pointer-events-none",
        )}
        onClick={() => setPage(1)}
      >
        (Back to Start)
      </p>

      <div className="flex items-center gap-4">
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
          {/* Mobile: ShadCN Select */}
          <div className="">
            <Select
              value={String(inputVal)}
              onValueChange={(val) => {
                const parsed = Number(val);
                setInputVal(parsed);
                setPage(parsed);
              }}
            >
              <SelectTrigger className="w-fit border-2 border-foreground px-4 text-center text-2xl font-bold hover:bg-white/40 sm:text-xl [&>svg]:hidden">
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
          </div>
          {/* Desktop: Numeric Input */}
          {/* <div className="hidden">
            <Input
              onChange={(e) => {
                const parsed = Number(e.target.value);
                if (parsed > totalPages) return;
                if (!isNaN(parsed)) {
                  setInputVal(parsed);
                }
              }}
              value={inputVal}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (inputVal < 1) setPage(1);
                  else if (inputVal > totalPages) setPage(totalPages);
                  else setPage(inputVal);
                }
              }}
              onBlur={() => {
                if (inputVal < 1) setPage(1);
                else if (inputVal > totalPages) setPage(totalPages);
                else setPage(inputVal);
              }}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={totalPages}
              className="no-spinner w-fit border-2 border-foreground bg-background text-center text-xl font-bold"
            />
          </div> */}
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
    </motion.div>
  );
};
