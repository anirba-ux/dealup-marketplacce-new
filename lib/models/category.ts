import { ObjectId } from "mongodb";

export type CategoryStatus =
  | "active"
  | "inactive";

export interface Category {
  _id?: ObjectId;

  // Basic Information
  name: string;
  slug: string;
  description?: string;

  // UI
  icon: string;
  image?: string;

  // Category Hierarchy
  parentId: ObjectId | null;
  level: number;

  // Display Order
  sortOrder: number;

  // Status
  status: CategoryStatus;

  // SEO (Future)
  metaTitle?: string;
  metaDescription?: string;

  // Analytics (Future)
  totalProducts?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}