import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  findTicketByTicketId,
} from "@/lib/repositories/support.repository";

import {
  findMessagesByTicketId,
} from "@/lib/repositories/supportMessage.repository";

// =====================================================
// Route Context
// =====================================================

interface RouteContext {
  params: Promise<{
    ticketId: string;
  }>;
}

// =====================================================
// GET
// Admin Support Ticket Detail
// =====================================================

export async function GET(
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
    // Find Conversation
    // =================================================

    const messages =
      await findMessagesByTicketId(
        cleanTicketId,
      );

    // =================================================
    // Safe Ticket Response
    // =================================================

    const safeTicket = {
      id:
        ticket._id?.toString() ?? "",

      ticketId:
        ticket.ticketId,

      userId:
        ticket.userId?.toString() ?? "",

      userName:
        ticket.userName,

      userEmail:
        ticket.userEmail,

      category:
        ticket.category,

      subject:
        ticket.subject,

      description:
        ticket.description,

      productId:
        ticket.productId?.toString() ?? null,

      status:
        ticket.status,

      priority:
        ticket.priority,

      assignedTo:
        ticket.assignedTo?.toString() ?? null,

      createdAt:
        ticket.createdAt,

      updatedAt:
        ticket.updatedAt,

      resolvedAt:
        ticket.resolvedAt ?? null,

      closedAt:
        ticket.closedAt ?? null,
    };

    // =================================================
    // Safe Messages
    // =================================================

    const safeMessages =
      messages.map((message) => ({
        id:
          message._id?.toString() ?? "",

        ticketId:
          message.ticketId,

        senderId:
          message.senderId?.toString() ??
          null,

        senderType:
          message.senderType,

        senderName:
          message.senderName,

        message:
          message.message,

        createdAt:
          message.createdAt,

        updatedAt:
          message.updatedAt,
      }));

    // =================================================
    // Response
    // =================================================

    return NextResponse.json(
      {
        success: true,

        ticket: safeTicket,

        messages: safeMessages,

        messageCount:
          safeMessages.length,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "ADMIN SUPPORT TICKET DETAIL GET ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load support ticket.",
      },
      {
        status: 500,
      },
    );
  }
}