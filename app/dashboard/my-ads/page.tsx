import Link from "next/link";

import { auth } from "@/auth";

import { findProductsBySeller } from "@/lib/repositories/product.repository";

import MyProductCard from "@/components/dashboard/MyProductCard";

export default async function MyAdsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-7xl p-10">
        <h1 className="text-3xl font-bold">Unauthorized</h1>
      </main>
    );
  }

  const products = await findProductsBySeller(session.user.id);

  console.log(products);

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white dark:text-white">My Ads</h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Manage all your published products.
            </p>
          </div>

          <Link
            href="/sell"
            className="rounded-2xl bg-[#1565d8] px-6 py-3 font-semibold text-white transition hover:bg-[#0f52ba]"
          >
            + Sell New Product
          </Link>
        </div>
        {/* Empty State */}

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white dark:bg-slate-900 py-24 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">
              No Products Yet
            </h2>

            <p className="mt-4 text-slate-500 dark:text-slate-400">
              You haven't published any products yet.
            </p>

            <Link
              href="/sell"
              className="mt-8 inline-flex rounded-2xl bg-[#1565d8] px-8 py-4 font-semibold text-white transition hover:bg-[#0f52ba]"
            >
              Publish Your First Product
            </Link>
          </div>
        ) : (
          <>
            {/* Summary */}

            <div className="mb-8 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white dark:text-white">
                Total Products
              </h2>

              <p className="mt-2 text-4xl font-extrabold text-[#1565d8]">
                {products.length}
              </p>
            </div>

            {/* Products Grid */}

            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <MyProductCard
                  key={product._id.toString()}
                  id={product._id.toString()}
                  slug={product.slug}
                  title={product.title}
                  price={product.price}
                  image={product.thumbnail}
                  location={product.location.city}
                  views={product.views}
                  favorites={product.favorites}
                  chatCount={product.chatCount}
                  status={product.status}
                  isBoosted={product.isBoosted}
                  boostedUntil={product.boostedUntil}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
