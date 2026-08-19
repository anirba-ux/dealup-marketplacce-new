import Link from "next/link";
import Image from "next/image";

interface EmptySearchStateProps {
  keyword?: string;
  category?: string;
}

export default function EmptySearchState({
  keyword,
  category,
}: EmptySearchStateProps) {
  return (
    <div
      className="
        flex
        min-h-[520px]
        flex-col
        items-center
        justify-center

        rounded-3xl

        border
        border-blue-100

        bg-white

        p-10

        text-center

        shadow-xl

        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      {/* Illustration */}

      <div className="mb-10">
        <Image
          src="/illustrations/empty-search.png"
          alt="No products found"
          width={320}
          height={240}
          priority
        />
      </div>

      {/* Title */}

      <h2
        className="
    text-4xl
    font-extrabold

    text-slate-900

    dark:text-white
  "
      >
        {keyword
          ? `No results for "${keyword}"`
          : category
            ? `No ${category} available`
            : "No Products Found"}
      </h2>
      {/* Description */}

      <p
        className="
    mt-5

    max-w-xl

    text-lg
    leading-8

    text-slate-500

    dark:text-slate-400
  "
      >
        {keyword && category
          ? `We couldn't find any "${keyword}" products in ${category}.`
          : keyword
            ? `Try searching with a different keyword.`
            : category
              ? `There are currently no products in this category.`
              : `Try browsing another category.`}
      </p>

      {/* Buttons */}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/search"
          className="
            rounded-xl

            bg-[#1565d8]

            px-8
            py-3

            font-semibold

            text-white

            shadow-lg

            transition-all
            duration-300

            hover:-translate-y-1
            hover:bg-[#0f52ba]
          "
        >
          Browse Marketplace
        </Link>

        <Link
          href="/"
          className="
            rounded-xl

            border
            border-[#1565d8]

            px-8
            py-3

            font-semibold

            text-[#1565d8]

            transition-all
            duration-300

            hover:bg-blue-50

            dark:hover:bg-slate-800
          "
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
