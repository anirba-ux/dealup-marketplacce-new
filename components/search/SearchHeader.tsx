"use client";

import { formatLabel } from "@/lib/utils/format";
import Image from "next/image";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Search,
  PackageSearch,
  SlidersHorizontal,
  FolderOpen,
  ArrowUp,
  ArrowDown,
  Clock3,
  Eye,
  Check,
  RotateCcw,
} from "lucide-react";

interface SearchHeaderProps {
  keyword?: string;
  category?: string;
  city?: string;
  total: number;
  sort?: string;
}

export default function SearchHeader({
  keyword,
  category,
  city,
  total,
  sort,
}: SearchHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [openSort, setOpenSort] = useState(false);

  const sortOptions = [
    {
      value: "newest",
      label: "Newest First",
      icon: ArrowDown,
    },
    {
      value: "oldest",
      label: "Oldest First",
      icon: Clock3,
    },
    {
      value: "price_asc",
      label: "Price: Low → High",
      icon: ArrowUp,
    },
    {
      value: "price_desc",
      label: "Price: High → Low",
      icon: ArrowDown,
    },
    {
      value: "most_viewed",
      label: "Most Viewed",
      icon: Eye,
    },
  ];

  let title = "Marketplace";
  let subtitle = "";

  if (keyword && category) {
    title = `${keyword.toUpperCase()} in ${formatLabel(category)}`;
    subtitle = "Showing filtered products";
  } else if (keyword) {
    title = "Search Results";
    subtitle = `Results for "${keyword}"`;
  } else if (category) {
    title = `Browse ${formatLabel(category)}`;
    subtitle = `Showing all ${formatLabel(category)}`;
  } else if (city) {
    title = `Products in ${formatLabel(city)}`;
  }

  function updateSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("sort", value);

    router.push(`/search?${params.toString()}`);
  }

  function resetSort() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("sort");

    router.push(`/search?${params.toString()}`);
  }

  return (
    <div
      className="
mb-8

flex
flex-col

gap-8

lg:flex-row
lg:items-center
lg:justify-between

rounded-3xl

border

px-6

py-5
md:px-8
md:py-6

shadow-2xl

transition-all
duration-300

border-blue-200/60

bg-gradient-to-r
from-[#1565d8]
via-[#4f8df5]
to-[#f7c04a]

dark:border-slate-700
dark:from-slate-900
dark:via-slate-800
dark:to-slate-900
"
    >
      <div
        className="
    flex
    flex-1

    items-start
    gap-5
  "
      >
        {/* Search Icon Box */}

        <div
          className="
      flex
      h-14
      w-14
      items-center
      justify-center
      rounded-2xl

      bg-white/20
      backdrop-blur-md
      border
      border-white/30

      text-white
      shadow-xl

      dark:bg-slate-800
      dark:border-slate-700
    "
        >
          <Search size={28} />
        </div>

        {/* Text Section */}

        <div>
          <h1
            className="
text-3xl

md:text-4xl

xl:text-5xl
font-extrabold
tracking-tight

text-white

dark:text-white
"
          >
            {title}
          </h1>

          <p
            className="
mt-3
text-sm
font-semibold
uppercase
tracking-[0.2em]

text-blue-100

dark:text-slate-400
"
          >
            {subtitle}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {/* Keyword */}
            {keyword && (
              <div
                className="
        inline-flex
        items-center
        gap-2

        rounded-full

        bg-white/20
        backdrop-blur-md

        border
        border-white/30

        px-4
        py-2

        shadow-lg

        dark:bg-slate-800
        dark:border-slate-700
      "
              >
                <Search
                  size={16}
                  className="text-yellow-300 dark:text-sky-400"
                />

                <span className="text-sm font-bold uppercase tracking-wide text-white">
                  {keyword}
                </span>
              </div>
            )}

            {/* Category */}
            {category && (
              <div
                className="
        inline-flex
        items-center
        gap-2

        rounded-full

        bg-white/20
        backdrop-blur-md

        border
        border-white/30

        px-4
        py-2

        shadow-lg

        dark:bg-slate-800
        dark:border-slate-700
      "
              >
                <FolderOpen
                  size={16}
                  className="text-yellow-300 dark:text-sky-400"
                />

                <span className="text-sm font-semibold text-white">
                  {formatLabel(category)}
                </span>
              </div>
            )}

            {/* Product Count */}
            <div
              className="
      inline-flex
      items-center
      gap-2

      rounded-full

      bg-white/20
      backdrop-blur-md

      border
      border-white/30

      px-4
      py-2

      shadow-lg

      dark:bg-slate-800
      dark:border-slate-700
    "
            >
              <PackageSearch
                size={16}
                className="text-yellow-300 dark:text-sky-400"
              />

              <span className="text-sm font-semibold text-white">
                {total} Product{total !== 1 ? "s" : ""} Found
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="
    relative

    hidden
    lg:flex

    items-center
    gap-6

    lg:gap-8
  "
      >
        {/* Illustration */}

        <div
          className="
    hidden

    lg:flex

    lg:w-[300px]
    xl:w-[360px]


    items-center
    justify-center

    flex-shrink-0
  "
        >
          <Image
            src="/illustrations/header-illustration.png"
            alt="Search Illustration"
            width={360}
            height={240}
            priority
            className="
      h-auto
      w-full
      object-contain
      translate-y-12
      select-none
      pointer-events-none
    "
          />
        </div>
        {/* Sort Button */}

        <button
          onClick={() => setOpenSort(!openSort)}
          className="
flex

w-full

justify-center

lg:w-auto

items-center

gap-2

rounded-2xl

px-7
py-3.5
min-w-[210px]
justify-between

font-semibold

bg-white/20

backdrop-blur-md

border
border-white/30

text-white

shadow-lg

transition-all
duration-300

hover:bg-white/30
hover:shadow-2xl
hover:text-[#1565d8]

dark:bg-slate-800
dark:border-slate-700
dark:text-white
"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} />

            <span>
              {sort
                ? `Sort: ${sortOptions.find((item) => item.value === sort)?.label}`
                : "Sort"}
            </span>
          </div>

          <ArrowDown
            size={16}
            className={`
    transition-transform
    duration-300

    ${openSort ? "rotate-180" : ""}
  `}
          />
        </button>

        <button
          onClick={resetSort}
          className="
    flex
    h-12
    w-12
    items-center
    justify-center

    rounded-2xl

    border
    border-white/30

    bg-white/20
    backdrop-blur-md

    text-white

    transition-all

    hover:bg-white
    hover:text-[#1565d8]
  "
        >
          <RotateCcw size={18} />
        </button>

        {openSort && (
          <div
            className="
      absolute
      right-0
      top-[calc(100%+14px)]

      w-72

      overflow-hidden

      rounded-2xl

      border
      border-white/40

      bg-white/95
backdrop-blur-xl

      shadow-[0_20px_60px_rgba(0,0,0,0.18)]

      dark:border-slate-700
      dark:bg-slate-900
    "
          >
            {sortOptions.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.value}
                  onClick={() => {
                    updateSort(item.value);
                    setOpenSort(false);
                  }}
                  className={`
        flex
        w-full
        items-center
        justify-between

        px-5
        py-3

        border-b
border-slate-100
last:border-0

        transition

        ${
          sort === item.value
            ? "bg-blue-50 text-[#1565d8] font-semibold"
            : "hover:bg-blue-50 hover:text-[#1565d8] dark:hover:bg-slate-800"
        }
      `}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>

                  {sort === item.value && (
                    <Check size={18} className="text-[#1565d8]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
