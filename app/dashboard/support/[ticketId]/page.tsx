"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useTheme } from "@teispace/next-themes";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Send,
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

type MessageSenderType =
  | "user"
  | "agent"
  | "system";

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

interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string | null;
  senderType: MessageSenderType;
  senderName: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

const categoryLabels: Record<TicketCategory, string> = {
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

const statusLabels: Record<TicketStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  waiting_for_user: "Waiting for You",
  resolved: "Resolved",
  closed: "Closed",
};

function getStatusClasses(status: TicketStatus) {
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

function getPriorityClasses(priority: TicketPriority) {
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

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function SupportTicketPage() {
  const params = useParams();
  const { resolvedTheme } = useTheme();

  const ticketId =
    typeof params.ticketId === "string"
      ? params.ticketId
      : "";

  const [ticket, setTicket] =
    useState<SupportTicket | null>(null);

  const [messages, setMessages] = useState<
    SupportMessage[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);

  const [messageText, setMessageText] = useState("");
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");

  const logoSrc =
    resolvedTheme === "dark"
      ? "/images/dealup-dark-logo.png"
      : "/images/dealup-logo.png";

  /* ========================================================
     LOAD TICKET
  ======================================================== */

  const fetchTicket = async (
    isRefresh = false,
  ) => {
    if (!ticketId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `/api/support/tickets/${encodeURIComponent(ticketId)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load this support ticket.",
        );
      }

      setTicket(data.ticket || null);

      setMessages(
        Array.isArray(data.messages)
          ? data.messages
          : [],
      );
    } catch (err) {
      console.error(
        "Support ticket details error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load this support ticket.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  /* ========================================================
     SEND MESSAGE
  ======================================================== */

  const handleSendMessage = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (sending) return;

    const cleanMessage = messageText.trim();

    if (!cleanMessage) {
      setSendError("Please enter a message.");
      return;
    }

    if (cleanMessage.length > 3000) {
      setSendError(
        "Message cannot be longer than 3000 characters.",
      );
      return;
    }

    try {
      setSending(true);
      setSendError("");

      const response = await fetch(
        `/api/support/tickets/${encodeURIComponent(
          ticketId,
        )}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: cleanMessage,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to send your message.",
        );
      }

      if (data?.data) {
        setMessages((current) => [
          ...current,
          data.data,
        ]);
      }

      setMessageText("");

      /*
       * Refresh ticket status because a reply from a user
       * can move waiting_for_user → open.
       */
      await fetchTicket(true);
    } catch (err) {
      console.error(
        "Support message send error:",
        err,
      );

      setSendError(
        err instanceof Error
          ? err.message
          : "Unable to send your message.",
      );
    } finally {
      setSending(false);
    }
  };

  /* ========================================================
     LOADING
  ======================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />

            <div className="mt-6 h-32 rounded-3xl bg-white dark:bg-slate-900" />

            <div className="mt-6 h-80 rounded-3xl bg-white dark:bg-slate-900" />
          </div>
        </div>
      </main>
    );
  }

  /* ========================================================
     ERROR
  ======================================================== */

  if (error || !ticket) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard/support"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#1565d8] dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowLeft size={16} />
            Back to My Support
          </Link>

          <div className="mt-6 rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400">
              <Ticket size={28} />
            </div>

            <h1 className="mt-5 text-xl font-extrabold text-slate-900 dark:text-white">
              Unable to load ticket
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {error || "Support ticket not found."}
            </p>

            <Link
              href="/dashboard/support"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#1565d8] px-5 text-sm font-bold text-white hover:bg-[#0f56bb]"
            >
              My Support
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isClosed = ticket.status === "closed";

  return (
    <main className="min-h-screen bg-slate-50 pb-16 dark:bg-slate-950">
      {/* ====================================================
          HEADER
      ===================================================== */}
      <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/dashboard/support"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#1565d8] dark:text-slate-400 dark:hover:text-blue-400"
              >
                <ArrowLeft size={16} />
                My Support
              </Link>

              <button
                type="button"
                onClick={() => fetchTicket(true)}
                disabled={refreshing}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-[#1565d8] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <RefreshCw
                  size={14}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />
                Refresh
              </button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  {resolvedTheme ? (
                    <Image
                      src={logoSrc}
                      alt="DealUp Marketplace"
                      width={100}
                      height={50}
                      className="h-auto w-full object-contain"
                    />
                  ) : (
                    <div className="h-7 w-8 rounded bg-slate-200 dark:bg-slate-800" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-blue-100 px-2 py-1 font-mono text-xs font-bold text-[#1565d8] dark:bg-blue-950/60 dark:text-blue-400">
                      {ticket.ticketId}
                    </span>

                    <span className="text-slate-300 dark:text-slate-700">
                      •
                    </span>

                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {categoryLabels[ticket.category]}
                    </span>
                  </div>

                  <h1 className="mt-2 line-clamp-2 text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
                    {ticket.subject}
                  </h1>
                </div>
              </div>

              <span
                className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClasses(ticket.status)}`}
              >
                {statusLabels[ticket.status]}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          CONTENT
      ===================================================== */}
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Ticket info */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Category
            </p>

            <p className="mt-1 font-bold text-slate-900 dark:text-white">
              {categoryLabels[ticket.category]}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Priority
            </p>

            <p
              className={`mt-1 font-bold capitalize ${getPriorityClasses(ticket.priority)}`}
            >
              {ticket.priority}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Created
            </p>

            <p className="mt-1 font-bold text-slate-900 dark:text-white">
              {formatDate(ticket.createdAt)}
            </p>
          </div>
        </div>

        {/* ==================================================
            ORIGINAL REQUEST
        =================================================== */}
        <section className="mb-6 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
          <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/20 px-5 py-4 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-transparent sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <MessageSquareText size={18} />
              </div>

              <div>
                <h2 className="font-extrabold text-slate-900 dark:text-white">
                  Your original request
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDateTime(ticket.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
              {ticket.description}
            </p>
          </div>
        </section>

        {/* ==================================================
            CONVERSATION
        =================================================== */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
            <div>
              <h2 className="font-extrabold text-slate-900 dark:text-white">
                Conversation
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {messages.length}{" "}
                {messages.length === 1
                  ? "message"
                  : "messages"}
              </p>
            </div>

            <Headphones
              size={20}
              className="text-[#1565d8] dark:text-blue-400"
            />
          </div>

          <div className="min-h-[280px] space-y-5 p-5 sm:p-6">
            {messages.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  <MessageSquareText size={25} />
                </div>

                <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                  No replies yet
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Our support team can continue the
                  conversation here.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isUser =
                  message.senderType === "user";

                const isSystem =
                  message.senderType === "system";

                if (isSystem) {
                  return (
                    <div
                      key={message.id}
                      className="flex justify-center"
                    >
                      <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      >
                        {message.message}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[75%] ${
                        isUser
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <div
                        className={`mb-1.5 flex items-center gap-2 ${
                          isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {!isUser && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                            <Headphones size={14} />
                          </div>
                        )}

                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {isUser
                            ? "You"
                            : message.senderName}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(
                            message.createdAt,
                          )}
                        </span>
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                          isUser
                            ? "rounded-br-md bg-[#1565d8] text-white shadow-sm"
                            : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* =================================================
              REPLY BOX
          ================================================== */}
          <div className="border-t border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/40 sm:p-6">
            {isClosed ? (
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    This ticket is closed
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    This conversation can no longer receive
                    new messages.
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSendMessage}
                className="space-y-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor="support-message"
                      className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                    >
                      Reply to Support
                    </label>

                    <textarea
                      id="support-message"
                      value={messageText}
                      onChange={(event) => {
                        setMessageText(
                          event.target.value,
                        );
                        setSendError("");
                      }}
                      maxLength={3000}
                      rows={4}
                      placeholder="Write your message..."
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />

                    <div className="mt-1.5 text-right text-[11px] text-slate-400">
                      {messageText.length}/3000
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !messageText.trim()
                    }
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1565d8] to-[#1976e8] px-5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Sending
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>

                {sendError && (
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {sendError}
                  </p>
                )}
              </form>
            )}
          </div>
        </section>

        {/* ==================================================
            SAFETY / FOOTER INFO
        =================================================== */}
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-blue-50 p-5 dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-blue-950/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <ShieldCheck size={19} />
            </div>

            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Your support conversation is private
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Only you and authorized DealUp support staff
                can access this support request.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/dashboard/support"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-[#1565d8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:text-blue-400"
          >
            <ArrowLeft size={16} />
            All Support Requests
          </Link>

          <Link
            href="/help/contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0f56bb]"
          >
            Need More Help
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}