
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import {
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronRight,
  Headphones,
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
  Wrench,
  X,
} from "lucide-react";

const serviceHref = "/dashboard/my-services";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [myAdsOpen, setMyAdsOpen] = useState(false);

  const pathname = usePathname();
  const { data: session } = useSession();
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
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const closeMenu = () => setOpen(false);

  const standardItems = [
    { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("myProfile"), href: "/dashboard/profile", icon: User },
    { label: t("wishlist"), href: "/wishlist", icon: Heart },
    { label: t("messages"), href: "/messages", icon: MessageCircle },
    { label: t("settings"), href: "/dashboard/settings", icon: Settings },
    { label: "Help Center", href: "/help", icon: Headphones },
  ];

  const adsItems = [
    { label: "My Products", href: "/dashboard/my-ads", icon: Package },
    { label: "My Jobs", href: "/dashboard/my-jobs", icon: BriefcaseBusiness },
    { label: "My Services", href: serviceHref, icon: Wrench },
  ];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      active
        ? "bg-blue-50 text-[#1565D8] dark:bg-[#1565D8]/10 dark:text-[#1976F3]"
        : "text-slate-700 hover:bg-blue-50 hover:text-[#1565D8] dark:text-slate-200 dark:hover:bg-[#1565D8]/10 dark:hover:text-[#1976F3]"
    }`;

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 shrink-0 -translate-y-1.5 items-center justify-center rounded-xl bg-[#1565D8] text-white shadow-sm transition hover:bg-[#1257b8] active:scale-95 dark:bg-[#1976F3] md:hidden"
      >
        <Menu size={22} strokeWidth={2.3} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
            className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-[2px]"
          />

          <aside className="absolute left-0 top-0 flex h-[100dvh] w-[88%] max-w-[380px] flex-col overflow-y-auto overscroll-contain bg-white shadow-2xl dark:bg-slate-950">
            <div className="flex min-h-14 shrink-0 items-center justify-between bg-[#1565D8] px-4 text-white dark:bg-[#1976F3]">
              <div>
                <p className="text-lg font-extrabold leading-tight">DealUp</p>
                <p className="text-[10px] text-white/75">Local Marketplace</p>
              </div>

              <button
                type="button"
                aria-label="Close menu"
                onClick={closeMenu}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition hover:bg-white/10"
              >
                <X size={22} />
              </button>
            </div>

            {session?.user ? (
              <div className="shrink-0 px-3 pt-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <Image
                      src={image}
                      alt={name}
                      width={42}
                      height={42}
                      unoptimized
                      onError={(event) => {
                        event.currentTarget.src = "/images/default-avatar.png";
                      }}
                      className="h-10 w-10 shrink-0 rounded-full border-2 border-[#1565D8] object-cover dark:border-[#1976F3]"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t("myAccount")}
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-[11px] font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      <ShieldCheck size={12} />
                      Administrator
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="shrink-0 px-3 pt-3">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center rounded-xl bg-[#1565D8] px-4 py-2.5 text-sm font-bold text-white dark:bg-[#1976F3]"
                >
                  Login
                </Link>
              </div>
            )}

            <div className="px-3 py-3">
              {session?.user && (
                <>
                  <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    My Account
                  </p>

                  <div className="space-y-1">
                    {standardItems.slice(0, 2).map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className={navItemClass(isActive(item.href))}
                        >
                          <Icon size={18} />
                          {item.label}
                        </Link>
                      );
                    })}

                    <button
                      type="button"
                      aria-expanded={myAdsOpen}
                      onClick={() => setMyAdsOpen((previous) => !previous)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isMyAdsSection
                          ? "bg-blue-50 text-[#1565D8] dark:bg-[#1565D8]/10 dark:text-[#1976F3]"
                          : "text-slate-700 hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-[#1565D8]/10"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Package size={18} />
                        {t("myAds")}
                      </span>
                      {myAdsOpen ? (
                        <ChevronDown size={17} />
                      ) : (
                        <ChevronRight size={17} />
                      )}
                    </button>

                    {myAdsOpen && (
                      <div className="ml-4 space-y-1 border-l-2 border-blue-100 pl-3 dark:border-blue-900/40">
                        {adsItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={closeMenu}
                              className={navItemClass(isActive(item.href))}
                            >
                              <Icon size={17} />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {standardItems.slice(2).map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className={navItemClass(isActive(item.href))}
                        >
                          <Icon size={18} />
                          {item.label}
                        </Link>
                      );
                    })}

                    <NotificationBell
                      variant="menu"
                      onNavigate={closeMenu}
                    />

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-900/20"
                      >
                        <ShieldCheck size={18} />
                        Admin Dashboard
                      </Link>
                    )}
                  </div>
                </>
              )}

              <div className="mt-3 shrink-0 border-t border-slate-200 pt-3 dark:border-slate-800">
                <Link
                  href="/sell"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565D8] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#0f52ba] dark:bg-[#1976F3]"
                >
                  <PlusCircle size={18} />
                  + {t("sell")}
                </Link>
              </div>

              <div className="mt-3 shrink-0 border-t border-slate-200 pt-3 dark:border-slate-800">
                <LanguageSwitcher />
              </div>

              {session?.user && (
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="mt-2 flex w-full shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut size={18} />
                  {t("logout")}
                </button>
              )}
            </div>

            <div className="mt-auto shrink-0 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
              <p className="text-center text-[11px] font-medium text-slate-400">
                DealUp Marketplace
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
