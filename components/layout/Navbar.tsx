import { auth } from "@/auth";

import LoginButton from "@/components/ui/LoginButton";
import UserMenu from "@/components/ui/UserMenu";
import SellButton from "@/components/ui/SellButton";
import SearchBar from "@/components/ui/SearchBar";
import Logo from "@/components/ui/Logo";
import WishlistNavButton from "@/components/ui/WishlistNavButton";
import MobileMenu from "@/components/ui/MobileMenu";
import ThemeToggle from "@/components/ui/ThemeToggle";
import UserLocationDisplay from "@/components/ui/UserLocationDisplay";

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
        backdrop-blur-md
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
            md:h-20
            md:gap-4
          "
        >
          {/* ===================================================
              MOBILE HAMBURGER
          ==================================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-center
              md:hidden
            "
          >
            <MobileMenu />
          </div>

          {/* ===================================================
              LOGO
          ==================================================== */}

          <div
            className="
              flex
              min-w-0
              shrink
              items-center
              md:shrink-0
            "
          >
            <div
              className="
                w-[128px]
                overflow-hidden
                sm:w-[145px]
                md:w-auto
              "
            >
              <Logo />
            </div>
          </div>

          {/* ===================================================
              DESKTOP SEARCH
          ==================================================== */}

          <div
            className="
              hidden
              min-w-0
              flex-1
              px-2
              md:block
              lg:px-4
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
              h-12
              shrink-0
              items-center
              justify-end
              gap-0.5
              sm:gap-1.5
              md:h-auto
              md:gap-2
              lg:gap-3
            "
          >
            {/* =================================================
                MOBILE LOCATION
            ================================================== */}

            <div
              className="
                flex
                h-12
                shrink-0
                items-center
                justify-center
                md:hidden
              "
            >
              <UserLocationDisplay variant="mobile" />
            </div>

            {/* =================================================
                THEME TOGGLE
            ================================================== */}

            <div
              className="
                flex
                h-12
                shrink-0
                items-center
                justify-center
              "
            >
              <ThemeToggle />
            </div>

            {/* =================================================
                WISHLIST
            ================================================== */}

            <div
              className="
                flex
                h-12
                shrink-0
                items-center
                justify-center
              "
            >
              <WishlistNavButton />
            </div>

            {/* =================================================
                DESKTOP USER
            ================================================== */}

            <div
              className="
                hidden
                shrink-0
                md:block
              "
            >
              {session?.user ? <UserMenu /> : <LoginButton />}
            </div>

            {/* =================================================
                DESKTOP SELL
            ================================================== */}

            <div
              className="
                hidden
                shrink-0
                md:block
              "
            >
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