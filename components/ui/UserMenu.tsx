
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  BriefcaseBusiness,
  Building2,
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
  Wrench,
} from "lucide-react";

const serviceHref = "/dashboard/my-services";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [myAdsOpen, setMyAdsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const pathname = usePathname();
  const t = useTranslations("common");

  const name = session?.user?.name || "User";
  const image = session?.user?.image || "/images/default-avatar.png";
  const isAdmin = session?.user?.role === "admin";

  const isMyAdsSection =
    pathname === "/dashboard/my-ads" ||
    pathname.startsWith("/dashboard/my-ads/") ||
    pathname === "/dashboard/my-jobs" ||
    pathname.startsWith("/dashboard/my-jobs/") ||
    pathname === serviceHref ||
    pathname.startsWith(`${serviceHref}/`);

  useEffect(() => {
    if (isMyAdsSection) setMyAdsOpen(true);
  }, [isMyAdsSection]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const standardItems = [
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
  ];

  const otherItems = [
    { label: t("wishlist"), href: "/wishlist", icon: Heart },
    { label: t("messages"), href: "/messages", icon: MessageCircle },
    { label: t("settings"), href: "/dashboard/settings", icon: Settings },
  ];

  const adsItems = [
    { label: "My Products", href: "/dashboard/my-ads", icon: Package },
    { label: "My Jobs", href: "/dashboard/my-jobs", icon: BriefcaseBusiness },
    { label: "My Services", href: serviceHref, icon: Wrench },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const itemClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm transition ${
      active
        ? "bg-[#1565d8]/10 font-semibold text-[#1565d8] dark:text-blue-400"
        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Image
          src={image}
          alt={name}
          width={38}
          height={38}
          unoptimized
          onError={(event) => {
            event.currentTarget.src = "/images/default-avatar.png";
          }}
          className="h-9 w-9 rounded-full border border-slate-200 object-cover dark:border-slate-700"
        />

        <span className="hidden max-w-[140px] text-left sm:block">
          <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {name}
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            {t("myAccount")}
          </span>
        </span>

        <ChevronDown
          size={17}
          className={`hidden text-slate-500 transition sm:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-[100] flex max-h-[calc(100dvh-5rem)] w-64 flex-col overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          role="menu"
        >
          <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("manageAccount")}
            </p>

            {isAdmin && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                <ShieldCheck size={12} />
                Administrator
              </span>
            )}
          </div>

          {standardItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={itemClass(isActive(item.href))}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            aria-expanded={myAdsOpen}
            onClick={() => setMyAdsOpen((previous) => !previous)}
            className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition ${
              isMyAdsSection
                ? "bg-[#1565d8]/10 font-semibold text-[#1565d8] dark:text-blue-400"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <span className="flex items-center gap-3">
              <Package size={17} />
              My Ads
            </span>
            <ChevronRight
              size={16}
              className={`transition-transform ${myAdsOpen ? "rotate-90" : ""}`}
            />
          </button>

          {myAdsOpen && (
            <div className="shrink-0 border-y border-slate-100 bg-slate-50/70 py-1 dark:border-slate-800 dark:bg-slate-950/40">
              {adsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`ml-4 flex items-center gap-3 border-l-2 px-4 py-2 text-sm transition ${
                      isActive(item.href)
                        ? "border-[#1565d8] bg-[#1565d8]/10 font-semibold text-[#1565d8] dark:text-blue-400"
                        : "border-slate-200 text-slate-600 hover:border-[#1565d8] hover:text-[#1565d8] dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {otherItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={itemClass(isActive(item.href))}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-900/20"
            >
              <ShieldCheck size={17} />
              Admin Dashboard
            </Link>
          )}

          <div className="shrink-0 border-t border-slate-200 dark:border-slate-700">
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full shrink-0 items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-slate-800 dark:hover:bg-red-950/30"
          >
            <LogOut size={17} />
            {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}
