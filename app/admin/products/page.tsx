import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Eye, MapPin, Package, Star, Crown } from "lucide-react";

import { auth } from "@/auth";

import {
  findAllAdminProducts,
  getProductStatistics,
} from "@/lib/repositories/admin-product.repository";

interface PageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  // =====================================================
  // Authentication
  // =====================================================

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // =====================================================
  // Admin Authorization
  // =====================================================

  if (session.user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl dark:border-red-900 dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl dark:bg-red-950">
            🚫
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
            Access Denied
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Administrator access is required to manage products.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white"
          >
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  // =====================================================
  // Search
  // =====================================================

  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search.trim() : "";

  // =====================================================
  // Database
  // =====================================================

  const [products, statistics] = await Promise.all([
    findAllAdminProducts({
      search,
      limit: 50,
    }),

    getProductStatistics(),
  ]);

  // =====================================================
  // Page
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        {/* =================================================
            Header
        ================================================= */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1565d8] hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Admin Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              Products Management
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage DealUp product listings and monitor their status.
            </p>
          </div>
        </div>

        {/* =================================================
            Statistics
        ================================================= */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="📦"
            title="Total Products"
            value={statistics.totalProducts}
          />

          <StatCard
            icon="🟢"
            title="Active Products"
            value={statistics.activeProducts}
          />

          <StatCard
            icon="⭐"
            title="Featured Products"
            value={statistics.featuredProducts}
          />

          <StatCard
            icon="👑"
            title="Premium Products"
            value={statistics.premiumProducts}
          />
        </div>

        {/* =================================================
            Search
        ================================================= */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <form method="GET" className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search product, seller, category or city..."
              className="
                h-12
                flex-1
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                text-sm
                outline-none
                transition
                focus:border-[#1565d8]
                focus:ring-2
                focus:ring-blue-100
                dark:border-slate-700
                dark:bg-slate-800
                dark:text-white
                dark:focus:ring-blue-950
              "
            />

            <button
              type="submit"
              className="
                h-12
                rounded-xl
                bg-[#1565d8]
                px-6
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#0f52ba]
              "
            >
              🔍 Search
            </button>

            {search && (
              <Link
                href="/admin/products"
                className="
                  flex
                  h-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-300
                  px-5
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-100
                  dark:border-slate-700
                  dark:text-slate-200
                  dark:hover:bg-slate-800
                "
              >
                Clear
              </Link>
            )}
          </form>
        </section>

        {/* =================================================
            Results Header
        ================================================= */}

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {search ? "Search Results" : "All Products"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {products.length} product
              {products.length === 1 ? "" : "s"} displayed
            </p>
          </div>
        </div>

        {/* =================================================
            Product Table
        ================================================= */}

        <section className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {products.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-5xl">📦</div>

              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                No products found
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try a different product, seller or location.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                {/* =================================================
                    Header
                ================================================= */}

                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Seller
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Location
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Views
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* =================================================
                    Body
                ================================================= */}

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products.map((product: any) => {
                    const productImage =
                      product.thumbnail ?? product.images?.[0] ?? "";

                    const location = product.location?.city ?? "Unknown";

                    const status =
                      product.status ??
                      (product.isActive === false ? "inactive" : "active");

                    return (
                      <tr
                        key={product._id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        {/* Product */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={product.title ?? "Product"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package size={26} className="text-slate-400" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[260px] truncate font-semibold text-slate-900 dark:text-white">
                                {product.title ?? "Untitled Product"}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-2">
                                {product.categoryName && (
                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {product.categoryName}
                                  </span>
                                )}

                                {product.isFeatured && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-[11px] font-bold text-yellow-700">
                                    <Star size={11} fill="currentColor" />
                                    Featured
                                  </span>
                                )}

                                {product.isPremium && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-700">
                                    <Crown size={11} />
                                    Premium
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Seller */}

                        <td className="px-6 py-5">
                          <p className="max-w-[180px] truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {product.sellerName ?? "Seller"}
                          </p>

                          <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                            {product.sellerId ?? "Unknown seller"}
                          </p>
                        </td>

                        {/* Price */}

                        <td className="px-6 py-5">
                          <p className="font-bold text-[#1565d8]">
                            ₹{" "}
                            {Number(product.price ?? 0).toLocaleString("en-IN")}
                          </p>

                          {product.negotiable && (
                            <p className="mt-1 text-xs font-medium text-green-600">
                              Negotiable
                            </p>
                          )}
                        </td>

                        {/* Location */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <MapPin size={16} className="text-slate-400" />

                            <span>{location}</span>
                          </div>
                        </td>

                        {/* Views */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <Eye size={16} className="text-slate-400" />

                            {Number(product.views ?? 0).toLocaleString("en-IN")}
                          </div>
                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">
                          <ProductStatusBadge status={status} />
                        </td>

                        {/* Action */}

                        <td className="px-6 py-5 text-right">
                          {product.slug ? (
                            <Link
                              href={`/products/${product.slug}`}
                              target="_blank"
                              className="
                                  inline-flex
                                  items-center
                                  rounded-xl
                                  bg-blue-50
                                  px-4
                                  py-2.5
                                  text-sm
                                  font-semibold
                                  text-[#1565d8]
                                  transition
                                  hover:bg-blue-100
                                  dark:bg-blue-950/40
                                  dark:text-blue-300
                                  dark:hover:bg-blue-950
                                "
                            >
                              View →
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No slug
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// =====================================================
// Statistics Card
// =====================================================

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="text-3xl">{icon}</div>

        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
        {title}
      </p>
    </div>
  );
}

// =====================================================
// Product Status Badge
// =====================================================

function ProductStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const config: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    active: {
      label: "Active",
      className: "bg-green-100 text-green-700",
    },

    inactive: {
      label: "Inactive",
      className: "bg-slate-100 text-slate-600",
    },

    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700",
    },

    sold: {
      label: "Sold",
      className: "bg-blue-100 text-blue-700",
    },

    rejected: {
      label: "Rejected",
      className: "bg-red-100 text-red-700",
    },
  };

  const current = config[normalized] ?? config.active;

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}
