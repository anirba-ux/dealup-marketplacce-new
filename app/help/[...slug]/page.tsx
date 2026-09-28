import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Heart,
  LifeBuoy,
  MessageCircle,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Tag,
  UserCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import HelpArticleFeedback from "@/components/help/HelpArticleFeedback";

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

interface HelpArticle {
  title: string;
  description: string;
  category: string;
  icon: LucideIcon;
  sections: {
    title: string;
    content: string;
    bullets?: string[];
  }[];
}

const helpArticles: Record<string, HelpArticle> = {
  buying: {
    title: "Buying on DealUp",
    description:
      "Learn how to find products, review listings, contact sellers and buy safely on DealUp.",
    category: "Buying",
    icon: ShoppingBag,
    sections: [
      {
        title: "Find the right product",
        content:
          "Use DealUp search, categories and location-based discovery to find products available near you.",
        bullets: [
          "Search using a product name or keyword.",
          "Browse relevant categories.",
          "Use location and nearby product features where available.",
          "Review the product photos, description, price and condition before contacting the seller.",
        ],
      },
      {
        title: "Review the listing",
        content:
          "Before making a purchase decision, carefully review the information provided by the seller.",
        bullets: [
          "Check the product condition.",
          "Compare the asking price with similar listings.",
          "Review seller information and available verification badges.",
          "Ask the seller questions if anything is unclear.",
        ],
      },
      {
        title: "Contact the seller",
        content:
          "You can contact a seller through the communication options provided on the product page. Never share unnecessary personal or financial information.",
      },
      {
        title: "Stay safe",
        content:
          "Meet safely when possible, inspect the product before completing an offline transaction, and be careful with advance-payment requests.",
      },
    ],
  },

  selling: {
    title: "Selling on DealUp",
    description:
      "Learn how to create listings, manage products and communicate with buyers.",
    category: "Selling",
    icon: Tag,
    sections: [
      {
        title: "Before creating a listing",
        content:
          "Prepare clear product photos, an accurate title, a useful description and a realistic asking price.",
        bullets: [
          "Use clear and relevant photos.",
          "Describe the actual condition of the product.",
          "Mention important specifications.",
          "Choose the correct category.",
          "Set an appropriate price.",
        ],
      },
      {
        title: "Create your listing",
        content:
          "Use the Sell option on DealUp to provide the required product information and publish your listing.",
      },
      {
        title: "Manage your listings",
        content:
          "After publishing, you can manage your active listings from your seller area. Keep information and availability up to date.",
      },
      {
        title: "Communicate safely",
        content:
          "Use DealUp communication features when possible and avoid sharing unnecessary private information with buyers.",
      },
    ],
  },

  account: {
    title: "Account & Login",
    description:
      "Learn how to manage your DealUp account, profile and login options.",
    category: "Account",
    icon: UserCircle,
    sections: [
      {
        title: "Create or access your account",
        content:
          "Use the DealUp login and registration options to access your account.",
        bullets: [
          "Use your supported email and password credentials.",
          "Google and Facebook login may also be available.",
          "Make sure you are using the correct account when accessing your dashboard.",
        ],
      },
      {
        title: "Manage your profile",
        content:
          "Your profile area allows you to manage information associated with your DealUp account.",
      },
      {
        title: "Keep your account secure",
        content:
          "Never share your password, authentication codes or sensitive account information with another person.",
      },
    ],
  },

  payments: {
    title: "Payments & Premium",
    description:
      "Learn about DealUp payments, Premium features and payment-related issues.",
    category: "Payments",
    icon: CreditCard,
    sections: [
      {
        title: "Payment safety",
        content:
          "Always verify the payment page and transaction details before completing a payment.",
        bullets: [
          "Check the amount before payment.",
          "Do not share OTPs or payment credentials.",
          "Keep payment confirmations for your records.",
        ],
      },
      {
        title: "DealUp Premium",
        content:
          "Premium features may provide additional benefits for eligible sellers and listings. Check the Premium page for the current plan and feature information.",
      },
      {
        title: "Payment problems",
        content:
          "If a payment fails or your Premium activation does not appear correctly, keep the transaction details and contact DealUp Support.",
      },
    ],
  },

  verification: {
    title: "Verification",
    description:
      "Understand phone verification, identity verification and seller trust features on DealUp.",
    category: "Verification",
    icon: CheckCircle2,
    sections: [
      {
        title: "Why verification matters",
        content:
          "Verification helps DealUp provide safer marketplace interactions and can contribute to trust signals shown on seller profiles.",
      },
      {
        title: "Phone verification",
        content:
          "Phone verification confirms that the phone number associated with an account can be verified through the supported verification process.",
      },
      {
        title: "Identity verification",
        content:
          "Where identity verification is required, submit the requested information through the official DealUp verification flow and wait for the review result.",
      },
      {
        title: "Verification status",
        content:
          "Verification may have different states such as pending, verified or requiring further action. Follow the instructions shown in your account.",
      },
    ],
  },

  safety: {
    title: "Safety & Security",
    description:
      "Learn how to stay safe while buying and selling on DealUp.",
    category: "Safety",
    icon: ShieldCheck,
    sections: [
      {
        title: "Meet safely",
        content:
          "For local transactions, choose a safe public location and consider taking someone with you when appropriate.",
      },
      {
        title: "Avoid suspicious payments",
        content:
          "Be careful if someone pressures you to make an urgent advance payment or asks for sensitive banking information.",
      },
      {
        title: "Protect your account",
        content:
          "Never share passwords, OTPs or authentication credentials.",
      },
      {
        title: "Report suspicious activity",
        content:
          "If you find a suspicious listing, user or message, use the available reporting option or contact DealUp Support.",
      },
    ],
  },

  messages: {
    title: "Chat & Messages",
    description:
      "Learn how DealUp messaging works and how to communicate safely.",
    category: "Messages",
    icon: MessageCircle,
    sections: [
      {
        title: "Start a conversation",
        content:
          "Use the contact or messaging option available on a product to communicate with the seller.",
      },
      {
        title: "Keep conversations safe",
        content:
          "Do not share passwords, OTPs, banking credentials or other unnecessary sensitive information.",
      },
      {
        title: "Report a problem",
        content:
          "If a conversation contains suspicious behaviour, threats or scam attempts, preserve the relevant information and report it.",
      },
    ],
  },

  wishlist: {
    title: "Wishlist & Notifications",
    description:
      "Learn how to save products and manage marketplace notifications.",
    category: "Wishlist",
    icon: Heart,
    sections: [
      {
        title: "Save a product",
        content:
          "Use the wishlist option on supported product cards or product pages to save products you want to check later.",
      },
      {
        title: "Manage saved products",
        content:
          "Open your Wishlist area to review products you have saved and remove products you no longer want to track.",
      },
      {
        title: "Notifications",
        content:
          "DealUp may show relevant marketplace and account notifications in the notification area.",
      },
    ],
  },

  "selling/create-listing": {
    title: "How to Create a Listing",
    description:
      "Step-by-step guidance for creating a product listing on DealUp.",
    category: "Selling",
    icon: Tag,
    sections: [
      {
        title: "Step 1 — Start selling",
        content:
          "Open the Sell option from DealUp and start creating a new product listing.",
      },
      {
        title: "Step 2 — Add product information",
        content:
          "Enter accurate information about the product.",
        bullets: [
          "Product title",
          "Category",
          "Price",
          "Condition",
          "Description",
          "Location",
        ],
      },
      {
        title: "Step 3 — Add photos",
        content:
          "Upload clear photos that accurately represent the product. Avoid misleading or unrelated images.",
      },
      {
        title: "Step 4 — Review and publish",
        content:
          "Review all information carefully before publishing the listing. Correct mistakes before making the listing live.",
      },
    ],
  },

  "selling/manage-listing": {
    title: "How to Edit or Manage a Listing",
    description:
      "Learn how to manage your existing DealUp listings.",
    category: "Selling",
    icon: Tag,
    sections: [
      {
        title: "Open your listings",
        content:
          "Go to your seller dashboard or My Ads area to view your listings.",
      },
      {
        title: "Edit a listing",
        content:
          "Open the listing you want to update and edit the available information. Keep the title, description, price and availability accurate.",
      },
      {
        title: "Remove or close a listing",
        content:
          "When a product is no longer available, use the available listing management controls rather than leaving outdated information online.",
      },
    ],
  },

  "verification/phone-verification": {
    title: "How to Verify Your Phone Number",
    description:
      "Learn how phone verification works on DealUp.",
    category: "Verification",
    icon: Phone,
    sections: [
      {
        title: "Start phone verification",
        content:
          "Open the verification area of your DealUp account and start the phone verification process.",
      },
      {
        title: "Complete the verification step",
        content:
          "Follow the on-screen instructions and enter the verification code when requested.",
      },
      {
        title: "If verification does not complete",
        content:
          "Check that the phone number is correct, the device can receive the verification message, and try again after a short wait if necessary.",
      },
    ],
  },

  "payments/premium": {
    title: "How DealUp Premium Works",
    description:
      "Learn how Premium activation and payment work on DealUp.",
    category: "Payments",
    icon: CreditCard,
    sections: [
      {
        title: "View Premium",
        content:
          "Open the Premium section from your DealUp dashboard to review the available Premium offering.",
      },
      {
        title: "Choose a plan",
        content:
          "Review the plan information, price and included features before continuing.",
      },
      {
        title: "Complete payment",
        content:
          "Use the supported payment flow to complete your purchase. Do not share OTPs or payment credentials with anyone.",
      },
      {
        title: "Payment completed but Premium is not active",
        content:
          "Keep your transaction details and contact DealUp Support if the payment completed but your Premium status has not updated.",
      },
    ],
  },

  "buying/contact-seller": {
    title: "How to Contact a Seller",
    description:
      "Learn how to safely contact a seller about a product.",
    category: "Buying",
    icon: MessageCircle,
    sections: [
      {
        title: "Open the product",
        content:
          "Open the product details page for the item you are interested in.",
      },
      {
        title: "Choose a contact option",
        content:
          "Use the available messaging or calling option provided by DealUp.",
      },
      {
        title: "Protect your privacy",
        content:
          "DealUp may use privacy-protecting communication methods for supported calls. Do not ask the seller to share unnecessary private information.",
      },
      {
        title: "Stay alert",
        content:
          "If a seller asks for suspicious payments or sensitive credentials, stop the transaction and report the issue.",
      },
    ],
  },

  "safety/report-listing": {
    title: "How to Report a Suspicious Listing",
    description:
      "Learn how to report a listing that may violate DealUp rules or create a safety concern.",
    category: "Safety",
    icon: ShieldCheck,
    sections: [
      {
        title: "When should you report?",
        content:
          "Consider reporting listings that appear fraudulent, misleading, prohibited or otherwise unsafe.",
      },
      {
        title: "Submit a report",
        content:
          "Use the report option available on the relevant product or listing and provide accurate information about the problem.",
      },
      {
        title: "After reporting",
        content:
          "DealUp can review the submitted information and take appropriate action according to its policies.",
      },
      {
        title: "Need more help?",
        content:
          "If the issue is urgent or you need additional assistance, contact DealUp Support.",
      },
    ],
  },
};

function getArticleKey(slug: string[]) {
  return slug.map((part) => decodeURIComponent(part)).join("/");
}

function getParentCategory(slug: string[]) {
  if (slug.length <= 1) {
    return null;
  }

  return `/help/${slug[0]}`;
}

export default async function HelpArticlePage({
  params,
}: PageProps) {
  const { slug } = await params;

  const articleKey = getArticleKey(slug);
  const article = helpArticles[articleKey];

  if (!article) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#1565d8] dark:bg-blue-950/50 dark:text-blue-400">
            <LifeBuoy size={30} />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
            Help article not found
          </h1>

          <p className="mt-3 text-slate-600 dark:text-slate-400">
            We could not find the Help Center article you are looking for.
          </p>

          <Link
            href="/help"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d47a1]"
          >
            <ArrowLeft size={17} />
            Back to Help Center
          </Link>
        </div>
      </main>
    );
  }

  const Icon = article.icon;
  const parentCategory = getParentCategory(slug);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/help"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#1565d8] dark:text-slate-300 dark:hover:text-blue-400"
            >
              <ArrowLeft size={17} />
              Help Center
            </Link>

            <Link
              href="/"
              className="text-sm font-semibold text-[#1565d8] hover:underline"
            >
              DealUp
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          BREADCRUMB
      ====================================================== */}

      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400"
        >
          <Link
            href="/help"
            className="hover:text-[#1565d8]"
          >
            Help Center
          </Link>

          <ChevronRight size={15} />

          {parentCategory ? (
            <>
              <Link
                href={parentCategory}
                className="hover:text-[#1565d8]"
              >
                {article.category}
              </Link>

              <ChevronRight size={15} />
            </>
          ) : null}

          <span className="font-medium text-slate-700 dark:text-slate-200">
            {article.title}
          </span>
        </nav>
      </div>

      {/* =====================================================
          ARTICLE HEADER
      ====================================================== */}

      <section className="mx-auto max-w-5xl px-4 pb-8 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1565d8] dark:bg-blue-950/50 dark:text-blue-400">
              <Icon size={28} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#1565d8]">
                {article.category}
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {article.title}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">
                {article.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ARTICLE CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-9">
              {article.sections.map((section, index) => (
                <section
                  key={section.title}
                  className={
                    index > 0
                      ? "border-t border-slate-200 pt-8 dark:border-slate-800"
                      : ""
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#1565d8] dark:bg-blue-950/50 dark:text-blue-400">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {section.title}
                      </h2>

                      <p className="mt-3 text-[15px] leading-7 text-slate-600 dark:text-slate-400">
                        {section.content}
                      </p>

                      {section.bullets?.length ? (
                        <ul className="mt-4 space-y-3">
                          {section.bullets.map((bullet) => (
                            <li
                              key={bullet}
                              className="flex gap-3 text-[15px] leading-6 text-slate-600 dark:text-slate-400"
                            >
                              <CheckCircle2
                                size={18}
                                className="mt-1 shrink-0 text-[#1565d8]"
                              />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </article>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <BookOpen
                  size={21}
                  className="text-[#1565d8]"
                />

                <h2 className="font-bold">
                  Need more help?
                </h2>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                If this article does not solve your problem, contact the
                DealUp Support team.
              </p>

              <Link
                href="/help/contact"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d47a1]"
              >
                Contact Support
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-3">
                <ShieldCheck
                  size={21}
                  className="text-amber-600 dark:text-amber-400"
                />

                <h2 className="font-bold text-amber-900 dark:text-amber-300">
                  Stay safe
                </h2>
              </div>

              <p className="mt-3 text-sm leading-6 text-amber-800 dark:text-amber-200/80">
                Never share your password, OTP, banking credentials or
                other sensitive information with another person.
              </p>

              <Link
                href="/help/safety"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:underline dark:text-amber-300"
              >
                Safety Center
                <ArrowRight size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* =====================================================
          ARTICLE FEEDBACK
      ====================================================== */}

      <HelpArticleFeedback
        articleSlug={articleKey}
      />

      {/* =====================================================
          ARTICLE FEEDBACK / FOOTER CTA
      ====================================================== */}

      <section className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Still need help?
          </p>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Our Support team can help you with account, buying, selling,
            payment and safety-related issues.
          </p>

          <Link
            href="/help/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#1565d8] px-5 py-3 text-sm font-semibold text-[#1565d8] transition hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            Contact DealUp Support
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}