import { z } from "zod";

export const productSchema = z.object({
  /* ==========================
      Basic Information
  ========================== */

  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(120, "Title cannot exceed 120 characters."),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(
      5000,
      "Description cannot exceed 5000 characters."
    ),

  /* ==========================
      Category
  ========================== */

  category: z
    .string()
    .min(1, "Please select a category."),

  subcategory: z
    .string()
    .min(1, "Please select a subcategory."),

  /* ==========================
      Product Details
  ========================== */

  condition: z.enum([
    "new",
    "used",
    "refurbished",
  ]),

  brand: z.string().optional(),

  model: z.string().optional(),

  /* ==========================
      Pricing
  ========================== */

  price: z
    .number({
      error: "Price is required.",
    })
    .positive(
      "Price must be greater than zero."
    ),

  negotiable: z.boolean(),

  /* ==========================
      Location
  ========================== */

  state: z
    .string()
    .min(1, "Please select your state."),

  district: z
    .string()
    .min(1, "District is required."),

  city: z
    .string()
    .min(1, "City is required."),

  pincode: z
    .string()
    .regex(
      /^[1-9][0-9]{5}$/,
      "Enter a valid 6-digit pincode."
    ),

  address: z
    .string()
    .min(
      5,
      "Address must be at least 5 characters."
    ),

  latitude: z.number(),

  longitude: z.number(),
});

export type ProductFormData = z.infer<
  typeof productSchema
>;