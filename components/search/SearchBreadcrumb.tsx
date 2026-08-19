"use client";

import Link from "next/link";
import { ChevronRight, House, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBreadcrumbProps {
  keyword?: string;
  category?: string;
}

export default function SearchBreadcrumb({
  keyword,
  category,
}: SearchBreadcrumbProps) {
  const router = useRouter();

  return (
    <div className="mb-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="
          mb-5
          flex
          items-center
          gap-2

          rounded-xl

          border
          border-slate-200

          bg-white

          px-4
          py-2

          text-sm
          font-medium

          text-slate-700

          shadow-sm

          transition-all
          duration-300

          hover:border-[#1565d8]
          hover:bg-blue-50
          hover:text-[#1565d8]
        "
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Breadcrumb */}
      <nav
        className="
          flex
          flex-wrap
          items-center
          gap-2

          text-sm
          text-slate-500
        "
      >
        <Link
          href="/"
          className="
            flex
            items-center
            gap-1

            transition-colors

            hover:text-[#1565d8]
          "
        >
          <House size={16} />
          Home
        </Link>

        <ChevronRight size={15} />

        <span className="font-medium text-slate-700">Search Results</span>

        {category && (
          <>
            <ChevronRight size={15} />

            <span
              className="
                rounded-full
                bg-blue-50
                px-3
                py-1

                font-medium

                text-[#1565d8]
              "
            >
              {category}
            </span>
          </>
        )}

        {keyword && (
          <>
            <ChevronRight size={15} />

            <span
              className="
                rounded-full
                bg-emerald-50
                px-3
                py-1

                font-medium

                text-emerald-700
              "
            >
              "{keyword}"
            </span>
          </>
        )}
      </nav>
    </div>
  );
}
