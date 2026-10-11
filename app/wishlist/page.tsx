
import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, Heart, Package, BriefcaseBusiness } from "lucide-react";

import { auth } from "@/auth";
import BackButton from "@/components/ui/BackButton";
import WishlistGrid from "@/components/wishlist/WishlistGrid";
import SavedListingsSection from "@/components/wishlist/SavedListingsSection";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = String(session.user.id);

  return (
    <main className="min-h-screen bg-slate-50 py-5 dark:bg-slate-950 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
          <BackButton />

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f52ba] active:scale-95 sm:px-4"
          >
            <Home size={16} />
            <span>Home</span>
          </Link>
        </div>

        {/* Page heading */}
        <header className="mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-sm dark:bg-rose-950/40 dark:text-rose-400 sm:h-14 sm:w-14">
              <Heart className="h-6 w-6 fill-current sm:h-7 sm:w-7" />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                My Wishlist
              </h1>

              <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400 sm:text-base">
                All your favourite products, jobs, services and local businesses in one place.
              </p>
            </div>
          </div>
        </header>

        {/* Saved products */}
        <section aria-labelledby="saved-products-heading">
          <div className="mb-4 flex items-center gap-2">
            <Package size={21} className="text-[#1565d8]" />

            <h2
              id="saved-products-heading"
              className="text-xl font-bold text-slate-900 dark:text-white"
            >
              Saved Products
            </h2>
          </div>

          <WishlistGrid />
        </section>

        {/* Saved jobs, services and local businesses */}
        <section
          aria-labelledby="saved-listings-heading"
          className="mt-10"
        >
          <div className="mb-4 flex items-center gap-2">
            <BriefcaseBusiness
              size={21}
              className="text-[#1565d8]"
            />

            <h2
              id="saved-listings-heading"
              className="text-xl font-bold text-slate-900 dark:text-white"
            >
              Saved Jobs, Services & Businesses
            </h2>
          </div>

          <SavedListingsSection userId={userId} />
        </section>
      </div>
    </main>
  );
}
