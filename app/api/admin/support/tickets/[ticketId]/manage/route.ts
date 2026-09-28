import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  findTicketByTicketId,
  updateTicketPriority,
  updateTicketStatus,
} from "@/lib/repositories/support.repository";

import { createNotification } from "@/lib/repositories/notification.repository";

import type {
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/lib/models/supportTicket";

// =====================================================
// Types
// =====================================================

interface RouteContext {
  params: Promise<{
    ticketId: string;
  }>;
}

type ManageAction = "status" | "priority";

// =====================================================
// Helpers
// =====================================================

function getStatusLabel(
  status: SupportTicketStatus,
): string {
  const labels: Record<
    SupportTicketStatus,
    string
  > = {
    open: "Open",
    assigned: "Assigned",
    in_progress: "In Progress",
    waiting_for_user: "Waiting for User",
    resolved: "Resolved",
    closed: "Closed",
  };

  return labels[status];
}

// =====================================================
// PATCH
// =====================================================

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    // -------------------------------------------------
    // Admin Authentication
    // -------------------------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 },
      );
    }

    // -------------------------------------------------
    // Ticket ID
    // -------------------------------------------------

    const { ticketId } = await context.params;

    const cleanTicketId = ticketId?.trim();

    if (!cleanTicketId) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket ID is required.",
        },
        { status: 400 },
      );
    }

    // -------------------------------------------------
    // Find Ticket
    // -------------------------------------------------

    const ticket =
      await findTicketByTicketId(
        cleanTicketId,
      );

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message: "Support ticket not found.",
        },
        { status: 404 },
      );
    }

    // -------------------------------------------------
    // Parse Request Body
    // -------------------------------------------------

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const action =
      typeof (body as { action?: unknown })
        ?.action === "string"
        ? (body as { action: string })
            .action
            .trim()
            .toLowerCase()
        : "";

    const value =
      typeof (body as { value?: unknown })
        ?.value === "string"
        ? (body as { value: string })
            .value
            .trim()
            .toLowerCase()
        : "";

    // -------------------------------------------------
    // Validate Action
    // -------------------------------------------------

    const allowedActions: ManageAction[] = [
      "status",
      "priority",
    ];

    if (
      !allowedActions.includes(
        action as ManageAction,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid management action.",
        },
        { status: 400 },
      );
    }

    if (!value) {
      return NextResponse.json(
        {
          success: false,
          message: "A value is required.",
        },
        { status: 400 },
      );
    }

    // =================================================
    // STATUS UPDATE
    // =================================================

    if (action === "status") {
      const allowedStatuses: SupportTicketStatus[] =
        [
          "open",
          "assigned",
          "in_progress",
          "waiting_for_user",
          "resolved",
          "closed",
        ];

      if (
        !allowedStatuses.includes(
          value as SupportTicketStatus,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid support ticket status.",
          },
          { status: 400 },
        );
      }

      const newStatus =
        value as SupportTicketStatus;

      // -------------------------------------------------
      // Closed Ticket Protection
      // -------------------------------------------------

      if (
        ticket.status === "closed" &&
        newStatus !== "closed"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "A closed ticket cannot be reopened from this action.",
          },
          { status: 400 },
        );
      }

      // -------------------------------------------------
      // Detect Real Status Change
      // -------------------------------------------------

      const previousStatus =
        ticket.status;

      const statusChanged =
        previousStatus !== newStatus;

      // -------------------------------------------------
      // Update Status
      // -------------------------------------------------

      await updateTicketStatus(
        cleanTicketId,
        newStatus,
      );

      // -------------------------------------------------
      // Fetch Updated Ticket
      // -------------------------------------------------

      const updatedTicket =
        await findTicketByTicketId(
          cleanTicketId,
        );

      if (!updatedTicket) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ticket was updated but could not be loaded again.",
          },
          { status: 500 },
        );
      }

      // -------------------------------------------------
      // Customer Notification
      //
      // Only create notification when the status
      // actually changes.
      // -------------------------------------------------

      if (
        statusChanged &&
        updatedTicket.userId
      ) {
        // -------------------------------------------------
        // Resolved Notification
        // -------------------------------------------------

        if (newStatus === "resolved") {
          await createNotification({
            userId:
              updatedTicket.userId,
            type:
              "support_ticket_resolved",
            title:
              "Support request resolved",
            message:
              `Your support request ${updatedTicket.ticketId} has been resolved.`,
            ticketId:
              updatedTicket.ticketId,
          });
        }

        // -------------------------------------------------
        // Closed Notification
        // -------------------------------------------------

        else if (newStatus === "closed") {
          await createNotification({
            userId:
              updatedTicket.userId,
            type:
              "support_ticket_closed",
            title:
              "Support request closed",
            message:
              `Your support request ${updatedTicket.ticketId} has been closed.`,
            ticketId:
              updatedTicket.ticketId,
          });
        }

        // -------------------------------------------------
        // Normal Status Notification
        // -------------------------------------------------

        else {
          const statusLabel =
            getStatusLabel(newStatus);

          await createNotification({
            userId:
              updatedTicket.userId,
            type:
              "support_ticket_status",
            title:
              "Support request status updated",
            message:
              `Your support request ${updatedTicket.ticketId} is now ${statusLabel}.`,
            ticketId:
              updatedTicket.ticketId,
          });
        }
      }

      // -------------------------------------------------
      // Response
      // -------------------------------------------------

      return NextResponse.json(
        {
          success: true,
          message:
            "Ticket status updated successfully.",
          ticket: {
            ticketId:
              updatedTicket.ticketId,
            status:
              updatedTicket.status,
            priority:
              updatedTicket.priority,
            assignedTo:
              updatedTicket.assignedTo
                ?.toString() ?? null,
            updatedAt:
              updatedTicket.updatedAt,
            resolvedAt:
              updatedTicket.resolvedAt ??
              null,
            closedAt:
              updatedTicket.closedAt ??
              null,
          },
        },
        { status: 200 },
      );
    }

    // =================================================
    // PRIORITY UPDATE
    // =================================================

    if (action === "priority") {
      const allowedPriorities: SupportTicketPriority[] =
        [
          "low",
          "normal",
          "high",
          "critical",
        ];

      if (
        !allowedPriorities.includes(
          value as SupportTicketPriority,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid support ticket priority.",
          },
          { status: 400 },
        );
      }

      // -------------------------------------------------
      // Update Priority
      // -------------------------------------------------

      await updateTicketPriority(
        cleanTicketId,
        value as SupportTicketPriority,
      );

      // -------------------------------------------------
      // Fetch Updated Ticket
      // -------------------------------------------------

      const updatedTicket =
        await findTicketByTicketId(
          cleanTicketId,
        );

      if (!updatedTicket) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ticket priority was updated but could not be loaded again.",
          },
          { status: 500 },
        );
      }

      // -------------------------------------------------
      // Response
      // -------------------------------------------------

      return NextResponse.json(
        {
          success: true,
          message:
            "Ticket priority updated successfully.",
          ticket: {
            ticketId:
              updatedTicket.ticketId,
            status:
              updatedTicket.status,
            priority:
              updatedTicket.priority,
            assignedTo:
              updatedTicket.assignedTo
                ?.toString() ?? null,
            updatedAt:
              updatedTicket.updatedAt,
            resolvedAt:
              updatedTicket.resolvedAt ??
              null,
            closedAt:
              updatedTicket.closedAt ??
              null,
          },
        },
        { status: 200 },
      );
    }

    // -------------------------------------------------
    // Fallback
    // -------------------------------------------------

    return NextResponse.json(
      {
        success: false,
        message:
          "Unsupported management action.",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error(
      "ADMIN SUPPORT MANAGEMENT ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update support ticket.",
      },
      { status: 500 },
    );
  }
}