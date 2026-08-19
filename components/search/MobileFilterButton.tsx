"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  SlidersHorizontal,
  ArrowUpDown,
  X,
} from "lucide-react";

import SearchFilterContent from "./SearchFilterContent";

import { SerializedCategory } from "@/lib/serializers/category.serializer";

interface MobileFilterButtonProps {
  categories: SerializedCategory[];
  radius: number;
}

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

  const [price, setPrice] =
    useState(selectedMaxPrice);

  const [selectedRadius, setSelectedRadius] =
    useState(radius);

  const [openCategory, setOpenCategory] =
    useState<string | null>(null);

  function closeFilter() {
    setFilterOpen(false);
  }

  function updateCategory(category: string) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("category", category);

    closeFilter();

    router.push(`/search?${params.toString()}`);
  }

  function updateRadius(value: number) {
    setSelectedRadius(value);

    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("radius", value.toString());

    closeFilter();

    router.push(`/search?${params.toString()}`);
  }

  function updateCondition(condition: string) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    const current =
      params.get("condition")?.split(",") ?? [];

    let updated: string[];

    if (current.includes(condition)) {
      updated = current.filter(
        (item) => item !== condition,
      );
    } else {
      updated = [...current, condition];
    }

    if (updated.length === 0) {
      params.delete("condition");
    } else {
      params.set(
        "condition",
        updated.join(","),
      );
    }

    closeFilter();

    router.push(`/search?${params.toString()}`);
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

    closeFilter();

    router.push(`/search?${params.toString()}`);
  }

  function toggleCategory(slug: string) {
    setOpenCategory((prev) =>
      prev === slug ? null : slug,
    );
  }

  function updateSort(sort: string) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("sort", sort);

    setSortOpen(false);

    router.push(`/search?${params.toString()}`);
  }

    return (
    <>
      {/* Mobile Buttons */}
      <div className="mb-6 flex gap-3 lg:hidden">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-[#1565d8] hover:bg-[#1565d8] hover:text-white"
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>

        <button
          onClick={() => setSortOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-[#1565d8] hover:bg-[#1565d8] hover:text-white"
        >
          <ArrowUpDown size={18} />
          Sort
        </button>
      </div>

      {/* Filter Overlay */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setFilterOpen(false)}
        />
      )}

      {/* Filter Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl transition-transform duration-300 lg:hidden ${
          filterOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-slate-300" />

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Filters</h2>

          <button
            onClick={() => setFilterOpen(false)}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <SearchFilterContent
          categories={categories}
          selectedRadius={selectedRadius}
          selectedCategory={selectedCategory}
          selectedConditions={selectedConditions}
          price={price}
          openCategory={openCategory}
          updateRadius={updateRadius}
          updateCategory={updateCategory}
          updateCondition={updateCondition}
          updatePrice={updatePrice}
          toggleCategory={toggleCategory}
          setPrice={setPrice}
        />
      </div>

      {/* Sort Overlay */}
      {sortOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setSortOpen(false)}
        />
      )}

      {/* Sort Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white p-6 shadow-2xl transition-transform duration-300 lg:hidden ${
          sortOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-slate-300" />

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Sort Products</h2>

          <button
            onClick={() => setSortOpen(false)}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => updateSort("nearest")}
            className="w-full rounded-xl px-4 py-3 text-left hover:bg-blue-50"
          >
            📍 Nearest First
          </button>

          <button
            onClick={() => updateSort("newest")}
            className="w-full rounded-xl px-4 py-3 text-left hover:bg-blue-50"
          >
            🆕 Newest First
          </button>

          <button
            onClick={() => updateSort("price_asc")}
            className="w-full rounded-xl px-4 py-3 text-left hover:bg-blue-50"
          >
            ₹ Price: Low to High
          </button>

          <button
            onClick={() => updateSort("price_desc")}
            className="w-full rounded-xl px-4 py-3 text-left hover:bg-blue-50"
          >
            ₹ Price: High to Low
          </button>

          <button
            onClick={() => updateSort("most_viewed")}
            className="w-full rounded-xl px-4 py-3 text-left hover:bg-blue-50"
          >
            👁 Most Viewed
          </button>
        </div>
      </div>
    </>
  );
}