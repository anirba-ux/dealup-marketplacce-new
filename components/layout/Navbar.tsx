import { auth } from "@/auth";

import LoginButton from "@/components/ui/LoginButton";
import UserMenu from "@/components/ui/UserMenu";
import SellButton from "@/components/ui/SellButton";
import SearchBar from "@/components/ui/SearchBar";
import Logo from "@/components/ui/Logo";
import WishlistNavButton from "@/components/ui/WishlistNavButton";
import MobileMenu from "@/components/ui/MobileMenu";

export default async function Navbar() {
  const session = await auth();

  console.log("======== NAVBAR SESSION ========");
  console.log(session);
  console.log("================================");

  return (
    <nav
      className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-slate-200/80
        bg-white/95
        dark:border-slate-800
        dark:bg-slate-950/95
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-3
          sm:px-6
          lg:px-8
        "
      >
        {/* =====================================================
            MAIN NAVBAR ROW
        ====================================================== */}

        <div
          className="
            flex
            h-16
            items-center
            gap-2
            pt-4
            sm:gap-4
            md:h-20
            md:gap-6
            md:pt-0
          "
        >
          {/* ===================================================
              MOBILE HAMBURGER
          ==================================================== */}

          <div className="shrink-0 md:hidden">
            <MobileMenu />
          </div>

          {/* ===================================================
              LOGO
          ==================================================== */}

          <div
            className="
              min-w-0
              shrink-0
              translate-x-1
              pl-2
              sm:translate-x-0
              sm:pl-0
            "
          >
            <Logo />
          </div>

          {/* ===================================================
              DESKTOP SEARCH
          ==================================================== */}

          <div
            className="
              hidden
              min-w-0
              flex-1
              px-4
              md:block
              lg:px-6
            "
          >
            <SearchBar />
          </div>

          {/* ===================================================
              RIGHT SIDE ACTIONS
          ==================================================== */}

          <div
            className="
              ml-auto
              flex
              shrink-0
              items-center
              gap-1
              sm:gap-2
              md:gap-3
            "
          >
            {/* =================================================
                WISHLIST
            ================================================== */}

            <div className="shrink-0">
              <WishlistNavButton />
            </div>

            {/* =================================================
                DESKTOP USER
            ================================================== */}

            <div className="hidden shrink-0 md:block">
              {session?.user ? (
                <UserMenu />
              ) : (
                <LoginButton />
              )}
            </div>

            {/* =================================================
                DESKTOP SELL
            ================================================== */}

            <div className="hidden shrink-0 md:block">
              <SellButton />
            </div>
          </div>
        </div>

        {/* =====================================================
            MOBILE SEARCH
        ====================================================== */}

        <div
          className="
            w-full
            pb-3
            md:hidden
          "
        >
          <SearchBar />
        </div>
      </div>
    </nav>
  );
}