"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Headphones,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Send,
  Shield,
  Ticket,
  UserRound,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@teispace/next-themes";

// =====================================================
// Types
// =====================================================

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

interface SupportAgent {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
}

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
// Page
// =====================================================

export default function AdminSupportTicketPage() {
  const { resolvedTheme } = useTheme();

  const params = useParams<{
    ticketId: string;
  }>();

  const ticketId = params?.ticketId;

  // ===================================================
  // Ticket State
  // ===================================================

  const [ticket, setTicket] =
    useState<SupportTicket | null>(null);

  const [messages, setMessages] =
    useState<SupportMessage[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===================================================
  // Reply State
  // ===================================================

  const [replyMessage, setReplyMessage] =
    useState("");

  const [sendingReply, setSendingReply] =
    useState(false);

  const [replyError, setReplyError] =
    useState("");

  // ===================================================
  // Ticket Management State
  // ===================================================

  const [managementSaving, setManagementSaving] =
    useState(false);

  const [managementError, setManagementError] =
    useState("");

  const [managementSuccess, setManagementSuccess] =
    useState("");

  // ===================================================
  // Agent Assignment State
  // ===================================================

  const [agents, setAgents] =
    useState<SupportAgent[]>([]);

  const [selectedAgentId, setSelectedAgentId] =
    useState("");

  const [agentsLoading, setAgentsLoading] =
    useState(false);

  const [assignmentSaving, setAssignmentSaving] =
    useState(false);

  const [assignmentError, setAssignmentError] =
    useState("");

  const [assignmentSuccess, setAssignmentSuccess] =
    useState("");

  // ===================================================
  // Load Ticket
  // ===================================================

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError("");

      if (!ticketId) {
        throw new Error("Ticket ID is missing.");
      }

      const response = await fetch(
        `/api/admin/support/tickets/${encodeURIComponent(
          ticketId,
        )}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            "Unable to load support ticket.",
        );
      }

      setTicket(data.ticket);

      setMessages(
        Array.isArray(data.messages)
          ? data.messages
          : [],
      );

      setSelectedAgentId(
        data.ticket?.assignedTo ?? "",
      );
    } catch (err) {
      console.error(
        "ADMIN SUPPORT DETAIL LOAD ERROR:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load support ticket.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // Load Support Agents
  // ===================================================

  const loadSupportAgents = async () => {
    try {
      setAgentsLoading(true);
      setAssignmentError("");

      const response = await fetch(
        "/api/admin/support/agents",
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            "Unable to load support agents.",
        );
      }

      setAgents(
        Array.isArray(data.agents)
          ? data.agents
          : [],
      );
    } catch (err) {
      console.error(
        "ADMIN SUPPORT AGENTS LOAD ERROR:",
        err,
      );

      setAssignmentError(
        err instanceof Error
          ? err.message
          : "Unable to load support agents.",
      );
    } finally {
      setAgentsLoading(false);
    }
  };

  // ===================================================
  // Assign Support Agent
  // ===================================================

  const handleAssignAgent = async () => {
    if (!ticketId) {
      setAssignmentError(
        "Ticket ID is missing.",
      );
      return;
    }

    if (!selectedAgentId) {
      setAssignmentError(
        "Please select a support agent.",
      );
      return;
    }

    if (ticket?.status === "closed") {
      setAssignmentError(
        "A closed ticket cannot be assigned.",
      );
      return;
    }

    try {
      setAssignmentSaving(true);
      setAssignmentError("");
      setAssignmentSuccess("");

      const response = await fetch(
        `/api/admin/support/tickets/${encodeURIComponent(
          ticketId,
        )}/assign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentId: selectedAgentId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            "Unable to assign support agent.",
        );
      }

      if (data.ticket) {
        setTicket((current) =>
          current
            ? {
                ...current,
                status:
                  data.ticket.status ??
                  current.status,
                assignedTo:
                  data.ticket.assignedTo ??
                  selectedAgentId,
                updatedAt:
                  data.ticket.updatedAt ??
                  current.updatedAt,
              }
            : current,
        );
      }

      setAssignmentSuccess(
        data?.message ||
          "Support agent assigned successfully.",
      );
    } catch (err) {
      console.error(
        "ADMIN SUPPORT ASSIGNMENT UI ERROR:",
        err,
      );

      setAssignmentError(
        err instanceof Error
          ? err.message
          : "Unable to assign support agent.",
      );
    } finally {
      setAssignmentSaving(false);
    }
  };

  // ===================================================
  // Send Admin Reply
  // ===================================================

  const handleSendReply = async () => {
    const message = replyMessage.trim();

    if (!message) {
      setReplyError("Please enter a reply.");
      return;
    }

    if (message.length < 2) {
      setReplyError(
        "Reply must contain at least 2 characters.",
      );
      return;
    }

    if (message.length > 3000) {
      setReplyError(
        "Reply cannot exceed 3000 characters.",
      );
      return;
    }

    if (!ticketId) {
      setReplyError("Ticket ID is missing.");
      return;
    }

    if (ticket?.status === "closed") {
      setReplyError(
        "This ticket is closed and cannot receive new replies.",
      );
      return;
    }

    try {
      setSendingReply(true);
      setReplyError("");

      const response = await fetch(
        `/api/admin/support/tickets/${encodeURIComponent(
          ticketId,
        )}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            "Unable to send support reply.",
        );
      }

      if (data.message) {
        setMessages((current) => [
          ...current,
          data.message,
        ]);
      }

      setReplyMessage("");

      setTicket((current) =>
        current
          ? {
              ...current,
              status: "in_progress",
              updatedAt:
                data.message?.updatedAt ??
                new Date().toISOString(),
            }
          : current,
      );
    } catch (err) {
      console.error(
        "ADMIN SUPPORT REPLY ERROR:",
        err,
      );

      setReplyError(
        err instanceof Error
          ? err.message
          : "Unable to send support reply.",
      );
    } finally {
      setSendingReply(false);
    }
  };

  // ===================================================
  // Ticket Management
  // ===================================================

  const handleTicketManagement = async (
    action: "status" | "priority",
    value: string,
  ) => {
    if (!ticketId) {
      setManagementError(
        "Ticket ID is missing.",
      );
      return;
    }

    if (!value) {
      return;
    }

    try {
      setManagementSaving(true);
      setManagementError("");
      setManagementSuccess("");

      const response = await fetch(
        `/api/admin/support/tickets/${encodeURIComponent(
          ticketId,
        )}/manage`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            value,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            "Unable to update ticket.",
        );
      }

      if (data.ticket) {
        setTicket((current) =>
          current
            ? {
                ...current,
                status:
                  data.ticket.status ??
                  current.status,
                priority:
                  data.ticket.priority ??
                  current.priority,
                assignedTo:
                  data.ticket.assignedTo ??
                  current.assignedTo,
                updatedAt:
                  data.ticket.updatedAt ??
                  current.updatedAt,
                resolvedAt:
                  data.ticket.resolvedAt ??
                  null,
                closedAt:
                  data.ticket.closedAt ??
                  null,
              }
            : current,
        );
      }

      setManagementSuccess(
        action === "status"
          ? "Ticket status updated successfully."
          : "Ticket priority updated successfully.",
      );
    } catch (err) {
      console.error(
        "ADMIN SUPPORT MANAGEMENT UI ERROR:",
        err,
      );

      setManagementError(
        err instanceof Error
          ? err.message
          : "Unable to update ticket.",
      );
    } finally {
      setManagementSaving(false);
    }
  };

  // ===================================================
  // Initial Load
  // ===================================================

  useEffect(() => {
    loadTicket();
    loadSupportAgents();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  // ===================================================
  // Loading
  // ===================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="text-center">
          <Loader2
            size={36}
            className="mx-auto animate-spin text-[#1565d8]"
          />

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Loading support ticket...
          </p>
        </div>
      </main>
    );
  }

  // ===================================================
  // Error
  // ===================================================

  if (error || !ticket) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300">
            <AlertCircle size={30} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
            Unable to load ticket
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {error ||
              "Support ticket not found."}
          </p>

          <Link
            href="/admin/support"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft size={16} />
            Back to Support Center
          </Link>
        </div>
      </main>
    );
  }

  // ===================================================
  // Selected Agent
  // ===================================================

  const selectedAgent = agents.find(
    (agent) =>
      agent.id === selectedAgentId,
  );

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
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            Back
        ================================================= */}

        <Link
          href="/admin/support"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1565d8] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Support Center
        </Link>

        {/* =================================================
            Header
        ================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="bg-gradient-to-br from-[#1565d8] to-[#0d47a1] px-5 py-7 text-white sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                    <Headphones size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-blue-100">
                      DealUp Care
                    </p>

                    <p className="text-xs text-blue-100/80">
                      Admin Support Ticket
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-sm font-semibold text-blue-100">
                  {ticket.ticketId}
                </p>

                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  {ticket.subject}
                </h1>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusClass(
                    ticket.status,
                  )}`}
                >
                  {formatStatus(
                    ticket.status,
                  )}
                </span>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${getPriorityClass(
                    ticket.priority,
                  )}`}
                >
                  {formatPriority(
                    ticket.priority,
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Meta */}

          <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200 dark:divide-slate-700 dark:border-slate-700 md:grid-cols-4">
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Category
              </p>

              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                {formatCategory(
                  ticket.category,
                )}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Created
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {formatDate(
                  ticket.createdAt,
                )}
              </p>
            </div>

            <div className="border-t border-slate-200 p-5 dark:border-slate-700 md:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Last Updated
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {formatDate(
                  ticket.updatedAt,
                )}
              </p>
            </div>

            <div className="border-t border-slate-200 p-5 dark:border-slate-700 md:border-t-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Assigned Agent
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {selectedAgent
                  ? selectedAgent.name
                  : ticket.assignedTo
                    ? "Assigned"
                    : "Unassigned"}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            Main Grid
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* =================================================
              Left
          ================================================= */}

          <div className="space-y-6">

            {/* Original Request */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1565d8] dark:bg-blue-950/40">
                  <MessageSquare size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Original Support Request
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Submitted by the customer
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/60">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {ticket.description}
                </p>
              </div>
            </section>

            {/* Conversation */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-700 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">
                      Conversation
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {messages.length} message
                      {messages.length !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <MessageSquare size={17} />
                  </div>
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#1565d8] dark:bg-blue-950/40">
                    <MessageSquare size={24} />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900 dark:text-white">
                    No conversation yet
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                    No support agent has replied to
                    this ticket yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 p-5 sm:p-6">
                  {messages.map(
                    (message) => {
                      const isUser =
                        message.senderType ===
                        "user";

                      const isSystem =
                        message.senderType ===
                        "system";

                      if (isSystem) {
                        return (
                          <div
                            key={message.id}
                            className="flex justify-center"
                          >
                            <div className="max-w-md rounded-xl bg-slate-100 px-4 py-3 text-center dark:bg-slate-800">
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {
                                  message.message
                                }
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                {formatDate(
                                  message.createdAt,
                                )}
                              </p>
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
                              className={`mb-1 flex items-center gap-2 ${
                                isUser
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {
                                  message.senderName
                                }
                              </span>

                              <span className="text-[10px] text-slate-400">
                                {formatDate(
                                  message.createdAt,
                                )}
                              </span>
                            </div>

                            <div
                              className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                                isUser
                                  ? "rounded-br-md bg-[#1565d8] text-white"
                                  : "rounded-bl-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">
                                {
                                  message.message
                                }
                              </p>
                            </div>

                            {!isUser && (
                              <p className="mt-1 text-[10px] font-medium text-[#1565d8]">
                                Support Agent
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </section>

            {/* Admin Reply */}

            <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm dark:border-blue-900/50 dark:bg-slate-900 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1565d8] dark:bg-blue-950/40">
                  <MessageSquare size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Reply to Customer
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Send a reply directly to the customer support conversation.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <textarea
                  value={replyMessage}
                  onChange={(event) => {
                    setReplyMessage(
                      event.target.value,
                    );
                    setReplyError("");
                  }}
                  disabled={
                    sendingReply ||
                    ticket.status ===
                      "closed"
                  }
                  maxLength={3000}
                  rows={5}
                  placeholder={
                    ticket.status ===
                    "closed"
                      ? "This ticket is closed."
                      : "Write your reply to the customer..."
                  }
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1565d8] focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
                />

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {replyMessage.length}/3000
                  </p>

                  {ticket.status ===
                    "closed" && (
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Ticket closed
                    </p>
                  )}
                </div>

                {replyError && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/20">
                    <AlertCircle
                      size={16}
                      className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                    />

                    <p className="text-xs font-medium text-red-700 dark:text-red-300">
                      {replyError}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={
                      handleSendReply
                    }
                    disabled={
                      sendingReply ||
                      ticket.status ===
                        "closed" ||
                      !replyMessage.trim()
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d47a1] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendingReply ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        Send Reply
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              Right Sidebar
          ================================================= */}

          <aside className="space-y-6">

            {/* Customer */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
                  <UserRound size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Customer
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ticket owner
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="font-bold text-slate-900 dark:text-white">
                  {ticket.userName}
                </p>

                <div className="mt-3 flex items-start gap-2">
                  <Mail
                    size={15}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />

                  <p className="break-all text-sm text-slate-600 dark:text-slate-300">
                    {ticket.userEmail}
                  </p>
                </div>

                <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    User ID
                  </p>

                  <p className="mt-1 break-all text-xs font-medium text-slate-600 dark:text-slate-300">
                    {ticket.userId}
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                Support Agent Assignment
            ================================================= */}

            <section className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm dark:border-violet-900/50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
                  <UserCheck size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Support Agent
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Assign this ticket to an admin
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">

                <div>
                  <label
                    htmlFor="support-agent"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Assigned Agent
                  </label>

                  <select
                    id="support-agent"
                    value={selectedAgentId}
                    disabled={
                      agentsLoading ||
                      assignmentSaving ||
                      ticket.status ===
                        "closed"
                    }
                    onChange={(event) => {
                      setSelectedAgentId(
                        event.target.value,
                      );
                      setAssignmentError("");
                      setAssignmentSuccess("");
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="">
                      Select support agent
                    </option>

                    {agents.map((agent) => (
                      <option
                        key={agent.id}
                        value={agent.id}
                      >
                        {agent.name}
                        {agent.email
                          ? ` — ${agent.email}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {agentsLoading && (
                  <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-xs font-semibold text-violet-700 dark:bg-violet-950/30 dark:text-violet-300">
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                    Loading support agents...
                  </div>
                )}

                {selectedAgent && (
                  <div className="rounded-xl border border-violet-100 bg-violet-50 p-3 dark:border-violet-900/40 dark:bg-violet-950/20">
                    <div className="flex items-center gap-3">
                      {selectedAgent.image ? (
                        <img
                          src={selectedAgent.image}
                          alt={selectedAgent.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-200 text-violet-700 dark:bg-violet-900 dark:text-violet-200">
                          <UserRound
                            size={18}
                          />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-violet-900 dark:text-violet-200">
                          {selectedAgent.name}
                        </p>

                        <p className="truncate text-xs text-violet-600 dark:text-violet-300">
                          {selectedAgent.email ||
                            "DealUp Admin"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {assignmentError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/40 dark:bg-red-950/20">
                    <AlertCircle
                      size={15}
                      className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                    />

                    <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                      {assignmentError}
                    </p>
                  </div>
                )}

                {assignmentSuccess && (
                  <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-900/40 dark:bg-green-950/20">
                    <CheckCircle2
                      size={15}
                      className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                    />

                    <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                      {assignmentSuccess}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    void handleAssignAgent()
                  }
                  disabled={
                    agentsLoading ||
                    assignmentSaving ||
                    ticket.status ===
                      "closed" ||
                    !selectedAgentId
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {assignmentSaving ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserCheck size={16} />
                      Assign Agent
                    </>
                  )}
                </button>

                {ticket.status ===
                  "closed" && (
                  <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                    Closed tickets cannot be assigned.
                  </p>
                )}
              </div>
            </section>

            {/* =================================================
                Ticket Information
            ================================================= */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1565d8] dark:bg-blue-950/40">
                  <Ticket size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Ticket Information
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage current ticket state
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-5">

                {/* Status */}

                <div>
                  <label
                    htmlFor="ticket-status"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Status
                  </label>

                  <select
                    id="ticket-status"
                    value={ticket.status}
                    disabled={
                      managementSaving ||
                      ticket.status ===
                        "closed"
                    }
                    onChange={(event) => {
                      void handleTicketManagement(
                        "status",
                        event.target.value,
                      );
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
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
                </div>

                {/* Priority */}

                <div>
                  <label
                    htmlFor="ticket-priority"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Priority
                  </label>

                  <select
                    id="ticket-priority"
                    value={ticket.priority}
                    disabled={
                      managementSaving
                    }
                    onChange={(event) => {
                      void handleTicketManagement(
                        "priority",
                        event.target.value,
                      );
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
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
                </div>

                {/* Category */}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Category
                  </span>

                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {formatCategory(
                      ticket.category,
                    )}
                  </span>
                </div>

                {/* Assigned */}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Assigned
                  </span>

                  <span className="text-right text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {selectedAgent
                      ? selectedAgent.name
                      : ticket.assignedTo
                        ? "Assigned"
                        : "Unassigned"}
                  </span>
                </div>

                {/* Product */}

                {ticket.productId && (
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Product ID
                    </p>

                    <p className="mt-1 break-all text-xs text-slate-600 dark:text-slate-300">
                      {ticket.productId}
                    </p>
                  </div>
                )}

                {/* Updating */}

                {managementSaving && (
                  <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs font-semibold text-[#1565d8] dark:bg-blue-950/30 dark:text-blue-300">
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                    Updating ticket...
                  </div>
                )}

                {/* Success */}

                {managementSuccess &&
                  !managementSaving && (
                    <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-900/40 dark:bg-green-950/20">
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
                      />

                      <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                        {managementSuccess}
                      </p>
                    </div>
                  )}

                {/* Error */}

                {managementError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/40 dark:bg-red-950/20">
                    <AlertCircle
                      size={15}
                      className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
                    />

                    <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                      {managementError}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Timeline */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300">
                  <CalendarDays size={19} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Timeline
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ticket activity
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">

                {/* Created */}

                <div className="flex gap-3">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />

                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Ticket created
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatDate(
                        ticket.createdAt,
                      )}
                    </p>
                  </div>
                </div>

                {/* Updated */}

                <div className="flex gap-3">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />

                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Last updated
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatDate(
                        ticket.updatedAt,
                      )}
                    </p>
                  </div>
                </div>

                {/* Resolved */}

                {ticket.resolvedAt && (
                  <div className="flex gap-3">
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />

                    <div>
                      <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                        Ticket resolved
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatDate(
                          ticket.resolvedAt,
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Closed */}

                {ticket.closedAt && (
                  <div className="flex gap-3">
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-500" />

                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Ticket closed
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatDate(
                          ticket.closedAt,
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Security Note */}

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <Shield
                  size={18}
                  className="mt-0.5 shrink-0 text-[#1565d8]"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    Private Support Conversation
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300">
                    Customer support information
                    should only be accessed by
                    authorized DealUp administrators.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* =================================================
            Support Management Footer
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Support Management
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Admin reply, ticket status, priority
                  and agent assignment are active.
                </p>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                ticket.status === "closed"
                  ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  : "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
              }`}
            >
              {ticket.status ===
              "closed" ? (
                <>
                  <Clock3 size={14} />
                  Ticket Closed
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  Management Active
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}