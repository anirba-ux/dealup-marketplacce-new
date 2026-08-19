"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import SearchFilterContent from "./SearchFilterContent";

import { SerializedCategory } from "@/lib/serializers/category.serializer";

interface SearchFilterProps {
  categories: SerializedCategory[];
  radius?: number;
  embedded?: boolean;
}

export default function SearchFilter({
  categories,
  radius = 10,
  embedded = false,
}: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category") ?? "";

  const hasFilters =
    searchParams.has("category") ||
    searchParams.has("condition") ||
    searchParams.has("maxPrice") ||
    searchParams.has("sort") ||
    searchParams.has("radius");

  const selectedConditions = searchParams.get("condition")?.split(",") ?? [];

  const selectedMaxPrice = Number(searchParams.get("maxPrice") ?? 1000000);

  const [price, setPrice] = useState(selectedMaxPrice);

  const [selectedRadius, setSelectedRadius] = useState(radius);

  const [openCategory, setOpenCategory] = useState<string | null>(null);

  function updateCategory(category: string) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("category", category);

    router.push(`/search?${params.toString()}`);
  }

  function updateCondition(condition: string) {
    const params = new URLSearchParams(searchParams.toString());

    const current = params.get("condition")?.split(",") ?? [];

    let updated: string[];

    if (current.includes(condition)) {
      updated = current.filter((item) => item !== condition);
    } else {
      updated = [...current, condition];
    }

    if (updated.length === 0) {
      params.delete("condition");
    } else {
      params.set("condition", updated.join(","));
    }

    router.push(`/search?${params.toString()}`);
  }

  function updateRadius(value: number) {
    setSelectedRadius(value);

    const params = new URLSearchParams(searchParams.toString());

    params.set("radius", value.toString());

    router.push(`/search?${params.toString()}`);
  }

  function updatePrice(price: number) {
    // Local UI Update
    setPrice(price);

    const params = new URLSearchParams(searchParams.toString());

    if (price >= 1000000) {
      params.delete("maxPrice");
    } else {
      params.set("maxPrice", price.toString());
    }

    router.push(`/search?${params.toString()}`);
  }

  function clearAllFilters() {
    router.push("/search");
  }

  function toggleCategory(slug: string) {
    setOpenCategory((prev) => (prev === slug ? null : slug));
  }

  return (
    <aside
      className={
        embedded
          ? ""
          : `
          sticky
          top-24
          h-fit
          rounded-3xl
          border
          border-blue-100
          bg-white
          p-6
          shadow-lg
          transition-all
          duration-300
          dark:border-slate-700
          dark:bg-slate-900
        `
      }
    >
      {!embedded && (
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Filters</h2>

          {hasFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm font-semibold text-[#1565d8] hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
      )}

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
    </aside>
  );
}
