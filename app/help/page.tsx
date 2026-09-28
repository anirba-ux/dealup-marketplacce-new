"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Heart,
  Headphones,
  Home,
  LifeBuoy,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tag,
  UserCircle,
} from "lucide-react";

/* =========================================================
   HELP CATEGORIES
========================================================= */

const helpCategories = [
  {
    title: "Buying",
    description:
      "Find products, contact sellers and complete your purchase safely.",
    href: "/help/buying",
    icon: ShoppingBag,
  },
  {
    title: "Selling & Listings",
    description:
      "Create, manage, edit and promote your listings on DealUp.",
    href: "/help/selling",
    icon: Tag,
  },
  {
    title: "Account & Login",
    description:
      "Manage your profile, login, password and account settings.",
    href: "/help/account",
    icon: UserCircle,
  },
  {
    title: "Payments & Premium",
    description:
      "Get help with payments, Premium plans and transactions.",
    href: "/help/payments",
    icon: CreditCard,
  },
  {
    title: "Verification",
    description:
      "Learn about phone, identity and seller verification.",
    href: "/help/verification",
    icon: CheckCircle2,
  },
  {
    title: "Safety & Security",
    description:
      "Stay safe while buying and selling on DealUp.",
    href: "/help/safety",
    icon: ShieldCheck,
  },
  {
    title: "Chat & Messages",
    description:
      "Get help with conversations and messaging features.",
    href: "/help/messages",
    icon: MessageCircle,
  },
  {
    title: "Wishlist & Notifications",
    description:
      "Manage saved products and marketplace notifications.",
    href: "/help/wishlist",
    icon: Heart,
  },
];

/* =========================================================
   POPULAR QUESTIONS
========================================================= */

const popularQuestions = [
  {
    title: "How do I create a listing?",
    href: "/help/selling/create-listing",
  },
  {
    title: "How do I edit or delete my listing?",
    href: "/help/selling/manage-listing",
  },
  {
    title: "How do I verify my phone number?",
    href: "/help/verification/phone-verification",
  },
  {
    title: "How does DealUp Premium work?",
    href: "/help/payments/premium",
  },
  {
    title: "How do I contact a seller?",
    href: "/help/buying/contact-seller",
  },
  {
    title: "How do I report a suspicious listing?",
    href: "/help/safety/report-listing",
  },
];

/* =========================================================
   QUICK TOPICS
========================================================= */

const quickTopics = [
  {
    title: "Buying",
    href: "/help/buying",
    icon: ShoppingBag,
  },
  {
    title: "Selling",
    href: "/help/selling",
    icon: Tag,
  },
  {
    title: "Payments",
    href: "/help/payments",
    icon: CreditCard,
  },
  {
    title: "Safety",
    href: "/help/safety",
    icon: ShieldCheck,
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const query = searchQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!query) return helpCategories;

    return helpCategories.filter((category) => {
      return (
        category.title.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query)
      );
    });
  }, [query]);

  const filteredQuestions = useMemo(() => {
    if (!query) return popularQuestions;

    return popularQuestions.filter((question) =>
      question.title.toLowerCase().includes(query),
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden">

        {/* Main blue background */}

        <div
          className="
            absolute
            inset-0
            bg-[#1565D8]
            dark:bg-[#0D47A1]
          "
        />

        {/* Soft light effect */}

        <div
          aria-hidden="true"
          className="
            absolute
            -left-24
            top-10
            h-72
            w-72
            rounded-full
            bg-white/10
            blur-3xl
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute
            -right-20
            top-0
            h-80
            w-80
            rounded-full
            bg-[#F5A623]/20
            blur-3xl
          "
        />

        {/* Decorative circles */}

        <div
          aria-hidden="true"
          className="
            absolute
            right-[12%]
            top-16
            h-4
            w-4
            rounded-full
            bg-white/30
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute
            left-[15%]
            top-28
            h-3
            w-3
            rounded-full
            bg-[#F5A623]
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute
            bottom-12
            right-[20%]
            h-5
            w-5
            rounded-full
            bg-white/20
          "
        />

        {/* Hero content */}

        <div
          className="
            relative
            mx-auto
            max-w-7xl
            px-4
            pb-20
            pt-8
            sm:px-6
            sm:pb-24
            sm:pt-10
            lg:px-8
            lg:pb-28
          "
        >

          {/* =================================================
              BACK + HOME
          ================================================== */}

          <div className="mx-auto max-w-md">

            <div className="flex items-center justify-between">

              {/* Back Button */}

              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = "/";
                  }
                }}
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-white/10
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  ring-1
                  ring-white/15
                  backdrop-blur-sm
                  transition
                  hover:bg-white/20
                  active:scale-95
                "
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>

              {/* Home Button */}

              <Link
                href="/"
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-white/10
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  ring-1
                  ring-white/15
                  backdrop-blur-sm
                  transition
                  hover:bg-white/20
                  active:scale-95
                "
              >
                <Home size={15} />
                <span>Home</span>
              </Link>

            </div>

            {/* DealUp Logo */}

            <div className="mt-5 flex justify-center">

              <div
                className="
                  flex
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white/10
                  px-5
                  py-3
                  ring-1
                  ring-white/15
                  backdrop-blur-sm
                "
              >
                <Image
                  src="/images/dealup-dark-logo.png"
                  alt="DealUp Marketplace"
                  width={170}
                  height={48}
                  priority
                  className="
                    h-auto
                    w-[145px]
                    object-contain
                    sm:w-[165px]
                  "
                />
              </div>

            </div>

          </div>

          {/* Heading */}

          <div className="mx-auto mt-12 max-w-3xl text-center sm:mt-14">

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.22em]
                text-blue-100
                sm:text-sm
              "
            >
              DealUp Support
            </p>

            <h1
              className="
                mt-3
                text-4xl
                font-black
                leading-tight
                tracking-tight
                text-white
                sm:text-5xl
                lg:text-6xl
              "
            >
              We&apos;re here to
              <span className="text-[#F5A623]"> help you.</span>
            </h1>

            <p
              className="
                mx-auto
                mt-5
                max-w-2xl
                text-sm
                leading-6
                text-blue-100
                sm:text-base
                sm:leading-7
              "
            >
              Find answers and helpful guides for buying, selling,
              payments, verification, account and more on DealUp.
            </p>

          </div>

          {/* Search */}

          <div className="mx-auto mt-8 max-w-3xl sm:mt-10">

            <div
              className="
                flex
                min-h-[58px]
                items-center
                overflow-hidden
                rounded-xl
                bg-white
                shadow-[0_20px_50px_rgba(0,0,0,0.18)]
                dark:bg-slate-900
                sm:min-h-[64px]
              "
            >

              <Search
                size={22}
                className="
                  ml-4
                  shrink-0
                  text-slate-400
                  sm:ml-5
                "
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Type your question or search for help..."
                aria-label="Search DealUp Help Center"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-3
                  py-4
                  text-sm
                  text-slate-900
                  outline-none
                  placeholder:text-slate-400
                  dark:text-white
                  dark:placeholder:text-slate-500
                  sm:px-4
                  sm:text-base
                "
              />

              <button
                type="button"
                className="
                  mr-1.5
                  hidden
                  min-h-[48px]
                  shrink-0
                  items-center
                  gap-2
                  rounded-lg
                  bg-[#1565D8]
                  px-5
                  text-xs
                  font-bold
                  text-white
                  transition
                  hover:bg-[#1257B8]
                  sm:inline-flex
                  sm:text-sm
                "
              >
                <Search size={16} />
                SEARCH
              </button>

            </div>

            {/* Mobile search button */}

            <button
              type="button"
              className="
                mt-3
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#F5A623]
                px-5
                py-3.5
                text-sm
                font-extrabold
                text-slate-950
                shadow-lg
                shadow-black/10
                transition
                hover:bg-[#e89a16]
                sm:hidden
              "
            >
              <Search size={17} />
              Search Help
            </button>

          </div>

          {/* Quick topics */}

          <div
            className="
              mx-auto
              mt-6
              flex
              max-w-3xl
              flex-wrap
              justify-center
              gap-2
            "
          >
            {quickTopics.map((topic) => {
              const Icon = topic.icon;

              return (
                <Link
                  key={topic.href}
                  href={topic.href}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-white/20
                    bg-white/10
                    px-3.5
                    py-2
                    text-xs
                    font-semibold
                    text-white
                    backdrop-blur-sm
                    transition
                    hover:bg-white/20
                  "
                >
                  <Icon size={13} />
                  {topic.title}
                </Link>
              );
            })}
          </div>

        </div>

        {/* Curved bottom */}

        <div
          aria-hidden="true"
          className="
            absolute
            bottom-[-1px]
            left-0
            h-8
            w-full
            rounded-[50%_50%_0_0/100%_100%_0_0]
            bg-slate-100
            dark:bg-slate-950
          "
        />

      </section>

      {/* =====================================================
          HELP TOPICS
      ====================================================== */}

      <section className="bg-slate-100 py-12 dark:bg-slate-950 sm:py-16">

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* Heading */}

          <div className="mb-8 text-center">

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.2em]
                text-[#1565D8]
                dark:text-blue-400
              "
            >
              Explore Help
            </p>

            <h2
              className="
                mt-2
                text-2xl
                font-black
                tracking-tight
                text-slate-900
                sm:text-3xl
                dark:text-white
              "
            >
              How can we help?
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-xl
                text-sm
                leading-6
                text-slate-500
                dark:text-slate-400
              "
            >
              Choose a topic below to find answers and helpful guides.
            </p>

          </div>

          {/* Help category cards */}

          {filteredCategories.length > 0 ? (

            <div className="grid gap-4 md:grid-cols-2">

              {filteredCategories.map((category) => {

                const Icon = category.icon;

                return (
                  <Link
                    key={category.href}
                    href={category.href}
                    className="
                      group
                      relative
                      flex
                      min-h-[142px]
                      items-center
                      gap-5
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      p-5
                      shadow-sm
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-[#1565D8]/30
                      hover:shadow-xl
                      dark:border-slate-800
                      dark:bg-slate-900
                      dark:hover:border-blue-500/40
                    "
                  >

                    {/* Card accent */}

                    <div
                      aria-hidden="true"
                      className="
                        absolute
                        right-0
                        top-0
                        h-20
                        w-20
                        rounded-bl-[60px]
                        bg-blue-50
                        transition-all
                        duration-300
                        group-hover:h-28
                        group-hover:w-28
                        dark:bg-blue-950/30
                      "
                    />

                    {/* Icon */}

                    <div
                      className="
                        relative
                        flex
                        h-16
                        w-16
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-blue-100
                        bg-blue-50
                        text-[#1565D8]
                        transition-all
                        duration-300
                        group-hover:scale-105
                        group-hover:border-[#1565D8]
                        group-hover:bg-[#1565D8]
                        group-hover:text-white
                        dark:border-blue-900/60
                        dark:bg-blue-950/50
                        dark:text-blue-400
                        dark:group-hover:border-[#1976F3]
                        dark:group-hover:bg-[#1976F3]
                        dark:group-hover:text-white
                      "
                    >
                      <Icon size={29} strokeWidth={1.7} />
                    </div>

                    {/* Text */}

                    <div className="relative min-w-0 flex-1">

                      <h3
                        className="
                          text-base
                          font-extrabold
                          text-slate-900
                          transition-colors
                          group-hover:text-[#1565D8]
                          dark:text-white
                          dark:group-hover:text-blue-400
                          sm:text-lg
                        "
                      >
                        {category.title}
                      </h3>

                      <p
                        className="
                          mt-1.5
                          max-w-lg
                          text-xs
                          leading-5
                          text-slate-500
                          dark:text-slate-400
                          sm:text-sm
                          sm:leading-6
                        "
                      >
                        {category.description}
                      </p>

                      <div
                        className="
                          mt-3
                          inline-flex
                          items-center
                          gap-1.5
                          text-xs
                          font-bold
                          text-[#1565D8]
                          dark:text-blue-400
                        "
                      >
                        Explore
                        <ArrowRight
                          size={14}
                          className="
                            transition-transform
                            group-hover:translate-x-1
                          "
                        />
                      </div>

                    </div>

                  </Link>
                );
              })}

            </div>

          ) : (

            <div
              className="
                rounded-xl
                border
                border-dashed
                border-slate-300
                bg-white
                px-6
                py-12
                text-center
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              <Search
                size={30}
                className="mx-auto text-slate-400"
              />

              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                No help topics found
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try another search term.
              </p>
            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          POPULAR QUESTIONS
      ====================================================== */}

      <section
        className="
          border-t
          border-slate-200
          bg-white
          py-12
          dark:border-slate-800
          dark:bg-slate-900
          sm:py-16
        "
      >

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          <div className="mb-7 flex items-center gap-3">

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-[#1565D8]
                dark:bg-blue-950/50
                dark:text-blue-400
              "
            >
              <BookOpen size={21} />
            </div>

            <div>

              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-[#1565D8]
                  dark:text-blue-400
                "
              >
                Quick Answers
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                Popular Questions
              </h2>

            </div>

          </div>

          {filteredQuestions.length > 0 && (

            <div className="grid gap-3 md:grid-cols-2">

              {filteredQuestions.map((question) => (

                <Link
                  key={question.href}
                  href={question.href}
                  className="
                    group
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-5
                    py-4
                    transition-all
                    hover:border-[#1565D8]/40
                    hover:bg-blue-50
                    dark:border-slate-800
                    dark:bg-slate-950
                    dark:hover:border-blue-500/40
                    dark:hover:bg-blue-950/20
                  "
                >

                  <span
                    className="
                      text-sm
                      font-semibold
                      leading-6
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    {question.title}
                  </span>

                  <span
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-slate-400
                      shadow-sm
                      transition-all
                      group-hover:bg-[#1565D8]
                      group-hover:text-white
                      dark:bg-slate-900
                    "
                  >
                    <ArrowRight size={15} />
                  </span>

                </Link>

              ))}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          CONTACT SUPPORT
      ====================================================== */}

      <section className="bg-slate-100 py-12 dark:bg-slate-950 sm:py-16">

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              bg-[#1565D8]
              px-6
              py-9
              shadow-xl
              sm:px-10
              sm:py-11
            "
          >

            <div
              aria-hidden="true"
              className="
                absolute
                -right-16
                -top-20
                h-56
                w-56
                rounded-full
                bg-white/10
              "
            />

            <div
              aria-hidden="true"
              className="
                absolute
                -bottom-24
                left-1/3
                h-48
                w-48
                rounded-full
                bg-[#F5A623]/20
              "
            />

            <div
              className="
                relative
                flex
                flex-col
                gap-6
                md:flex-row
                md:items-center
                md:justify-between
              "
            >

              <div>

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/15
                    text-white
                  "
                >
                  <Headphones size={22} />
                </div>

                <h2 className="mt-4 text-2xl font-black text-white sm:text-3xl">
                  Still need help?
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                  Can&apos;t find what you&apos;re looking for?
                  Contact DealUp Support and our team will help you.
                </p>

              </div>

              <Link
                href="/help/contact"
                className="
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#F5A623]
                  px-6
                  py-3.5
                  text-sm
                  font-extrabold
                  text-slate-950
                  shadow-sm
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-[#e89a16]
                  hover:shadow-lg
                "
              >
                Contact Support
                <ArrowRight size={17} />
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer
        className="
          border-t
          border-slate-200
          bg-white
          py-6
          dark:border-slate-800
          dark:bg-slate-900
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-6xl
            items-center
            justify-center
            gap-2
            px-4
            text-center
          "
        >

          <LifeBuoy
            size={15}
            className="text-[#1565D8] dark:text-blue-400"
          />

          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            DealUp Marketplace • Help Center
          </p>

        </div>

      </footer>

    </main>
  );
}