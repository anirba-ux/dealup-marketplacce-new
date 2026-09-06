import Link from "next/link";
import { Home, Heart } from "lucide-react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

import WishlistGrid from "@/components/wishlist/WishlistGrid";
import BackButton from "@/components/ui/BackButton";

export default async function WishlistPage() {
  const session = await auth();

  // =========================================================
  // AUTHENTICATION
  // =========================================================

  if (!session?.user || !(session.user as any).id) {
    redirect("/login");
  }

  // =========================================================
  // PAGE
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
            mb-6
            flex
            items-center
            justify-between
            gap-3
            sm:mb-8
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
            WISHLIST HEADER
        ===================================================== */}

        <header
          className="
            mb-6
            sm:mb-8
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              sm:gap-4
            "
          >
            {/* Heart Icon */}

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-rose-50
                text-rose-500
                shadow-sm
                dark:bg-rose-950/40
                dark:text-rose-400
                sm:h-14
                sm:w-14
              "
            >
              <Heart
                className="
                  h-6
                  w-6
                  fill-current
                  sm:h-7
                  sm:w-7
                "
              />
            </div>

            {/* Title */}

            <div className="min-w-0">
              <h1
                className="
                  text-2xl
                  font-extrabold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                My Wishlist
              </h1>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                  dark:text-slate-400
                  sm:text-sm
                  lg:text-base
                "
              >
                Products you've saved for later.
              </p>
            </div>
          </div>
        </header>

        {/* =====================================================
            WISHLIST CONTENT
        ===================================================== */}

        <WishlistGrid />
      </div>
    </main>
  );
}