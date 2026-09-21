import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Car,
  ChevronRight,
  Home,
  Laptop,
  MapPin,
  MessageCircle,
  Smartphone,
  Users,
  Wrench,
} from "lucide-react";

/* =========================================================
   CITY CONFIG
========================================================= */

type CityConfig = {
  name: string;
  district: string;
  state: string;
  image: string;
  description: string;
};

const cities: Record<string, CityConfig> = {
  bansberia: {
    name: "Bansberia",
    district: "Hooghly",
    state: "West Bengal",
    image: "/images/cities/hanseswari_temple.png",
    description:
      "Discover new and used products from local sellers in Bansberia. Find nearby listings, connect with sellers and make local buying and selling simpler with DealUp Marketplace.",
  },

  hooghly: {
    name: "Hooghly",
    district: "Hooghly",
    state: "West Bengal",
    image: "/images/cities/hooghly_img.png",
    description:
      "Discover new and used products from local sellers in Hooghly. Find nearby listings, connect with buyers and sellers and explore local deals with DealUp Marketplace.",
  },

  chinsurah: {
    name: "Chinsurah",
    district: "Hooghly",
    state: "West Bengal",
    image: "/images/cities/chuchura_img.png",
    description:
      "Buy and sell new and used products in Chinsurah. Discover local listings, connect with nearby sellers and find products around your area with DealUp Marketplace.",
  },

  tribeni: {
    name: "Tribeni",
    district: "Hooghly",
    state: "West Bengal",
    image: "/images/cities/tribeni_img.png",
    description:
      "Discover local products and listings in Tribeni. Buy and sell with nearby people and connect with local buyers and sellers through DealUp Marketplace.",
  },

  kalyani: {
    name: "Kalyani",
    district: "Nadia",
    state: "West Bengal",
    image: "/images/cities/kalyani_img.png",
    description:
      "Explore new and used products in Kalyani. Discover nearby listings, connect with local sellers and make buying and selling easier with DealUp Marketplace.",
  },

  kolkata: {
    name: "Kolkata",
    district: "Kolkata",
    state: "West Bengal",
    image: "/images/cities/kolkata_img.png",
    description:
      "Explore local products and listings across Kolkata. Discover nearby sellers, connect with buyers and find new and used products with DealUp Marketplace.",
  },

  serampore: {
    name: "Serampore",
    district: "Hooghly",
    state: "West Bengal",
    image: "/images/cities/sreerampur_img.jpg",
    description:
      "Buy and sell locally in Serampore. Discover nearby products, connect with local sellers and explore new and used listings with DealUp Marketplace.",
  },

  chandannagar: {
    name: "Chandannagar",
    district: "Hooghly",
    state: "West Bengal",
    image: "/images/cities/chandanagar_img.png",
    description:
      "Discover local products in Chandannagar. Find nearby listings, connect with sellers and make local buying and selling simpler with DealUp Marketplace.",
  },
};

/* =========================================================
   CATEGORY CONFIG
========================================================= */

const categories = [
  {
    name: "Mobiles",
    icon: Smartphone,
    slug: "mobile-phones",
  },
  {
    name: "Cars",
    icon: Car,
    slug: "cars",
  },
  {
    name: "Bikes",
    icon: Bike,
    slug: "bikes",
  },
  {
    name: "Electronics",
    icon: Laptop,
    slug: "electronics",
  },
  {
    name: "Property",
    icon: Building2,
    slug: "property",
  },
  {
    name: "Jobs",
    icon: BriefcaseBusiness,
    slug: "jobs",
  },
  {
    name: "Books",
    icon: BookOpen,
    slug: "books",
  },
  {
    name: "Services",
    icon: Wrench,
    slug: "services",
  },
];

/* =========================================================
   STATIC PARAMS
========================================================= */

export function generateStaticParams() {
  return Object.keys(cities).map((city) => ({
    city,
  }));
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;

  const cityData = cities[city.toLowerCase()];

  if (!cityData) {
    return {
      title: "Local Marketplace | DealUp Marketplace",
      description:
        "Discover local products and connect with nearby buyers and sellers on DealUp Marketplace.",
    };
  }

  const pageUrl = `https://www.dealupmarketplace.com/local-marketplace/${city.toLowerCase()}`;

  const title = `Buy & Sell in ${cityData.name} | Local Marketplace`;

  return {
    title,

    description: cityData.description,

    alternates: {
      canonical: pageUrl,
    },

    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: "DealUp Marketplace",
      locale: "en_IN",
      title,
      description: cityData.description,
      images: [
        {
          url: cityData.image,
          alt: `${cityData.name} local marketplace`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description: cityData.description,
      images: [cityData.image],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function LocalCityMarketplacePage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;

  const cityData = cities[city.toLowerCase()];

  /* =======================================================
     INVALID CITY
  ======================================================= */

  if (!cityData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900 dark:bg-[#050b16] dark:text-white">
        <div className="text-center">
          <h1 className="text-3xl font-black">
            Local marketplace not found
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-400">
            The requested city marketplace could not be found.
          </p>

          <Link
            href="/local-marketplace"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Local Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const citySlug = city.toLowerCase();

  const pageUrl = `https://www.dealupmarketplace.com/local-marketplace/${citySlug}`;

  /* =======================================================
     JSON-LD
  ======================================================= */

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: `Buy & Sell in ${cityData.name} | Local Marketplace`,
    description: cityData.description,
    isPartOf: {
      "@id": "https://www.dealupmarketplace.com/#website",
    },
    about: {
      "@id": "https://www.dealupmarketplace.com/#organization",
    },
  };

  return (
    <>
      {/* =====================================================
          JSON-LD
      ====================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageJsonLd),
        }}
      />

      <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#050b16] dark:text-white">
        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative overflow-hidden border-b border-slate-200 dark:border-white/5">
          {/* Background image */}

          <div className="absolute inset-0">
            <Image
              src={cityData.image}
              alt={`${cityData.name} local marketplace`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-white/85 dark:bg-[#030914]/88" />

            <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/95 to-slate-50/75 dark:from-[#061327]/98 dark:via-[#061327]/88 dark:to-[#061327]/55" />
          </div>

          {/* Content */}

          <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            {/* =================================================
                NAVIGATION
            ================================================= */}

            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-slate-300
                  bg-white/80
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-slate-700
                  shadow-sm
                  backdrop-blur
                  transition
                  hover:-translate-y-0.5
                  hover:border-[#1565d8]
                  hover:text-[#1565d8]
                  dark:border-white/15
                  dark:bg-white/5
                  dark:text-white
                  dark:hover:border-blue-400
                  dark:hover:text-blue-400
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>

              <Link
                href="/"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-slate-300
                  bg-white/80
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-slate-700
                  shadow-sm
                  backdrop-blur
                  transition
                  hover:-translate-y-0.5
                  hover:border-[#1565d8]
                  hover:text-[#1565d8]
                  dark:border-white/15
                  dark:bg-white/5
                  dark:text-white
                  dark:hover:border-blue-400
                  dark:hover:text-blue-400
                "
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
            </div>

            {/* =================================================
                HERO CONTENT
            ================================================= */}

            <div className="grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:py-24">
              {/* LEFT */}

              <div className="max-w-3xl">
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-[#1565d8]/20
                    bg-[#1565d8]/10
                    px-4
                    py-2
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-[#1565d8]
                    dark:border-blue-400/20
                    dark:bg-blue-500/10
                    dark:text-blue-400
                  "
                >
                  <MapPin className="h-3.5 w-3.5" />

                  {cityData.name} · {cityData.district}
                </div>

                <h1
                  className="
                    mt-6
                    max-w-3xl
                    text-4xl
                    font-black
                    leading-[0.98]
                    tracking-tight
                    sm:text-5xl
                    lg:text-7xl
                  "
                >
                  Buy & Sell in{" "}
                  <span className="text-[#1565d8] dark:text-[#3b82f6]">
                    {cityData.name}.
                  </span>
                </h1>

                <p
                  className="
                    mt-6
                    max-w-2xl
                    text-base
                    leading-7
                    text-slate-600
                    sm:text-lg
                    sm:leading-8
                    dark:text-slate-300
                  "
                >
                  {cityData.description}
                </p>

                {/* BUTTONS */}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/search?city=${encodeURIComponent(
                      cityData.name,
                    )}`}
                    className="
                      group
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#1565d8]
                      px-6
                      py-3.5
                      text-sm
                      font-black
                      text-white
                      shadow-lg
                      shadow-blue-900/20
                      transition
                      hover:-translate-y-0.5
                      hover:bg-[#0f52ba]
                    "
                  >
                    Browse {cityData.name} Listings

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                      border-slate-300
                      bg-white/80
                      px-6
                      py-3.5
                      text-sm
                      font-black
                      text-slate-800
                      backdrop-blur
                      transition
                      hover:-translate-y-0.5
                      hover:border-[#1565d8]
                      hover:text-[#1565d8]
                      dark:border-white/15
                      dark:bg-white/5
                      dark:text-white
                      dark:hover:border-blue-400
                      dark:hover:text-blue-400
                    "
                  >
                    Sell in {cityData.name}
                  </Link>
                </div>

                
                
              </div>

              {/* RIGHT IMAGE */}

              <div className="relative mx-auto w-full max-w-xl">
                <div className="absolute -inset-5 rounded-[2.5rem] bg-[#1565d8]/20 blur-3xl dark:bg-blue-500/15" />

                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-[2rem]
                    border
                    border-slate-300
                    bg-white/70
                    p-3
                    shadow-2xl
                    backdrop-blur
                    dark:border-white/15
                    dark:bg-white/5
                  "
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                    <Image
                      src={cityData.image}
                      alt={`${cityData.name}, ${cityData.district}`}
                      fill
                      sizes="(max-width: 1024px) 92vw, 520px"
                      className="object-cover transition duration-700 hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/65
                          p-4
                          text-white
                          shadow-xl
                          backdrop-blur-md
                        "
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1565d8]">
                          <MapPin className="h-6 w-6" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-base font-black">
                            {cityData.name}
                          </p>

                          <p className="text-xs text-white/65">
                            {cityData.district}, {cityData.state}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                BENEFITS
            ================================================= */}

            <div className="grid gap-3 pb-12 sm:grid-cols-2 lg:grid-cols-4 lg:pb-16">
              {[
                {
                  icon: Users,
                  title: "Local Sellers",
                  text: "Buy directly from people nearby.",
                },
                {
                  icon: MapPin,
                  title: "Nearby Products",
                  text: "Discover products close to you.",
                },
                {
                  icon: Users,
                  title: "Local Buyers",
                  text: `Reach buyers around ${cityData.name}.`,
                },
                {
                  icon: MessageCircle,
                  title: "Easy Communication",
                  text: "Chat and discuss before buying.",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="
                      group
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white/80
                      p-5
                      shadow-sm
                      backdrop-blur
                      transition
                      hover:-translate-y-1
                      hover:border-[#1565d8]/40
                      hover:shadow-lg
                      dark:border-white/10
                      dark:bg-white/[0.04]
                      dark:hover:border-blue-400/30
                    "
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-[#1565d8]/10
                          text-[#1565d8]
                          dark:bg-blue-500/10
                          dark:text-blue-400
                        "
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-black">
                            {item.title}
                          </h2>

                          <span className="text-[10px] font-black text-slate-400">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            CATEGORY SECTION
        ====================================================== */}

        <section className="bg-white py-14 dark:bg-[#050b16] sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* HEADING */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-[#f5a623]
                  "
                >
                  Explore {cityData.name}
                </span>

                <h2
                  className="
                    mt-3
                    text-3xl
                    font-black
                    tracking-tight
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  Browse popular categories
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
                  Explore products and local listings available in{" "}
                  {cityData.name} by category.
                </p>
              </div>

              <Link
                href={`/search?city=${encodeURIComponent(
                  cityData.name,
                )}`}
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  text-sm
                  font-black
                  text-[#1565d8]
                  transition
                  hover:gap-3
                  dark:text-blue-400
                "
              >
                View all listings
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* CATEGORY GRID */}

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <Link
                    key={category.slug}
                    href={`/search?city=${encodeURIComponent(
                      cityData.name,
                    )}&category=${category.slug}`}
                    className="
                      group
                      rounded-2xl
                      border
                      border-slate-200
                      bg-slate-50
                      p-4
                      transition
                      hover:-translate-y-1
                      hover:border-[#1565d8]/40
                      hover:bg-white
                      hover:shadow-lg
                      dark:border-white/10
                      dark:bg-[#0b182b]
                      dark:hover:border-blue-400/30
                      dark:hover:bg-[#0e1d33]
                      sm:p-5
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
                        transition
                        group-hover:bg-[#1565d8]
                        group-hover:text-white
                        dark:bg-blue-500/10
                        dark:text-blue-400
                        dark:group-hover:bg-blue-500
                      "
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 text-sm font-black sm:text-base">
                      {category.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-400 transition group-hover:text-[#1565d8] dark:group-hover:text-blue-400">
                      Explore
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            LOCAL MARKETPLACE CTA
        ====================================================== */}

        <section className="px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <div className="mx-auto max-w-7xl">
            <div
              className="
                relative
                overflow-hidden
                rounded-[2rem]
                bg-[#1565d8]
                px-6
                py-10
                text-white
                shadow-2xl
                shadow-blue-900/20
                sm:px-10
                sm:py-12
                lg:px-14
                lg:py-16
              "
            >
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

              <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

              <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                    Local Marketplace
                  </span>

                  <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    Buy local.
                    <br />
                    Sell local.
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                    Discover products near you, connect with local sellers
                    and make your next deal closer to home in{" "}
                    {cityData.name}.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link
                    href={`/search?city=${encodeURIComponent(
                      cityData.name,
                    )}`}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-white
                      px-6
                      py-3.5
                      text-sm
                      font-black
                      text-[#1565d8]
                      transition
                      hover:-translate-y-0.5
                      hover:bg-slate-100
                    "
                  >
                    Browse Listings
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
                      border-white/25
                      bg-white/10
                      px-6
                      py-3.5
                      text-sm
                      font-black
                      text-white
                      backdrop-blur
                      transition
                      hover:bg-white/15
                    "
                  >
                    Sell a Product
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}