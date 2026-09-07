import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";

export default function Hero() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-gradient-to-br
        from-slate-50
        via-white
        to-blue-50/70
        py-12
        transition-colors duration-500

        dark:from-[#020817]
        dark:via-[#030a18]
        dark:to-[#081426]

        sm:py-16
        lg:py-20
      "
    >
      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          -top-32
          h-80
          w-80
          rounded-full
          bg-blue-400/10
          blur-3xl

          dark:bg-blue-600/10
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          left-1/3
          h-72
          w-72
          rounded-full
          bg-amber-300/10
          blur-3xl

          dark:bg-amber-500/5
        "
      />

      <Container>
        <div
          className="
            relative
            grid
            items-center
            gap-12

            lg:min-h-[650px]
            lg:grid-cols-[1fr_1fr]
            lg:gap-16
            xl:gap-20
          "
        >
          {/* =================================================
              LEFT SIDE
          ================================================== */}

          <div
            className="
              mx-auto
              w-full
              max-w-2xl
              text-center

              lg:mx-0
              lg:text-left
            "
          >
            {/* =================================================
                BADGE
            ================================================== */}

            <span
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-blue-200
                bg-blue-50
                px-3.5
                py-2
                text-xs
                font-semibold
                text-[#1565d8]
                shadow-sm
                transition-all duration-300

                hover:-translate-y-0.5
                hover:shadow-md

                dark:border-blue-500/30
                dark:bg-blue-500/10
                dark:text-blue-300

                sm:px-4
                sm:py-2
                sm:text-sm
              "
            >
              🚀 Trusted Local Marketplace
            </span>

            {/* =================================================
                MAIN HEADING
            ================================================== */}

            <h1
              className="
                mt-7
                max-w-3xl
                text-[3.25rem]
                font-black
                leading-[0.98]
                tracking-[-0.045em]

                text-slate-950

                sm:mt-8
                sm:text-6xl

                md:text-7xl

                lg:text-[5.25rem]
                xl:text-[6rem]

                dark:text-white
              "
            >
              {/* Buy & Sell */}
              <span className="block">Buy &amp; Sell</span>

              {/* Anything */}
              <span
                className="
                  block
                  text-[#1565d8]
                  dark:text-[#1976f3]
                "
              >
                Anything
              </span>

              {/* Near You */}
              <span
                className="
                  block
                  bg-gradient-to-r
                  from-[#1565d8]
                  via-slate-500
                  to-[#e3a62f]
                  bg-clip-text
                  text-transparent

                  dark:from-[#1976f3]
                  dark:via-slate-300
                  dark:to-[#f5b84b]
                "
              >
                Near You
              </span>
            </h1>

            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <p
              className="
                mx-auto
                mt-6
                max-w-xl
                text-base
                leading-7
                text-slate-600

                sm:mt-7
                sm:text-lg
                sm:leading-8

                lg:mx-0
                lg:mt-8
                lg:text-xl
                lg:leading-9

                dark:text-slate-300
              "
            >
              Discover trusted local deals, connect with nearby buyers and
              sellers, and trade safely with confidence using DealUp.
            </p>

            {/* =================================================
                BUTTONS
            ================================================== */}

            <div
              className="
                mx-auto
                mt-7
                flex
                w-full
                max-w-md
                items-center
                gap-3

                sm:mt-9
                sm:gap-4

                lg:mx-0
                lg:max-w-none
              "
            >
              {/* Browse Products */}
              <Link
                href="/search"
                className="
    inline-flex
    min-w-0
    flex-1
    shrink-0
    items-center
    justify-center
    gap-1
    whitespace-nowrap
    rounded-xl
    bg-[#1565d8]
    px-2.5
    py-3
    text-center
    text-[13px]
    font-bold
    leading-none
    text-white
    shadow-lg
    shadow-blue-500/20
    transition-all
    duration-300

    hover:-translate-y-1
    hover:bg-[#0f52ba]
    hover:shadow-xl

    active:scale-95

    sm:gap-2
    sm:px-6
    sm:py-3.5
    sm:text-base

    lg:flex-none
    lg:px-8
    lg:py-4
  "
              >
                <span className="whitespace-nowrap">Explore Products</span>

                <span className="text-base leading-none sm:text-lg">→</span>
              </Link>

              {/* Start Selling */}
              <Link
                href="/sell"
                className="
                  inline-flex
                  min-w-0
                  flex-1
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-3
                  text-center
                  text-sm
                  font-bold
                  text-slate-800
                  shadow-sm
                  transition-all duration-300

                  hover:-translate-y-1
                  hover:border-[#1565d8]
                  hover:text-[#1565d8]
                  hover:shadow-md

                  active:scale-95

                  sm:px-6
                  sm:py-3.5
                  sm:text-base

                  lg:flex-none
                  lg:px-8
                  lg:py-4

                  dark:border-white/20
                  dark:bg-white/5
                  dark:text-white
                  dark:hover:border-blue-400
                  dark:hover:bg-white/10
                  dark:hover:text-blue-300
                "
              >
                Start Selling
              </Link>
            </div>

            {/* =================================================
                STATS
            ================================================== */}

            <div
              className="
                mx-auto
                mt-10
                flex
                max-w-md
                items-center
                justify-between
                border-t
                border-slate-200
                pt-7

                sm:mt-12
                sm:justify-start
                sm:gap-10

                lg:mx-0
                lg:mt-14

                dark:border-white/10
              "
            >
              {/* Products */}
              <div className="text-center lg:text-left">
                <h3
                  className="
                    text-2xl
                    font-black
                    text-[#1565d8]

                    sm:text-3xl
                  "
                >
                  10K+
                </h3>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                  Products
                </p>
              </div>

              {/* Sellers */}
              <div className="text-center lg:text-left">
                <h3
                  className="
                    text-2xl
                    font-black
                    text-[#1565d8]

                    sm:text-3xl
                  "
                >
                  5K+
                </h3>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                  Sellers
                </p>
              </div>

              {/* Cities */}
              <div className="text-center lg:text-left">
                <h3
                  className="
                    text-2xl
                    font-black
                    text-[#1565d8]

                    sm:text-3xl
                  "
                >
                  50+
                </h3>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                  Cities
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE IMAGE
          ================================================== */}

          <div
            className="
              relative
              mx-auto
              w-full
              max-w-xl

              lg:max-w-2xl
            "
          >
            {/* Blue glow */}
            <div
              className="
                pointer-events-none
                absolute
                -left-10
                -top-10
                h-56
                w-56
                rounded-full
                bg-blue-400/20
                blur-3xl

                dark:bg-blue-500/15
              "
            />

            {/* Gold glow */}
            <div
              className="
                pointer-events-none
                absolute
                -bottom-10
                -right-10
                h-56
                w-56
                rounded-full
                bg-amber-300/20
                blur-3xl

                dark:bg-amber-400/10
              "
            />

            {/* Image card */}
            <div
              className="
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-slate-200/80
                bg-white/80
                p-2
                shadow-[0_25px_80px_rgba(15,23,42,0.14)]
                backdrop-blur-sm
                transition-all duration-500

                hover:-translate-y-1
                hover:shadow-[0_30px_90px_rgba(21,101,216,0.18)]

                dark:border-white/10
                dark:bg-white/5
                dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)]

                sm:rounded-[32px]
                sm:p-3
              "
            >
              <Image
                src="/images/hero.png"
                alt="DealUp Marketplace"
                width={900}
                height={700}
                priority
                className="
                  h-auto
                  w-full
                  rounded-[22px]
                  object-cover

                  sm:rounded-[25px]
                "
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
