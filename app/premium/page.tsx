import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Crown,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const plans = [
  {
    name: "Monthly",
    price: "₹99",
    period: "/ month",
    description: "Perfect for sellers getting started with Premium.",
    popular: false,
  },
  {
    name: "Quarterly",
    price: "₹249",
    period: "/ 3 months",
    description: "More value for sellers who sell regularly.",
    popular: true,
  },
  {
    name: "Yearly",
    price: "₹799",
    period: "/ year",
    description: "Best value for serious sellers.",
    popular: false,
  },
];

const features = [
  {
    icon: TrendingUp,
    title: "Featured Listings",
    description:
      "Get your products highlighted and reach more potential buyers.",
  },
  {
    icon: Zap,
    title: "Boost Your Products",
    description:
      "Increase product visibility and get more enquiries from nearby buyers.",
  },
  {
    icon: BadgeCheck,
    title: "Premium Seller Badge",
    description:
      "Show buyers that you are an active Premium seller on DealUp.",
  },
  {
    icon: BarChart3,
    title: "Seller Analytics",
    description:
      "Track your product performance and understand buyer interest.",
  },
  {
    icon: ShieldCheck,
    title: "Build Buyer Trust",
    description:
      "A stronger seller presence can help you stand out in the marketplace.",
  },
  {
    icon: Sparkles,
    title: "More Visibility",
    description:
      "Premium tools are designed to help your listings get noticed faster.",
  },
];

const benefits = [
  "Featured product visibility",
  "Premium Seller badge",
  "Free Boost quota",
  "Free Featured quota",
  "Seller analytics",
  "Better product visibility",
];

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1565d8] via-[#1769dc] to-[#0f52ba] px-6 py-20 text-white lg:px-8 lg:py-28">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">
              <Crown size={17} className="text-yellow-500" />
              DealUp Premium Seller
            </div>

            <h1 className="mt-7 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Sell Faster.
              <br />
              <span className="text-yellow-300">
                Reach More Buyers.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100 sm:text-xl">
              Give your products more visibility with DealUp Premium.
              Featured listings, product boosts, Premium Seller badge and
              powerful seller tools—all designed to help you sell faster.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/dashboard/premium"
                className="inline-flex items-center gap-2 rounded-xl bg-[#f5a623] px-7 py-4 font-bold text-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-yellow-400"
              >
                Upgrade Now
                <ArrowRight size={19} />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center rounded-xl border border-white/40 px-7 py-4 font-semibold text-white transition-all duration-300 hover:bg-white hover:text-[#1565d8]"
              >
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Premium */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-[#1565d8]">
              Why DealUp Premium?
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Everything you need to sell smarter
            </h2>

            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Premium gives sellers extra tools and visibility to make their
              products stand out in the DealUp marketplace.
            </p>
          </div>

          <div
            id="features"
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1565d8] transition-all duration-300 group-hover:bg-[#1565d8] group-hover:text-white dark:bg-blue-950">
                    <Icon size={28} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white px-6 py-20 dark:bg-slate-900 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-[#1565d8]">
              Premium Benefits
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Get more from every listing
            </h2>

            <p className="mt-5 leading-8 text-slate-600 dark:text-slate-400">
              DealUp Premium is built for sellers who want to improve
              visibility, reach more buyers and grow their sales.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950">
                    <Check size={17} />
                  </span>

                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-[#1565d8] to-[#0f52ba] p-8 text-white shadow-2xl sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <Crown size={26} className="text-yellow-300" />
              </div>

              <div>
                <p className="text-sm text-blue-100">Premium Seller</p>
                <h3 className="text-xl font-bold">
                  Stand out on DealUp
                </h3>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {benefits.slice(0, 4).map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 rounded-xl bg-white/10 p-4"
                >
                  <Check size={19} className="text-yellow-300" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/premium"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f5a623] px-6 py-4 font-bold text-slate-900 transition-all duration-300 hover:scale-[1.02] hover:bg-yellow-400"
            >
              Upgrade to Premium
              <ArrowRight size={19} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-[#1565d8]">
              Simple Pricing
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Choose your Premium plan
            </h2>

            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Pick the plan that works best for your selling goals.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl border bg-white p-7 shadow-sm dark:bg-slate-900 ${
                  plan.popular
                    ? "border-[#1565d8] shadow-xl ring-2 ring-[#1565d8]/10"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1565d8] px-4 py-1.5 text-xs font-bold text-white">
                    MOST POPULAR
                  </span>
                )}

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {plan.name}
                </h3>

                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {plan.price}
                  </span>

                  <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">
                    {plan.period}
                  </span>
                </div>

                <p className="mt-4 min-h-[56px] text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {plan.description}
                </p>

                <Link
                  href="/dashboard/premium"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-[#0f52ba]"
                >
                  Choose Plan
                  <ArrowRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-r from-[#1565d8] to-[#0f52ba] px-8 py-12 text-center text-white shadow-2xl sm:px-12">
          <Sparkles className="mx-auto text-yellow-300" size={32} />

          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            Ready to sell faster?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            Upgrade to DealUp Premium and give your products the visibility
            they deserve.
          </p>

          <Link
            href="/dashboard/premium"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#f5a623] px-8 py-4 font-bold text-slate-900 transition-all duration-300 hover:scale-105 hover:bg-yellow-400"
          >
            Get DealUp Premium
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>
    </main>
  );
}