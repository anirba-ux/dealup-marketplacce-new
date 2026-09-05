import Link from "next/link";
import Container from "@/components/ui/Container";
import { ArrowRight, BadgeCheck, TrendingUp, Zap } from "lucide-react";

export default function PremiumBanner() {
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
                Get featured listings, reach more buyers, boost
                your visibility, and grow your sales with our
                Premium Seller membership.
              </p>

              {/* =================================================
                  ACTIONS
              ================================================== */}

              <div
                className="
                  mt-6
                  flex
                  flex-col
                  gap-3

                  sm:mt-8
                  sm:flex-row
                  sm:flex-wrap
                  sm:gap-4

                  lg:mt-10
                "
              >
                {/* Upgrade Now */}

                <Link
                  href="/dashboard/premium"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#f5a623]
                    px-6
                    py-3
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

                    sm:px-8
                    sm:py-3.5
                    sm:text-base

                    lg:px-10
                    lg:py-4
                  "
                >
                  Upgrade Now

                  <ArrowRight size={18} />
                </Link>

                {/* Learn More */}

                <Link
                  href="/premium"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/40
                    px-6
                    py-3
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

                    sm:px-8
                    sm:py-3.5
                    sm:text-base

                    lg:px-10
                    lg:py-4

                    dark:hover:bg-slate-800
                    dark:hover:text-white
                  "
                >
                  Learn More
                </Link>
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
                    Increase visibility and receive more
                    enquiries.
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
                    Build trust with verified premium seller
                    status.
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