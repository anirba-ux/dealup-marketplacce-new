"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Filter,
  Headphones,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  Ticket,
  UserRound,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@teispace/next-themes";

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
  userId: string;
  userName: string;
  userEmail: string;
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

interface SupportStatistics {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  waitingForUser: number;
  resolved: number;
  closed: number;
  highPriority: number;
  criticalPriority: number;
}

const defaultStatistics: SupportStatistics = {
  total: 0,
  open: 0,
  assigned: 0,
  inProgress: 0,
  waitingForUser: 0,
  resolved: 0,
  closed: 0,
  highPriority: 0,
  criticalPriority: 0,
};

// =====================================================
// Helpers
// =====================================================

function formatStatus(status: TicketStatus) {
  switch (status) {
    case "open":
      return "Open";

    case "assigned":
      return "Assigned";

    case "in_progress":
      return "In Progress";

    case "waiting_for_user":
      return "Waiting for User";

    case "resolved":
      return "Resolved";

    case "closed":
      return "Closed";

    default:
      return status;
  }
}

function formatCategory(category: TicketCategory) {
  switch (category) {
    case "account":
      return "Account";

    case "buying":
      return "Buying";

    case "selling":
      return "Selling";

    case "payment":
      return "Payment";

    case "verification":
      return "Verification";

    case "messages":
      return "Messages";

    case "safety":
      return "Safety";

    case "technical":
      return "Technical";

    case "other":
      return "Other";

    default:
      return category;
  }
}

function formatPriority(priority: TicketPriority) {
  return (
    priority.charAt(0).toUpperCase() +
    priority.slice(1)
  );
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

// =====================================================
// Badge Styles
// =====================================================

function getStatusClass(status: TicketStatus) {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";

    case "assigned":
      return "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300";

    case "in_progress":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";

    case "waiting_for_user":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300";

    case "resolved":
      return "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300";

    case "closed":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getPriorityClass(priority: TicketPriority) {
  switch (priority) {
    case "critical":
      return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300";

    case "high":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300";

    case "normal":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";

    case "low":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

// =====================================================
// Admin Support Page
// =====================================================

export default function AdminSupportPage() {
  const { resolvedTheme } = useTheme();

  const [tickets, setTickets] = useState<
    SupportTicket[]
  >([]);

  const [statistics, setStatistics] =
    useState<SupportStatistics>(
      defaultStatistics,
    );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ===================================================
  // Load Tickets
  // ===================================================

  const loadTickets = async (
    showRefresh = false,
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim(),
        );
      }

      if (status) {
        params.set("status", status);
      }

      if (category) {
        params.set(
          "category",
          category,
        );
      }

      if (priority) {
        params.set(
          "priority",
          priority,
        );
      }

      params.set("limit", "100");

      const response = await fetch(
        `/api/admin/support/tickets?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            "Unable to load support tickets.",
        );
      }

      setTickets(
        Array.isArray(data.tickets)
          ? data.tickets
          : [],
      );

      setStatistics(
        data.statistics ||
          defaultStatistics,
      );
    } catch (err) {
      console.error(
        "ADMIN SUPPORT LOAD ERROR:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load support tickets.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ===================================================
  // Initial Load
  // ===================================================

  useEffect(() => {
    loadTickets();
  }, []);

  // ===================================================
  // Filtered Tickets
  // ===================================================

  const visibleTickets = useMemo(() => {
    return tickets;
  }, [tickets]);

  // ===================================================
  // Page
  // ===================================================

  return (
    <main
      className={`min-h-screen px-4 py-6 sm:px-6 lg:px-8 ${
        resolvedTheme === "dark"
          ? "bg-slate-950"
          : "bg-slate-50"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        {/* =================================================
            Header
        ================================================= */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1565d8] hover:underline"
            >
              <ArrowLeft size={16} />
              Back to Admin Dashboard
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1565d8] to-[#0d47a1] text-white shadow-lg">
                <Headphones
                  size={28}
                  strokeWidth={2.2}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#1565d8]">
                  DealUp Care
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  Support Center
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage customer support requests
                  and help DealUp users.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadTickets(true)}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#1565d8] hover:text-[#1565d8] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* =================================================
            Statistics
        ================================================= */}

        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {/* Total */}

          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm dark:border-blue-900/40 dark:from-blue-950/40 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                <Ticket size={20} />
              </div>

              <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                Total
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              {statistics.total}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Support requests
            </p>
          </div>

          {/* Open */}

          <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm dark:border-sky-900/40 dark:from-sky-950/40 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300">
                <Inbox size={20} />
              </div>

              <span className="text-xs font-semibold text-sky-600 dark:text-sky-300">
                Open
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              {statistics.open}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Need attention
            </p>
          </div>

          {/* Assigned */}

          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm dark:border-violet-900/40 dark:from-violet-950/40 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300">
                <UserRound size={20} />
              </div>

              <span className="text-xs font-semibold text-violet-600 dark:text-violet-300">
                Assigned
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              {statistics.assigned}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              With an agent
            </p>
          </div>

          {/* In Progress */}

          <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm dark:border-amber-900/40 dark:from-amber-950/40 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300">
                <Clock3 size={20} />
              </div>

              <span className="text-xs font-semibold text-amber-600 dark:text-amber-300">
                In Progress
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              {statistics.inProgress}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Being handled
            </p>
          </div>

          {/* Priority */}

          <div className="col-span-2 rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 shadow-sm dark:border-red-900/40 dark:from-red-950/40 dark:to-slate-900 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300">
                <ShieldAlert size={20} />
              </div>

              <span className="text-xs font-semibold text-red-600 dark:text-red-300">
                Priority
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              {statistics.highPriority +
                statistics.criticalPriority}
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              High / Critical
            </p>
          </div>
        </section>

        {/* =================================================
            Filters
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Filter
              size={18}
              className="text-[#1565d8]"
            />

            <h2 className="font-bold text-slate-900 dark:text-white">
              Find Support Requests
            </h2>
          </div>

          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
            {/* Search */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadTickets();
                  }
                }}
                placeholder="Search ticket, subject or user..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Status */}

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#1565d8] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">
                All Status
              </option>

              <option value="open">
                Open
              </option>

              <option value="assigned">
                Assigned
              </option>

              <option value="in_progress">
                In Progress
              </option>

              <option value="waiting_for_user">
                Waiting for User
              </option>

              <option value="resolved">
                Resolved
              </option>

              <option value="closed">
                Closed
              </option>
            </select>

            {/* Category */}

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#1565d8] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">
                All Categories
              </option>

              <option value="account">
                Account
              </option>

              <option value="buying">
                Buying
              </option>

              <option value="selling">
                Selling
              </option>

              <option value="payment">
                Payment
              </option>

              <option value="verification">
                Verification
              </option>

              <option value="messages">
                Messages
              </option>

              <option value="safety">
                Safety
              </option>

              <option value="technical">
                Technical
              </option>

              <option value="other">
                Other
              </option>
            </select>

            {/* Priority */}

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#1565d8] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">
                All Priority
              </option>

              <option value="low">
                Low
              </option>

              <option value="normal">
                Normal
              </option>

              <option value="high">
                High
              </option>

              <option value="critical">
                Critical
              </option>
            </select>

            {/* Apply */}

            <button
              type="button"
              onClick={() => loadTickets()}
              className="h-11 rounded-xl bg-[#1565d8] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d47a1]"
            >
              Search
            </button>
          </div>
        </section>

        {/* =================================================
            Error
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Unable to load support tickets
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            Tickets
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-700 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Support Requests
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {visibleTickets.length} request
                  {visibleTickets.length !== 1
                    ? "s"
                    : ""}{" "}
                  found
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Live support queue
              </div>
            </div>
          </div>

          {/* Loading */}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <Loader2
                  size={32}
                  className="mx-auto animate-spin text-[#1565d8]"
                />

                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Loading support requests...
                </p>
              </div>
            </div>
          ) : visibleTickets.length === 0 ? (
            /* Empty */

            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-[#1565d8] dark:bg-blue-950/40">
                <CheckCircle2 size={38} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                No support requests found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                There are no tickets matching
                the current search and filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/60">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Ticket
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        User
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Category
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Priority
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Updated
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleTickets.map(
                      (ticket) => (
                        <tr
                          key={ticket.id}
                          className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                        >
                          <td className="px-6 py-5">
                            <div className="max-w-[280px]">
                              <p className="font-bold text-[#1565d8]">
                                {ticket.ticketId}
                              </p>

                              <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                                {ticket.subject}
                              </p>

                              <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                                {ticket.description}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {ticket.userName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {ticket.userEmail}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {formatCategory(
                                ticket.category,
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                                ticket.status,
                              )}`}
                            >
                              {formatStatus(
                                ticket.status,
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getPriorityClass(
                                ticket.priority,
                              )}`}
                            >
                              {formatPriority(
                                ticket.priority,
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(
                              ticket.updatedAt,
                            )}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <Link
                              href={`/admin/support/${ticket.ticketId}`}
                              className="inline-flex items-center rounded-xl bg-[#1565d8] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0d47a1]"
                            >
                              View Ticket
                            </Link>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}

              <div className="divide-y divide-slate-100 dark:divide-slate-800 lg:hidden">
                {visibleTickets.map(
                  (ticket) => (
                    <div
                      key={ticket.id}
                      className="p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#1565d8]">
                            {ticket.ticketId}
                          </p>

                          <h3 className="mt-1 font-bold text-slate-900 dark:text-white">
                            {ticket.subject}
                          </h3>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClass(
                            ticket.status,
                          )}`}
                        >
                          {formatStatus(
                            ticket.status,
                          )}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {ticket.description}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            User
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {ticket.userName}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Category
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {formatCategory(
                              ticket.category,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Priority
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getPriorityClass(
                              ticket.priority,
                            )}`}
                          >
                            {formatPriority(
                              ticket.priority,
                            )}
                          </span>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Updated
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(
                              ticket.updatedAt,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <Link
                          href={`/admin/support/${ticket.ticketId}`}
                          className="flex h-11 w-full items-center justify-center rounded-xl bg-[#1565d8] text-sm font-bold text-white transition hover:bg-[#0d47a1]"
                        >
                          View Support Ticket
                        </Link>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </section>

        {/* =================================================
            Footer Note
        ================================================= */}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1565d8] dark:bg-blue-950/40">
            <Headphones size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              DealUp Support Operations
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Customer conversations and support
              requests should be handled securely.
              Never expose private user information
              unnecessarily.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}