import { ObjectId } from "mongodb";

export type NotificationType =
  | "support_ticket_created"
  | "support_ticket_assigned"
  | "support_ticket_reply"
  | "support_ticket_status"
  | "support_ticket_resolved"
  | "support_ticket_closed"
  | "system";

export interface Notification {
  _id?: ObjectId;

  userId: ObjectId;

  type: NotificationType;

  title: string;

  message: string;

  ticketId?: string | null;

  read: boolean;

  createdAt: Date;

  updatedAt: Date;
}