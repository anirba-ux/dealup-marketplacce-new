import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";

import BackButton from "@/components/ui/BackButton";

export const metadata = {
  title: "Privacy Policy | DealUp",
  description:
    "Read the Privacy Policy for the DealUp local marketplace.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#07111f] dark:text-white">
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

      <section className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#07111f]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#1565d8]">
            DealUp
          </p>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
            This Privacy Policy explains how DealUp collects, uses and
            protects information when you use our marketplace.
          </p>

          <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-500">
            Last updated: September 7, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="space-y-5">
          <PolicySection number="01" title="Information We Collect">
            <p>
              DealUp may collect information that you provide when creating an
              account, creating a listing, contacting another user or
              contacting DealUp support.
            </p>

            <ul className="mt-4 space-y-3">
              <PolicyBullet>Account and profile information.</PolicyBullet>

              <PolicyBullet>
                Product listing information provided by sellers.
              </PolicyBullet>

              <PolicyBullet>
                Location information when required for marketplace features.
              </PolicyBullet>

              <PolicyBullet>
                Information provided when contacting customer support.
              </PolicyBullet>
            </ul>
          </PolicySection>

          <PolicySection number="02" title="How We Use Information">
            <p>Information may be used to:</p>

            <ul className="mt-4 space-y-3">
              <PolicyBullet>
                Provide and operate DealUp marketplace services.
              </PolicyBullet>

              <PolicyBullet>
                Help buyers discover relevant local listings.
              </PolicyBullet>

              <PolicyBullet>
                Support seller accounts and product listings.
              </PolicyBullet>

              <PolicyBullet>
                Improve platform security and user experience.
              </PolicyBullet>

              <PolicyBullet>
                Respond to support requests and communicate important service
                information.
              </PolicyBullet>
            </ul>
          </PolicySection>

          <PolicySection number="03" title="Location Information">
            <p>
              Some DealUp features may use location information to help users
              discover products available in nearby areas.
            </p>

            <p className="mt-3">
              Location access is used only for relevant marketplace features
              and is subject to the permissions provided by the user.
            </p>
          </PolicySection>

          <PolicySection number="04" title="Product and Profile Information">
            <p>
              Information included in public seller profiles and product
              listings may be visible to other DealUp users.
            </p>

            <p className="mt-3">
              Users should avoid publishing sensitive personal information in
              public listings or profile descriptions.
            </p>
          </PolicySection>

          <PolicySection number="05" title="Payments">
            <p>
              Payments for eligible DealUp services may be processed through
              third-party payment providers such as Razorpay.
            </p>

            <p className="mt-3">
              Payment information is processed according to the applicable
              payment provider's systems and policies. DealUp does not ask
              users to share passwords, OTPs or PINs through marketplace
              communications.
            </p>
          </PolicySection>

          <PolicySection number="06" title="Cookies and Similar Technologies">
            <p>
              DealUp may use cookies or similar technologies to maintain
              sessions, remember preferences, improve functionality and
              understand how the platform is used.
            </p>
          </PolicySection>

          <PolicySection number="07" title="Data Security">
            <p>
              DealUp takes reasonable measures to protect user information
              against unauthorized access, misuse or disclosure.
            </p>

            <p className="mt-3">
              However, no internet-based service can guarantee absolute
              security.
            </p>
          </PolicySection>

          <PolicySection number="08" title="Information Sharing">
            <p>
              DealUp may share information when necessary to operate the
              platform, provide requested services, process eligible payments,
              comply with legal requirements or protect the safety and
              security of the platform and its users.
            </p>
          </PolicySection>

          <PolicySection number="09" title="Your Responsibilities">
            <p>
              You are responsible for keeping your account information
              accurate and protecting your login credentials.
            </p>

            <p className="mt-3">
              Never share your password, OTP, PIN or other sensitive
              authentication information with another person.
            </p>
          </PolicySection>

          <PolicySection number="10" title="Policy Updates">
            <p>
              DealUp may update this Privacy Policy when our services,
              technology, legal requirements or business practices change.
            </p>

            <p className="mt-3">
              The latest version will always be published on this page with
              the applicable update date.
            </p>
          </PolicySection>

          <PolicySection number="11" title="Contact Us">
            <p>
              If you have questions about this Privacy Policy or how your
              information is handled, please contact DealUp.
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
        <Link href="/terms" className="policy-link">
          Terms & Conditions
        </Link>

        <Link href="/refund" className="policy-link">
          Refund Policy
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