import { ObjectId } from "mongodb";

// =====================================================
// SUPPORT TICKET STATUS
// =====================================================

export type SupportTicketStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "waiting_for_user"
  | "resolved"
  | "closed";

// =====================================================
// SUPPORT TICKET PRIORITY
// =====================================================

export type SupportTicketPriority =
  | "low"
  | "normal"
  | "high"
  | "critical";

// =====================================================
// SUPPORT TICKET CATEGORY
// =====================================================

export type SupportTicketCategory =
  | "account"
  | "buying"
  | "selling"
  | "payment"
  | "verification"
  | "messages"
  | "safety"
  | "technical"
  | "other";

// =====================================================
// SUPPORT TICKET
// =====================================================

export interface SupportTicket {
  _id?: ObjectId;

  // ---------------------------------------------------
  // Public Ticket Reference
  // ---------------------------------------------------

  ticketId: string;

  // ---------------------------------------------------
  // User
  // ---------------------------------------------------

  userId: ObjectId;

  userEmail: string;

  userName: string;

  // ---------------------------------------------------
  // Support Information
  // ---------------------------------------------------

  category: SupportTicketCategory;

  subject: string;

  description: string;

  // ---------------------------------------------------
  // Optional Marketplace Context
  // ---------------------------------------------------

  productId?: ObjectId | null;

  // ---------------------------------------------------
  // Ticket Management
  // ---------------------------------------------------

  status: SupportTicketStatus;

  priority: SupportTicketPriority;

  assignedTo?: ObjectId | null;

  // ---------------------------------------------------
  // Timestamps
  // ---------------------------------------------------

  createdAt: Date;

  updatedAt: Date;

  resolvedAt?: Date | null;

  closedAt?: Date | null;
}