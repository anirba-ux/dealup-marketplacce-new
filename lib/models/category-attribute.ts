import { ObjectId } from "mongodb";

export type AttributeType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "boolean"
  | "date";

export interface CategoryAttribute {
  _id?: ObjectId;

  categoryId: ObjectId;

  name: string;

  slug: string;

  type: AttributeType;

  required: boolean;

  searchable: boolean;

  filterable: boolean;

  sortable: boolean;

  options?: string[];

  placeholder?: string;

  unit?: string;

  min?: number;

  max?: number;

  sortOrder: number;

  createdAt: Date;

  updatedAt: Date;
}