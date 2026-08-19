import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import {
  getConversationById,
  getMessages,
  sendMessage,
  deleteMessagesForUser,
} from "@/lib/repositories/chat.repository";

// ===============================
// GET Messages
// ===============================

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversationId = request.nextUrl.searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
      { status: 400 },
    );
  }

  const conversation = await getConversationById(conversationId);

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const userId = (session.user as any).id;

  // Only buyer or seller can access messages
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await getMessages(conversationId, userId);
  return NextResponse.json(messages);
}

// ===============================
// SEND Message
// ===============================
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const senderId = (session.user as any).id;

    const body = await request.json();

    const {
      conversationId,
      message,
      messageType = "text",
      attachmentUrl,
      attachmentPublicId,
      attachmentName,
      attachmentSize,
    } = body;

    // =========================================
    // Validate conversation ID
    // =========================================

    if (!conversationId) {
      return NextResponse.json(
        {
          error: "conversationId is required",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================
    // Validate message type
    // =========================================

    const allowedMessageTypes = ["text", "image", "document", "video", "audio"];

    if (!allowedMessageTypes.includes(messageType)) {
      return NextResponse.json(
        {
          error: "Invalid message type",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================
    // Clean text message
    // =========================================

    const cleanMessage = typeof message === "string" ? message.trim() : "";

    // =========================================
    // Text validation
    // =========================================

    if (messageType === "text" && !cleanMessage) {
      return NextResponse.json(
        {
          error: "Message is required",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================
    // Attachment validation
    // =========================================

    if (messageType !== "text" && !attachmentUrl) {
      return NextResponse.json(
        {
          error: "Attachment URL is required",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================
    // Find conversation
    // =========================================

    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      return NextResponse.json(
        {
          error: "Conversation not found",
        },
        {
          status: 404,
        },
      );
    }

    // =========================================
    // Authorization
    // =========================================

    if (
      conversation.buyerId !== senderId &&
      conversation.sellerId !== senderId
    ) {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    // =========================================
    // Determine receiver
    // =========================================

    const receiverId =
      senderId === conversation.buyerId
        ? conversation.sellerId
        : conversation.buyerId;

    // =========================================
    // Save message
    // =========================================

    const newMessage = await sendMessage(
      conversationId,
      senderId,
      receiverId,
      cleanMessage,
      messageType === "text"
        ? undefined
        : {
            messageType,
            attachmentUrl,
            attachmentPublicId,
            attachmentName,
            attachmentSize,
          },
    );

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to send message",
      },
      {
        status: 500,
      },
    );
  }
}

// ===============================
// DELETE Messages
// Delete for current user
// ===============================

export async function DELETE(
  request: NextRequest,
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const userId =
      (session.user as any).id;

    const body = await request.json();

    const {
      conversationId,
      messageIds,
    } = body;

    // =========================================
    // Validate conversation ID
    // =========================================

    if (
      !conversationId ||
      typeof conversationId !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "conversationId is required",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================
    // Validate message IDs
    // =========================================

    if (
      !Array.isArray(messageIds) ||
      messageIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "At least one message ID is required",
        },
        {
          status: 400,
        },
      );
    }

    // =========================================
    // Find conversation
    // =========================================

    const conversation =
      await getConversationById(
        conversationId,
      );

    if (!conversation) {
      return NextResponse.json(
        {
          error:
            "Conversation not found",
        },
        {
          status: 404,
        },
      );
    }

    // =========================================
    // Authorization
    // =========================================

    if (
      conversation.buyerId !== userId &&
      conversation.sellerId !== userId
    ) {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

    // =========================================
    // Delete messages for current user
    // =========================================

    const result =
      await deleteMessagesForUser(
        conversationId,
        messageIds,
        userId,
      );

    return NextResponse.json({
      success: true,

      deletedCount:
        result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "DELETE MESSAGES ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete messages",
      },
      {
        status: 500,
      },
    );
  }
}
