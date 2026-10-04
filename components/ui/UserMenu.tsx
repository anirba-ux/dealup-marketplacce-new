"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

import { signOut, useSession } from "next-auth/react";

import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";

export default function UserMenu() {
  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();

  const pathname = usePathname();

  const t = useTranslations("common");

  // =====================================================
  // User Information
  // =====================================================

  const name = session?.user?.name || "User";

  const image =
    session?.user?.image || "/images/default-avatar.png";

  // =====================================================
  // Admin Check
  //
  // Only users whose role is exactly "admin"
  // will see the Admin Dashboard option.
  // =====================================================

  const isAdmin = session?.user?.role === "admin";

  // =====================================================
  // My Ads Active Check
  //
  // My Ads parent stays expanded when user is inside:
  // /dashboard/my-ads
  // /dashboard/my-jobs
  // =====================================================

  const isMyAdsSection =
    pathname === "/dashboard/my-ads" ||
    pathname.startsWith("/dashboard/my-ads/") ||
    pathname === "/dashboard/my-jobs" ||
    pathname.startsWith("/dashboard/my-jobs/");

  const [myAdsOpen, setMyAdsOpen] =
    useState(isMyAdsSection);

  // =====================================================
  // Keep My Ads Expanded When Route Changes
  // =====================================================

  useEffect(() => {
    if (isMyAdsSection) {
      setMyAdsOpen(true);
    }
  }, [isMyAdsSection]);

  // =====================================================
  // Close Menu On Outside Click
  // =====================================================

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  // =====================================================
  // Normal User Menu Items
  // =====================================================

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

  // =====================================================
  // Render
  // =====================================================

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      {/* =================================================
          Profile Button
      ================================================= */}

      <button
        type="button"
        onClick={() =>
          setOpen((prev) => !prev)
        }
        className="
          flex
          items-center
          gap-3
          rounded-full
          px-2
          py-1
          transition
          hover:bg-slate-100
          dark:hover:bg-slate-800
        "
      >
        <Image
          src={image}
          alt={name}
          width={42}
          height={42}
          className="
            h-10
            w-10
            rounded-full
            border
            border-slate-200
            object-cover
            dark:border-slate-700
          "
          unoptimized
          onError={(event) => {
            event.currentTarget.src =
              "/images/default-avatar.png";
          }}
        />

        <div className="hidden text-left sm:block">
          <p
            className="
              max-w-[140px]
              truncate
              text-sm
              font-semibold
              text-slate-800
              dark:text-slate-100
            "
          >
            {name}
          </p>

          <p
            className="
              text-xs
              text-slate-500
              dark:text-slate-400
            "
          >
            {t("myAccount")}
          </p>
        </div>

        <ChevronDown
          size={18}
          className={`
            hidden
            text-slate-500
            transition
            dark:text-slate-400
            sm:block
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* =================================================
          Dropdown Menu
      ================================================= */}

      {open && (
        <div
          className="
            absolute
            right-0
            top-14
            z-50
            w-64
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-2xl
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          {/* =================================================
              User Header
          ================================================= */}

          <div
            className="
              border-b
              bg-slate-50
              px-5
              py-4
              dark:border-slate-700
              dark:bg-slate-800
            "
          >
            <p
              className="
                truncate
                font-semibold
                text-slate-800
                dark:text-white
              "
            >
              {name}
            </p>

            <p
              className="
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              {t("manageAccount")}
            </p>

            {/* Admin Indicator */}

            {isAdmin && (
              <div
                className="
                  mt-2
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
                  dark:bg-purple-900/40
                  dark:text-purple-300
                "
              >
                <ShieldCheck size={13} />

                <span>Administrator</span>
              </div>
            )}
          </div>

          {/* =================================================
              Normal Menu Items
          ================================================= */}

          {menuItems.slice(0, 2).map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`,
              );

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setOpen(false)
                }
                className={`
                  flex
                  items-center
                  gap-3
                  px-5
                  py-3
                  transition
                  ${
                    isActive
                      ? "bg-[#1565d8]/10 font-semibold text-[#1565d8] dark:bg-[#1565d8]/15 dark:text-blue-400"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  }
                `}
              >
                <Icon size={18} />

                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* =================================================
              MY ADS
              Parent Menu
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              setMyAdsOpen(
                (previous) => !previous,
              )
            }
            className={`
              flex
              w-full
              items-center
              justify-between
              px-5
              py-3
              text-left
              transition
              ${
                isMyAdsSection
                  ? "bg-[#1565d8]/10 font-semibold text-[#1565d8] dark:bg-[#1565d8]/15 dark:text-blue-400"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              }
            `}
          >
            <span className="flex items-center gap-3">
              <Package size={18} />

              <span>{t("myAds")}</span>
            </span>

            <ChevronRight
              size={17}
              className={`
                transition-transform
                duration-200
                ${
                  myAdsOpen
                    ? "rotate-90"
                    : ""
                }
              `}
            />
          </button>

          {/* =================================================
              MY ADS SUB MENU
          ================================================= */}

          {myAdsOpen && (
            <div
              className="
                border-y
                border-slate-100
                bg-slate-50/70
                py-1
                dark:border-slate-800
                dark:bg-slate-950/40
              "
            >
              {/* =================================================
                  My Products
              ================================================= */}

              <Link
                href="/dashboard/my-ads"
                onClick={() =>
                  setOpen(false)
                }
                className={`
                  ml-5
                  flex
                  items-center
                  gap-3
                  border-l-2
                  px-5
                  py-2.5
                  text-sm
                  transition
                  ${
                    pathname ===
                      "/dashboard/my-ads" ||
                    pathname.startsWith(
                      "/dashboard/my-ads/",
                    )
                      ? "border-[#1565d8] bg-[#1565d8]/10 font-semibold text-[#1565d8] dark:bg-[#1565d8]/15 dark:text-blue-400"
                      : "border-slate-200 text-slate-600 hover:border-[#1565d8] hover:bg-white hover:text-[#1565d8] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-blue-400"
                  }
                `}
              >
                <Package size={17} />

                <span>My Products</span>
              </Link>

              {/* =================================================
                  My Jobs
              ================================================= */}

              <Link
                href="/dashboard/my-jobs"
                onClick={() =>
                  setOpen(false)
                }
                className={`
                  ml-5
                  flex
                  items-center
                  gap-3
                  border-l-2
                  px-5
                  py-2.5
                  text-sm
                  transition
                  ${
                    pathname ===
                      "/dashboard/my-jobs" ||
                    pathname.startsWith(
                      "/dashboard/my-jobs/",
                    )
                      ? "border-[#1565d8] bg-[#1565d8]/10 font-semibold text-[#1565d8] dark:bg-[#1565d8]/15 dark:text-blue-400"
                      : "border-slate-200 text-slate-600 hover:border-[#1565d8] hover:bg-white hover:text-[#1565d8] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-blue-400"
                  }
                `}
              >
                <BriefcaseBusiness
                  size={17}
                />

                <span>My Jobs</span>
              </Link>
            </div>
          )}

          {/* =================================================
              Remaining Menu Items
              Wishlist / Messages / Settings
          ================================================= */}

          {menuItems.slice(2).map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              pathname.startsWith(
                `${item.href}/`,
              );

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() =>
                  setOpen(false)
                }
                className={`
                  flex
                  items-center
                  gap-3
                  px-5
                  py-3
                  transition
                  ${
                    isActive
                      ? "bg-[#1565d8]/10 font-semibold text-[#1565d8] dark:bg-[#1565d8]/15 dark:text-blue-400"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  }
                `}
              >
                <Icon size={18} />

                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* =================================================
              ADMIN DASHBOARD
              
              Only visible to admin.
          ================================================= */}

          {isAdmin && (
            <>
              <div
                className="
                  my-1
                  border-t
                  border-slate-200
                  dark:border-slate-700
                "
              />

              <Link
                href="/admin"
                onClick={() =>
                  setOpen(false)
                }
                className="
                  flex
                  items-center
                  gap-3
                  px-5
                  py-3
                  font-semibold
                  text-purple-700
                  transition
                  hover:bg-purple-50
                  dark:text-purple-300
                  dark:hover:bg-purple-900/20
                "
              >
                <ShieldCheck size={18} />

                <span>
                  Admin Dashboard
                </span>
              </Link>
            </>
          )}

          {/* =================================================
              Language
          ================================================= */}

          <div
            className="
              border-t
              border-slate-200
              dark:border-slate-700
            "
          />

          <LanguageSwitcher />

          {/* =================================================
              Logout
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              signOut({
                callbackUrl: "/login",
              })
            }
            className="
              flex
              w-full
              items-center
              gap-3
              px-5
              py-3
              font-medium
              text-red-600
              transition
              hover:bg-red-50
              dark:hover:bg-red-950/30
            "
          >
            <LogOut size={18} />

            <span>{t("logout")}</span>
          </button>
        </div>
      )}
    </div>
  );
}