import Link from "next/link";
import Container from "@/components/ui/Container";
import { auth } from "@/auth";
import { getPremiumSellerStatus } from "@/lib/repositories/premium.repository";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  TrendingUp,
  Zap,
} from "lucide-react";

export default async function PremiumBanner() {
  const session = await auth();
  const sellerId = (session?.user as any)?.id;

  const premiumStatus = sellerId
    ? await getPremiumSellerStatus(sellerId)
    : null;

  const isPremiumSubscriber =
    premiumStatus?.active === true &&
    premiumStatus?.sellerAnalytics === true;

  return (
    <section
      className="
        bg-[#f8fafc]
        py-10
        dark:bg-slate-950
        sm:py-12
        lg:py-16
      "
    >
      <Container>
        <div
          className="
            overflow-hidden
            rounded-2xl
            bg-gradient-to-r
            from-[#1565d8]
            to-[#0f52ba]
            px-5
            py-8
            text-white
            shadow-2xl

            sm:rounded-[28px]
            sm:px-8
            sm:py-10

            lg:rounded-[36px]
            lg:px-16
            lg:py-14
          "
        >
          <div
            className="
              grid
              items-center
              gap-8

              sm:gap-10

              lg:grid-cols-2
              lg:gap-12
            "
          >
            {/* =================================================
                LEFT CONTENT
            ================================================== */}

            <div className="min-w-0">
              {/* Premium Label */}

              <span
                className="
                  inline-flex
                  items-center
                  rounded-full
                  bg-white
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-slate-900
                  backdrop-blur

                  sm:px-4
                  sm:py-2
                  sm:text-sm

                  dark:bg-white/10
                  dark:text-white
                "
              >
                ⭐ Premium Seller
              </span>

              {/* Heading */}

              <h2
                className="
                  mt-4
                  text-3xl
                  font-extrabold
                  leading-[1.12]
                  tracking-tight

                  sm:mt-5
                  sm:text-4xl

                  lg:mt-6
                  lg:text-5xl
                "
              >
                Sell Faster with
                <br />
                <span className="text-yellow-300">
                  DealUp Premium
                </span>
              </h2>

              {/* Description */}

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-6
                  text-blue-100

                  sm:mt-5
                  sm:text-base
                  sm:leading-7

                  lg:mt-6
                  lg:text-lg
                  lg:leading-8
                "
              >
                Get featured listings, reach more buyers, boost your
                visibility, and grow your sales with our Premium Seller
                membership.
              </p>

              {/* =================================================
                  ACTIONS
              ================================================== */}

              <div
                className="
                  mt-6
                  grid
                  w-full
                  min-w-0
                  grid-cols-1
                  gap-3

                  sm:mt-8
                  sm:grid-cols-3
                  sm:gap-3

                  lg:mt-10
                  lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)]
                  lg:gap-3
                "
              >
                {/* Upgrade Now */}

                <Link
                  href="/dashboard/premium"
                  className="
                    flex
                    min-w-0
                    w-full
                    items-center
                    justify-center
                    gap-1.5
                    whitespace-nowrap
                    rounded-xl
                    bg-[#f5a623]
                    px-3
                    py-3
                    text-center
                    text-sm
                    font-semibold
                    text-slate-900
                    shadow-lg
                    transition-all
                    duration-300
                    ease-out
                    hover:-translate-y-0.5
                    hover:scale-[1.02]
                    hover:bg-[#ffb52e]
                    hover:shadow-xl
                    active:translate-y-0

                    sm:px-4
                    sm:py-3.5

                    lg:px-6
                    lg:py-4
                    lg:text-base
                  "
                >
                  <span>Upgrade Now</span>

                  <ArrowRight
                    size={17}
                    className="shrink-0"
                  />
                </Link>

                {/* Learn More */}

                <Link
                  href="/premium"
                  className="
                    flex
                    min-w-0
                    w-full
                    items-center
                    justify-center
                    gap-1.5
                    whitespace-nowrap
                    rounded-xl
                    border
                    border-white/40
                    bg-white/5
                    px-3
                    py-3
                    text-center
                    text-sm
                    font-semibold
                    text-white
                    backdrop-blur
                    transition-all
                    duration-300
                    ease-out
                    hover:-translate-y-0.5
                    hover:bg-white
                    hover:text-[#1565d8]
                    hover:shadow-lg
                    active:translate-y-0

                    sm:px-4
                    sm:py-3.5

                    lg:px-6
                    lg:py-4
                    lg:text-base

                    dark:hover:bg-slate-800
                    dark:hover:text-white
                  "
                >
                  <span>Learn More</span>
                </Link>

                {/* Seller Analytics — Premium subscribers only */}

                <div className="relative min-w-0 w-full">
                  {/* Premium badge stays above the button */}
                  <span
                    className="
                      absolute
                      -top-2.5
                      right-2
                      z-10
                      rounded-full
                      border
                      border-amber-300/70
                      bg-[#f5a623]
                      px-2
                      py-0.5
                      text-[8px]
                      font-black
                      uppercase
                      tracking-wide
                      text-slate-950
                      shadow-md
                      sm:-top-3
                      sm:right-3
                      sm:px-2.5
                      sm:text-[9px]
                    "
                  >
                    Premium
                  </span>

                  {isPremiumSubscriber ? (
                    <Link
                      href="/dashboard/analytics"
                      className="
                        flex
                        min-w-0
                        w-full
                        items-center
                        justify-center
                        gap-1.5
                        whitespace-nowrap
                        rounded-xl
                        border
                        border-white/40
                        bg-white/10
                        px-3
                        py-3
                        text-center
                        text-sm
                        font-semibold
                        text-white
                        backdrop-blur
                        transition-all
                        duration-300
                        ease-out
                        hover:-translate-y-0.5
                        hover:bg-white
                        hover:text-[#1565d8]
                        hover:shadow-lg
                        active:translate-y-0

                        sm:px-4
                        sm:py-3.5

                        lg:px-3
                        lg:py-4
                        lg:text-sm

                        dark:hover:bg-slate-800
                        dark:hover:text-white
                      "
                    >
                      <BarChart3
                        size={17}
                        className="shrink-0"
                      />

                      <span className="min-w-0 truncate">
                        Seller Analytics
                      </span>

                      <ArrowRight
                        size={17}
                        className="shrink-0"
                      />
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/premium"
                      aria-label="Seller Analytics is available for Premium subscribers"
                      className="
                        flex
                        min-w-0
                        w-full
                        items-center
                        justify-center
                        gap-1.5
                        whitespace-nowrap
                        rounded-xl
                        border
                        border-white/25
                        bg-white/5
                        px-3
                        py-3
                        text-center
                        text-sm
                        font-semibold
                        text-white/75
                        backdrop-blur
                        transition-all
                        duration-300
                        ease-out
                        hover:-translate-y-0.5
                        hover:bg-white/15
                        hover:text-white
                        hover:shadow-lg
                        active:translate-y-0

                        sm:px-4
                        sm:py-3.5

                        lg:px-3
                        lg:py-4
                        lg:text-sm
                      "
                    >
                      <BarChart3
                        size={17}
                        className="shrink-0"
                      />

                      <span className="min-w-0 truncate">
                        Seller Analytics
                      </span>

                      <ArrowRight
                        size={17}
                        className="shrink-0"
                      />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT CONTENT
            ================================================== */}

            <div
              className="
                grid
                gap-3

                sm:gap-4

                lg:gap-5
              "
            >
              {/* =================================================
                  REACH MORE BUYERS
              ================================================== */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  bg-white/10
                  p-4
                  backdrop-blur
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-white/20
                  hover:shadow-xl

                  sm:gap-4
                  sm:rounded-2xl
                  sm:p-5

                  lg:hover:-translate-y-2
                  lg:hover:scale-[1.02]
                  lg:hover:shadow-2xl
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
                    bg-white/10

                    sm:h-11
                    sm:w-11

                    lg:h-12
                    lg:w-12
                  "
                >
                  <TrendingUp
                    size={24}
                    className="sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                  />
                </div>

                <div className="min-w-0">
                  <h3
                    className="
                      text-base
                      font-semibold

                      sm:text-lg

                      lg:text-xl
                    "
                  >
                    Reach More Buyers
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      leading-5
                      text-blue-100

                      sm:text-sm
                      sm:leading-6
                    "
                  >
                    Featured listings appear at the top.
                  </p>
                </div>
              </div>

              {/* =================================================
                  SELL FASTER
              ================================================== */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  bg-white/10
                  p-4
                  backdrop-blur
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-white/20
                  hover:shadow-xl

                  sm:gap-4
                  sm:rounded-2xl
                  sm:p-5

                  lg:hover:-translate-y-2
                  lg:hover:scale-[1.02]
                  lg:hover:shadow-2xl
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
                    bg-white/10

                    sm:h-11
                    sm:w-11

                    lg:h-12
                    lg:w-12
                  "
                >
                  <Zap
                    size={24}
                    className="sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                  />
                </div>

                <div className="min-w-0">
                  <h3
                    className="
                      text-base
                      font-semibold

                      sm:text-lg

                      lg:text-xl
                    "
                  >
                    Sell Faster
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      leading-5
                      text-blue-100

                      sm:text-sm
                      sm:leading-6
                    "
                  >
                    Increase visibility and receive more enquiries.
                  </p>
                </div>
              </div>

              {/* =================================================
                  PREMIUM BADGE
              ================================================== */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  bg-white/10
                  p-4
                  backdrop-blur
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-white/20
                  hover:shadow-xl

                  sm:gap-4
                  sm:rounded-2xl
                  sm:p-5

                  lg:hover:-translate-y-2
                  lg:hover:scale-[1.02]
                  lg:hover:shadow-2xl
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
                    bg-white/10

                    sm:h-11
                    sm:w-11

                    lg:h-12
                    lg:w-12
                  "
                >
                  <BadgeCheck
                    size={24}
                    className="sm:h-7 sm:w-7 lg:h-8 lg:w-8"
                  />
                </div>

                <div className="min-w-0">
                  <h3
                    className="
                      text-base
                      font-semibold

                      sm:text-lg

                      lg:text-xl
                    "
                  >
                    Premium Badge
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      leading-5
                      text-blue-100

                      sm:text-sm
                      sm:leading-6
                    "
                  >
                    Build trust with verified premium seller status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}