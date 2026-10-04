import type { Metadata } from "next";

import {
  searchNearbyProducts,
  searchProductsPage,
} from "@/lib/repositories/product.repository";

import { searchJobsPage } from "@/lib/repositories/job.repository";

import type { Job } from "@/lib/models/job";

import SearchPagination from "@/components/search/SearchPagination";

import { findCategoryTree } from "@/lib/repositories/category.repository";

import { serializeCategoryTree } from "@/lib/serializers/category.serializer";

import SearchBreadcrumb from "@/components/search/SearchBreadcrumb";

import SearchResultCard from "@/components/search/SearchResultCard";

import EmptySearchState from "@/components/search/EmptySearchState";

import SearchFilter from "@/components/search/SearchFilter";

import SearchHeader from "@/components/search/SearchHeader";

import MobileFilterButton from "@/components/search/MobileFilterButton";

import SearchJobCard from "@/components/search/SearchJobCard";

import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  SearchX,
} from "lucide-react";

/* =========================================================
   Search Page Props
========================================================= */

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;

    category?: string;

    city?: string;

    sort?: string;

    condition?: string;

    maxPrice?: string;

    radius?: string;

    lat?: string;

    lng?: string;

    nearby?: string;

    featured?: string;

    latest?: string;

    page?: string;
  }>;
}

/* =========================================================
   Helpers
========================================================= */

function isJobsCategory(
  category?: string,
) {
  return (
    category?.trim().toLowerCase() ===
    "jobs"
  );
}

/* =========================================================
   Metadata
========================================================= */

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const {
    q,
    category,
    city,
    condition,
    maxPrice,
    radius,
    lat,
    lng,
    nearby,
    featured,
    latest,
    sort,
    page,
  } = await searchParams;

  const searchTerm =
    q?.trim();

  const categorySlug =
    category?.trim();

  const cityName =
    city?.trim();

  const jobsSearch =
    isJobsCategory(
      categorySlug,
    );

  let title =
    "Search Products";

  /* =======================================================
     JOB SEO
  ======================================================= */

  if (jobsSearch) {
    if (
      searchTerm &&
      cityName
    ) {
      title =
        `Jobs for ${searchTerm} in ${cityName}`;
    } else if (
      searchTerm
    ) {
      title =
        `${searchTerm} Jobs in India`;
    } else if (
      cityName
    ) {
      title =
        `Jobs in ${cityName}`;
    } else {
      title =
        "Jobs in India";
    }
  }

  /* =======================================================
     PRODUCT SEO
  ======================================================= */

  else if (
    searchTerm &&
    categorySlug &&
    cityName
  ) {
    title =
      `Buy ${searchTerm} in ${cityName}`;
  }

  else if (
    searchTerm &&
    categorySlug
  ) {
    title =
      `Buy ${searchTerm} in ${categorySlug}`;
  }

  else if (
    searchTerm &&
    cityName
  ) {
    title =
      `Buy ${searchTerm} in ${cityName}`;
  }

  else if (
    categorySlug &&
    cityName
  ) {
    title =
      `Buy & Sell ${categorySlug} in ${cityName}`;
  }

  else if (
    searchTerm
  ) {
    title =
      `Buy ${searchTerm} Online`;
  }

  else if (
    categorySlug
  ) {
    title =
      `Buy & Sell ${categorySlug}`;
  }

  else if (
    cityName
  ) {
    title =
      `Products for Sale in ${cityName}`;
  }

  else if (
    featured === "true"
  ) {
    title =
      "Featured Products";
  }

  else if (
    latest === "true"
  ) {
    title =
      "Latest Products";
  }

  /* =======================================================
     Description
  ======================================================= */

  const descriptionParts: string[] =
    [];

  if (jobsSearch) {
    if (
      searchTerm &&
      cityName
    ) {
      descriptionParts.push(
        `Find ${searchTerm} jobs in ${cityName} on DealUp Marketplace.`,
      );
    }

    else if (
      searchTerm
    ) {
      descriptionParts.push(
        `Find ${searchTerm} job opportunities on DealUp Marketplace.`,
      );
    }

    else if (
      cityName
    ) {
      descriptionParts.push(
        `Browse job opportunities in ${cityName} on DealUp Marketplace.`,
      );
    }

    else {
      descriptionParts.push(
        "Browse active job opportunities from employers on DealUp Marketplace.",
      );
    }

    descriptionParts.push(
      "Discover local jobs, hiring opportunities and career openings.",
    );
  }

  else {
    if (
      searchTerm &&
      categorySlug
    ) {
      descriptionParts.push(
        `Find ${searchTerm} for sale in ${categorySlug} on DealUp Marketplace.`,
      );
    }

    else if (
      searchTerm
    ) {
      descriptionParts.push(
        `Find ${searchTerm} for sale on DealUp Marketplace.`,
      );
    }

    else if (
      categorySlug
    ) {
      descriptionParts.push(
        `Browse ${categorySlug} listings on DealUp Marketplace.`,
      );
    }

    else {
      descriptionParts.push(
        "Search new and used products for sale on DealUp Marketplace.",
      );
    }

    if (
      cityName
    ) {
      descriptionParts.push(
        `Discover listings from sellers in ${cityName}.`,
      );
    }

    descriptionParts.push(
      "Buy and sell locally with DealUp Marketplace.",
    );
  }

  const description =
    descriptionParts
      .join(" ")
      .slice(0, 160);

  /* =======================================================
     SEO No Index
  ======================================================= */

  const hasNoIndexFilter =
    Boolean(condition) ||
    Boolean(maxPrice) ||
    Boolean(radius) ||
    Boolean(lat) ||
    Boolean(lng) ||
    nearby === "true" ||
    featured === "true" ||
    latest === "true" ||
    Boolean(sort) ||
    Boolean(
      page &&
        page !== "1",
    );

  /* =======================================================
     Canonical
  ======================================================= */

  const canonicalParams =
    new URLSearchParams();

  if (
    searchTerm
  ) {
    canonicalParams.set(
      "q",
      searchTerm,
    );
  }

  if (
    categorySlug
  ) {
    canonicalParams.set(
      "category",
      categorySlug,
    );
  }

  if (
    cityName
  ) {
    canonicalParams.set(
      "city",
      cityName,
    );
  }

  const queryString =
    canonicalParams.toString();

  const canonicalUrl =
    queryString
      ? `https://www.dealupmarketplace.com/search?${queryString}`
      : "https://www.dealupmarketplace.com/search";

  const shouldIndex =
    !hasNoIndexFilter;

  return {
    title,

    description,

    alternates: {
      canonical:
        canonicalUrl,
    },

    robots: {
      index:
        shouldIndex,

      follow: true,

      googleBot: {
        index:
          shouldIndex,

        follow: true,
      },
    },

    openGraph: {
      type: "website",

      url:
        canonicalUrl,

      siteName:
        "DealUp Marketplace",

      locale:
        "en_IN",

      title,

      description,
    },

    twitter: {
      card:
        "summary_large_image",

      title,

      description,
    },
  };
}

/* =========================================================
   Job Empty State
========================================================= */

function JobEmptyState({
  keyword,
  city,
}: {
  keyword?: string;

  city?: string;
}) {
  const searchLabel =
    keyword?.trim()
      ? `"${keyword.trim()}"`
      : "your search";

  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-8
        text-center
        shadow-sm

        sm:p-12

        dark:border-white/10
        dark:bg-[#0d1b2a]
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-blue-50
          text-[#1565d8]

          dark:bg-blue-500/10
          dark:text-blue-300
        "
      >
        <SearchX
          className="h-7 w-7"
        />
      </div>

      <h2
        className="
          mt-5
          text-xl
          font-bold
          text-slate-900

          dark:text-white
        "
      >
        No jobs found
      </h2>

      <p
        className="
          mx-auto
          mt-2
          max-w-lg
          text-sm
          leading-6
          text-slate-600

          dark:text-slate-300
        "
      >
        We could not find active
        job opportunities for{" "}
        {searchLabel}
        {city?.trim()
          ? ` in ${city.trim()}`
          : ""}
        . Try a different job
        title, company name or
        location.
      </p>
    </div>
  );
}

/* =========================================================
   Job Search Header
========================================================= */

function JobSearchHeader({
  keyword,
  city,
  total,
}: {
  keyword?: string;

  city?: string;

  total: number;
}) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm

        sm:p-6

        dark:border-white/10
        dark:bg-[#0d1b2a]
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            flex
            min-w-0
            items-start
            gap-3
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-blue-50
              text-[#1565d8]

              dark:bg-blue-500/10
              dark:text-blue-300
            "
          >
            <BriefcaseBusiness
              className="h-5 w-5"
            />
          </div>

          <div
            className="min-w-0"
          >
            <h1
              className="
                text-2xl
                font-bold
                tracking-tight
                text-slate-900

                dark:text-white

                sm:text-3xl
              "
            >
              Job Search
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-slate-500

                dark:text-slate-400
              "
            >
              {keyword?.trim()
                ? `Showing jobs matching "${keyword.trim()}"`
                : "Browse active job opportunities"}

              {city?.trim()
                ? ` in ${city.trim()}`
                : ""}
            </p>
          </div>
        </div>

        <div
          className="
            shrink-0
            rounded-2xl
            bg-slate-50
            px-4
            py-3
            text-center

            dark:bg-white/5
          "
        >
          <div
            className="
              text-xl
              font-bold
              text-slate-900

              dark:text-white
            "
          >
            {total.toLocaleString(
              "en-IN",
            )}
          </div>

          <div
            className="
              text-xs
              font-medium
              text-slate-500

              dark:text-slate-400
            "
          >
            {total === 1
              ? "Job found"
              : "Jobs found"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Job Pagination
========================================================= */

function JobPagination({
  currentPage,
  totalPages,
  totalJobs,
  searchParams,
}: {
  currentPage: number;

  totalPages: number;

  totalJobs: number;

  searchParams: Record<
    string,
    string | undefined
  >;
}) {
  if (
    totalPages <= 1
  ) {
    return null;
  }

  const buildHref = (
    targetPage: number,
  ) => {
    const params =
      new URLSearchParams();

    Object.entries(
      searchParams,
    ).forEach(
      ([key, value]) => {
        if (value) {
          params.set(
            key,
            value,
          );
        }
      },
    );

    if (
      targetPage > 1
    ) {
      params.set(
        "page",
        String(targetPage),
      );
    } else {
      params.delete(
        "page",
      );
    }

    return `/search?${params.toString()}`;
  };

  const start =
    (currentPage - 1) *
      20 +
    1;

  const end =
    Math.min(
      currentPage * 20,
      totalJobs,
    );

  const visiblePages =
    new Set<number>([
      1,

      totalPages,

      currentPage,

      currentPage - 1,

      currentPage + 1,
    ]);

  const pages =
    Array.from(
      visiblePages,
    )
      .filter(
        (value) =>
          value >= 1 &&
          value <= totalPages,
      )
      .sort(
        (a, b) =>
          a - b,
      );

  return (
    <div
      className="
        mt-8
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm

        sm:p-5

        dark:border-white/10
        dark:bg-[#0d1b2a]
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <p
          className="
            text-sm
            text-slate-500

            dark:text-slate-400
          "
        >
          Showing{" "}

          <span
            className="
              font-semibold
              text-slate-800

              dark:text-slate-200
            "
          >
            {start}–{end}
          </span>

          {" "}of{" "}

          <span
            className="
              font-semibold
              text-slate-800

              dark:text-slate-200
            "
          >
            {totalJobs.toLocaleString(
              "en-IN",
            )}
          </span>

          {" "}

          {totalJobs === 1
            ? "job"
            : "jobs"}
        </p>

        <div
          className="
            flex
            items-center
            justify-center
            gap-1
          "
        >
          {/* Previous */}

          {currentPage > 1 ? (
            <a
              href={buildHref(
                currentPage - 1,
              )}
              className="
                inline-flex
                h-10
                items-center
                gap-1
                rounded-xl
                border
                border-slate-200
                px-3
                text-sm
                font-semibold
                text-slate-700
                transition

                hover:border-[#1565d8]/30
                hover:bg-blue-50
                hover:text-[#1565d8]

                dark:border-white/10
                dark:text-slate-200
                dark:hover:bg-white/5
              "
            >
              <ChevronLeft
                className="h-4 w-4"
              />

              <span
                className="hidden sm:inline"
              >
                Previous
              </span>
            </a>
          ) : (
            <span
              className="
                inline-flex
                h-10
                items-center
                gap-1
                rounded-xl
                border
                border-slate-100
                px-3
                text-sm
                font-semibold
                text-slate-300

                dark:border-white/5
                dark:text-slate-600
              "
            >
              <ChevronLeft
                className="h-4 w-4"
              />

              <span
                className="hidden sm:inline"
              >
                Previous
              </span>
            </span>
          )}

          {/* Page Numbers */}

          {pages.map(
            (
              pageNumber,
              index,
            ) => {
              const previous =
                pages[
                  index - 1
                ];

              const needsGap =
                previous !==
                  undefined &&
                pageNumber -
                  previous >
                  1;

              return (
                <span
                  key={
                    pageNumber
                  }
                  className="
                    flex
                    items-center
                    gap-1
                  "
                >
                  {needsGap && (
                    <span
                      className="
                        px-1
                        text-slate-400
                      "
                    >
                      …
                    </span>
                  )}

                  <a
                    href={buildHref(
                      pageNumber,
                    )}
                    aria-current={
                      pageNumber ===
                      currentPage
                        ? "page"
                        : undefined
                    }
                    className={
                      pageNumber ===
                      currentPage
                        ? `
                          inline-flex
                          h-10
                          min-w-10
                          items-center
                          justify-center
                          rounded-xl
                          bg-[#1565d8]
                          px-3
                          text-sm
                          font-bold
                          text-white
                          shadow-sm
                        `
                        : `
                          inline-flex
                          h-10
                          min-w-10
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-slate-200
                          px-3
                          text-sm
                          font-semibold
                          text-slate-700
                          transition

                          hover:border-[#1565d8]/30
                          hover:bg-blue-50
                          hover:text-[#1565d8]

                          dark:border-white/10
                          dark:text-slate-200
                          dark:hover:bg-white/5
                        `
                    }
                  >
                    {pageNumber}
                  </a>
                </span>
              );
            },
          )}

          {/* Next */}

          {currentPage <
          totalPages ? (
            <a
              href={buildHref(
                currentPage + 1,
              )}
              className="
                inline-flex
                h-10
                items-center
                gap-1
                rounded-xl
                border
                border-slate-200
                px-3
                text-sm
                font-semibold
                text-slate-700
                transition

                hover:border-[#1565d8]/30
                hover:bg-blue-50
                hover:text-[#1565d8]

                dark:border-white/10
                dark:text-slate-200
                dark:hover:bg-white/5
              "
            >
              <span
                className="hidden sm:inline"
              >
                Next
              </span>

              <ChevronRight
                className="h-4 w-4"
              />
            </a>
          ) : (
            <span
              className="
                inline-flex
                h-10
                items-center
                gap-1
                rounded-xl
                border
                border-slate-100
                px-3
                text-sm
                font-semibold
                text-slate-300

                dark:border-white/5
                dark:text-slate-600
              "
            >
              <span
                className="hidden sm:inline"
              >
                Next
              </span>

              <ChevronRight
                className="h-4 w-4"
              />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Search Page
========================================================= */

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const {
    q,
    category,
    city,
    sort,
    condition,
    maxPrice,
    radius,
    lat,
    lng,
    nearby,
    featured,
    latest,
    page,
  } = await searchParams;

  /* =======================================================
     Categories
  ======================================================= */

  const categories =
    await findCategoryTree();

  const serializedCategories =
    serializeCategoryTree(
      categories,
    );

  /* =======================================================
     Search Type
  ======================================================= */

  const jobsSearch =
    isJobsCategory(
      category,
    );

  /* =======================================================
     Pagination
  ======================================================= */

  const currentRequestedPage =
    Math.max(
      1,
      Number(
        page ?? 1,
      ),
    );

  /* =======================================================
     State
  ======================================================= */

  let products: any[] =
    [];

  let jobs: Job[] =
    [];

  let currentPage =
    1;

  let totalPages =
    1;

  let totalProducts =
    0;

  let totalJobs =
    0;

  /* =======================================================
     Search
  ======================================================= */

  try {
    /* =====================================================
       JOB SEARCH
    ===================================================== */

    if (
      jobsSearch
    ) {
      const result =
        await searchJobsPage({
          query:
            q ?? "",

          category,

          city,

          page:
            currentRequestedPage,

          limit: 20,
        });

      jobs =
        result.jobs as Job[];

      currentPage =
        result.page;

      totalPages =
        result.totalPages;

      totalJobs =
        result.total;
    }

    /* =====================================================
       NEARBY PRODUCT SEARCH
    ===================================================== */

    else if (
      nearby ===
        "true" &&
      lat &&
      lng
    ) {
      products =
        await searchNearbyProducts(
          {
            keyword:
              q ?? "",

            category,

            sort,

            condition,

            maxPrice,

            lat:
              Number(lat),

            lng:
              Number(lng),

            radius:
              Number(
                radius ?? 10,
              ),
          },
        );

      currentPage =
        1;

      totalPages =
        1;

      totalProducts =
        products.length;
    }

    /* =====================================================
       NORMAL PRODUCT SEARCH
    ===================================================== */

    else {
      const result =
        await searchProductsPage(
          {
            keyword:
              q ?? "",

            category,

            city,

            sort,

            condition,

            maxPrice,

            featured:
              featured ===
              "true",

            latest:
              latest ===
              "true",

            page:
              currentRequestedPage,
          },
        );

      products =
        result.products;

      currentPage =
        result.currentPage;

      totalPages =
        result.totalPages;

      totalProducts =
        result.totalProducts;
    }
  }

  /* =======================================================
     Error
  ======================================================= */

  catch (error) {
    console.error(
      "SEARCH PAGE ERROR:",
      error,
    );

    products =
      [];

    jobs =
      [];

    currentPage =
      1;

    totalPages =
      1;

    totalProducts =
      0;

    totalJobs =
      0;
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      className="
        mx-auto
        w-full
        max-w-7xl
        px-4
        py-8

        sm:px-6
        sm:py-10

        lg:px-8
      "
    >

      {/* =================================================
          Breadcrumb
      ================================================= */}

      <SearchBreadcrumb
        keyword={q}
        category={category}
      />

      {/* =================================================
          Header
      ================================================= */}

      {jobsSearch ? (
        <JobSearchHeader
          keyword={q}
          city={city}
          total={totalJobs}
        />
      ) : (
        <SearchHeader
          keyword={q}
          category={category}
          city={city}
          total={totalProducts}
          sort={sort}
        />
      )}

      {/* =================================================
          Main Layout
      ================================================= */}

      <div
        className="
          mt-8
          grid
          grid-cols-1
          gap-8

          lg:mt-10
          lg:grid-cols-12
        "
      >

        {/* =================================================
            Product Sidebar
        ================================================= */}

        {!jobsSearch && (
          <aside
            className="
              hidden

              lg:col-span-3
              lg:block

              xl:col-span-3
            "
          >
            <SearchFilter
              categories={
                serializedCategories
              }
              radius={
                Number(
                  radius ?? 10,
                )
              }
            />
          </aside>
        )}

        {/* =================================================
            Results
        ================================================= */}

        <section
          className={
            jobsSearch
              ? `
                col-span-1
                lg:col-span-12
              `
              : `
                col-span-1
                lg:col-span-9
                xl:col-span-9
              `
          }
        >

          {/* =================================================
              Mobile Product Filter
          ================================================= */}

          {!jobsSearch && (
            <MobileFilterButton
              categories={
                serializedCategories
              }
              radius={
                Number(
                  radius ?? 10,
                )
              }
            />
          )}

          {/* =================================================
              JOB RESULTS
          ================================================= */}

          {jobsSearch ? (
            jobs.length ===
            0 ? (
              <JobEmptyState
                keyword={q}
                city={city}
              />
            ) : (
              <>
                <div
                  className="
                    space-y-5
                  "
                >
                  {jobs.map(
                    (
                      job,
                    ) => (
                      <SearchJobCard
                        key={String(
                          job._id,
                        )}
                        job={job}
                      />
                    ),
                  )}
                </div>

                <JobPagination
                  currentPage={
                    currentPage
                  }
                  totalPages={
                    totalPages
                  }
                  totalJobs={
                    totalJobs
                  }
                  searchParams={{
                    q,
                    category,
                    city,
                  }}
                />
              </>
            )
          ) : (

            /* =================================================
               PRODUCT RESULTS
            ================================================= */

            products.length ===
            0 ? (
              <EmptySearchState
                keyword={q}
                category={
                  category
                }
              />
            ) : (
              <>
                <div
                  className="
                    space-y-6
                  "
                >
                  {products.map(
                    (
                      product,
                    ) => (
                      <SearchResultCard
                        key={String(
                          product._id,
                        )}
                        product={
                          product
                        }
                      />
                    ),
                  )}
                </div>

                {/* Product Pagination */}

                {totalPages >
                  1 && (
                  <SearchPagination
                    currentPage={
                      currentPage
                    }
                    totalPages={
                      totalPages
                    }
                    totalProducts={
                      totalProducts
                    }
                    searchParams={{
                      q,
                      category,
                      city,
                      sort,
                      condition,
                      maxPrice,
                      radius,
                      lat,
                      lng,
                      nearby,
                      featured,
                      latest,
                    }}
                  />
                )}
              </>
            )
          )}
        </section>
      </div>
    </main>
  );
}