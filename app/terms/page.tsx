import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";

import BackButton from "@/components/ui/BackButton";

export const metadata = {
  title: "Terms & Conditions | DealUp",
  description:
    "Read the Terms and Conditions for using the DealUp local marketplace.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#07111f] dark:text-white">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#091526]">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <BackButton />

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0f52ba] active:scale-[0.98] sm:px-4"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#07111f]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#1565d8]">
            DealUp
          </p>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            Terms & Conditions
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            These Terms and Conditions explain the rules and responsibilities
            that apply when using the DealUp marketplace.
          </p>

          <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-500">
            Last updated: September 7, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="space-y-5">
          <PolicySection number="01" title="About DealUp">
            <p>
              DealUp is a local online marketplace that allows users to
              discover, buy and sell products within nearby cities and
              communities.
            </p>

            <p className="mt-3">
              DealUp provides the marketplace platform and related services.
              Buyers and sellers are responsible for their own transactions,
              communications and decisions.
            </p>
          </PolicySection>

          <PolicySection number="02" title="User Accounts">
            <p>
              Some DealUp features may require you to create an account. You
              are responsible for providing accurate information and keeping
              your account credentials secure.
            </p>

            <p className="mt-3">
              You should not share your password, OTP, PIN or other sensitive
              account information with anyone.
            </p>
          </PolicySection>

          <PolicySection number="03" title="Buying and Selling">
            <p>
              Sellers are responsible for the accuracy of their product
              listings, including product description, condition, price,
              images and other relevant information.
            </p>

            <p className="mt-3">
              Buyers should carefully review product information and seller
              details before completing a transaction.
            </p>
          </PolicySection>

          <PolicySection number="04" title="Product Listings">
            <p>
              Product listings must contain genuine and relevant information.
              Users must not knowingly publish misleading, fraudulent,
              unlawful or inappropriate listings.
            </p>

            <p className="mt-3">
              DealUp may remove or restrict listings that violate applicable
              laws, marketplace rules or these Terms and Conditions.
            </p>
          </PolicySection>

          <PolicySection number="05" title="Seller Verification">
            <p>
              DealUp may provide verification indicators or trust signals
              based on information and verification steps completed by a
              seller.
            </p>

            <p className="mt-3">
              A verification badge is intended to provide additional trust
              information. Users should still independently review products
              and transaction details before buying.
            </p>
          </PolicySection>

          <PolicySection number="06" title="Premium Seller Services">
            <p>
              DealUp may offer optional premium seller services or
              subscriptions that provide additional marketplace features,
              visibility or seller tools.
            </p>

            <p className="mt-3">
              Premium services are optional. The applicable subscription
              price, features, duration and other conditions will be displayed
              before a user completes the purchase.
            </p>

            <p className="mt-3">
              Cancellation and refund conditions for premium services are
              described separately in our Refund Policy.
            </p>
          </PolicySection>

          <PolicySection number="07" title="Payments">
            <p>
              Payments for eligible DealUp services may be processed through
              third-party payment providers such as Razorpay.
            </p>

            <p className="mt-3">
              Users are responsible for providing accurate payment information
              and completing transactions through the supported payment
              process.
            </p>
          </PolicySection>

          <PolicySection number="08" title="Prohibited Activities">
            <p>Users must not use DealUp to:</p>

            <ul className="mt-4 space-y-3">
              <PolicyBullet>
                Publish fraudulent or misleading listings.
              </PolicyBullet>

              <PolicyBullet>
                Sell products or services that are prohibited by applicable
                law or DealUp marketplace rules.
              </PolicyBullet>

              <PolicyBullet>
                Misuse another person's account or personal information.
              </PolicyBullet>

              <PolicyBullet>
                Attempt to interfere with the security or operation of the
                DealUp platform.
              </PolicyBullet>

              <PolicyBullet>
                Use DealUp for unlawful, fraudulent or abusive activities.
              </PolicyBullet>
            </ul>
          </PolicySection>

          <PolicySection number="09" title="Safe Transactions">
            <p>
              Users should take reasonable precautions when communicating,
              meeting or completing transactions with other users.
            </p>

            <p className="mt-3">
              Buyers should inspect products before payment where appropriate
              and should avoid sharing sensitive personal or financial
              information with other users.
            </p>
          </PolicySection>

          <PolicySection number="10" title="Account Restrictions">
            <p>
              DealUp may restrict, suspend or terminate an account or remove
              content when there is a reasonable basis to believe that a user
              has violated these Terms, applicable laws or marketplace rules.
            </p>
          </PolicySection>

          <PolicySection number="11" title="Changes to These Terms">
            <p>
              DealUp may update these Terms and Conditions from time to time
              to reflect changes to the platform, services, legal requirements
              or business practices.
            </p>

            <p className="mt-3">
              Updated terms will be published on this page with a revised
              update date.
            </p>
          </PolicySection>

          <PolicySection number="12" title="Contact and Support">
            <p>
              If you have questions about these Terms and Conditions, please
              contact DealUp through our Contact Us page.
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

function PolicyNavigation() {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#091526] sm:mt-10 sm:p-6">
      <h2 className="text-base font-bold sm:text-lg">DealUp Policies</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PolicyLink href="/privacy" label="Privacy Policy" />
        <PolicyLink href="/refund" label="Refund Policy" />
        <PolicyLink href="/shipping" label="Shipping Policy" />
        <PolicyLink href="/contact" label="Contact Us" />
      </div>
    </div>
  );
}

function PolicyLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#1565d8]/30 hover:bg-[#1565d8]/5 hover:text-[#1565d8] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
    >
      {label}
    </Link>
  );
}