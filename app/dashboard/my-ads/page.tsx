import Link from "next/link";
import { Home, Plus } from "lucide-react";

import { auth } from "@/auth";

import {
  findProductsBySeller,
} from "@/lib/repositories/product.repository";

import {
  getPremiumSellerStatus,
} from "@/lib/repositories/premium.repository";

import MyProductCard from "@/components/dashboard/MyProductCard";
import BackButton from "@/components/ui/BackButton";

export default async function MyAdsPage() {
  // =========================================================
  // Authentication
  // =========================================================

  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl">
          <div
            className="
              rounded-2xl border border-red-200 bg-white p-8
              text-center shadow-sm
              dark:border-red-900 dark:bg-slate-900
            "
          >
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Unauthorized
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Please login to access your ads.
            </p>

            <Link
              href="/login"
              className="
                mt-6 inline-flex items-center justify-center
                rounded-xl bg-[#1565d8] px-6 py-3
                text-sm font-semibold text-white
                transition-all duration-200
                hover:bg-[#0f52ba]
                active:scale-95
              "
            >
              Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // Seller ID
  // =========================================================

  const sellerId = String(session.user.id);

  // =========================================================
  // Load Products + Premium Status
  // =========================================================

  const [products, premiumSeller] = await Promise.all([
    findProductsBySeller(sellerId),
    getPremiumSellerStatus(sellerId),
  ]);

  // =========================================================
  // Premium Promotion Usage
  // =========================================================

  const isPremium = premiumSeller?.active === true;

  const featuredAdsLimit =
    premiumSeller?.featuredAdsLimit ?? 0;

  const featuredAdsUsed =
    premiumSeller?.featuredAdsUsed ?? 0;

  const featuredAdsRemaining = Math.max(
    0,
    featuredAdsLimit - featuredAdsUsed,
  );

  const boostAdsLimit =
    premiumSeller?.boostAdsLimit ?? 0;

  const boostAdsUsed =
    premiumSeller?.boostAdsUsed ?? 0;

  const boostAdsRemaining = Math.max(
    0,
    boostAdsLimit - boostAdsUsed,
  );

  const boostUsagePercent =
    boostAdsLimit > 0
      ? Math.min(
          100,
          (boostAdsUsed / boostAdsLimit) * 100,
        )
      : 0;

  const featuredUsagePercent =
    featuredAdsLimit > 0
      ? Math.min(
          100,
          (featuredAdsUsed / featuredAdsLimit) * 100,
        )
      : 0;

  const premiumPlanName = premiumSeller?.plan
    ? `${premiumSeller.plan.charAt(0).toUpperCase()}${premiumSeller.plan.slice(1)} Plan`
    : "Premium Seller";

  // =========================================================
  // Render
  // =========================================================

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        py-5
        dark:bg-slate-950
        sm:py-8
        lg:py-10
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =====================================================
            BACK + HOME
        ===================================================== */}

        <div
          className="
            mb-5
            flex
            items-center
            justify-between
            gap-3
            sm:mb-7
          "
        >
          <BackButton />

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/25
              bg-[#1565d8]
              px-3
              py-2
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:bg-[#0f52ba]
              hover:shadow-md
              active:scale-95
              sm:px-4
            "
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </div>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <header
          className="
            mb-6
            flex
            flex-col
            gap-4
            sm:mb-8
            sm:flex-row
            sm:items-end
            sm:justify-between
            sm:gap-6
          "
        >
          <div className="min-w-0">
            <h1
              className="
                text-3xl
                font-extrabold
                tracking-tight
                text-slate-900
                dark:text-white
                sm:text-4xl
              "
            >
              My Ads
            </h1>

            <p
              className="
                mt-1.5
                text-sm
                text-slate-500
                dark:text-slate-400
                sm:mt-2
                sm:text-base
              "
            >
              Manage all your published products.
            </p>
          </div>

          <Link
            href="/sell"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#1565d8]
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-md
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-[#0f52ba]
              hover:shadow-lg
              active:scale-[0.98]
              sm:w-auto
              sm:px-6
              sm:py-3.5
            "
          >
            <Plus className="h-4 w-4" />
            <span>Sell New Product</span>
          </Link>
        </header>

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {products.length === 0 ? (
          <section
            className="
              rounded-2xl
              border
              border-dashed
              border-slate-300
              bg-white
              px-5
              py-16
              text-center
              shadow-sm
              dark:border-slate-700
              dark:bg-slate-900
              sm:rounded-3xl
              sm:px-8
              sm:py-24
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-blue-50
                text-[#1565d8]
                dark:bg-blue-950/50
                dark:text-blue-400
              "
            >
              <Plus className="h-7 w-7" />
            </div>

            <h2
              className="
                mt-5
                text-2xl
                font-bold
                text-slate-900
                dark:text-white
                sm:text-3xl
              "
            >
              No Products Yet
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
                sm:text-base
              "
            >
              You haven't published any products yet.
              Start selling on DealUp today.
            </p>

            <Link
              href="/sell"
              className="
                mt-7
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#1565d8]
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                shadow-md
                transition-all
                hover:bg-[#0f52ba]
                hover:shadow-lg
                active:scale-95
                sm:px-8
                sm:py-3.5
              "
            >
              <Plus className="h-4 w-4" />
              Publish Your First Product
            </Link>
          </section>
        ) : (
          <>
            {/* =================================================
                TOTAL PRODUCTS
            ================================================= */}

            <section
              className="
                mb-5
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
                dark:border-slate-700
                dark:bg-slate-900
                sm:mb-7
                sm:rounded-3xl
                sm:p-6
              "
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className="
                      text-sm
                      font-medium
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Total Products
                  </p>

                  <p
                    className="
                      mt-1
                      text-3xl
                      font-extrabold
                      text-[#1565d8]
                      sm:text-4xl
                    "
                  >
                    {products.length}
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-50
                    text-[#1565d8]
                    dark:bg-blue-950/50
                    dark:text-blue-400
                  "
                >
                  <Plus className="h-5 w-5" />
                </div>
              </div>
            </section>

            {/* =================================================
                PREMIUM PROMOTION USAGE
            ================================================= */}

            {isPremium && (
              <section
                className="
                  mb-5
                  rounded-2xl
                  border
                  border-blue-100
                  bg-white
                  p-4
                  shadow-sm
                  dark:border-blue-900
                  dark:bg-slate-900
                  sm:mb-7
                  sm:rounded-3xl
                  sm:p-6
                "
              >
                {/* Premium Header */}

                <div
                  className="
                    mb-4
                    flex
                    items-center
                    gap-3
                    sm:mb-6
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-50
                      text-lg
                      dark:bg-blue-950
                    "
                  >
                    ✨
                  </div>

                  <div className="min-w-0">
                    <h2
                      className="
                        text-base
                        font-bold
                        text-slate-900
                        dark:text-white
                        sm:text-xl
                      "
                    >
                      Premium Promotion Usage
                    </h2>

                    <p
                      className="
                        mt-0.5
                        text-xs
                        text-slate-500
                        dark:text-slate-400
                        sm:text-sm
                      "
                    >
                      {premiumPlanName}
                    </p>
                  </div>
                </div>

                {/* Usage Cards */}

                <div className="grid gap-4 md:grid-cols-2">
                  {/* =================================================
                      BOOST ADS
                  ================================================= */}

                  <div
                    className="
                      rounded-2xl
                      border
                      border-amber-200
                      bg-amber-50
                      p-4
                      dark:border-amber-900
                      dark:bg-amber-950/30
                      sm:p-5
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-amber-100
                          text-lg
                          dark:bg-amber-900
                        "
                      >
                        🚀
                      </div>

                      <div>
                        <h3
                          className="
                            text-sm
                            font-bold
                            text-slate-900
                            dark:text-white
                            sm:text-base
                          "
                        >
                          Boost Ads
                        </h3>

                        <p
                          className="
                            text-[11px]
                            text-slate-500
                            dark:text-slate-400
                          "
                        >
                          Free quota
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div
                        className="
                          rounded-xl
                          bg-white
                          px-2
                          py-2.5
                          text-center
                          dark:bg-slate-900
                        "
                      >
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Used
                        </p>

                        <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                          {boostAdsUsed}
                        </p>
                      </div>

                      <div
                        className="
                          rounded-xl
                          bg-white
                          px-2
                          py-2.5
                          text-center
                          dark:bg-slate-900
                        "
                      >
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Remaining
                        </p>

                        <p className="mt-1 text-lg font-extrabold text-green-600">
                          {boostAdsRemaining}
                        </p>
                      </div>

                      <div
                        className="
                          rounded-xl
                          bg-white
                          px-2
                          py-2.5
                          text-center
                          dark:bg-slate-900
                        "
                      >
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Total
                        </p>

                        <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                          {boostAdsLimit}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">
                          Usage
                        </span>

                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {boostAdsUsed} / {boostAdsLimit}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-500"
                          style={{
                            width: `${boostUsagePercent}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      FEATURED ADS
                  ================================================= */}

                  <div
                    className="
                      rounded-2xl
                      border
                      border-blue-200
                      bg-blue-50
                      p-4
                      dark:border-blue-900
                      dark:bg-blue-950/30
                      sm:p-5
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-blue-100
                          text-lg
                          dark:bg-blue-900
                        "
                      >
                        ⭐
                      </div>

                      <div>
                        <h3
                          className="
                            text-sm
                            font-bold
                            text-slate-900
                            dark:text-white
                            sm:text-base
                          "
                        >
                          Featured Ads
                        </h3>

                        <p
                          className="
                            text-[11px]
                            text-slate-500
                            dark:text-slate-400
                          "
                        >
                          Free quota
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div
                        className="
                          rounded-xl
                          bg-white
                          px-2
                          py-2.5
                          text-center
                          dark:bg-slate-900
                        "
                      >
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Used
                        </p>

                        <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                          {featuredAdsUsed}
                        </p>
                      </div>

                      <div
                        className="
                          rounded-xl
                          bg-white
                          px-2
                          py-2.5
                          text-center
                          dark:bg-slate-900
                        "
                      >
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Remaining
                        </p>

                        <p className="mt-1 text-lg font-extrabold text-green-600">
                          {featuredAdsRemaining}
                        </p>
                      </div>

                      <div
                        className="
                          rounded-xl
                          bg-white
                          px-2
                          py-2.5
                          text-center
                          dark:bg-slate-900
                        "
                      >
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Total
                        </p>

                        <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                          {featuredAdsLimit}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1.5 flex justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">
                          Usage
                        </span>

                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {featuredAdsUsed} / {featuredAdsLimit}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900">
                        <div
                          className="h-full rounded-full bg-[#1565d8] transition-all duration-500"
                          style={{
                            width: `${featuredUsagePercent}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    QUOTA EXHAUSTED
                ================================================= */}

                {(boostAdsRemaining === 0 ||
                  featuredAdsRemaining === 0) && (
                  <div
                    className="
                      mt-4
                      rounded-xl
                      border
                      border-orange-200
                      bg-orange-50
                      px-4
                      py-3
                      dark:border-orange-900
                      dark:bg-orange-950/30
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-semibold
                        text-orange-800
                        dark:text-orange-300
                        sm:text-sm
                      "
                    >
                      Some free promotion quota has been
                      exhausted.
                    </p>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        leading-5
                        text-orange-700
                        dark:text-orange-400
                        sm:text-xs
                      "
                    >
                      You can continue using paid promotion
                      after your free quota is finished.
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* =================================================
                NORMAL SELLER PROMOTION
            ================================================= */}

            {!isPremium && (
              <section
                className="
                  mb-5
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-sm
                  dark:border-slate-700
                  dark:bg-slate-900
                  sm:mb-7
                  sm:rounded-3xl
                  sm:p-6
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
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
                      rounded-xl
                      bg-slate-100
                      text-lg
                      dark:bg-slate-800
                    "
                  >
                    🚀
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2
                      className="
                        text-base
                        font-bold
                        text-slate-900
                        dark:text-white
                      "
                    >
                      Promote Your Ads
                    </h2>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-slate-500
                        dark:text-slate-400
                        sm:text-sm
                      "
                    >
                      Boost and Featured Ads are available
                      with paid promotion.
                    </p>
                  </div>

                  <Link
                    href="/dashboard/premium"
                    className="
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#1565d8]
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition-all
                      duration-200
                      hover:bg-[#0f52ba]
                      hover:shadow-md
                      active:scale-95
                      sm:w-auto
                    "
                  >
                    Go Premium
                  </Link>
                </div>
              </section>
            )}

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <section>
              <div
                className="
                  mb-4
                  flex
                  items-center
                  justify-between
                  gap-3
                  sm:mb-5
                "
              >
                <div>
                  <h2
                    className="
                      text-xl
                      font-bold
                      tracking-tight
                      text-slate-900
                      dark:text-white
                      sm:text-2xl
                    "
                  >
                    Your Products
                  </h2>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-slate-500
                      dark:text-slate-400
                      sm:text-sm
                    "
                  >
                    Manage your published ads.
                  </p>
                </div>

                <span
                  className="
                    rounded-full
                    bg-blue-50
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-[#1565d8]
                    dark:bg-blue-950/50
                    dark:text-blue-400
                  "
                >
                  {products.length} Ads
                </span>
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                  xl:grid-cols-3
                  xl:gap-6
                "
              >
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
            </section>
          </>
        )}
      </div>
    </main>
  );
}