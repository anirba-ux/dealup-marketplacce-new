import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findTicketByTicketId } from "@/lib/repositories/support.repository";
import { findMessagesByTicketId } from "@/lib/repositories/supportMessage.repository";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      ticketId: string;
    }>;
  },
) {
  try {
    /* =====================================================
       AUTHENTICATION
    ====================================================== */

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please log in to view this support ticket.",
        },
        { status: 401 },
      );
    }

    const userId = String(session.user.id);

    /* =====================================================
       GET TICKET ID
    ====================================================== */

    const { ticketId } = await params;

    const cleanTicketId =
      typeof ticketId === "string"
        ? ticketId.trim()
        : "";

    if (!cleanTicketId) {
      return NextResponse.json(
        {
          success: false,
          message: "Ticket ID is required.",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       FIND TICKET
    ====================================================== */

    const ticket =
      await findTicketByTicketId(cleanTicketId);

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          message: "Support ticket not found.",
        },
        { status: 404 },
      );
    }

    /* =====================================================
       AUTHORIZATION
       User can only access their own ticket.
    ====================================================== */

    if (ticket.userId.toString() !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have access to this ticket.",
        },
        { status: 404 },
      );
    }

    /* =====================================================
       FIND CONVERSATION
    ====================================================== */

    const messages =
      await findMessagesByTicketId(cleanTicketId);

    /* =====================================================
       SAFE TICKET DATA
    ====================================================== */

    const safeTicket = {
      id: ticket._id?.toString() ?? "",
      ticketId: ticket.ticketId,
      category: ticket.category,
      subject: ticket.subject,
      description: ticket.description,
      productId:
        ticket.productId?.toString() ?? null,
      status: ticket.status,
      priority: ticket.priority,
      assignedTo:
        ticket.assignedTo?.toString() ?? null,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      resolvedAt: ticket.resolvedAt ?? null,
      closedAt: ticket.closedAt ?? null,
    };

    /* =====================================================
       SAFE MESSAGE DATA
    ====================================================== */

    const safeMessages = messages.map((message) => ({
      id: message._id?.toString() ?? "",
      ticketId: message.ticketId,
      senderId:
        message.senderId?.toString() ?? null,
      senderType: message.senderType,
      senderName: message.senderName,
      message: message.message,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));

    /* =====================================================
       RESPONSE
    ====================================================== */

    return NextResponse.json(
      {
        success: true,
        ticket: safeTicket,
        messages: safeMessages,
        messageCount: safeMessages.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Support ticket details error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load this support ticket right now.",
      },
      { status: 500 },
    );
  }
}