import {
  searchNearbyProducts,
  searchProductsPage,
} from "@/lib/repositories/product.repository";

import SearchPagination from "@/components/search/SearchPagination";

import { findCategoryTree } from "@/lib/repositories/category.repository";
import { serializeCategoryTree } from "@/lib/serializers/category.serializer";

import SearchBreadcrumb from "@/components/search/SearchBreadcrumb";

import SearchResultCard from "@/components/search/SearchResultCard";
import EmptySearchState from "@/components/search/EmptySearchState";
import SearchFilter from "@/components/search/SearchFilter";
import SearchHeader from "@/components/search/SearchHeader";
import MobileFilterButton from "@/components/search/MobileFilterButton";

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

  // =====================================================
  // Categories
  // =====================================================

  const categories = await findCategoryTree();

  const serializedCategories =
    serializeCategoryTree(categories);

  // =====================================================
  // Default Search State
  // =====================================================

  let products: any[] = [];

  let currentPage = 1;

  let totalPages = 1;

  let totalProducts = 0;

  // =====================================================
  // Page Number
  // =====================================================

  const currentRequestedPage = Math.max(
    1,
    Number(page ?? 1),
  );

  // =====================================================
  // Nearby Search
  // =====================================================

  try {
    if (
      nearby === "true" &&
      lat &&
      lng
    ) {
      products = await searchNearbyProducts({
        keyword: q ?? "",
        category,
        sort,
        condition,
        maxPrice,
        lat: Number(lat),
        lng: Number(lng),
        radius: Number(radius ?? 10),
      });

      currentPage = 1;
      totalPages = 1;
      totalProducts = products.length;
    } else {
      // =================================================
      // Normal / Featured / Latest Search
      // =================================================

      const searchResult =
        await searchProductsPage({
          keyword: q ?? "",
          category,
          city,
          sort,
          condition,
          maxPrice,
          featured: featured === "true",
          latest: latest === "true",
          page: currentRequestedPage,
        });

      products = searchResult.products;

      currentPage =
        searchResult.currentPage;

      totalPages =
        searchResult.totalPages;

      totalProducts =
        searchResult.totalProducts;
    }
  } catch (error) {
    console.error(
      "SEARCH PAGE ERROR:",
      error,
    );

    products = [];

    currentPage = 1;

    totalPages = 1;

    totalProducts = 0;
  }

  // =====================================================
  // UI
  // =====================================================

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

      <SearchHeader
        keyword={q}
        category={category}
        city={city}
        total={totalProducts}
        sort={sort}
      />

      {/* =================================================
          Main Content
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
            Desktop Sidebar
            ================================================= */}

        <aside
          className="
            hidden
            lg:col-span-3
            lg:block
            xl:col-span-3
          "
        >
          <SearchFilter
            categories={serializedCategories}
            radius={Number(radius ?? 10)}
          />
        </aside>

        {/* =================================================
            Results
            ================================================= */}

        <section
          className="
            col-span-1
            lg:col-span-9
            xl:col-span-9
          "
        >
          {/* =================================================
              Mobile Filter
              ================================================= */}

          <MobileFilterButton
            categories={serializedCategories}
            radius={Number(radius ?? 10)}
          />

          {/* =================================================
              Empty State
              ================================================= */}

          {products.length === 0 ? (
            <EmptySearchState
              keyword={q}
              category={category}
            />
          ) : (
            <>
              {/* =================================================
                  Product Results
                  ================================================= */}

              <div className="space-y-6">
                {products.map((product) => (
                  <SearchResultCard
                    key={String(product._id)}
                    product={product}
                  />
                ))}
              </div>

              {/* =================================================
                  Pagination
                  ================================================= */}

              {totalPages > 1 && (
                <SearchPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalProducts={totalProducts}
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
          )}
        </section>
      </div>
    </main>
  );
}