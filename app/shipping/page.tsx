import Link from "next/link";
import { CheckCircle2, Home, Package } from "lucide-react";

import BackButton from "@/components/ui/BackButton";

export const metadata = {
  title: "Shipping Policy | DealUp",
  description:
    "Read the shipping and delivery policy for products listed on DealUp.",
};

export default function ShippingPage() {
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
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1565d8]/10 text-[#1565d8] dark:bg-[#1565d8]/20">
            <Package className="h-7 w-7" />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#1565d8]">
            DealUp
          </p>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            Shipping Policy
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            This policy explains how delivery and shipping may be handled for
            products listed on the DealUp marketplace.
          </p>

          <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-500">
            Last updated: September 7, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="space-y-5">
          <PolicySection number="01" title="Marketplace Delivery Model">
            <p>
              DealUp is a local marketplace connecting buyers and sellers.
              Shipping or delivery arrangements may therefore vary depending
              on the seller, product and location.
            </p>
          </PolicySection>

          <PolicySection number="02" title="Seller Responsibilities">
            <p>
              Where a seller offers delivery or shipping, the seller is
              responsible for communicating the available delivery method,
              applicable delivery charges and expected delivery timeline to
              the buyer.
            </p>
          </PolicySection>

          <PolicySection number="03" title="Buyer Responsibilities">
            <p>
              Buyers should confirm the delivery method, location, charges
              and expected timeline with the seller before completing a
              transaction.
            </p>
          </PolicySection>

          <PolicySection number="04" title="Local Pickup">
            <p>
              For local marketplace transactions, buyers and sellers may
              agree to meet at a suitable location for product pickup.
            </p>

            <p className="mt-3">
              Users should follow DealUp safety recommendations and choose
              public and familiar meeting locations whenever possible.
            </p>
          </PolicySection>

          <PolicySection number="05" title="Delivery Delays">
            <p>
              Delivery timelines may be affected by seller availability,
              courier services, weather, location or other circumstances
              outside DealUp's direct control.
            </p>
          </PolicySection>

          <PolicySection number="06" title="Shipping Charges">
            <p>
              If shipping or delivery charges apply, the buyer and seller
              should agree on the applicable charges before the transaction
              is completed.
            </p>
          </PolicySection>

          <PolicySection number="07" title="Product Inspection">
            <p>
              Buyers should inspect products at the time of pickup or delivery
              where reasonably possible and confirm that the product matches
              the listing details.
            </p>
          </PolicySection>

          <PolicySection number="08" title="Problems With Delivery">
            <p>
              If there is a problem with delivery or a product received,
              buyers should first contact the seller and may contact DealUp
              support for marketplace assistance where applicable.
            </p>

            <div className="mt-5">
              <Link
                href="/contact"
                className="inline-flex items-center rounded-xl bg-[#1565d8] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f52ba]"
              >
                Contact DealUp
              </Link>
            </div>
          </PolicySection>

          <PolicySection number="09" title="Policy Updates">
            <p>
              DealUp may update this Shipping Policy when marketplace
              services, delivery options or business practices change.
            </p>
          </PolicySection>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#091526] sm:mt-10 sm:p-6">
          <h2 className="text-lg font-bold">Important</h2>

          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
            <PolicyBullet>
              Confirm delivery terms before completing a transaction.
            </PolicyBullet>

            <PolicyBullet>
              Prefer safe public locations for local pickup.
            </PolicyBullet>

            <PolicyBullet>
              Inspect the product before finalizing the transaction where
              possible.
            </PolicyBullet>
          </ul>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/terms"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-[#091526] dark:text-slate-300"
          >
            Terms & Conditions
          </Link>

          <Link
            href="/privacy"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-[#091526] dark:text-slate-300"
          >
            Privacy Policy
          </Link>

          <Link
            href="/refund"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-[#091526] dark:text-slate-300"
          >
            Refund Policy
          </Link>

          <Link
            href="/contact"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-[#091526] dark:text-slate-300"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}

function PolicySection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#091526] sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1565d8]/10 text-xs font-black text-[#1565d8] dark:bg-[#1565d8]/20">
          {number}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold sm:text-xl">{title}</h2>

          <div className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            {children}
          </div>
        </div>
      </div>
    </article>
  );
}

function PolicyBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#16a34a]" />
      <span>{children}</span>
    </li>
  );
}