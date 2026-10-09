import { z } from "zod";

// =====================================================
// Service Image
// =====================================================

const serviceImageSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
});

// =====================================================
// Location
// =====================================================

const serviceLocationSchema = z.object({
  country: z.string().min(1, "Country is required"),

  state: z.string().min(1, "State is required"),

  district: z.string().min(1, "District is required"),

  city: z.string().min(1, "City is required"),

  pincode: z
    .string()
    .min(4, "Enter a valid pincode")
    .max(10, "Enter a valid pincode"),

  address: z.string().optional(),

  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

// =====================================================
// Contact
// =====================================================

const serviceContactSchema = z.object({
  phone: z
    .string()
    .min(10, "Enter a valid phone number"),

  alternativePhone: z.string().optional(),

  whatsapp: z.string().optional(),

  email: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),

  website: z
    .string()
    .url("Enter a valid website URL")
    .optional()
    .or(z.literal("")),
});

// =====================================================
// Opening Hours
// =====================================================

const openingHourSchema = z.object({
  day: z.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ]),

  isOpen: z.boolean(),

  openTime: z.string().optional(),

  closeTime: z.string().optional(),
});

// =====================================================
// Service Schema
// =====================================================

export const serviceSchema = z.object({
  title: z
    .string()
    .min(3, "Service name must be at least 3 characters")
    .max(120, "Service name is too long"),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description is too long"),

  listingType: z.enum([
    "service",
    "business",
  ]),

  category: z
    .string()
    .min(1, "Please select a category"),

  subcategory: z
    .string()
    .min(1, "Please select a subcategory"),

  businessName: z
    .string()
    .max(150)
    .optional(),

  businessType: z
    .string()
    .max(100)
    .optional(),

  yearsOfExperience: z
    .number()
    .min(0)
    .max(100)
    .optional(),

  serviceMode: z.enum([
    "at_business",
    "home_visit",
    "both",
    "remote",
  ]),

  servicesOffered: z
    .array(z.string().min(1))
    .min(1, "Add at least one service"),

  serviceAreas: z
    .array(z.string().min(1))
    .min(1, "Add at least one service area"),

  startingPrice: z
    .number()
    .min(0)
    .optional(),

  priceUnit: z
    .enum([
      "hour",
      "visit",
      "day",
      "service",
      "project",
      "month",
    ])
    .optional(),

  priceOnRequest: z.boolean(),

  images: z
    .array(serviceImageSchema)
    .min(1, "Please upload at least one image"),

  thumbnail: z
    .string()
    .url("Invalid thumbnail URL"),

  location: serviceLocationSchema,

  contact: serviceContactSchema,

  openingHours: z
    .array(openingHourSchema)
    .optional(),
});

// =====================================================
// Form Type
// =====================================================

export type ServiceFormData = z.infer<
  typeof serviceSchema
>;