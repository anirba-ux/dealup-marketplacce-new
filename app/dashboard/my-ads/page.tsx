import Link from "next/link";

import { auth } from "@/auth";

import {
  findProductsBySeller,
} from "@/lib/repositories/product.repository";

import {
  getPremiumSellerStatus,
} from "@/lib/repositories/premium.repository";

import MyProductCard from "@/components/dashboard/MyProductCard";

export default async function MyAdsPage() {
  // ===================================================
  // Authentication
  // ===================================================

  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-7xl p-10">
        <h1 className="text-3xl font-bold">
          Unauthorized
        </h1>
      </main>
    );
  }

  // ===================================================
  // Seller ID
  // ===================================================

  const sellerId = String(
    session.user.id,
  );

  // ===================================================
  // Load Products + Premium Status
  // ===================================================

  const [
    products,
    premiumSeller,
  ] = await Promise.all([
    findProductsBySeller(sellerId),

    getPremiumSellerStatus(
      sellerId,
    ),
  ]);

  // ===================================================
  // Premium Promotion Usage
  // ===================================================

  const isPremium =
    premiumSeller?.active === true;

  const featuredAdsLimit =
    premiumSeller?.featuredAdsLimit ?? 0;

  const featuredAdsUsed =
    premiumSeller?.featuredAdsUsed ?? 0;

  const featuredAdsRemaining =
    Math.max(
      0,
      featuredAdsLimit -
        featuredAdsUsed,
    );

  const boostAdsLimit =
    premiumSeller?.boostAdsLimit ?? 0;

  const boostAdsUsed =
    premiumSeller?.boostAdsUsed ?? 0;

  const boostAdsRemaining =
    Math.max(
      0,
      boostAdsLimit -
        boostAdsUsed,
    );

  // ===================================================
  // Render
  // ===================================================

  return (
    <main className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-10 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
              My Ads
            </h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Manage all your published products.
            </p>
          </div>

          <Link
            href="/sell"
            className="
              rounded-2xl
              bg-[#1565d8]
              px-6
              py-3
              font-semibold
              text-white
              transition
              hover:bg-[#0f52ba]
            "
          >
            + Sell New Product
          </Link>
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {products.length === 0 ? (
          <div
            className="
              rounded-3xl
              border
              border-dashed
              border-slate-300
              bg-white
              py-24
              text-center
              dark:border-slate-700
              dark:bg-slate-900
            "
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              No Products Yet
            </h2>

            <p className="mt-4 text-slate-500 dark:text-slate-400">
              You haven't published any products yet.
            </p>

            <Link
              href="/sell"
              className="
                mt-8
                inline-flex
                rounded-2xl
                bg-[#1565d8]
                px-8
                py-4
                font-semibold
                text-white
                transition
                hover:bg-[#0f52ba]
              "
            >
              Publish Your First Product
            </Link>
          </div>
        ) : (
          <>
            {/* =================================================
                TOTAL PRODUCTS
            ================================================= */}

            <div
              className="
                mb-8
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Total Products
              </h2>

              <p className="mt-2 text-4xl font-extrabold text-[#1565d8]">
                {products.length}
              </p>
            </div>

            {/* =================================================
                PREMIUM PROMOTION USAGE
            ================================================= */}

            {isPremium && (
              <div
                className="
                  mb-8
                  rounded-3xl
                  border
                  border-blue-100
                  bg-white
                  p-6
                  shadow-sm
                  dark:border-blue-900
                  dark:bg-slate-900
                "
              >
                {/* Header */}

                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                        text-xl
                        dark:bg-blue-950
                      "
                    >
                      ✨
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Premium Promotion Usage
                      </h2>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {premiumSeller?.plan
                          ? `${premiumSeller.plan
                              .charAt(0)
                              .toUpperCase()}${premiumSeller.plan.slice(
                              1,
                            )} Plan`
                          : "Premium Seller"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usage Cards */}

                <div className="grid gap-5 md:grid-cols-2">

                  {/* =================================================
                      BOOST USAGE
                  ================================================= */}

                  <div
                    className="
                      rounded-2xl
                      border
                      border-amber-200
                      bg-amber-50
                      p-5
                      dark:border-amber-900
                      dark:bg-amber-950/30
                    "
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-amber-100
                            text-xl
                            dark:bg-amber-900
                          "
                        >
                          🚀
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">
                            Boost Ads
                          </h3>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Free quota
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">

                      <div className="rounded-xl bg-white p-3 text-center dark:bg-slate-900">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Used
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                          {boostAdsUsed}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3 text-center dark:bg-slate-900">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Remaining
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-green-600">
                          {boostAdsRemaining}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3 text-center dark:bg-slate-900">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Total
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                          {boostAdsLimit}
                        </p>
                      </div>

                    </div>

                    {/* Progress */}

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          Usage
                        </span>

                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {boostAdsUsed} / {boostAdsLimit}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all"
                          style={{
                            width:
                              boostAdsLimit > 0
                                ? `${Math.min(
                                    100,
                                    (boostAdsUsed /
                                      boostAdsLimit) *
                                      100,
                                  )}%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      FEATURED USAGE
                  ================================================= */}

                  <div
                    className="
                      rounded-2xl
                      border
                      border-blue-200
                      bg-blue-50
                      p-5
                      dark:border-blue-900
                      dark:bg-blue-950/30
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-xl
                          bg-blue-100
                          text-xl
                          dark:bg-blue-900
                        "
                      >
                        ⭐
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          Featured Ads
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Free quota
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">

                      <div className="rounded-xl bg-white p-3 text-center dark:bg-slate-900">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Used
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                          {featuredAdsUsed}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3 text-center dark:bg-slate-900">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Remaining
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-green-600">
                          {featuredAdsRemaining}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3 text-center dark:bg-slate-900">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Total
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                          {featuredAdsLimit}
                        </p>
                      </div>

                    </div>

                    {/* Progress */}

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          Usage
                        </span>

                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {featuredAdsUsed} / {featuredAdsLimit}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900">
                        <div
                          className="h-full rounded-full bg-[#1565d8] transition-all"
                          style={{
                            width:
                              featuredAdsLimit > 0
                                ? `${Math.min(
                                    100,
                                    (featuredAdsUsed /
                                      featuredAdsLimit) *
                                      100,
                                  )}%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* =================================================
                    QUOTA EXHAUSTED MESSAGE
                ================================================= */}

                {(boostAdsRemaining === 0 ||
                  featuredAdsRemaining === 0) && (
                  <div
                    className="
                      mt-5
                      rounded-2xl
                      border
                      border-orange-200
                      bg-orange-50
                      p-4
                      text-sm
                      text-orange-800
                      dark:border-orange-900
                      dark:bg-orange-950/30
                      dark:text-orange-300
                    "
                  >
                    <p className="font-semibold">
                      Some free promotion quota has been exhausted.
                    </p>

                    <p className="mt-1">
                      You can continue using paid promotion
                      after your free quota is finished.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                NORMAL SELLER MESSAGE
            ================================================= */}

            {!isPremium && (
              <div
                className="
                  mb-8
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  shadow-sm
                  dark:border-slate-700
                  dark:bg-slate-900
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      bg-slate-100
                      text-xl
                      dark:bg-slate-800
                    "
                  >
                    🚀
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">
                      Promote Your Ads
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Boost and Featured Ads are available
                      with paid promotion.
                    </p>
                  </div>

                  <Link
                    href="/dashboard/premium"
                    className="
                      ml-auto
                      rounded-xl
                      bg-[#1565d8]
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-[#0f52ba]
                    "
                  >
                    Go Premium
                  </Link>
                </div>
              </div>
            )}

            {/* =================================================
                PRODUCTS GRID
            ================================================= */}

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
                  isFeatured={product.isFeatured}
                  featuredUntil={product.featuredUntil}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}