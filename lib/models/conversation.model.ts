
import { ObjectId } from "mongodb";

export type ConversationListingType =
  | "product"
  | "service"
  | "business";

export interface Conversation {
  _id?: ObjectId;

  // Listing information
  productId: string;
  listingType?: ConversationListingType;

  // Participants
  buyerId: string;
  sellerId: string;

  // Last message information
  lastMessage: string;
  lastMessageAt: Date;

  // Unread message counters
  unreadCountBuyer: number;
  unreadCountSeller: number;

  // Mute notification settings
  buyerMuted: boolean;
  sellerMuted: boolean;

  buyerMutedAt?: Date;
  sellerMutedAt?: Date;

  // Soft delete settings
  buyerDeleted: boolean;
  sellerDeleted: boolean;

  buyerDeletedAt?: Date;
  sellerDeletedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
