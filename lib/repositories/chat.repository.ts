import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";
import { Conversation } from "@/lib/models/conversation.model";
import { Message } from "@/lib/models/message.model";

const DATABASE_NAME = "dealup";

const CONVERSATION_COLLECTION = "conversations";
const MESSAGE_COLLECTION = "messages";

async function getConversationCollection() {
  const client = await clientPromise;

  return client
    .db(DATABASE_NAME)
    .collection<Conversation>(CONVERSATION_COLLECTION);
}

async function getMessageCollection() {
  const client = await clientPromise;

  return client.db(DATABASE_NAME).collection<Message>(MESSAGE_COLLECTION);
}

export async function findConversation(
  productId: string,
  buyerId: string,
  sellerId: string,
) {
  const collection = await getConversationCollection();

  return collection.findOne({
    productId,
    buyerId,
    sellerId,
  });
}

export async function createConversation(
  productId: string,
  buyerId: string,
  sellerId: string,
) {
  const collection = await getConversationCollection();

  const existing = await findConversation(productId, buyerId, sellerId);

  if (existing) {
    await collection.updateOne(
      {
        _id: existing._id,
      },
      {
        $set: {
          buyerDeleted: false,
          sellerDeleted: false,

          buyerDeletedAt: undefined,
          sellerDeletedAt: undefined,

          updatedAt: new Date(),
        },
      },
    );

    return {
      ...existing,
      buyerDeleted: false,
      sellerDeleted: false,
      buyerDeletedAt: undefined,
      sellerDeletedAt: undefined,
    };
  }

  const now = new Date();

  const conversation: Conversation = {
    productId,
    buyerId,
    sellerId,

    lastMessage: "",

    lastMessageAt: now,

    unreadCountBuyer: 0,

    unreadCountSeller: 0,

    buyerMuted: false,
    sellerMuted: false,

    buyerMutedAt: undefined,
    sellerMutedAt: undefined,

    // 🗑 Soft Delete
    buyerDeleted: false,
    sellerDeleted: false,

    buyerDeletedAt: undefined,
    sellerDeletedAt: undefined,

    createdAt: now,

    updatedAt: now,
  };

  const result = await collection.insertOne(conversation);

  return {
    ...conversation,
    _id: result.insertedId,
  };
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  message: string,
  attachment?: {
    messageType: "image" | "document" | "video" | "audio";
    attachmentUrl: string;
    attachmentPublicId?: string;
    attachmentName?: string;
    attachmentSize?: number;
  },
) {
  const messageCollection = await getMessageCollection();
  const conversationCollection = await getConversationCollection();

  const conversation = await conversationCollection.findOne({
    _id: new ObjectId(conversationId),
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // =========================================
  // Restore conversation if previously deleted
  // =========================================

  const restoreUpdate: Record<string, any> = {};

  if (conversation.buyerDeleted) {
    restoreUpdate.buyerDeleted = false;
    restoreUpdate.buyerDeletedAt = undefined;
  }

  if (conversation.sellerDeleted) {
    restoreUpdate.sellerDeleted = false;
    restoreUpdate.sellerDeletedAt = undefined;
  }

  if (Object.keys(restoreUpdate).length > 0) {
    restoreUpdate.updatedAt = new Date();

    await conversationCollection.updateOne(
      {
        _id: new ObjectId(conversationId),
      },
      {
        $set: restoreUpdate,
      },
    );
  }

  // =========================================
  // Create message
  // =========================================

  const now = new Date();

  const newMessage: Message = {
    conversationId,

    senderId,

    receiverId,

    message,

    messageType: attachment?.messageType ?? "text",

    ...(attachment?.attachmentUrl
      ? {
          attachmentUrl: attachment.attachmentUrl,
        }
      : {}),

    ...(attachment?.attachmentPublicId
      ? {
          attachmentPublicId: attachment.attachmentPublicId,
        }
      : {}),

    ...(attachment?.attachmentName
      ? {
          attachmentName: attachment.attachmentName,
        }
      : {}),

    ...(attachment?.attachmentSize !== undefined
      ? {
          attachmentSize: attachment.attachmentSize,
        }
      : {}),

    isRead: false,

    createdAt: now,
  };

  // =========================================
  // Save message
  // =========================================

  const result = await messageCollection.insertOne(newMessage);

  // =========================================
  // Determine unread counter
  // =========================================

  const unreadField =
    senderId === conversation.buyerId
      ? "unreadCountSeller"
      : "unreadCountBuyer";

  // =========================================
  // Conversation last message
  // =========================================

  let lastMessage = message;

  if (attachment?.messageType === "image") {
    lastMessage = message ? `📷 ${message}` : "📷 Photo";
  }

  if (attachment?.messageType === "document") {
    lastMessage = message ? `📄 ${message}` : "📄 Document";
  }

  if (attachment?.messageType === "video") {
    lastMessage = message ? `🎥 ${message}` : "🎥 Video";
  }

  if (attachment?.messageType === "audio") {
    lastMessage = message ? `🎵 ${message}` : "🎵 Audio";
  }

  // =========================================
  // Update conversation
  // =========================================

  await conversationCollection.updateOne(
    {
      _id: new ObjectId(conversationId),
    },
    {
      $set: {
        lastMessage,

        lastMessageAt: now,

        updatedAt: now,
      },

      $inc: {
        [unreadField]: 1,
      },
    },
  );

  // =========================================
  // Return new message
  // =========================================

  return {
    ...newMessage,

    _id: result.insertedId,
  };
}

export async function getMessages(conversationId: string, userId: string) {
  const collection = await getMessageCollection();

  return collection
    .find({
      conversationId,

      // Hide messages deleted by this user
      deletedFor: {
        $nin: [userId],
      },
    })
    .sort({
      createdAt: 1,
    })
    .toArray();
}

// =========================================
// Delete Messages For User
// Single + Multiple
// =========================================

export async function deleteMessagesForUser(
  conversationId: string,
  messageIds: string[],
  userId: string,
) {
  const collection = await getMessageCollection();

  // =======================================
  // Validate message IDs
  // =======================================

  const objectIds = messageIds
    .filter((id) => ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  if (objectIds.length === 0) {
    throw new Error("No valid message IDs provided.");
  }

  // =======================================
  // Delete for current user only
  // =======================================

  const result = await collection.updateMany(
    {
      _id: {
        $in: objectIds,
      },

      conversationId,

      // Current user must be part of the message
      $or: [
        {
          senderId: userId,
        },
        {
          receiverId: userId,
        },
      ],
    },
    {
      $addToSet: {
        deletedFor: userId,
      },
    },
  );

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
}

export async function getUserConversations(userId: string) {
  const collection = await getConversationCollection();

  return collection
    .find({
      $or: [
        {
          buyerId: userId,
        },
        {
          sellerId: userId,
        },
      ],
    })
    .sort({
      updatedAt: -1,
    })
    .toArray();
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
) {
  const collection = await getConversationCollection();

  const conversation = await collection.findOne({
    _id: new ObjectId(conversationId),
  });

  if (!conversation) {
    return;
  }

  const update =
    userId === conversation.buyerId
      ? {
          unreadCountBuyer: 0,
        }
      : {
          unreadCountSeller: 0,
        };

  await collection.updateOne(
    {
      _id: new ObjectId(conversationId),
    },
    {
      $set: update,
    },
  );

  await (
    await getMessageCollection()
  ).updateMany(
    {
      conversationId,
      receiverId: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    },
  );
}

export async function getConversationById(conversationId: string) {
  const collection = await getConversationCollection();

  const result = await collection
    .aggregate([
      {
        $match: {
          _id: new ObjectId(conversationId),
        },
      },

      {
        $addFields: {
          productObjectId: {
            $toObjectId: "$productId",
          },
        },
      },

      {
        $lookup: {
          from: "products",
          localField: "productObjectId",
          foreignField: "_id",
          as: "product",
        },
      },

      {
        $unwind: "$product",
      },

      {
        $addFields: {
          sellerObjectId: {
            $toObjectId: "$product.sellerId",
          },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "sellerObjectId",
          foreignField: "_id",
          as: "seller",
        },
      },

      {
        $unwind: {
          path: "$seller",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          buyerObjectId: {
            $toObjectId: "$buyerId",
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "buyerObjectId",
          foreignField: "_id",
          as: "buyer",
        },
      },
      {
        $unwind: {
          path: "$buyer",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          buyerId: 1,
          sellerId: 1,
          productId: 1,
          lastMessage: 1,
          lastMessageAt: 1,
          unreadCountBuyer: 1,
          unreadCountSeller: 1,
          createdAt: 1,
          updatedAt: 1,

          product: {
            _id: "$product._id",
            title: "$product.title",
            thumbnail: "$product.thumbnail",
            price: "$product.price",
            slug: "$product.slug",
          },

          seller: {
            _id: "$seller._id",
            name: "$seller.name",
            image: "$seller.image",
            phone: "$seller.phone",
          },

          buyer: {
            _id: "$buyer._id",
            name: "$buyer.name",
            image: "$buyer.image",
            phone: "$buyer.phone",
          },
        },
      },
    ])
    .toArray();

  return result[0] ?? null;
}

export async function getConversationList(userId: string) {
  const collection = await getConversationCollection();

  return collection
    .aggregate([
      {
        $match: {
          $or: [
            {
              buyerId: userId,
              $or: [
                { buyerDeleted: false },
                { buyerDeleted: { $exists: false } },
              ],
            },
            {
              sellerId: userId,
              $or: [
                { sellerDeleted: false },
                { sellerDeleted: { $exists: false } },
              ],
            },
          ],
        },
      },
      {
        $addFields: {
          productObjectId: {
            $toObjectId: "$productId",
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productObjectId",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },

      {
        $addFields: {
          sellerObjectId: {
            $toObjectId: "$sellerId",
          },
          buyerObjectId: {
            $toObjectId: "$buyerId",
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sellerObjectId",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: {
          path: "$seller",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "buyerObjectId",
          foreignField: "_id",
          as: "buyer",
        },
      },
      {
        $unwind: {
          path: "$buyer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          buyerId: 1,
          sellerId: 1,
          lastMessage: 1,
          lastMessageAt: 1,
          unreadCountBuyer: 1,
          unreadCountSeller: 1,
          createdAt: 1,
          updatedAt: 1,

          "product._id": 1,
          "product.title": 1,
          "product.slug": 1,
          "product.thumbnail": 1,
          "product.price": 1,
          "product.sellerName": 1,

          seller: {
            _id: "$seller._id",
            name: "$seller.name",
            image: "$seller.image",
          },

          buyer: {
            _id: "$buyer._id",
            name: "$buyer.name",
            image: "$buyer.image",
          },
        },
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
    ])
    .toArray();
}

export async function getConversationCountByProduct(productId: string) {
  const collection = await getConversationCollection();

  return collection.countDocuments({
    productId,
  });
}

export async function updateConversationMute(
  conversationId: string,
  userId: string,
  muted: boolean,
) {
  const collection = await getConversationCollection();

  const conversation = await collection.findOne({
    _id: new ObjectId(conversationId),
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const isBuyer = conversation.buyerId === userId;

  await collection.updateOne(
    {
      _id: new ObjectId(conversationId),
    },
    {
      $set: {
        [isBuyer ? "buyerMuted" : "sellerMuted"]: muted,
        [isBuyer ? "buyerMutedAt" : "sellerMutedAt"]: muted
          ? new Date()
          : undefined,
      },
    },
  );
}

export async function deleteConversation(
  conversationId: string,
  userId: string,
) {
  const collection = await getConversationCollection();

  const conversation = await collection.findOne({
    _id: new ObjectId(conversationId),
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const isBuyer = conversation.buyerId === userId;

  await collection.updateOne(
    {
      _id: new ObjectId(conversationId),
    },
    {
      $set: {
        [isBuyer ? "buyerDeleted" : "sellerDeleted"]: true,
        [isBuyer ? "buyerDeletedAt" : "sellerDeletedAt"]: new Date(),
        updatedAt: new Date(),
      },
    },
  );
}
