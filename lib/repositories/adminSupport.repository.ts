import clientPromise from "@/lib/db/mongodb";
import type {
  SupportTicket,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportTicketCategory,
} from "@/lib/models/supportTicket";

// =====================================================
// Database
// =====================================================

const DB_NAME = "dealup";
const COLLECTION_NAME = "supportTickets";

// =====================================================
// Types
// =====================================================

export interface AdminSupportTicketFilters {
  search?: string;
  status?: SupportTicketStatus | "";
  category?: SupportTicketCategory | "";
  priority?: SupportTicketPriority | "";
  limit?: number;
}

export interface AdminSupportTicketStats {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  waitingForUser: number;
  resolved: number;
  closed: number;
  highPriority: number;
  criticalPriority: number;
}

// =====================================================
// Collection
// =====================================================

async function getCollection() {
  const client = await clientPromise;

  return client
    .db(DB_NAME)
    .collection<SupportTicket>(COLLECTION_NAME);
}

// =====================================================
// Find All Admin Support Tickets
// =====================================================

export async function findAllAdminSupportTickets(
  filters: AdminSupportTicketFilters = {},
): Promise<SupportTicket[]> {
  const collection = await getCollection();

  const {
    search = "",
    status = "",
    category = "",
    priority = "",
    limit = 100,
  } = filters;

  const query: Record<string, unknown> = {};

  // ---------------------------------------------------
  // Search
  // ---------------------------------------------------

  if (search.trim()) {
    const searchRegex = {
      $regex: search.trim(),
      $options: "i",
    };

    query.$or = [
      {
        ticketId: searchRegex,
      },
      {
        subject: searchRegex,
      },
      {
        userEmail: searchRegex,
      },
      {
        userName: searchRegex,
      },
    ];
  }

  // ---------------------------------------------------
  // Status
  // ---------------------------------------------------

  if (status) {
    query.status = status;
  }

  // ---------------------------------------------------
  // Category
  // ---------------------------------------------------

  if (category) {
    query.category = category;
  }

  // ---------------------------------------------------
  // Priority
  // ---------------------------------------------------

  if (priority) {
    query.priority = priority;
  }

  // ---------------------------------------------------
  // Fetch
  // ---------------------------------------------------

  const safeLimit = Math.min(
    Math.max(Number(limit) || 100, 1),
    200,
  );

  return collection
    .find(query)
    .sort({
      updatedAt: -1,
      createdAt: -1,
    })
    .limit(safeLimit)
    .toArray();
}

// =====================================================
// Support Ticket Statistics
// =====================================================

export async function getAdminSupportStatistics(): Promise<AdminSupportTicketStats> {
  const collection = await getCollection();

  const [
    total,
    open,
    assigned,
    inProgress,
    waitingForUser,
    resolved,
    closed,
    highPriority,
    criticalPriority,
  ] = await Promise.all([
    collection.countDocuments({}),

    collection.countDocuments({
      status: "open",
    }),

    collection.countDocuments({
      status: "assigned",
    }),

    collection.countDocuments({
      status: "in_progress",
    }),

    collection.countDocuments({
      status: "waiting_for_user",
    }),

    collection.countDocuments({
      status: "resolved",
    }),

    collection.countDocuments({
      status: "closed",
    }),

    collection.countDocuments({
      priority: "high",
    }),

    collection.countDocuments({
      priority: "critical",
    }),
  ]);

  return {
    total,
    open,
    assigned,
    inProgress,
    waitingForUser,
    resolved,
    closed,
    highPriority,
    criticalPriority,
  };
}