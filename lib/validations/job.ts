import { z } from "zod";

// =====================================================
// Job Location Schema
// =====================================================

const locationSchema = z.object({
  country: z
    .string()
    .trim()
    .min(1, "Country is required."),

  state: z
    .string()
    .trim()
    .min(1, "State is required."),

  district: z
    .string()
    .trim()
    .min(1, "District is required."),

  city: z
    .string()
    .trim()
    .min(1, "City is required."),

  pincode: z
    .string()
    .trim()
    .min(4, "Valid pincode is required."),

  address: z
    .string()
    .trim()
    .optional(),

  coordinates: z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
  }),
});

// =====================================================
// Job Position Schema
// =====================================================

const jobPositionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Job title is required."),

    category: z
      .string()
      .trim()
      .min(2, "Job category is required."),

    subcategory: z
      .string()
      .trim()
      .optional(),

    description: z
      .string()
      .trim()
      .min(
        20,
        "Job description must be at least 20 characters.",
      ),

    employmentType: z.enum([
      "full-time",
      "part-time",
      "contract",
      "internship",
      "temporary",
      "freelance",
    ]),

    workMode: z.enum([
      "on-site",
      "hybrid",
      "remote",
    ]),

    experience: z
      .string()
      .trim()
      .min(1, "Experience is required."),

    salary: z.object({
      min: z.coerce
        .number()
        .min(0, "Minimum salary cannot be negative."),

      max: z.coerce
        .number()
        .min(0, "Maximum salary cannot be negative.")
        .optional(),

      period: z.enum([
        "hour",
        "day",
        "month",
        "year",
      ]),
    }),

    vacancies: z.coerce
      .number()
      .int()
      .min(1, "At least one vacancy is required."),

    // =================================================
    // Application Options
    // =================================================
    //
    // Position-specific application methods.
    // Used by both Single Job and Weekly Hiring.
    //

    applicationUrl: z
      .string()
      .trim()
      .url("Enter a valid application URL.")
      .optional()
      .or(z.literal("")),

    contactPhone: z
      .string()
      .trim()
      .optional(),

    contactEmail: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .optional()
      .or(z.literal("")),

    // =================================================
    // Position-specific Location
    // =================================================
    //
    // Used by Weekly Hiring / Multiple Jobs.
    // Optional for backward compatibility with
    // older multiple-job records.
    //

    location: locationSchema.optional(),
  })
  .superRefine((job, ctx) => {
    if (
      job.salary.max !== undefined &&
      job.salary.max < job.salary.min
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salary", "max"],
        message:
          "Maximum salary must be greater than or equal to minimum salary.",
      });
    }
  });

// =====================================================
// Employer Schema
// =====================================================

const employerSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name is required."),

  contactPerson: z
    .string()
    .trim()
    .min(2, "Contact person is required."),

  phone: z
    .string()
    .trim()
    .min(7, "Valid phone number is required."),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .optional()
    .or(z.literal("")),

  website: z
    .string()
    .trim()
    .url("Please enter a valid website URL.")
    .optional()
    .or(z.literal("")),
});

// =====================================================
// Job Thumbnail Schema
// =====================================================
//
// Cloudinary image reference.
// The actual image remains stored on Cloudinary.
// =====================================================

const thumbnailSchema = z.object({
  publicId: z
    .string()
    .trim()
    .min(1, "Thumbnail public ID is required."),

  url: z
    .string()
    .trim()
    .url("Thumbnail URL must be valid."),
});

// =====================================================
// Job Schema
// =====================================================

export const jobSchema = z
  .object({
    listingType: z.enum([
      "single",
      "multiple",
    ]),

    jobs: z
      .array(jobPositionSchema)
      .min(
        1,
        "At least one job position is required.",
      ),

    employer: employerSchema,

    // =================================================
    // Legacy / Main Job Location
    // =================================================
    //
    // Kept at the top level for:
    // - Single Job
    // - Existing Multiple Job records
    // - Backward compatibility
    //

    location: locationSchema,

    // ===================================
    // Job Thumbnail
    // ===================================

    thumbnail: thumbnailSchema.optional(),

    // ===================================
    // Legacy Infographic
    // ===================================
    //
    // Kept temporarily so older form/data
    // does not break.
    //

    infographic: thumbnailSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // =================================================
    // Single Job
    // =================================================

    if (
      data.listingType === "single" &&
      data.jobs.length !== 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["jobs"],
        message:
          "Single Job listing must contain exactly one job position.",
      });
    }

    // =================================================
    // Multiple / Weekly Hiring
    // =================================================

    if (
      data.listingType === "multiple" &&
      data.jobs.length < 2
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["jobs"],
        message:
          "Multiple Jobs listing must contain at least two job positions.",
      });
    }
  });

// =====================================================
// Job Form Data Type
// =====================================================

export type JobFormData = z.infer<
  typeof jobSchema
>;