import { NextResponse } from "next/server";
import { auth } from "@/auth";

import {
  findTicketByTicketId,
} from "@/lib/repositories/support.repository";

import {
  createSupportMessage,
} from "@/lib/repositories/supportMessage.repository";

export async function POST(
  request: Request,
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
            "Please log in to send a support message.",
        },
        { status: 401 },
      );
    }

    const userId = String(session.user.id);

    /* =====================================================
       TICKET ID
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
       User can only reply to their own ticket.
    ====================================================== */

    if (ticket.userId.toString() !== userId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to reply to this ticket.",
        },
        { status: 404 },
      );
    }

    /* =====================================================
       CLOSED TICKET CHECK
    ====================================================== */

    if (ticket.status === "closed") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This support ticket is closed and cannot receive new messages.",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       REQUEST BODY
    ====================================================== */

    const body = await request.json();

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    /* =====================================================
       VALIDATION
    ====================================================== */

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Message cannot be empty.",
        },
        { status: 400 },
      );
    }

    if (message.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message must contain at least 2 characters.",
        },
        { status: 400 },
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Message cannot be longer than 3000 characters.",
        },
        { status: 400 },
      );
    }

    /* =====================================================
       USER NAME
    ====================================================== */

    const senderName =
      typeof session.user.name === "string" &&
      session.user.name.trim()
        ? session.user.name.trim()
        : "DealUp User";

    /* =====================================================
       CREATE MESSAGE
    ====================================================== */

    const createdMessage =
      await createSupportMessage({
        ticketId: cleanTicketId,
        senderId: userId,
        senderType: "user",
        senderName,
        message,
      });

    /* =====================================================
       UPDATE TICKET
       If user replies after waiting_for_user,
       move ticket back to open.
    ====================================================== */

    if (ticket.status === "waiting_for_user") {
      const { updateTicketStatus } =
        await import(
          "@/lib/repositories/support.repository"
        );

      await updateTicketStatus(
        cleanTicketId,
        "open",
      );
    }

    /* =====================================================
       RESPONSE
    ====================================================== */

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent.",
        data: {
          id:
            createdMessage._id?.toString() ?? "",
          ticketId:
            createdMessage.ticketId,
          senderId:
            createdMessage.senderId?.toString() ?? null,
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
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Support message creation error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to send your message right now. Please try again later.",
      },
      { status: 500 },
    );
  }
}