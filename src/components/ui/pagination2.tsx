"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

interface BasicPaginationProps {
  currentPage: number
  totalPages: number
}

export const BasicPagination = ({
  currentPage,
  totalPages,
}: BasicPaginationProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())

    if (page === 1) {
      params.delete("page")
    } else {
      params.set("page", page.toString())
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className='flex items-center gap-4 mt-6'>
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className='px-3 py-1 bg-gray-200 rounded disabled:opacity-50'>
        Prev
      </button>

      <span>
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='px-3 py-1 bg-gray-200 rounded disabled:opacity-50'>
        Next
      </button>
    </div>
  )
}
