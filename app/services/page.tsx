import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";

const SITE_URL = "https://www.dealupmarketplace.com";

export const metadata = {
  title: "Services | Find Local Services Near You",
  description:
    "Find trusted local services near you on DealUp Marketplace. Discover AC repair, electricians, plumbers, tutors, repair services, professional services and more.",
  alternates: {
    canonical: `${SITE_URL}/services`,
  },
  openGraph: {
    title: "Find Local Services Near You | DealUp Marketplace",
    description:
      "Discover local service providers and businesses near you on DealUp Marketplace.",
    url: `${SITE_URL}/services`,
    siteName: "DealUp Marketplace",
    type: "website",
  },
};

const categories = [
  "Home Services",
  "Repair Services",
  "Education",
  "Beauty & Personal Care",
  "Professional Services",
  "Automotive",
  "Local Business",
];

const services = [
  {
    title: "Professional AC Repair & Service",
    category: "Home Services",
    subcategory: "AC Repair",
    location: "Bansberia, Hooghly",
    mode: "Home Visit",
    price: "₹499",
    description:
      "AC servicing, installation, gas refilling, cooling problem repair and maintenance.",
    businessName: "CoolCare AC Services",
    featured: true,
    verified: true,
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1565d8]/10 via-transparent to-[#f5a623]/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1565d8]/20 bg-[#1565d8]/10 px-4 py-2 text-sm font-bold text-[#1565d8]">
              <Wrench className="h-4 w-4" />
              DealUp Services
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Find Trusted
              <span className="block text-[#1565d8]">
                Local Services
              </span>
              Near You
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
              Discover local professionals, service providers and businesses
              near you. Compare services, prices and locations on DealUp
              Marketplace.
            </p>

            {/* Search */}
            <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  placeholder="Search AC repair, electrician, tutor..."
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-[#1565d8]/10 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <button
                type="button"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#1565d8] px-7 text-sm font-bold text-white shadow-lg shadow-[#1565d8]/20 transition hover:bg-[#1154b5]"
              >
                <Search className="h-5 w-5" />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Categories
              </h2>

              <div className="mt-4 space-y-1">
                <button
                  type="button"
                  className="w-full rounded-xl bg-[#1565d8]/10 px-3 py-2.5 text-left text-sm font-bold text-[#1565d8]"
                >
                  All Services
                </button>

                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="my-6 border-t border-slate-200 dark:border-white/10" />

              <div className="rounded-2xl bg-[#1565d8]/5 p-4 dark:bg-[#1565d8]/10">
                <ShieldCheck className="h-6 w-6 text-[#1565d8]" />

                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                  Find trusted providers
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Look for verified and trusted service providers.
                </p>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Local Services
                </p>

                <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  Services Near You
                </h2>
              </div>

              <select
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                defaultValue="latest"
              >
                <option value="latest">Latest</option>
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Service Cards */}
            <div className="grid gap-5 md:grid-cols-2">
              {services.map((service) => (
                <Link
                  key={service.title}
                  href="/services"
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-[#1565d8]/30 hover:shadow-xl hover:shadow-slate-200/50 dark:border-white/10 dark:bg-slate-900 dark:hover:shadow-black/20"
                >
                  {/* Image placeholder */}
                  <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-[#1565d8]/10 to-[#f5a623]/10">
                    <Wrench className="h-16 w-16 text-[#1565d8]/40" />

                    {service.featured && (
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#f5a623] px-3 py-1.5 text-xs font-black text-white">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#1565d8]">
                          {service.category}
                        </p>

                        <h3 className="mt-1 text-lg font-black text-slate-900 group-hover:text-[#1565d8] dark:text-white">
                          {service.title}
                        </h3>
                      </div>

                      {service.verified && (
                        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
                      )}
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {service.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-400">
                        {service.subcategory}
                      </span>

                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-400">
                        {service.mode}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
                      <div>
                        <p className="text-xs text-slate-400">
                          Starting from
                        </p>

                        <p className="text-lg font-black text-slate-900 dark:text-white">
                          {service.price}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {service.businessName}
                        </p>

                        <div className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {service.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty/Coming dynamic state */}
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-900">
              <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />

              <h3 className="mt-3 font-bold text-slate-900 dark:text-white">
                More local services coming soon
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Service providers can list their services on DealUp Marketplace.
              </p>

              <Link
                href="/add-service"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1154b5]"
              >
                Add Your Service
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}