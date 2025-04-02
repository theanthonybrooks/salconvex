"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Filters, SortOptions } from "@/types/thelist";
import { motion } from "framer-motion";
import { TiArrowLeftOutline, TiArrowRightOutline } from "react-icons/ti";

interface BasicPaginationProps {
  page: number;
  totalPages: number;
  filters: Filters;
  sortOptions: SortOptions;
  onPageChange: (page: number) => void;
}

export const BasicPagination = ({
  page,
  totalPages,
  filters,
  sortOptions,
  onPageChange: setPage,
}: BasicPaginationProps) => {
  const firstPage = page === 1;
  const lastPage = page === totalPages;
  const singlePage = totalPages === 1;

  // const [prevTotal, setPrevTotal] = useState(totalPages);

  console.log("currentPage", page);
  console.log("totalPages", totalPages);
  console.log("firstPage", firstPage);
  console.log("lastPage", lastPage);
  console.log("filters", filters);
  console.log("sortOptions", sortOptions);
  // console.log(firstPage, lastPage, page, currentPage, totalPages);

  const onUserInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = Number((e.target as HTMLInputElement).value);
      if (!isNaN(value) && value >= 1 && value <= totalPages) {
        setPage(value);
      }
    }
  };

  // const goToPage = useCallback(
  //   (page: number) => {
  //     const params = new URLSearchParams(searchParams.toString());

  //     if (page > totalPages) return;

  //     if (page === 1) {
  //       params.delete("page");
  //     } else {
  //       params.set("page", page.toString());
  //     }

  //     router.push(`${pathname}?${params.toString()}`);
  //   },
  //   [router, pathname, searchParams, totalPages],
  // );

  // if (prevTotal !== totalPages) {
  //   if (val !== 1 && )
  // }

  // useEffect(() => {
  //   console.log("im changing");
  //   // if (totalPages <= 1) {
  //   console.log("totalPages", totalPages);

  //   setPrevTotal(totalPages);
  //   setPage(1);
  //   setVal(1);
  //   console.log("prevTotal", prevTotal);

  //   // }
  // }, [totalPages, prevTotal]);

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

  // useEffect(() => {
  //   if (page < 1 || page > totalPages || page === currentPage) return;

  //   goToPage(page);
  // }, [page, currentPage, totalPages, goToPage]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={totalPages >= 1 && { opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
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
          <Input
            // onChange={(e) => {
            //   setPage(Number(e.target.value));
            // }}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              if (parsed > totalPages) return;
              if (!isNaN(parsed)) {
                setPage(parsed);
              }
            }}
            value={page}
            onKeyDown={onUserInput}
            onBlur={() => {
              if (page < 1) setPage(1);
              else if (page > totalPages) setPage(totalPages);
              else setPage(page);
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
