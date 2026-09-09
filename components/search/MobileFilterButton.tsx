"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
  MapPin,
  Sparkles,
  IndianRupee,
  Eye,
} from "lucide-react";

import SearchFilterContent from "./SearchFilterContent";

import { SerializedCategory } from "@/lib/serializers/category.serializer";

interface MobileFilterButtonProps {
  categories: SerializedCategory[];
  radius: number;
}

const SORT_OPTIONS = [
  {
    value: "nearest",
    label: "Nearest First",
    icon: MapPin,
  },
  {
    value: "newest",
    label: "Newest First",
    icon: Sparkles,
  },
  {
    value: "price_asc",
    label: "Price: Low to High",
    icon: IndianRupee,
  },
  {
    value: "price_desc",
    label: "Price: High to Low",
    icon: IndianRupee,
  },
  {
    value: "most_viewed",
    label: "Most Viewed",
    icon: Eye,
  },
];

export default function MobileFilterButton({
  categories,
  radius,
}: MobileFilterButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const selectedCategory =
    searchParams.get("category") ?? "";

  const selectedConditions =
    searchParams.get("condition")?.split(",") ?? [];

  const selectedMaxPrice = Number(
    searchParams.get("maxPrice") ?? 1000000,
  );

  const selectedSort =
    searchParams.get("sort") ?? "newest";

  const [price, setPrice] =
    useState(selectedMaxPrice);

  const [selectedRadius, setSelectedRadius] =
    useState(radius);

  const [openCategory, setOpenCategory] =
    useState<string | null>(null);

  // =====================================================
  // Prevent background scrolling while mobile sheet open
  // =====================================================

  useEffect(() => {
    const isOpen = filterOpen || sortOpen;

    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [filterOpen, sortOpen]);

  // =====================================================
  // Close helpers
  // =====================================================

  function closeFilter() {
    setFilterOpen(false);
  }

  function closeSort() {
    setSortOpen(false);
  }

  // =====================================================
  // Filter Updates
  // =====================================================

  function updateCategory(category: string) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("category", category);

    router.push(
      `/search?${params.toString()}`,
    );
  }

  function updateRadius(value: number) {
    setSelectedRadius(value);

    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("radius", value.toString());

    router.push(
      `/search?${params.toString()}`,
    );
  }

  function updateCondition(
    condition: string,
  ) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    const current =
      params.get("condition")?.split(",") ??
      [];

    let updated: string[];

    if (current.includes(condition)) {
      updated = current.filter(
        (item) => item !== condition,
      );
    } else {
      updated = [
        ...current,
        condition,
      ];
    }

    if (updated.length === 0) {
      params.delete("condition");
    } else {
      params.set(
        "condition",
        updated.join(","),
      );
    }

    router.push(
      `/search?${params.toString()}`,
    );
  }

  function updatePrice(value: number) {
    setPrice(value);

    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (value >= 1000000) {
      params.delete("maxPrice");
    } else {
      params.set(
        "maxPrice",
        value.toString(),
      );
    }

    router.push(
      `/search?${params.toString()}`,
    );
  }

  function toggleCategory(slug: string) {
    setOpenCategory((prev) =>
      prev === slug ? null : slug,
    );
  }

  // =====================================================
  // Sort
  // =====================================================

  function updateSort(sort: string) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("sort", sort);

    setSortOpen(false);

    router.push(
      `/search?${params.toString()}`,
    );
  }

  return (
    <>
      {/* =================================================
          Mobile Filter / Sort Buttons
      ================================================= */}

      <div className="mb-6 flex gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => {
            setSortOpen(false);
            setFilterOpen(true);
          }}
          className="
            flex min-w-0 flex-1 items-center justify-center
            gap-2 rounded-2xl border border-slate-200
            bg-white px-4 py-3.5
            text-sm font-bold text-slate-700
            shadow-sm transition-all duration-200
            hover:-translate-y-0.5
            hover:border-[#1565d8]
            hover:bg-[#1565d8]
            hover:text-white
            active:scale-[0.98]

            dark:border-white/10
            dark:bg-[#0b1729]
            dark:text-slate-200
            dark:hover:border-[#1565d8]
            dark:hover:bg-[#1565d8]
            dark:hover:text-white
          "
        >
          <SlidersHorizontal
            className="h-[18px] w-[18px] shrink-0"
          />

          <span>Filters</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFilterOpen(false);
            setSortOpen(true);
          }}
          className="
            flex min-w-0 flex-1 items-center justify-center
            gap-2 rounded-2xl border border-slate-200
            bg-white px-4 py-3.5
            text-sm font-bold text-slate-700
            shadow-sm transition-all duration-200
            hover:-translate-y-0.5
            hover:border-[#1565d8]
            hover:bg-[#1565d8]
            hover:text-white
            active:scale-[0.98]

            dark:border-white/10
            dark:bg-[#0b1729]
            dark:text-slate-200
            dark:hover:border-[#1565d8]
            dark:hover:bg-[#1565d8]
            dark:hover:text-white
          "
        >
          <ArrowUpDown
            className="h-[18px] w-[18px] shrink-0"
          />

          <span>Sort</span>
        </button>
      </div>

      {/* =================================================
          FILTER OVERLAY
      ================================================= */}

      {filterOpen && (
        <div
          className="
            fixed inset-0 z-[80]
            bg-slate-950/55
            backdrop-blur-[3px]
            lg:hidden
          "
          onClick={closeFilter}
          aria-hidden="true"
        />
      )}

      {/* =================================================
          FILTER BOTTOM SHEET
      ================================================= */}

      <div
        className={`
          fixed inset-x-0 bottom-0 z-[90]
          flex max-h-[88vh] flex-col
          overflow-hidden
          rounded-t-[28px]
          border-t border-slate-200
          bg-white
          shadow-[0_-12px_40px_rgba(15,23,42,0.18)]
          transition-transform duration-300 ease-out
          lg:hidden

          dark:border-white/10
          dark:bg-[#081426]
          dark:shadow-[0_-12px_40px_rgba(0,0,0,0.45)]

          ${
            filterOpen
              ? "translate-y-0"
              : "pointer-events-none translate-y-full"
          }
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
      >
        {/* Drag Handle */}
        <div className="shrink-0 px-4 pt-3">
          <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-4 pt-4 sm:px-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1565d8]">
              Refine Results
            </p>

            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Filters
            </h2>
          </div>

          <button
            type="button"
            onClick={closeFilter}
            className="
              inline-flex h-10 w-10 items-center
              justify-center rounded-full
              border border-slate-200
              bg-slate-50
              text-slate-600
              transition-all
              hover:bg-slate-100
              hover:text-slate-900
              active:scale-95

              dark:border-white/10
              dark:bg-white/5
              dark:text-slate-300
              dark:hover:bg-white/10
              dark:hover:text-white
            "
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6">
          <SearchFilterContent
            categories={categories}
            selectedRadius={selectedRadius}
            selectedCategory={selectedCategory}
            selectedConditions={
              selectedConditions
            }
            price={price}
            openCategory={openCategory}
            updateRadius={updateRadius}
            updateCategory={updateCategory}
            updateCondition={
              updateCondition
            }
            updatePrice={updatePrice}
            toggleCategory={
              toggleCategory
            }
            setPrice={setPrice}
          />
        </div>

        {/* Bottom Action */}
        <div
          className="
            shrink-0 border-t border-slate-200
            bg-white/95 px-5 py-4
            backdrop-blur
            sm:px-6

            dark:border-white/10
            dark:bg-[#081426]/95
          "
        >
          <button
            type="button"
            onClick={closeFilter}
            className="
              flex w-full items-center justify-center
              gap-2 rounded-2xl
              bg-[#1565d8]
              px-5 py-3.5
              text-sm font-extrabold text-white
              shadow-lg shadow-blue-500/20
              transition-all duration-200
              hover:bg-[#0f52ba]
              hover:shadow-xl
              active:scale-[0.98]
            "
          >
            <Check className="h-4 w-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* =================================================
          SORT OVERLAY
      ================================================= */}

      {sortOpen && (
        <div
          className="
            fixed inset-0 z-[80]
            bg-slate-950/55
            backdrop-blur-[3px]
            lg:hidden
          "
          onClick={closeSort}
          aria-hidden="true"
        />
      )}

      {/* =================================================
          SORT BOTTOM SHEET
      ================================================= */}

      <div
        className={`
          fixed inset-x-0 bottom-0 z-[90]
          rounded-t-[28px]
          border-t border-slate-200
          bg-white
          p-5
          pb-7
          shadow-[0_-12px_40px_rgba(15,23,42,0.18)]
          transition-transform duration-300 ease-out
          lg:hidden

          dark:border-white/10
          dark:bg-[#081426]
          dark:shadow-[0_-12px_40px_rgba(0,0,0,0.45)]

          ${
            sortOpen
              ? "translate-y-0"
              : "pointer-events-none translate-y-full"
          }
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Sort Products"
      >
        {/* Drag Handle */}
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-300 dark:bg-slate-600" />

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1565d8]">
              Order Results
            </p>

            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Sort Products
            </h2>
          </div>

          <button
            type="button"
            onClick={closeSort}
            className="
              inline-flex h-10 w-10 items-center
              justify-center rounded-full
              border border-slate-200
              bg-slate-50
              text-slate-600
              transition-all
              hover:bg-slate-100
              hover:text-slate-900
              active:scale-95

              dark:border-white/10
              dark:bg-white/5
              dark:text-slate-300
              dark:hover:bg-white/10
              dark:hover:text-white
            "
            aria-label="Close sort"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          {SORT_OPTIONS.map(
            ({
              value,
              label,
              icon: Icon,
            }) => {
              const isSelected =
                selectedSort === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    updateSort(value)
                  }
                  className={`
                    flex w-full items-center
                    gap-3 rounded-2xl
                    border px-4 py-3.5
                    text-left
                    transition-all duration-200
                    active:scale-[0.99]

                    ${
                      isSelected
                        ? `
                          border-[#1565d8]
                          bg-blue-50
                          text-[#1565d8]
                          shadow-sm

                          dark:border-[#1565d8]
                          dark:bg-[#102b52]
                          dark:text-white
                        `
                        : `
                          border-slate-200
                          bg-slate-50
                          text-slate-700
                          hover:border-blue-200
                          hover:bg-blue-50
                          hover:text-[#1565d8]

                          dark:border-white/10
                          dark:bg-white/[0.035]
                          dark:text-slate-200
                          dark:hover:border-[#1565d8]/50
                          dark:hover:bg-[#102b52]
                          dark:hover:text-white
                        `
                    }
                  `}
                >
                  <span
                    className={`
                      flex h-10 w-10 shrink-0
                      items-center justify-center
                      rounded-xl
                      ${
                        isSelected
                          ? "bg-[#1565d8] text-white"
                          : "bg-white text-slate-500 shadow-sm dark:bg-white/10 dark:text-slate-300"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="min-w-0 flex-1 text-sm font-bold">
                    {label}
                  </span>

                  {isSelected && (
                    <span
                      className="
                        flex h-7 w-7 shrink-0
                        items-center justify-center
                        rounded-full
                        bg-[#1565d8]
                        text-white
                      "
                    >
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            },
          )}
        </div>
      </div>
    </>
  );
}