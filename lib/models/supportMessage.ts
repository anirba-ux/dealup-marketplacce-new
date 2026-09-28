import { ObjectId } from "mongodb";

export type SupportMessageSenderType =
  | "user"
  | "agent"
  | "system";

export interface SupportMessage {
  _id?: ObjectId;

  ticketId: string;

  senderId?: ObjectId | null;

  senderType: SupportMessageSenderType;

  senderName: string;

  message: string;

  createdAt: Date;

  updatedAt: Date;
}