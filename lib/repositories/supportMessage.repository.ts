import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db/mongodb";
import type { SupportMessage } from "@/lib/models/supportMessage";

const DATABASE_NAME = "dealup";
const COLLECTION_NAME = "supportMessages";

async function getCollection() {
  const client = await clientPromise;
  const db = client.db(DATABASE_NAME);

  return db.collection<SupportMessage>(COLLECTION_NAME);
}

/* =========================================================
   CREATE MESSAGE
   ========================================================= */

export async function createSupportMessage({
  ticketId,
  senderId,
  senderType,
  senderName,
  message,
}: {
  ticketId: string;
  senderId?: string | null;
  senderType: "user" | "agent" | "system";
  senderName: string;
  message: string;
}) {
  const collection = await getCollection();

  const now = new Date();

  const supportMessage: SupportMessage = {
    ticketId,
    senderId:
      senderId && ObjectId.isValid(senderId)
        ? new ObjectId(senderId)
        : null,
    senderType,
    senderName,
    message: message.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(
    supportMessage,
  );

  return {
    ...supportMessage,
    _id: result.insertedId,
  };
}

/* =========================================================
   FIND MESSAGES BY TICKET
   ========================================================= */

export async function findMessagesByTicketId(
  ticketId: string,
) {
  const collection = await getCollection();

  return collection
    .find({ ticketId })
    .sort({ createdAt: 1 })
    .toArray();
}

/* =========================================================
   FIND LATEST MESSAGE
   ========================================================= */

export async function findLatestMessageByTicketId(
  ticketId: string,
) {
  const collection = await getCollection();

  return collection
    .find({ ticketId })
    .sort({ createdAt: -1 })
    .limit(1)
    .next();
}

/* =========================================================
   COUNT MESSAGES
   ========================================================= */

export async function countMessagesByTicketId(
  ticketId: string,
) {
  const collection = await getCollection();

  return collection.countDocuments({
    ticketId,
  });
}