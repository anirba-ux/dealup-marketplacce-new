import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  MapPin,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";

import BackButton from "@/components/ui/BackButton";

export const metadata = {
  title: "About Us | DealUp",
  description:
    "Learn more about DealUp, a local marketplace built to make buying and selling easier within nearby cities.",
};

const values = [
  {
    icon: MapPin,
    title: "Local First",
    description:
      "DealUp focuses on connecting buyers and sellers within nearby cities and local communities.",
  },
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    description:
      "We are building features that help users make more informed and confident buying and selling decisions.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Sellers",
    description:
      "Seller verification and trust signals help buyers understand who they are dealing with.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "DealUp is designed around real local connections between buyers and sellers.",
  },
];

const features = [
  "Nearby product discovery",
  "Local seller connections",
  "Verified seller signals",
  "Simple product listings",
  "Wishlist and saved products",
  "Premium seller features",
];

export default function AboutPage() {
  return (
    <main
      className="
        min-h-screen
        overflow-hidden
        bg-slate-50
        text-slate-900
        transition-colors duration-300
        dark:bg-[#07111f]
        dark:text-white
      "
    >
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative">
        {/* Background shapes */}
        <div
          className="
            pointer-events-none absolute
            -right-32 -top-32
            h-80 w-80
            rounded-full
            bg-[#1565d8]/10
            blur-3xl
            dark:bg-blue-500/10
          "
        />

        <div
          className="
            pointer-events-none absolute
            -left-32 top-40
            h-72 w-72
            rounded-full
            bg-[#f5a623]/10
            blur-3xl
            dark:bg-orange-400/10
          "
        />

        <div
          className="
            relative mx-auto
            max-w-7xl
            px-4
            pb-16
            pt-6

            sm:px-6
            sm:pb-20
            sm:pt-8

            lg:px-8
            lg:pb-24
            lg:pt-10
          "
        >
          {/* Back + Home */}
          <div className="mb-10 flex items-center justify-between gap-3">
            <BackButton />

            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                py-2
                text-sm
                font-semibold
                text-slate-700
                shadow-sm
                transition-all duration-200
                hover:border-[#1565d8]/30
                hover:bg-slate-50
                hover:text-[#1565d8]
                active:scale-95

                dark:border-white/20
                dark:bg-white/10
                dark:text-white
                dark:hover:bg-white/15
              "
            >
              Home
            </Link>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            {/* Left */}
            <div>
              <div
                className="
                  mb-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#1565d8]/20
                  bg-[#1565d8]/5
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-[#1565d8]
                  dark:border-blue-400/20
                  dark:bg-blue-400/10
                  dark:text-blue-300
                "
              >
                <Globe2 className="h-3.5 w-3.5" />
                About DealUp
              </div>

              <h1
                className="
                  max-w-4xl
                  text-4xl
                  font-black
                  leading-[1.05]
                  tracking-tight

                  sm:text-5xl

                  lg:text-7xl
                "
              >
                Making local
                <span className="block text-[#1565d8]">
                  buying & selling
                </span>
                easier.
              </h1>

              <p
                className="
                  mt-6
                  max-w-2xl
                  text-base
                  leading-7
                  text-slate-600

                  sm:text-lg

                  dark:text-slate-300
                "
              >
                DealUp is a local marketplace designed to help people
                discover products, connect with nearby sellers and make
                local buying and selling simpler.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#1565d8]
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-blue-500/20
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-[#0f52ba]
                    active:scale-95
                  "
                >
                  Explore Marketplace
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/sell"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-slate-700
                    shadow-sm
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:border-[#1565d8]/30
                    hover:text-[#1565d8]
                    active:scale-95

                    dark:border-white/15
                    dark:bg-white/5
                    dark:text-white
                    dark:hover:bg-white/10
                  "
                >
                  Start Selling
                </Link>
              </div>
            </div>

            {/* Right visual */}
            <div className="relative">
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[32px]
                  border
                  border-slate-200
                  bg-white
                  p-6
                  shadow-[0_25px_80px_rgba(15,23,42,0.10)]

                  dark:border-white/10
                  dark:bg-[#0b192b]
                  dark:shadow-[0_25px_80px_rgba(0,0,0,0.30)]
                "
              >
                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#1565d8]
                    text-white
                    shadow-lg
                  "
                >
                  <Store className="h-8 w-8" />
                </div>

                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Local Marketplace
                </p>

                <h2
                  className="
                    mt-3
                    text-3xl
                    font-black
                    tracking-tight
                    text-slate-900

                    dark:text-white
                  "
                >
                  Discover.
                  <br />
                  Connect.
                  <br />
                  Trade locally.
                </h2>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <InfoBox value="Local" label="Community" />
                  <InfoBox value="Nearby" label="Discovery" />
                  <InfoBox value="Trusted" label="Sellers" />
                  <InfoBox value="Simple" label="Trading" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION
      ====================================================== */}
      <section className="border-y border-slate-200 bg-white dark:border-white/10 dark:bg-[#091526]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1565d8]">
              Our Mission
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Bring local commerce closer to people.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              We believe buying and selling locally should be simple,
              accessible and trustworthy. DealUp is being built to make
              it easier for people to find useful products around them
              and connect with local buyers and sellers.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          VALUES
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1565d8]">
            What We Care About
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Built around local trust.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  group
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  shadow-sm
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-xl

                  dark:border-white/10
                  dark:bg-[#0b192b]
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#1565d8]/10
                    text-[#1565d8]
                    transition-transform duration-300
                    group-hover:scale-110
                    dark:bg-blue-400/10
                    dark:text-blue-300
                  "
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ====================================================== */}
      <section className="bg-slate-100 dark:bg-[#06101f]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1565d8]">
                The DealUp Experience
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Everything designed around local commerce.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
                From discovering nearby products to connecting with
                sellers, DealUp brings the essential marketplace
                experience together in one place.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-4
                    text-sm
                    font-semibold
                    shadow-sm

                    dark:border-white/10
                    dark:bg-[#0b192b]
                  "
                >
                  <div className="h-2 w-2 shrink-0 rounded-full bg-[#f5a623]" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div
          className="
            overflow-hidden
            rounded-[28px]
            bg-gradient-to-br
            from-[#1565d8]
            to-[#0f52ba]
            px-6
            py-10
            text-white
            shadow-[0_25px_70px_rgba(21,101,216,0.25)]

            sm:px-10
            sm:py-12

            lg:px-14
            lg:py-14
          "
        >
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-100">
              Join DealUp
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Ready to buy or sell locally?
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Explore products around you or create your first listing
              and start connecting with local buyers.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-[#1565d8]
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-slate-50
                  active:scale-95
                "
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/sell"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/30
                  bg-white/10
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  backdrop-blur-sm
                  transition-all
                  hover:bg-white/20
                  active:scale-95
                "
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBox({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        px-4
        py-3

        dark:border-white/10
        dark:bg-white/5
      "
    >
      <p className="text-sm font-bold">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}