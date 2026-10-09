
import Link from "next/link";
import { auth } from "@/auth";
import { findServicesBySeller } from "@/lib/repositories/service.repository";
import MyServiceCard, {
  type MyService,
} from "@/components/dashboard/MyServiceCard";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Home,
  Plus,
  Rocket,
  Wrench,
} from "lucide-react";

interface MyServicesPageProps {
  searchParams?: Promise<{
    view?: string;
  }>;
}

export default async function MyServicesPage({
  searchParams,
}: MyServicesPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-[#020817]">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#0d172a]">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Login Required
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Please log in to manage your services and business listings.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-[#1565d8] px-6 py-3 text-sm font-bold text-white hover:bg-[#0f52ba]"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  const sellerId = String(session.user.id);
  const params = await searchParams;
  const showAll = params?.view === "all";

  const services = await findServicesBySeller(sellerId);

  const serializedServices: MyService[] = services.map((service) => ({
    _id: service._id!.toString(),
    title: service.title,
    slug: service.slug,
    listingType: service.listingType,
    category: service.category,
    subcategory: service.subcategory,
    description: service.description,
    status: service.status,
    thumbnail: service.thumbnail,
    location: {
      city: service.location?.city,
      district: service.location?.district,
      state: service.location?.state,
    },
    startingPrice: service.startingPrice,
    priceUnit: service.priceUnit,
    priceOnRequest: service.priceOnRequest,
    views: service.views ?? 0,
    enquiries: service.enquiries ?? 0,
    createdAt: service.createdAt
      ? new Date(service.createdAt).toISOString()
      : undefined,
  }));

  const totalServices = serializedServices.length;
  const visibleServices = showAll
    ? serializedServices
    : serializedServices.slice(0, 3);

  const hasMoreServices = totalServices > 3;

  return (
    <main className="min-h-screen overflow-x-clip bg-slate-50 py-5 text-slate-900 dark:bg-[#020817] dark:text-white sm:py-8">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 transition hover:border-[#1565d8] dark:border-slate-700 dark:bg-[#0d172a] dark:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1565d8] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f52ba]"
          >
            <Home size={17} />
            Home
          </Link>
        </div>

        {/* Heading */}
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1565d8]/10 text-[#1565d8]">
              <Wrench size={23} />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              My Services
            </h1>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Manage your published services and local business listings.
          </p>

          <Link
            href="/add-service"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#1565d8] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0f52ba] sm:w-auto sm:min-w-56"
          >
            <Plus size={18} />
            Add a Service
          </Link>
        </header>

        {totalServices === 0 ? (
          /* Empty State */
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-[#0d172a]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1565d8]/10 text-[#1565d8]">
              <Building2 size={28} />
            </div>

            <h2 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">
              No Services Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Publish your first service or business listing to help local
              customers discover your work.
            </p>

            <Link
              href="/add-service"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white hover:bg-[#0f52ba]"
            >
              <Plus size={17} />
              Publish Your First Service
            </Link>
          </section>
        ) : (
          <>
            {/* Total Listings — compact My Ads style */}
            <section className="mb-5 flex min-h-[102px] items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-[#0d172a] sm:px-6">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Listings
                </p>
                <p className="mt-1 text-3xl font-extrabold leading-none text-[#1565d8]">
                  {totalServices}
                </p>
              </div>

              <Link
                href="/add-service"
                aria-label="Add another service"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1565d8]/10 text-[#1565d8] transition hover:bg-[#1565d8]/20"
              >
                <Plus size={22} />
              </Link>
            </section>

            {/* Promotion card */}
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#0d172a] sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">
                    <Rocket size={22} className="text-amber-500" />
                  </div>

                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Promote Your Services
                  </h2>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Explore premium features and promotional options to help
                    more local customers discover your listings.
                  </p>
                </div>

                <Link
                  href="/dashboard/premium"
                  className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#0f52ba] sm:w-auto sm:min-w-48"
                >
                  Go Premium
                </Link>
              </div>
            </section>

            {/* Listings heading */}
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
                    Your Listings
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {showAll
                      ? "Showing all your service and business listings."
                      : "Manage your published listings."}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-[#1565d8]/10 px-3 py-1.5 text-xs font-extrabold text-[#1565d8]">
                    {totalServices}{" "}
                    {totalServices === 1 ? "Listing" : "Listings"}
                  </span>

                  {hasMoreServices && (
                    <Link
                      href={
                        showAll
                          ? "/dashboard/my-services"
                          : "/dashboard/my-services?view=all"
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-[#1565d8] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#0f52ba]"
                    >
                      {showAll ? "Less" : "All"}
                      <ArrowRight
                        size={13}
                        className={showAll ? "rotate-180" : ""}
                      />
                    </Link>
                  )}
                </div>
              </div>

              {/* Service cards */}
              <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleServices.map((service) => (
                  <MyServiceCard key={service._id} service={service} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
