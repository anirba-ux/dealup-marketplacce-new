import { ObjectId } from "mongodb";

export type ReportReason =
  | "spam"
  | "fake"
  | "duplicate"
  | "wrong_category"
  | "scam"
  | "sold"
  | "other";

export type ReportStatus =
  | "pending"
  | "reviewing"
  | "resolved"
  | "rejected";

export interface Report {
  _id?: ObjectId;

  // Product
  productId: string;

  // Seller
  sellerId: string;

  // Reporter
  reportedBy: string;

  // Reason
  reason: ReportReason;

  // Optional Message
  message?: string;

  // Status
  status: ReportStatus;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}