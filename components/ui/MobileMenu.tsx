"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";

import LanguageSwitcher from "./LanguageSwitcher";

import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  PlusCircle,
  Settings,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  const { data: session } = useSession();

  const t = useTranslations("common");

  // =======================================================
  // Close menu with Escape key
  // =======================================================

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // =======================================================
  // Prevent body scroll when menu is open
  // =======================================================

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // =======================================================
  // User information
  // =======================================================

  const name = session?.user?.name || "User";

  const image = session?.user?.image || "/images/default-avatar.png";

  const isAdmin = session?.user?.role === "admin";

  // =======================================================
  // Menu items
  // =======================================================

  const menuItems = [
    {
      label: t("dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t("myProfile"),
      href: "/dashboard/profile",
      icon: User,
    },
    {
      label: t("myAds"),
      href: "/dashboard/my-ads",
      icon: Package,
    },
    {
      label: t("wishlist"),
      href: "/wishlist",
      icon: Heart,
    },
    {
      label: t("messages"),
      href: "/messages",
      icon: MessageCircle,
    },
    {
      label: t("settings"),
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <>
      {/* =====================================================
          HAMBURGER BUTTON
      ====================================================== */}

      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="
          flex
          h-10
          w-10
          shrink-0
          -translate-y-1.5
          items-center
          justify-center
          rounded-xl
          bg-[#1565D8]
          text-white
          shadow-sm
          shadow-[#1565D8]/20
          transition-all
          duration-200
          hover:bg-[#1257b8]
          hover:shadow-md
          hover:shadow-[#1565D8]/25
          active:scale-95
          dark:bg-[#1976F3]
          dark:shadow-[#1976F3]/20
          dark:hover:bg-[#1565D8]
          md:hidden
        "
      >
        <Menu size={22} strokeWidth={2.3} />
      </button>

      {/* =====================================================
          FULL SCREEN MOBILE MENU
      ====================================================== */}

      {open && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            md:hidden
          "
        >
          {/* =================================================
              BACKDROP
          ================================================= */}

          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
            className="
              absolute
              inset-0
              h-full
              w-full
              cursor-default
              bg-black/60
              backdrop-blur-[2px]
            "
          />

          {/* =================================================
              DRAWER
          ================================================= */}

          <aside
            className="
              absolute
              left-0
              top-0
              flex
              h-[100dvh]
              w-[88%]
              max-w-[380px]
              flex-col
              overflow-y-auto
              bg-white
              shadow-2xl
              dark:bg-slate-950
            "
          >
            {/* ===============================================
                BLUE HEADER
            ================================================ */}

            <div
              className="
                flex
                min-h-16
                shrink-0
                items-center
                justify-between
                bg-[#1565D8]
                px-5
                shadow-sm
                dark:bg-[#1976F3]
              "
            >
              {/* Logo / Brand */}

              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-[#1565D8]
                    shadow-sm
                  "
                >
                  <Menu size={20} strokeWidth={2.3} />
                </div>

                <div>
                  <p
                    className="
                      text-lg
                      font-extrabold
                      leading-none
                      text-white
                    "
                  >
                    DealUp
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      font-medium
                      text-white/70
                    "
                  >
                    Local Marketplace
                  </p>
                </div>
              </div>

              {/* Close */}

              <button
                type="button"
                aria-label="Close menu"
                onClick={closeMenu}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  text-white
                  transition
                  hover:bg-white/10
                  active:scale-95
                "
              >
                <X size={23} strokeWidth={2.2} />
              </button>
            </div>

            {/* ===============================================
                USER CARD
            ================================================ */}

            {session?.user ? (
              <div className="px-4 pt-4">
                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-4
                    dark:border-slate-800
                    dark:bg-slate-900
                  "
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={image}
                      alt={name}
                      width={48}
                      height={48}
                      className="
                        h-12
                        w-12
                        shrink-0
                        rounded-full
                        border-2
                        border-[#1565D8]
                        object-cover
                        shadow-sm
                        dark:border-[#1976F3]
                      "
                    />

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-sm
                          font-bold
                          text-slate-900
                          dark:text-white
                        "
                      >
                        {name}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-xs
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        {t("myAccount")}
                      </p>
                    </div>
                  </div>

                  {/* Admin badge */}

                  {isAdmin && (
                    <div
                      className="
                        mt-3
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-purple-100
                        px-2.5
                        py-1
                        text-xs
                        font-semibold
                        text-purple-700
                        dark:bg-purple-900/30
                        dark:text-purple-300
                      "
                    >
                      <ShieldCheck size={13} />
                      Administrator
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-4 pt-4">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#1565D8]
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#0f52ba]
                    dark:bg-[#1976F3]
                    dark:hover:bg-[#1565D8]
                  "
                >
                  Login
                </Link>
              </div>
            )}

            {/* ===============================================
                NAVIGATION
            ================================================ */}

            <div className="px-3 py-5">
              {session?.user && (
                <>
                  <p
                    className="
                      px-3
                      pb-2
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-slate-400
                    "
                  >
                    My Account
                  </p>

                  <div className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className="
                            group
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-3
                            text-sm
                            font-medium
                            text-slate-700
                            transition
                            duration-200
                            hover:bg-blue-50
                            hover:text-[#1565D8]
                            dark:text-slate-200
                            dark:hover:bg-[#1565D8]/10
                            dark:hover:text-[#1976F3]
                          "
                        >
                          <Icon
                            size={19}
                            strokeWidth={1.9}
                            className="
                              transition
                              group-hover:text-[#1565D8]
                              dark:group-hover:text-[#1976F3]
                            "
                          />

                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* =========================================
                      ADMIN
                  ========================================== */}

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      className="
                        mt-1
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-sm
                        font-semibold
                        text-purple-700
                        transition
                        hover:bg-purple-50
                        dark:text-purple-300
                        dark:hover:bg-purple-900/20
                      "
                    >
                      <ShieldCheck size={19} />

                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                </>
              )}

              {/* =============================================
                  SELL BUTTON
              ============================================== */}

              <div
                className="
                  mt-4
                  border-t
                  border-slate-200
                  pt-4
                  dark:border-slate-800
                "
              >
                <Link
                  href="/sell"
                  onClick={closeMenu}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#1565D8]
                    px-4
                    py-3.5
                    text-sm
                    font-extrabold
                    text-white
                    shadow-sm
                    transition
                    duration-200
                    hover:bg-[#0f52ba]
                    hover:shadow-md
                    active:scale-[0.98]
                    dark:bg-[#1976F3]
                    dark:hover:bg-[#1565D8]
                  "
                >
                  <PlusCircle size={19} strokeWidth={2.2} />

                  <span>+ {t("sell")}</span>
                </Link>
              </div>

              {/* =============================================
                  LANGUAGE
              ============================================== */}

              <div
                className="
                  mt-4
                  border-t
                  border-slate-200
                  pt-4
                  dark:border-slate-800
                "
              >
                <LanguageSwitcher />
              </div>

              {/* =============================================
                  LOGOUT
              ============================================== */}

              {session?.user && (
                <button
                  type="button"
                  onClick={() =>
                    signOut({
                      callbackUrl: "/login",
                    })
                  }
                  className="
                    mt-2
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    text-sm
                    font-medium
                    text-red-600
                    transition
                    hover:bg-red-50
                    dark:hover:bg-red-950/30
                  "
                >
                  <LogOut size={19} />

                  <span>{t("logout")}</span>
                </button>
              )}
            </div>

            {/* ===============================================
                FOOTER
            ================================================ */}

            <div
              className="
                mt-auto
                border-t
                border-slate-200
                px-5
                py-4
                dark:border-slate-800
              "
            >
              <p
                className="
                  text-center
                  text-[11px]
                  font-medium
                  text-slate-400
                "
              >
                DealUp Marketplace
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}