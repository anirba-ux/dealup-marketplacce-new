"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useTheme } from "@teispace/next-themes";

import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Headphones,
  Loader2,
  MessageSquareText,
  Plus,
  RefreshCw,
  ShieldCheck,
  Ticket,
} from "lucide-react";

type TicketStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "waiting_for_user"
  | "resolved"
  | "closed";

type TicketPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

type TicketCategory =
  | "account"
  | "buying"
  | "selling"
  | "payment"
  | "verification"
  | "messages"
  | "safety"
  | "technical"
  | "other";

interface SupportTicket {
  id: string;
  ticketId: string;
  category: TicketCategory;
  subject: string;
  description: string;
  productId: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
}

interface SupportTicketsResponse {
  success: boolean;
  tickets?: SupportTicket[];
  count?: number;
  message?: string;
}

const categoryLabels: Record<
  TicketCategory,
  string
> = {
  account: "Account",
  buying: "Buying",
  selling: "Selling",
  payment: "Payments",
  verification: "Verification",
  messages: "Messages",
  safety: "Safety",
  technical: "Technical",
  other: "Other",
};

const statusLabels: Record<
  TicketStatus,
  string
> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  waiting_for_user: "Waiting for You",
  resolved: "Resolved",
  closed: "Closed",
};

function getStatusClasses(
  status: TicketStatus,
) {
  switch (status) {
    case "open":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300";

    case "assigned":
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300";

    case "in_progress":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300";

    case "waiting_for_user":
      return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300";

    case "resolved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300";

    case "closed":
      return "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";

    default:
      return "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function getPriorityClasses(
  priority: TicketPriority,
) {
  switch (priority) {
    case "critical":
      return "text-red-600 dark:text-red-400";

    case "high":
      return "text-orange-600 dark:text-orange-400";

    case "normal":
      return "text-blue-600 dark:text-blue-400";

    case "low":
      return "text-slate-500 dark:text-slate-400";

    default:
      return "text-slate-500 dark:text-slate-400";
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function SupportPage() {
  const { resolvedTheme } = useTheme();

  const [tickets, setTickets] =
    useState<SupportTicket[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const fetchTickets = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          "/api/support/tickets",
          {
            method: "GET",

            credentials: "include",

            cache: "no-store",

            headers: {
              Accept: "application/json",
            },
          },
        );

        const data =
          (await response.json()) as SupportTicketsResponse;

        console.log(
          "[SUPPORT] API RESPONSE:",
          data,
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load your support tickets.",
          );
        }

        if (!data.success) {
          throw new Error(
            data?.message ||
              "Unable to load your support tickets.",
          );
        }

        const nextTickets =
          Array.isArray(data.tickets)
            ? data.tickets
            : [];

        console.log(
          "[SUPPORT] TICKETS RECEIVED:",
          nextTickets.length,
          nextTickets,
        );

        setTickets(nextTickets);
      } catch (err) {
        console.error(
          "Support tickets fetch error:",
          err,
        );

        setTickets([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your support tickets.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const logoSrc =
    resolvedTheme === "dark"
      ? "/images/dealup-dark-logo.png"
      : "/images/dealup-logo.png";

  const activeTicketCount =
    tickets.filter(
      (ticket) =>
        ![
          "resolved",
          "closed",
        ].includes(ticket.status),
    ).length;

  return (
    <main className="min-h-screen bg-slate-50 pb-16 dark:bg-slate-950">
      {/* =====================================================
          HERO HEADER
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/40">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />

        <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/10" />

        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Back */}

          <Link
            href="/help"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#1565d8] dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowLeft size={16} />

            <span>
              Back to Help Center
            </span>
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Title */}

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-blue-900/50 dark:bg-slate-900">
                <Headphones
                  size={26}
                  className="text-[#1565d8] dark:text-blue-400"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    My Support
                  </h1>

                  <span className="hidden rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 sm:inline-flex">
                    DealUp Care
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                  Track and manage your DealUp support requests.
                </p>
              </div>
            </div>

            {/* Actions */}

            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() =>
                  void fetchTickets(true)
                }
                disabled={
                  loading ||
                  refreshing
                }
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-[#1565d8] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:text-blue-400 sm:flex-none"
              >
                {refreshing ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCw size={16} />
                )}

                <span>
                  {refreshing
                    ? "Refreshing..."
                    : "Refresh"}
                </span>
              </button>

              <Link
                href="/help/contact"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1565d8] to-[#1976e8] px-4 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 sm:flex-none"
              >
                <Plus size={17} />

                <span>
                  New Request
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* ===================================================
            STATS
        ==================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {/* Total */}

          <div className="group rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-blue-900/40 dark:from-slate-900 dark:to-blue-950/20">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Ticket size={20} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Total Requests
                </p>

                <p className="mt-0.5 text-2xl font-extrabold text-slate-900 dark:text-white">
                  {loading
                    ? "—"
                    : tickets.length}
                </p>
              </div>
            </div>
          </div>

          {/* Active */}

          <div className="group rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-orange-900/40 dark:from-slate-900 dark:to-orange-950/20">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
                <MessageSquareText
                  size={20}
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Active Requests
                </p>

                <p className="mt-0.5 text-2xl font-extrabold text-slate-900 dark:text-white">
                  {loading
                    ? "—"
                    : activeTicketCount}
                </p>
              </div>
            </div>
          </div>

          {/* Support */}

          <div className="group rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/40 dark:from-slate-900 dark:to-emerald-950/20">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ShieldCheck size={20} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Support
                </p>

                <p className="mt-0.5 text-base font-extrabold text-slate-900 dark:text-white">
                  We&apos;re here to help
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-5 dark:border-red-900/60 dark:from-red-950/30 dark:to-orange-950/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-red-700 dark:text-red-300">
                  Unable to load support requests
                </p>

                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void fetchTickets()
                }
                className="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-700 transition hover:bg-red-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading && !error && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-4 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-4 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-6 h-9 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {/* ===================================================
            EMPTY STATE
        ==================================================== */}

        {!loading &&
          !error &&
          tickets.length === 0 && (
            <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-orange-50/70 px-6 py-12 text-center shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-blue-950/20 dark:to-orange-950/10 sm:py-16">
              <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-blue-400/10 blur-2xl" />

              <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-orange-400/10 blur-2xl" />

              <div className="relative">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-blue-100 bg-white p-4 shadow-lg shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-950">
                  {resolvedTheme ? (
                    <Image
                      src={logoSrc}
                      alt="DealUp Marketplace"
                      width={160}
                      height={70}
                      className="h-auto w-full object-contain"
                      priority
                    />
                  ) : (
                    <div className="h-10 w-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                  )}
                </div>

                <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-[#1565d8] shadow-sm dark:border-blue-900/50 dark:bg-slate-900/80 dark:text-blue-400">
                  <Headphones size={14} />
                  DealUp Support
                </div>

                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  No support requests yet
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                  Need help with something? Create a support request and our team will assist you with your DealUp experience.
                </p>

                <Link
                  href="/help/contact"
                  className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1565d8] to-[#1976e8] px-6 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25"
                >
                  <Headphones size={18} />
                  Contact Support
                </Link>
              </div>
            </div>
          )}

        {/* ===================================================
            TICKET LIST
        ==================================================== */}

        {!loading &&
          !error &&
          tickets.length > 0 && (
            <div>
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Your Support Requests
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Track the status of your requests below.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {tickets.map(
                  (ticket) => (
                    <Link
                      key={ticket.ticketId}
                      href={`/dashboard/support/${ticket.ticketId}`}
                      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900"
                    >
                      <div className="flex flex-col gap-5">
                        {/* Top */}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-blue-50 px-2 py-1 font-mono text-xs font-bold text-[#1565d8] dark:bg-blue-950/50 dark:text-blue-400">
                                {ticket.ticketId}
                              </span>

                              <span className="text-slate-300 dark:text-slate-700">
                                •
                              </span>

                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {
                                  categoryLabels[
                                    ticket.category
                                  ]
                                }
                              </span>
                            </div>

                            <h3 className="mt-3 line-clamp-2 text-base font-extrabold text-slate-900 transition group-hover:text-[#1565d8] dark:text-white dark:group-hover:text-blue-400 sm:text-lg">
                              {ticket.subject}
                            </h3>
                          </div>

                          <span
                            className={`inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                              ticket.status,
                            )}`}
                          >
                            {
                              statusLabels[
                                ticket.status
                              ]
                            }
                          </span>
                        </div>

                        {/* Description */}

                        <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                          {ticket.description}
                        </p>

                        {/* Bottom */}

                        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={14} />

                              {formatDate(
                                ticket.createdAt,
                              )}
                            </span>

                            <span>
                              Priority:{" "}
                              <strong
                                className={`font-bold capitalize ${getPriorityClasses(
                                  ticket.priority,
                                )}`}
                              >
                                {ticket.priority}
                              </strong>
                            </span>
                          </div>

                          <span className="inline-flex items-center gap-1 text-sm font-bold text-[#1565d8] dark:text-blue-400">
                            View Ticket

                            <ChevronRight
                              size={16}
                              className="transition-transform group-hover:translate-x-0.5"
                            />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ),
                )}
              </div>

              {/* Bottom CTA */}

              <div className="mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-orange-50 p-5 dark:border-blue-900/40 dark:from-blue-950/20 dark:to-orange-950/10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white">
                      Still need help?
                    </h3>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Create a new support request and tell us what you need.
                    </p>
                  </div>

                  <Link
                    href="/help/contact"
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-4 text-sm font-bold text-white transition hover:bg-[#0f56bb]"
                  >
                    <Plus size={16} />
                    New Request
                  </Link>
                </div>
              </div>
            </div>
          )}
      </div>
    </main>
  );
}