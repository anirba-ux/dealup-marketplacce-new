import Link from "next/link";
import { Home, Mail, MapPin, MessageCircle } from "lucide-react";

import BackButton from "@/components/ui/BackButton";

export const metadata = {
  title: "Contact Us | DealUp",
  description:
    "Contact DealUp for marketplace support, account assistance and payment-related queries.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#07111f] dark:text-white">
      <section className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#091526]">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <BackButton />

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0f52ba] sm:px-4"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#07111f]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#1565d8]">
            DealUp Support
          </p>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            Contact Us
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            Need help with your account, product listing, seller verification
            or a DealUp service? Get in touch with our support team.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <ContactCard
            icon={<Mail className="h-6 w-6" />}
            title="Email Support"
            text="support@dealup.in"
          />

          <ContactCard
            icon={<MapPin className="h-6 w-6" />}
            title="Location"
            text="Bansberia, Hooghly, West Bengal"
          />

          <ContactCard
            icon={<MessageCircle className="h-6 w-6" />}
            title="Marketplace Support"
            text="Account, listing and service assistance"
          />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#091526] sm:p-8">
          <h2 className="text-xl font-bold">How can we help?</h2>

          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            For faster support, please include your DealUp account email and
            a clear description of your issue. For payment-related queries,
            include the relevant transaction information when available.
          </p>

          <div className="mt-6">
            <a
              href="mailto:support@dealup.in"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f52ba]"
            >
              <Mail className="h-4 w-4" />
              Email DealUp Support
            </a>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#091526]">
          <h2 className="text-lg font-bold">Related Policies</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/terms"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              Terms & Conditions
            </Link>

            <Link
              href="/privacy"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              Privacy Policy
            </Link>

            <Link
              href="/refund"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              Refund Policy
            </Link>

            <Link
              href="/shipping"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              Shipping Policy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#091526] sm:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1565d8]/10 text-[#1565d8] dark:bg-[#1565d8]/20">
        {icon}
      </div>

      <h2 className="mt-5 font-bold">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {text}
      </p>
    </div>
  );
}