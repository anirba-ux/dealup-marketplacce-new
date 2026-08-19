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
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
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
    page,
  } = await searchParams;

  const categories = await findCategoryTree();

  const serializedCategories = serializeCategoryTree(categories);

  let products: any[] = [];

  let currentPage = 1;

  let totalPages = 1;

  let totalProducts = 0;

  try {
    if (nearby === "true" && lat && lng) {
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
    } else {
      const searchResult = await searchProductsPage({
        keyword: q ?? "",
        category,
        sort,
        condition,
        maxPrice,
        page: Number(page ?? 1),
      });

      products = searchResult.products;

      currentPage = searchResult.currentPage;

      totalPages = searchResult.totalPages;

      totalProducts = searchResult.totalProducts;
    }
  } catch (error) {
    console.error("Search Error:", error);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <SearchBreadcrumb keyword={q} category={category} />

      <SearchHeader
        keyword={q}
        category={category}
        city={city}
        total={products.length}
        sort={sort}
      />

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar */}

        <div
          className="
    hidden
    lg:block
    lg:col-span-3
    xl:col-span-3
  "
        >
          <SearchFilter
            categories={serializedCategories}
            radius={Number(radius ?? 10)}
          />
        </div>

        {/* Results */}

        <div
          className="
    col-span-1
    lg:col-span-9
    xl:col-span-9
  "
        >
          <MobileFilterButton
            categories={serializedCategories}
            radius={Number(radius ?? 10)}
          />

          {products.length === 0 ? (
            <EmptySearchState keyword={q} category={category} />
          ) : (
            <>
              <div className="space-y-6">
                {products.map((product) => (
                  <SearchResultCard
                    key={product._id?.toString()}
                    product={product}
                  />
                ))}
              </div>

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
                }}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
