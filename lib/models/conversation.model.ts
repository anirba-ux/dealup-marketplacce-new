import { ObjectId } from "mongodb";

export interface Conversation {
  _id?: ObjectId;

  productId: string;

  buyerId: string;

  sellerId: string;

  lastMessage: string;

  lastMessageAt: Date;

  unreadCountBuyer: number;

  unreadCountSeller: number;

  // 🔕 Mute Notification
  buyerMuted: boolean;

  sellerMuted: boolean;

  buyerMutedAt?: Date;

  sellerMutedAt?: Date;

  // 🗑 Soft Delete
buyerDeleted: boolean;

sellerDeleted: boolean;

buyerDeletedAt?: Date;

sellerDeletedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}