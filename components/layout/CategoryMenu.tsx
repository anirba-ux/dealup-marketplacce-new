"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CategoryMenu() {
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category");

  const categories = [
    { name: "Mobiles", slug: "mobiles" },
    { name: "Cars", slug: "cars" },
    { name: "Bikes", slug: "bikes" },
    { name: "Electronics", slug: "electronics" },
    { name: "Property", slug: "property" },
    { name: "Fashion", slug: "fashion" },
    { name: "Jobs", slug: "jobs" },
    { name: "Services", slug: "services" },
  ];

  return (
    <div className="border-b border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div
        className="
    mx-auto
    flex
    max-w-7xl
    items-center
    gap-3
    overflow-x-auto
    px-1
    py-2
    md:px-4
    [-ms-overflow-style:none]
    [scrollbar-width:none]
    [&::-webkit-scrollbar]:hidden
  "
      >
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/search?category=${category.slug}`}
            className={`
              whitespace-nowrap

              rounded-full

              px-4
              py-2

              text-sm
              font-medium

              transition-all
              duration-300

              ${
                selectedCategory === category.slug
                  ? `
                    bg-[#1565d8]
                    text-white
                    shadow-md
                  `
                  : `
                    text-gray-600

                    hover:bg-blue-50
                    hover:text-[#1565d8]

                    dark:text-gray-300
                    dark:hover:bg-slate-800
                    dark:hover:text-white
                  `
              }
            `}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
