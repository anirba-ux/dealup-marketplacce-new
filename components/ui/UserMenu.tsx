"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";

import {
  signOut,
  useSession,
} from "next-auth/react";

import {
  ChevronDown,
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
  const [open, setOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const {
    data: session,
  } = useSession();

  const t =
    useTranslations("common");

  // =====================================================
  // User Information
  // =====================================================

  const name =
    session?.user?.name ||
    "User";

  const image =
    session?.user?.image ||
    "/images/default-avatar.png";

  // =====================================================
  // Admin Check
  //
  // Only users whose role is exactly "admin"
  // will see the Admin Dashboard option.
  // =====================================================

  const isAdmin =
    session?.user?.role ===
    "admin";

  // =====================================================
  // Close Menu On Outside Click
  // =====================================================

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
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
        onClick={() =>
          setOpen(
            (prev) => !prev,
          )
        }
        className="flex items-center gap-3 rounded-full px-2 py-1 transition hover:bg-slate-100"
      >
        <Image
          src={
            image ||
            "/images/default-avatar.png"
          }
          alt={name}
          width={42}
          height={42}
          className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
        />

        <div className="hidden text-left sm:block">
          <p className="max-w-[140px] truncate text-sm font-semibold text-slate-800">
            {name}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t("myAccount")}
          </p>
        </div>

        <ChevronDown
          size={18}
          className={`hidden text-slate-500 dark:text-slate-400 transition sm:block ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {/* =================================================
          Dropdown Menu
      ================================================= */}

      {open && (
        <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">

          {/* =================================================
              User Header
          ================================================= */}

          <div className="border-b bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="truncate font-semibold text-slate-800 dark:text-white">
              {name}
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("manageAccount")}
            </p>

            {/* Admin Indicator */}

            {isAdmin && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                <ShieldCheck
                  size={13}
                />

                Administrator
              </div>
            )}
          </div>

          {/* =================================================
              Normal Menu Items
          ================================================= */}

          {menuItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  onClick={() =>
                    setOpen(
                      false,
                    )
                  }
                  className="flex items-center gap-3 px-5 py-3 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Icon
                    size={18}
                  />

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            },
          )}

          {/* =================================================
              ADMIN DASHBOARD
              
              Only visible to admin.
          ================================================= */}

          {isAdmin && (
            <>
              <div className="my-1 border-t border-slate-200 dark:border-slate-700" />

              <Link
                href="/admin"
                onClick={() =>
                  setOpen(
                    false,
                  )
                }
                className="flex items-center gap-3 px-5 py-3 font-semibold text-purple-700 transition hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-900/20"
              >
                <ShieldCheck
                  size={18}
                />

                <span>
                  Admin Dashboard
                </span>
              </Link>
            </>
          )}

          {/* =================================================
              Language
          ================================================= */}

          <div className="border-t border-slate-200 dark:border-slate-700" />

          <LanguageSwitcher />

          {/* =================================================
              Logout
          ================================================= */}

          <button
            onClick={() =>
              signOut({
                callbackUrl:
                  "/login",
              })
            }
            className="flex w-full items-center gap-3 px-5 py-3 font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut
              size={18}
            />

            <span>
              {t("logout")}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}