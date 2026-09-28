import Link from "next/link";

import { redirect } from "next/navigation";

import { auth } from "@/auth";

interface FeedbackItem {
  _id?: string;
  articleSlug: string;
  feedback: "helpful" | "not_helpful";
  comment?: string | null;
  userId?: string;
  userName?: string;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ArticleStat {
  articleSlug: string;
  helpful: number;
  notHelpful: number;
  total: number;
  helpfulRate: number;
}

interface FeedbackResponse {
  success: boolean;

  stats: {
    helpful: number;
    notHelpful: number;
    total: number;
    helpfulRate: number;
  };

  articleStats: ArticleStat[];

  feedback: FeedbackItem[];
}

// =====================================================
// Article title helper
// =====================================================

function getArticleTitle(
  slug: string,
) {
  const titles: Record<
    string,
    string
  > = {
    buying:
      "Buying on DealUp",

    selling:
      "Selling on DealUp",

    account:
      "Account & Profile",

    payments:
      "Payments",

    verification:
      "Verification",

    safety:
      "Safety & Security",

    messages:
      "Messages",

    wishlist:
      "Wishlist",

    "selling/create-listing":
      "Create a Listing",

    "selling/manage-listing":
      "Manage Your Listing",

    "verification/phone-verification":
      "Phone Verification",

    "payments/premium":
      "Premium Payments",

    "buying/contact-seller":
      "Contact a Seller",

    "safety/report-listing":
      "Report a Listing",
  };

  return (
    titles[slug] ??
    slug
      .split("/")
      .map(
        (part) =>
          part
            .replace(/-/g, " ")
            .replace(
              /\b\w/g,
              (char) =>
                char.toUpperCase(),
            ),
      )
      .join(" / ")
  );
}

// =====================================================
// Admin Help Feedback Page
// =====================================================

export default async function AdminHelpFeedbackPage() {
  // ---------------------------------------------------
  // Authentication
  // ---------------------------------------------------

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // ---------------------------------------------------
  // Admin authorization
  // ---------------------------------------------------

  if (session.user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl dark:border-red-900 dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl dark:bg-red-950">
            🚫
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
            Access Denied
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            You do not have permission
            to access Help Center
            feedback.
          </p>

          <Link
            href="/admin"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#1565d8] px-5 text-sm font-semibold text-white transition hover:bg-[#0d47a1]"
          >
            Back to Admin
          </Link>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------
  // Load feedback
  // ---------------------------------------------------

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  let data:
    | FeedbackResponse
    | null = null;

  try {
    const response = await fetch(
      `${baseUrl}/api/admin/help/feedback`,
      {
        cache: "no-store",
        headers: {
          Cookie: "",
        },
      },
    );

    if (response.ok) {
      data =
        (await response.json()) as FeedbackResponse;
    }
  } catch (error) {
    console.error(
      "[ADMIN HELP FEEDBACK PAGE]",
      error,
    );
  }

  // ---------------------------------------------------
  // Fallback
  // ---------------------------------------------------

  const stats =
    data?.stats ?? {
      helpful: 0,
      notHelpful: 0,
      total: 0,
      helpfulRate: 0,
    };

  const articleStats =
    data?.articleStats ?? [];

  const feedback =
    data?.feedback ?? [];

  // ---------------------------------------------------
  // Dashboard
  // ---------------------------------------------------

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <Link
                href="/admin"
                className="text-sm font-semibold text-[#1565d8] hover:underline"
              >
                ← Admin Dashboard
              </Link>

              <p className="mt-4 text-sm font-semibold text-[#1565d8]">
                DealUp Help Center
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                Article Feedback
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Review user feedback and
                understand which Help Center
                articles need improvement.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl dark:bg-blue-950">
              📚
            </div>

          </div>
        </div>

        {/* Statistics */}

        <section className="mt-8">

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="Total Feedback"
              value={stats.total}
              description="All article responses"
              icon="💬"
            />

            <StatCard
              title="Helpful"
              value={stats.helpful}
              description="Users found useful"
              icon="👍"
            />

            <StatCard
              title="Not Helpful"
              value={stats.notHelpful}
              description="Needs improvement"
              icon="👎"
            />

            <StatCard
              title="Helpful Rate"
              value={`${stats.helpfulRate}%`}
              description="Overall article satisfaction"
              icon="📈"
            />

          </div>

        </section>

        {/* Article Statistics */}

        <section className="mt-8">

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Article Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Feedback performance by Help Center article.
            </p>
          </div>

          {articleStats.length === 0 ? (
            <EmptyState
              message="No article feedback has been submitted yet."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {articleStats.map(
                (article) => (
                  <div
                    key={
                      article.articleSlug
                    }
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {getArticleTitle(
                        article.articleSlug,
                      )}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      /help/
                      {article.articleSlug}
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-3">

                      <MiniStat
                        label="Helpful"
                        value={
                          article.helpful
                        }
                      />

                      <MiniStat
                        label="Not Helpful"
                        value={
                          article.notHelpful
                        }
                      />

                      <MiniStat
                        label="Total"
                        value={
                          article.total
                        }
                      />

                    </div>

                    <div className="mt-5">

                      <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500 dark:text-slate-400">
                          Helpful Rate
                        </span>

                        <span className="text-[#1565d8]">
                          {
                            article.helpfulRate
                          }%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-[#1565d8]"
                          style={{
                            width: `${article.helpfulRate}%`,
                          }}
                        />
                      </div>

                    </div>
                  </div>
                ),
              )}
            </div>
          )}

        </section>

        {/* Recent Feedback */}

        <section className="mt-8">

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Feedback
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Latest responses submitted by DealUp users.
            </p>
          </div>

          {feedback.length === 0 ? (
            <EmptyState
              message="No feedback available."
            />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[850px] text-left">

                  <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">

                    <tr>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Article
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Feedback
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        User
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Comment
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Date
                      </th>
                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                    {feedback.map(
                      (item, index) => (
                        <tr
                          key={
                            item._id ??
                            `${item.articleSlug}-${index}`
                          }
                          className="transition hover:bg-slate-50 dark:hover:bg-slate-950"
                        >

                          <td className="px-5 py-5 align-top">

                            <div className="font-semibold text-slate-900 dark:text-white">
                              {getArticleTitle(
                                item.articleSlug,
                              )}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              /help/
                              {
                                item.articleSlug
                              }
                            </div>

                          </td>

                          <td className="px-5 py-5 align-top">

                            {item.feedback ===
                            "helpful" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                👍 Helpful
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-400">
                                👎 Not Helpful
                              </span>
                            )}

                          </td>

                          <td className="px-5 py-5 align-top">

                            <div className="font-semibold text-slate-900 dark:text-white">
                              {item.userName ??
                                "Unknown user"}
                            </div>

                            {item.userEmail && (
                              <div className="mt-1 text-xs text-slate-400">
                                {
                                  item.userEmail
                                }
                              </div>
                            )}

                          </td>

                          <td className="max-w-sm px-5 py-5 align-top">

                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                              {item.comment?.trim()
                                ? item.comment
                                : "No comment provided."}
                            </p>

                          </td>

                          <td className="whitespace-nowrap px-5 py-5 align-top text-sm text-slate-500 dark:text-slate-400">
                            {item.createdAt
                              ? new Date(
                                  item.createdAt,
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </td>

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>
            </div>
          )}

        </section>

      </div>
    </main>
  );
}

// =====================================================
// Stat Card
// =====================================================

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl dark:bg-blue-950">
          {icon}
        </div>

      </div>
    </div>
  );
}

// =====================================================
// Mini Stat
// =====================================================

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-950">
      <p className="text-lg font-bold text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] font-medium text-slate-400">
        {label}
      </p>
    </div>
  );
}

// =====================================================
// Empty State
// =====================================================

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="text-4xl">
        📚
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
}