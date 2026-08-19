"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  searchParams: Record<string, string | undefined>;
}

export default function SearchPagination({
  currentPage,
  totalPages,
  totalProducts,
  searchParams,
}: SearchPaginationProps) {
  // Don't show pagination if only one page exists
  if (totalPages <= 1) {
    return null;
  }

  function createPageLink(page: number) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    params.set("page", page.toString());

    return `/search?${params.toString()}`;
  }

  function getVisiblePages() {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);

    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }

  const startProduct = (currentPage - 1) * 20 + 1;

  const endProduct = Math.min(currentPage * 20, totalProducts);

  return (
<>
    <div className="mb-5 text-center text-sm text-slate-500">
      Showing{" "}
      <span className="font-semibold text-slate-900">
        {startProduct}–{endProduct}
      </span>{" "}
      of{" "}
      <span className="font-semibold text-slate-900">
        {totalProducts}
      </span>{" "}
      products
    </div>

    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {/* Previous */}
      <Link
        href={createPageLink(Math.max(currentPage - 1, 1))}
        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${
          currentPage === 1
            ? "pointer-events-none border-slate-200 text-slate-300"
            : "border-slate-300 hover:border-[#1565d8] hover:bg-[#1565d8] hover:text-white"
        }`}
      >
        <ChevronLeft size={18} />
      </Link>

      {/* Page Numbers */}
      {/* Page Numbers */}
      {getVisiblePages().map((item, index) => {
        if (item === "...") {
          return (
            <span
              key={`dots-${index}`}
              className="flex h-10 w-10 items-center justify-center text-slate-500"
            >
              ...
            </span>
          );
        }

        return (
          <Link
            key={item}
            href={createPageLink(item)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition-all duration-300 ${
              currentPage === item
                ? "border-[#1565d8] bg-[#1565d8] text-white shadow-md"
                : "border-slate-300 bg-white hover:border-[#1565d8] hover:bg-blue-50 hover:text-[#1565d8]"
            }`}
          >
            {item}
          </Link>
        );
      })}

      {/* Next */}
      <Link
        href={createPageLink(Math.min(currentPage + 1, totalPages))}
        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 ${
          currentPage === totalPages
            ? "pointer-events-none border-slate-200 text-slate-300"
            : "border-slate-300 hover:border-[#1565d8] hover:bg-[#1565d8] hover:text-white"
        }`}
      >
        <ChevronRight size={18} />
      </Link>
    </div>
  </>
);
}
