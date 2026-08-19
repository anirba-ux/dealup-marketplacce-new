import { notFound } from "next/navigation";

import { auth } from "@/auth";

import {
  getConversationById,
  getMessages,
  markConversationRead,
} from "@/lib/repositories/chat.repository";

import ChatWindow from "@/components/chat/ChatWindow";

interface Props {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function MessagePage({ params }: Props) {
  // =========================================
  // Authentication
  // =========================================

  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  const userId = (session.user as any).id;

  // =========================================
  // Get conversation ID
  // =========================================

  const { conversationId } = await params;

  // =========================================
  // Get conversation
  // =========================================

  const conversation =
    await getConversationById(conversationId);

  if (!conversation) {
    notFound();
  }

  // =========================================
  // Check access
  // =========================================

  if (
    conversation.buyerId !== userId &&
    conversation.sellerId !== userId
  ) {
    notFound();
  }

  // =========================================
  // Mark conversation as read
  // =========================================

  await markConversationRead(
    conversationId,
    userId,
  );

  // =========================================
// Get messages
// =========================================

const messages =
  await getMessages(
    conversationId,
    userId,
  );

  // =========================================
  // Serialize Conversation
  // =========================================

  const serializedConversation = {
    _id: conversation._id?.toString(),

    productId: conversation.productId,

    buyerId: conversation.buyerId,

    sellerId: conversation.sellerId,

    lastMessage: conversation.lastMessage,

    lastMessageAt:
      conversation.lastMessageAt?.toISOString(),

    unreadCountBuyer:
      conversation.unreadCountBuyer,

    unreadCountSeller:
      conversation.unreadCountSeller,

    buyerMuted:
      conversation.buyerMuted ?? false,

    sellerMuted:
      conversation.sellerMuted ?? false,

    buyerMutedAt:
      conversation.buyerMutedAt?.toISOString(),

    sellerMutedAt:
      conversation.sellerMutedAt?.toISOString(),

    buyerDeleted:
      conversation.buyerDeleted ?? false,

    sellerDeleted:
      conversation.sellerDeleted ?? false,

    createdAt:
      conversation.createdAt?.toISOString(),

    updatedAt:
      conversation.updatedAt?.toISOString(),

    // =========================================
    // Product
    // =========================================

    product: conversation.product
      ? {
          _id:
            conversation.product._id?.toString(),

          title:
            conversation.product.title,

          thumbnail:
            conversation.product.thumbnail,

          price:
            conversation.product.price,

          slug:
            conversation.product.slug,
        }
      : null,

    // =========================================
    // Seller
    // =========================================

    seller: conversation.seller
      ? {
          _id:
            conversation.seller._id?.toString(),

          name:
            conversation.seller.name,

          image:
            conversation.seller.image,

          phone:
            conversation.seller.phone,
        }
      : null,

    // =========================================
    // Buyer
    // =========================================

    buyer: conversation.buyer
      ? {
          _id:
            conversation.buyer._id?.toString(),

          name:
            conversation.buyer.name,

          image:
            conversation.buyer.image,

          phone:
            conversation.buyer.phone,
        }
      : null,
  };

  // =========================================
  // Serialize Messages
  // =========================================

  const serializedMessages = messages.map(
    (msg) => ({
      _id:
        msg._id?.toString(),

      conversationId:
        msg.conversationId,

      senderId:
        msg.senderId,

      receiverId:
        msg.receiverId,

      message:
        msg.message,

      // =====================================
      // Attachment fields
      // =====================================

      messageType:
        msg.messageType ?? "text",

      attachmentUrl:
        msg.attachmentUrl,

      attachmentPublicId:
        msg.attachmentPublicId,

      attachmentName:
        msg.attachmentName,

      attachmentSize:
        msg.attachmentSize,

      isRead:
        msg.isRead,

      createdAt:
        msg.createdAt?.toISOString(),
    }),
  );

  // =========================================
  // Render Chat
  // =========================================

  return (
    <ChatWindow
      conversation={serializedConversation}
      messages={serializedMessages}
      currentUserId={userId}
    />
  );
}