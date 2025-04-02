"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TiArrowLeftOutline, TiArrowRightOutline } from "react-icons/ti";

interface BasicPaginationProps {
  currentPage: number;
  totalPages: number;
}

export const BasicPagination = ({
  currentPage,
  totalPages,
}: BasicPaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstPage = currentPage === 1;
  const lastPage = currentPage === totalPages;
  const singlePage = totalPages === 1;
  const [val, setVal] = useState(currentPage);
  const [page, setPage] = useState(currentPage);

  // console.log(firstPage, lastPage, page, currentPage, totalPages);

  const onUserInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = Number((e.target as HTMLInputElement).value);
      if (!isNaN(value) && value >= 1 && value <= totalPages) {
        setPage(value);
      }
    }
  };

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (page > totalPages) return;

      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, totalPages],
  );

  //Not using prefetch as it doesn't work with the dynamically loaded data
  // const prefetchPage = useCallback(
  //   (targetPage: number) => {
  //     console.log("prefetch page", targetPage)
  //     if (targetPage < 1 || targetPage > totalPages) return
  //     console.log("prefetching")
  //     const params = new URLSearchParams(searchParams.toString())
  //     if (targetPage === 1) {
  //       params.delete("page")
  //     } else {
  //       params.set("page", targetPage.toString())
  //     }

  //     router.prefetch(`${pathname}?${params.toString()}`)
  //   },
  //   [router, pathname, searchParams, totalPages]
  // )

  useEffect(() => {
    if (page < 1 || page > totalPages || page === currentPage) return;

    goToPage(page);
    // prefetchPage(page - 1)
    // prefetchPage(page + 1)
  }, [page, currentPage, totalPages, goToPage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={totalPages !== 0 && { opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="my-6 grid grid-cols-[30%_70%_30%] items-center justify-center gap-4"
    >
      <p
        className={cn(
          "opacity-0",
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
            setVal(currentPage - 1);
            setPage(currentPage - 1);
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
          <Input
            // onChange={(e) => {
            //   setPage(Number(e.target.value));
            // }}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              if (parsed > totalPages) return;
              if (!isNaN(parsed)) {
                setVal(parsed);
              }
            }}
            value={val}
            onKeyDown={onUserInput}
            onBlur={() => {
              if (page < 1) setPage(1);
              else if (page > totalPages) setPage(totalPages);
              else setPage(val);
            }}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            min={1}
            max={totalPages}
            className="no-spinner w-fit border-2 border-foreground bg-background text-center text-xl font-bold sm:text-xl"
          />
          of {totalPages}
        </span>

        <span
          onClick={() => {
            setVal(currentPage + 1);
            setPage(currentPage + 1);
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
