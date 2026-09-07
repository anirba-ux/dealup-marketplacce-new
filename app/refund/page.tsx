import Link from "next/link";
import { Home } from "lucide-react";

import BackButton from "@/components/ui/BackButton";

export const metadata = {
  title: "Cancellation & Refund Policy | DealUp",
  description:
    "Read the cancellation and refund policy for DealUp services and premium subscriptions.",
};

export default function RefundPage() {
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
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#1565d8]">
            DealUp
          </p>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            Cancellation & Refund Policy
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            This policy explains cancellation and refund conditions for paid
            DealUp services, including optional premium seller subscriptions.
          </p>

          <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-500">
            Last updated: September 7, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="space-y-5">
          <PolicySection number="01" title="Premium Services">
            <p>
              DealUp may offer optional paid premium services to sellers.
              These services may provide additional visibility, promotional
              features, analytics or other marketplace tools.
            </p>

            <p className="mt-3">
              The applicable price and service details will be displayed
              before payment.
            </p>
          </PolicySection>

          <PolicySection number="02" title="Cancellation">
            <p>
              A user may request cancellation of an eligible premium service
              by contacting DealUp support.
            </p>

            <p className="mt-3">
              Cancellation of a subscription does not automatically guarantee
              a refund. Refund eligibility is determined according to this
              policy and the specific service purchased.
            </p>
          </PolicySection>

          <PolicySection number="03" title="Refund Eligibility">
            <p>
              A refund may be considered in cases such as a duplicate payment,
              a confirmed payment-processing issue, or another situation
              approved by DealUp after review.
            </p>

            <p className="mt-3">
              Refund requests are reviewed individually based on the payment
              and service details.
            </p>
          </PolicySection>

          <PolicySection number="04" title="Non-Refundable Situations">
            <p>
              Premium services that have already been substantially used or
              delivered may not be eligible for a refund.
            </p>

            <p className="mt-3">
              Refunds may also be declined where a user has violated DealUp
              Terms and Conditions or misused the platform.
            </p>
          </PolicySection>

          <PolicySection number="05" title="How to Request a Refund">
            <p>
              To request a refund, contact DealUp support and provide the
              relevant transaction or account information.
            </p>

            <div className="mt-5">
              <Link
                href="/contact"
                className="inline-flex items-center rounded-xl bg-[#1565d8] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f52ba]"
              >
                Contact Support
              </Link>
            </div>
          </PolicySection>

          <PolicySection number="06" title="Refund Processing">
            <p>
              Once a refund is approved, it will be initiated through the
              applicable payment method or payment provider, subject to the
              provider's processing timelines.
            </p>
          </PolicySection>

          <PolicySection number="07" title="Payment Provider">
            <p>
              Payments for eligible DealUp services may be processed through
              third-party payment providers such as Razorpay.
            </p>

            <p className="mt-3">
              Payment confirmation and refund processing may therefore also
              depend on the applicable payment provider.
            </p>
          </PolicySection>

          <PolicySection number="08" title="Changes to This Policy">
            <p>
              DealUp may update this Cancellation & Refund Policy when
              services, payment processes or business practices change.
            </p>

            <p className="mt-3">
              The latest version will be published on this page.
            </p>
          </PolicySection>
        </div>

        <PolicyNavigation />
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5a623]/15 text-xs font-black text-[#c47b00] dark:bg-[#f5a623]/20 dark:text-[#f5a623]">
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

function PolicyNavigation() {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#091526] sm:mt-10 sm:p-6">
      <h2 className="text-base font-bold sm:text-lg">DealUp Policies</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/terms" className="policy-link">
          Terms & Conditions
        </Link>

        <Link href="/privacy" className="policy-link">
          Privacy Policy
        </Link>

        <Link href="/shipping" className="policy-link">
          Shipping Policy
        </Link>

        <Link href="/contact" className="policy-link">
          Contact Us
        </Link>
      </div>
    </div>
  );
}