import { ObjectId } from "mongodb";

import clientPromise from "@/lib/db/mongodb";

import type {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/lib/models/supportTicket";

// =====================================================
// DATABASE
// =====================================================

const DATABASE_NAME = "dealup";
const COLLECTION_NAME = "supportTickets";

// =====================================================
// COLLECTION
// =====================================================

async function getCollection() {
  const client = await clientPromise;

  const db = client.db(DATABASE_NAME);

  return db.collection<SupportTicket>(COLLECTION_NAME);
}

// =====================================================
// TICKET ID
// =====================================================

function generateTicketId() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  const randomNumber = Math.floor(
    100000 + Math.random() * 900000,
  );

  return `DU-${year}${month}${day}-${randomNumber}`;
}

// =====================================================
// CREATE SUPPORT TICKET
// =====================================================

export async function createSupportTicket({
  userId,
  userEmail,
  userName,
  category,
  subject,
  description,
  productId,
  priority = "normal",
}: {
  userId: string;
  userEmail: string;
  userName: string;
  category: SupportTicketCategory;
  subject: string;
  description: string;
  productId?: string | null;
  priority?: SupportTicketPriority;
}) {
  const collection = await getCollection();

  const now = new Date();

  const ticket: SupportTicket = {
    ticketId: generateTicketId(),

    userId: new ObjectId(userId),

    userEmail,

    userName,

    category,

    subject,

    description,

    productId:
      productId && ObjectId.isValid(productId)
        ? new ObjectId(productId)
        : null,

    status: "open",

    priority,

    assignedTo: null,

    createdAt: now,

    updatedAt: now,

    resolvedAt: null,

    closedAt: null,
  };

  const result = await collection.insertOne(ticket);

  return {
    ...ticket,
    _id: result.insertedId,
  };
}

// =====================================================
// FIND TICKET BY TICKET ID
// =====================================================

export async function findTicketByTicketId(
  ticketId: string,
) {
  const collection = await getCollection();

  return collection.findOne({
    ticketId,
  });
}

// =====================================================
// FIND TICKET BY MONGODB ID
// =====================================================

export async function findTicketById(
  id: string,
) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getCollection();

  return collection.findOne({
    _id: new ObjectId(id),
  });
}

// =====================================================
// FIND USER TICKETS
// =====================================================

export async function findTicketsByUser(
  userId: string,
  limit = 20,
) {
  console.log(
    "[SUPPORT REPOSITORY] findTicketsByUser userId:",
    userId,
  );

  if (!ObjectId.isValid(userId)) {
    console.log(
      "[SUPPORT REPOSITORY] Invalid ObjectId:",
      userId,
    );

    return [];
  }

  const objectId =
    new ObjectId(userId);

  console.log(
    "[SUPPORT REPOSITORY] ObjectId:",
    objectId.toString(),
  );

  const collection =
    await getCollection();

  const tickets =
    await collection
      .find({
        userId: objectId,
      })
      .sort({
        updatedAt: -1,
      })
      .limit(limit)
      .toArray();

  console.log(
    "[SUPPORT REPOSITORY] Tickets found:",
    tickets.length,
  );

  if (tickets.length > 0) {
    console.log(
      "[SUPPORT REPOSITORY] Ticket IDs:",
      tickets.map(
        (ticket) => ticket.ticketId,
      ),
    );
  }

  return tickets;
}

// =====================================================
// UPDATE TICKET STATUS
// =====================================================

export async function updateTicketStatus(
  ticketId: string,
  status: SupportTicketStatus,
) {
  const collection = await getCollection();

  const now = new Date();

  const update: {
    status: SupportTicketStatus;
    updatedAt: Date;
    resolvedAt?: Date | null;
    closedAt?: Date | null;
  } = {
    status,
    updatedAt: now,
  };

  if (status === "resolved") {
    update.resolvedAt = now;
  }

  if (status === "closed") {
    update.closedAt = now;
  }

  const result = await collection.updateOne(
    {
      ticketId,
    },
    {
      $set: update,
    },
  );

  return result;
}

// =====================================================
// ASSIGN TICKET
// =====================================================

export async function assignSupportTicket(
  ticketId: string,
  agentId: string | null,
) {
  const collection = await getCollection();

  const result = await collection.updateOne(
    {
      ticketId,
    },
    {
      $set: {
        assignedTo:
          agentId && ObjectId.isValid(agentId)
            ? new ObjectId(agentId)
            : null,

        status:
          agentId && ObjectId.isValid(agentId)
            ? "assigned"
            : "open",

        updatedAt: new Date(),
      },
    },
  );

  return result;
}

// =====================================================
// UPDATE TICKET PRIORITY
// =====================================================

export async function updateTicketPriority(
  ticketId: string,
  priority: SupportTicketPriority,
) {
  const collection = await getCollection();

  const result = await collection.updateOne(
    {
      ticketId,
    },
    {
      $set: {
        priority,
        updatedAt: new Date(),
      },
    },
  );

  return result;
}