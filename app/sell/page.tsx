import Link from "next/link";
import { Home } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProductForm from "@/components/product/ProductForm";

export default async function SellPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-gradient-to-br
        from-slate-50
        via-white
        to-blue-50
        px-3
        py-8
        transition-colors
        duration-500

        sm:px-5
        sm:py-12

        lg:px-6
        lg:py-16

        dark:from-[#020817]
        dark:via-[#030a18]
        dark:to-[#081426]
      "
    >
      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          -top-24
          h-72
          w-72
          rounded-full
          bg-[#1565d8]/10
          blur-[110px]

          sm:-left-40
          sm:-top-32
          sm:h-96
          sm:w-96

          dark:bg-blue-500/10
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          -right-28
          h-72
          w-72
          rounded-full
          bg-sky-400/10
          blur-[110px]

          sm:h-96
          sm:w-96

          dark:bg-sky-500/10
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/3
          h-56
          w-56
          -translate-x-1/2
          rounded-full
          bg-amber-300/5
          blur-[120px]

          dark:bg-amber-400/5
        "
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Back & Home */}
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <BackButton />

          <Link
            href="/"
            className="
      inline-flex items-center gap-2
      rounded-xl
      border border-slate-200
      bg-white
      px-3 py-2
      text-sm font-semibold
      text-slate-700
      shadow-sm
      transition-all duration-200
      hover:-translate-y-0.5
      hover:border-[#1565d8]/30
      hover:bg-blue-50
      hover:text-[#1565d8]
      hover:shadow-md
      active:scale-95
      dark:border-white/10
      dark:bg-white/5
      dark:text-slate-200
      dark:hover:border-[#1565d8]/40
      dark:hover:bg-[#1565d8]/10
      dark:hover:text-white
      sm:px-4
    "
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>Home</span>
          </Link>
        </div>
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          className="
            mx-auto
            mb-8
            max-w-4xl
            text-center

            sm:mb-10

            lg:mb-12
          "
        >
          {/* Badge */}

          <span
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-blue-200
              bg-blue-50
              px-3.5
              py-1.5
              text-xs
              font-semibold
              text-[#1565d8]
              shadow-sm

              sm:px-4
              sm:py-2
              sm:text-sm

              dark:border-blue-500/30
              dark:bg-blue-500/10
              dark:text-blue-300
            "
          >
            🚀 DealUp Marketplace
          </span>

          {/* Main Heading */}

          <h1
            className="
              mt-6
              text-[3rem]
              font-black
              leading-[0.94]
              tracking-[-0.05em]
              text-slate-950

              sm:mt-7
              sm:text-6xl

              md:text-7xl

              lg:mt-8
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
                to-[#d8a63c]
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

          {/* Description */}

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              px-2
              text-sm
              leading-6
              text-slate-600

              sm:mt-6
              sm:px-0
              sm:text-base
              sm:leading-7

              lg:mt-7
              lg:text-lg
              lg:leading-8

              dark:text-slate-300
            "
          >
            Publish your product and connect with thousands of buyers across
            India.
          </p>
        </div>

        {/* =====================================================
            PRODUCT FORM CARD
        ====================================================== */}

        <div
          className="
            w-full
            overflow-hidden
            rounded-2xl
            border
            border-slate-200/80
            bg-white
            p-4
            shadow-[0_20px_60px_rgba(21,101,216,0.12)]
            backdrop-blur-xl

            sm:rounded-3xl
            sm:p-6

            lg:rounded-[32px]
            lg:p-10

            dark:border-white/10
            dark:bg-[#091526]/95
            dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)]
          "
        >
          <ProductForm />
        </div>
      </div>
    </main>
  );
}
