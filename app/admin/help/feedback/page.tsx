import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  MessageCircle,
  MessageSquareText,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";

import { auth } from "@/auth";

import {
  findAllHelpArticleFeedback,
} from "@/lib/repositories/helpArticleFeedback.repository";

type FeedbackItem = {
  _id?: string;
  articleSlug: string;
  feedback: "helpful" | "not_helpful";
  comment?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  userId?: string;
  userName?: string;
  userEmail?: string;
};

type ArticleStat = {
  articleSlug: string;
  helpful: number;
  notHelpful: number;
  total: number;
  helpfulRate: number;
};

const articleTitles: Record<string, string> = {
  buying: "Buying on DealUp",
  selling: "Selling on DealUp",
  account: "Account & Login",
  payments: "Payments",
  verification: "Verification",
  safety: "Safety & Security",
  messages: "Messages",
  wishlist: "Wishlist",

  "selling/create-listing": "Create a Listing",
  "selling/manage-listing": "Manage Your Listing",
  "verification/phone-verification":
    "Phone Verification",
  "payments/premium": "Premium & Payments",
  "buying/contact-seller":
    "Contact a Seller",
  "safety/report-listing":
    "Report a Listing",
};

function getArticleTitle(slug: string) {
  return (
    articleTitles[slug] ??
    slug
      .split("/")
      .map((part) =>
        part
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) =>
            char.toUpperCase(),
          ),
      )
      .join(" / ")
  );
}

function formatDate(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getInitials(name?: string) {
  if (!name?.trim()) {
    return "U";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] + parts[parts.length - 1][0]
  ).toUpperCase();
}

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass,
  accentClass,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  accentClass: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${accentClass}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
        <MessageSquareText className="h-8 w-8" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
        No feedback yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        User feedback from Help Center articles will
        appear here once users start submitting their
        responses.
      </p>
    </div>
  );
}

export default async function AdminHelpFeedbackPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  let feedback: FeedbackItem[] = [];

  try {
    const result =
      await findAllHelpArticleFeedback(500);

    feedback = result.map((item) => ({
      _id: item._id?.toString(),
      articleSlug: item.articleSlug,
      feedback: item.feedback,
      comment: item.comment ?? null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      userId: item.userId?.toString(),
      userName: item.userName,
      userEmail: item.userEmail,
    }));
  } catch (error) {
    console.error(
      "[ADMIN HELP FEEDBACK PAGE ERROR]",
      error,
    );
  }

  const helpful = feedback.filter(
    (item) => item.feedback === "helpful",
  ).length;

  const notHelpful = feedback.filter(
    (item) => item.feedback === "not_helpful",
  ).length;

  const total = feedback.length;

  const helpfulRate =
    total > 0
      ? Math.round((helpful / total) * 100)
      : 0;

  const articleStatsMap = new Map<
    string,
    ArticleStat
  >();

  for (const item of feedback) {
    const existing = articleStatsMap.get(
      item.articleSlug,
    );

    if (existing) {
      existing.total += 1;

      if (item.feedback === "helpful") {
        existing.helpful += 1;
      } else {
        existing.notHelpful += 1;
      }

      existing.helpfulRate =
        existing.total > 0
          ? Math.round(
              (existing.helpful /
                existing.total) *
                100,
            )
          : 0;

      continue;
    }

    articleStatsMap.set(item.articleSlug, {
      articleSlug: item.articleSlug,
      helpful:
        item.feedback === "helpful" ? 1 : 0,
      notHelpful:
        item.feedback === "not_helpful" ? 1 : 0,
      total: 1,
      helpfulRate:
        item.feedback === "helpful" ? 100 : 0,
    });
  }

  const articleStats = Array.from(
    articleStatsMap.values(),
  ).sort((a, b) => b.total - a.total);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-80 overflow-hidden">
        <div className="absolute left-1/4 top-[-180px] h-96 w-96 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute right-1/4 top-[-160px] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-500/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* ================================================= */}
        {/* Header */}
        {/* ================================================= */}

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>

            <Link
              href="/help"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
            >
              <BookOpen className="h-4 w-4" />
              <span>View Help Center</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </Link>
          </div>

          <div className="mt-7 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 shadow-xl shadow-blue-500/10 sm:p-8 dark:border-blue-900/50 dark:from-blue-950 dark:via-blue-900 dark:to-indigo-950">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur">
                  <MessageCircle className="h-7 w-7" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Help Center Feedback
                    </h1>

                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-blue-50 ring-1 ring-white/10">
                      ADMIN
                    </span>
                  </div>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                    Monitor article feedback, understand
                    user satisfaction, and identify areas
                    where the Help Center can be improved.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur">
                <TrendingUp className="h-5 w-5 text-blue-100" />

                <div>
                  <p className="text-xs text-blue-200">
                    Overall helpfulness
                  </p>

                  <p className="text-xl font-bold text-white">
                    {helpfulRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ================================================= */}
        {/* Overview */}
        {/* ================================================= */}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Feedback Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                A quick view of user responses across
                Help Center articles.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Feedback"
              value={total}
              description="All submitted responses"
              icon={
                <MessageSquareText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              }
              iconClass="bg-blue-50 dark:bg-blue-950/50"
              accentClass="bg-blue-500"
            />

            <StatCard
              title="Helpful"
              value={helpful}
              description="Users found the article useful"
              icon={
                <ThumbsUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              }
              iconClass="bg-emerald-50 dark:bg-emerald-950/40"
              accentClass="bg-emerald-500"
            />

            <StatCard
              title="Not Helpful"
              value={notHelpful}
              description="Users need better information"
              icon={
                <ThumbsDown className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              }
              iconClass="bg-rose-50 dark:bg-rose-950/40"
              accentClass="bg-rose-500"
            />

            <StatCard
              title="Helpful Rate"
              value={`${helpfulRate}%`}
              description="Overall article helpfulness"
              icon={
                <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              }
              iconClass="bg-violet-50 dark:bg-violet-950/40"
              accentClass="bg-violet-500"
            />
          </div>
        </section>

        {/* ================================================= */}
        {/* Article Performance */}
        {/* ================================================= */}

        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Article Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              See how individual Help Center articles are
              performing.
            </p>
          </div>

          {articleStats.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {articleStats.map((article) => {
                const rate =
                  article.helpfulRate;

                return (
                  <div
                    key={article.articleSlug}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
                  >
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500" />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                              <BookOpen className="h-4 w-4" />
                            </div>

                            <h3 className="truncate font-bold text-slate-900 dark:text-white">
                              {getArticleTitle(
                                article.articleSlug,
                              )}
                            </h3>
                          </div>

                          <p className="mt-2 truncate text-xs text-slate-400">
                            /help/{article.articleSlug}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {rate}%
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-2">
                        <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70">
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Total
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                            {article.total}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
                          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            Helpful
                          </p>

                          <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">
                            {article.helpful}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-rose-50 p-3 dark:bg-rose-950/30">
                          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                            Not Helpful
                          </p>

                          <p className="mt-1 text-lg font-bold text-rose-700 dark:text-rose-300">
                            {article.notHelpful}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-500 dark:text-slate-400">
                            Helpfulness
                          </span>

                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {rate}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all"
                            style={{
                              width: `${rate}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* Recent Feedback */}
        {/* ================================================= */}

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Recent Feedback
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Latest responses submitted by Help Center
                users.
              </p>
            </div>

            {feedback.length > 0 && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <Users className="h-3.5 w-3.5" />
                {feedback.length} response
                {feedback.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {feedback.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* Desktop/tablet table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        User
                      </th>

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Article
                      </th>

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Feedback
                      </th>

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Comment
                      </th>

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {feedback.map((item, index) => (
                      <tr
                        key={
                          item._id ??
                          `${item.articleSlug}-${item.createdAt}-${index}`
                        }
                        className="transition hover:bg-blue-50/40 dark:hover:bg-blue-950/10"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                              {getInitials(
                                item.userName,
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {item.userName ||
                                  "Unknown user"}
                              </div>

                              {item.userEmail && (
                                <div className="mt-0.5 max-w-[180px] truncate text-xs text-slate-500 dark:text-slate-400">
                                  {item.userEmail}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                              <BookOpen className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <div className="max-w-[220px] truncate font-semibold text-slate-900 dark:text-white">
                                {getArticleTitle(
                                  item.articleSlug,
                                )}
                              </div>

                              <div className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
                                /help/{item.articleSlug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          {item.feedback ===
                          "helpful" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <ThumbsUp className="h-3.5 w-3.5" />
                              Helpful
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                              <ThumbsDown className="h-3.5 w-3.5" />
                              Not Helpful
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <div className="max-w-[300px] text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {item.comment?.trim()
                              ? item.comment
                              : "No comment provided"}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Clock3 className="h-4 w-4" />
                            {formatDate(
                              item.createdAt,
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
                {feedback.map((item, index) => (
                  <div
                    key={
                      item._id ??
                      `${item.articleSlug}-${item.createdAt}-${index}`
                    }
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                          {getInitials(
                            item.userName,
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">
                            {item.userName ||
                              "Unknown user"}
                          </p>

                          {item.userEmail && (
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {item.userEmail}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.feedback ===
                      "helpful" ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <ThumbsUp className="h-3 w-3" />
                          Helpful
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                          <ThumbsDown className="h-3 w-3" />
                          Not Helpful
                        </span>
                      )}
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />

                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {getArticleTitle(
                            item.articleSlug,
                          )}
                        </p>
                      </div>

                      <p className="mt-1 pl-6 text-xs text-slate-400">
                        /help/{item.articleSlug}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Comment
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {item.comment?.trim()
                          ? item.comment
                          : "No comment provided"}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* Bottom */}
        {/* ================================================= */}

        <footer className="mt-10 border-t border-slate-200 py-6 text-center dark:border-slate-800">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>DealUp Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span>Help Center Feedback</span>
          </div>
        </footer>
      </div>
    </main>
  );
}