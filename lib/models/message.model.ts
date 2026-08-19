import { ObjectId } from "mongodb";

export type MessageType =
  | "text"
  | "image"
  | "document"
  | "video"
  | "audio";

export interface Message {
  _id?: ObjectId;

  conversationId: string;

  senderId: string;

  receiverId: string;

  message: string;

  messageType: MessageType;

  attachmentUrl?: string;

  attachmentPublicId?: string;

  attachmentName?: string;

  attachmentSize?: number;

  isRead: boolean;

  // Users who deleted this message from their own chat
  deletedFor?: string[];

  createdAt: Date;
}