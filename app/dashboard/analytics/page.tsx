import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  BadgeCheck,
  Eye,
  Heart,
  Home,
  MessageCircle,
  Package,
  Rocket,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import BackButton from "@/components/ui/BackButton";
import { getPremiumSellerStatus } from "@/lib/repositories/premium.repository";
import { getSellerAnalytics } from "@/lib/repositories/sellerAnalytics.repository";

function number(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function price(value: number) {
  return `₹ ${new Intl.NumberFormat("en-IN").format(value)}`;
}

function date(value: string | null) {
  return value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
}

function StatCard({
  icon,
  label,
  value,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  text: string;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#091526]">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1565d8] dark:bg-blue-500/10 dark:text-blue-300">
          {icon}
        </div>
        <TrendingUp className="h-4 w-4 text-emerald-500" />
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-3xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

export default async function SellerAnalyticsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const sellerId = String(session.user.id);

  const [premiumSeller, analytics] = await Promise.all([
    getPremiumSellerStatus(sellerId),
    getSellerAnalytics(sellerId, 10),
  ]);

  const enabled =
    premiumSeller?.active === true &&
    premiumSeller?.sellerAnalytics === true;

  if (!enabled) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-[#07111f] dark:text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <BackButton />
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <Home className="h-4 w-4" /> Home
            </Link>
          </div>

          <section className="overflow-hidden rounded-[30px] border border-blue-100 bg-white shadow-sm dark:border-white/10 dark:bg-[#091526]">
            <div className="bg-gradient-to-br from-[#1565d8] via-[#1976f3] to-[#0f52ba] px-6 py-12 text-white sm:px-10 sm:py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <BarChart3 className="h-7 w-7" />
              </div>
              <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                Premium Feature
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
                Seller Analytics
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                Understand product views, buyer interest and seller
                performance from one professional dashboard.
              </p>
              <Link
                href="/dashboard/premium"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#1565d8] shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                Upgrade to Premium
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const maxViews = Math.max(
    1,
    ...analytics.products.map((product) => product.views),
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 px-3 py-5 text-slate-900 sm:px-6 sm:py-8 lg:py-10 dark:bg-[#07111f] dark:text-white">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <BackButton />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm dark:border-white/10 dark:bg-white/5"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#091526]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1565d8] via-[#1976f3] to-[#0f52ba] px-5 py-7 text-white sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/15" />
            <div className="pointer-events-none absolute -bottom-28 right-20 h-52 w-52 rounded-full border border-white/10" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-100">
                    Premium Analytics
                  </span>
                </div>
                <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                  Seller Performance
                </p>
                <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  Know what sells.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                  Track views, buyer interest and your strongest listings with
                  live marketplace data.
                </p>
              </div>
              <Link
                href="/dashboard/my-ads"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white/12 px-4 py-3 text-sm font-bold ring-1 ring-white/20"
              >
                <ShoppingBag className="h-4 w-4" /> Manage My Ads
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Eye className="h-5 w-5" />} label="Total Views" value={number(analytics.totalViews)} text="Across all your listings" />
          <StatCard icon={<Package className="h-5 w-5" />} label="Active Ads" value={number(analytics.activeAds)} text="Currently live listings" />
          <StatCard icon={<ShoppingBag className="h-5 w-5" />} label="Total Ads" value={number(analytics.totalAds)} text={`${number(analytics.soldAds)} sold listings`} />
          <StatCard icon={<MessageCircle className="h-5 w-5" />} label="Buyer Inquiries" value={number(analytics.totalInquiries)} text="Conversations started" />
        </section>

        <section className="mt-5 grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[1.55fr_0.85fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#091526]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1565d8]">
              Product Performance
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">
              Your top listings
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Sorted by product views.
            </p>

            <div className="mt-6 space-y-3">
              {analytics.products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center dark:border-white/10">
                  <Package className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 font-bold">No listings yet</p>
                </div>
              ) : (
                analytics.products.map((product) => (
                  <Link
                    key={product.id}
                    href={product.slug ? `/products/${encodeURIComponent(product.slug)}` : `/products/${product.id}`}
                    className="group block min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-white/10 dark:bg-[#07111f]"
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-extrabold">{product.title}</h3>
                            <p className="mt-0.5 text-xs font-semibold text-[#1565d8]">
                              {price(product.price)}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-slate-200 px-2 py-1 text-[10px] font-bold capitalize text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            {product.status}
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-[#1565d8]"
                            style={{ width: `${Math.max(4, Math.round((product.views / maxViews) * 100))}%` }}
                          />
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{number(product.views)}</span>
                          <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{number(product.favorites)}</span>
                          <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{number(product.inquiries)}</span>
                          <span>{date(product.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#091526]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1565d8]">
              Engagement
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">
              Buyer interest
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Signals from your current listings.
            </p>

            <div className="mt-6 space-y-3">
              <div className="min-w-0 rounded-2xl bg-blue-50 p-4 dark:bg-blue-500/10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-bold"><Eye className="h-4 w-4 text-[#1565d8]" /> Views</span>
                  <strong className="text-xl font-black">{number(analytics.totalViews)}</strong>
                </div>
              </div>
              <div className="min-w-0 rounded-2xl bg-pink-50 p-4 dark:bg-pink-500/10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-bold"><Heart className="h-4 w-4 text-pink-500" /> Favorites</span>
                  <strong className="text-xl font-black">{number(analytics.totalFavorites)}</strong>
                </div>
              </div>
              <div className="min-w-0 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-bold"><MessageCircle className="h-4 w-4 text-emerald-600" /> Inquiries</span>
                  <strong className="text-xl font-black">{number(analytics.totalInquiries)}</strong>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#07111f]">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-[#1565d8]" />
                <p className="text-sm font-extrabold">Improve visibility</p>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Use Featured Ads and Product Boost to give eligible listings
                more visibility.
              </p>
              <Link href="/dashboard/premium" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1565d8] hover:underline">
                Manage Premium <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
