import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  findTicketByTicketId,
  updateTicketStatus,
} from "@/lib/repositories/support.repository";

import {
  createSupportMessage,
} from "@/lib/repositories/supportMessage.repository";

import {
  createNotification,
} from "@/lib/repositories/notification.repository";

// =====================================================
// Route Context
// =====================================================

interface RouteContext {
  params: Promise<{
    ticketId: string;
  }>;
}

// =====================================================
// POST
// Admin Reply to Support Ticket
// =====================================================

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    // =================================================
    // Authentication
    // =================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // =================================================
    // Admin Authorization
    // =================================================

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required.",
        },
        {
          status: 403,
        },
      );
    }

    // =================================================
    // Params
    // =================================================

    const { ticketId } =
      await context.params;

    const cleanTicketId =
      ticketId?.trim();

    if (!cleanTicketId) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Find Ticket
    // =================================================

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
        {
          status: 404,
        },
      );
    }

    // =================================================
    // Closed Ticket Protection
    // =================================================

    if (ticket.status === "closed") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This support ticket is closed and cannot receive new replies.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Request Body
    // =================================================

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const message =
      typeof (
        body as {
          message?: unknown;
        }
      )?.message === "string"
        ? (
            body as {
              message: string;
            }
          ).message.trim()
        : "";

    // =================================================
    // Validate Message
    // =================================================

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (message.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message must contain at least 2 characters.",
        },
        {
          status: 400,
        },
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message cannot exceed 3000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // Admin Identity
    // =================================================

    const senderId =
      String(session.user.id);

    const senderName =
      session.user.name?.trim() ||
      "DealUp Support";

    // =================================================
    // Create Support Message
    // =================================================

    const createdMessage =
      await createSupportMessage({
        ticketId:
          cleanTicketId,

        senderId,

        senderType:
          "agent",

        senderName,

        message,
      });

    // =================================================
    // Update Ticket Status
    //
    // When an admin replies, the ticket becomes
    // in_progress unless it is already resolved.
    // =================================================

    if (
      ticket.status !== "resolved"
    ) {
      await updateTicketStatus(
        cleanTicketId,
        "in_progress",
      );
    }

    // =================================================
    // Create Customer Notification
    //
    // Admin/Agent reply
    //        ↓
    // Customer receives notification
    // =================================================

    await createNotification({
      userId:
        ticket.userId,

      type:
        "support_ticket_reply",

      title:
        "New reply from DealUp Support",

      message:
        `Our support team replied to your ticket ${ticket.ticketId}. Open your support request to view the reply.`,

      ticketId:
        ticket.ticketId,
    });

    // =================================================
    // Safe Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message: {
          id:
            createdMessage._id?.toString() ??
            "",

          ticketId:
            createdMessage.ticketId,

          senderId:
            createdMessage.senderId?.toString() ??
            null,

          senderType:
            createdMessage.senderType,

          senderName:
            createdMessage.senderName,

          message:
            createdMessage.message,

          createdAt:
            createdMessage.createdAt,

          updatedAt:
            createdMessage.updatedAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "ADMIN SUPPORT MESSAGE POST ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to send support reply.",
      },
      {
        status: 500,
      },
    );
  }
}