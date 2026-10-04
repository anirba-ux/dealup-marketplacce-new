import { ObjectId } from "mongodb";

// =====================================================
// Job Listing Type
// =====================================================

export type JobListingType =
  | "single"
  | "multiple";

// =====================================================
// Job Status
// =====================================================

export type JobStatus =
  | "draft"
  | "active"
  | "expired"
  | "blocked";

// =====================================================
// Employment Type
// =====================================================

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "temporary"
  | "freelance";

// =====================================================
// Work Mode
// =====================================================

export type WorkMode =
  | "on-site"
  | "hybrid"
  | "remote";

// =====================================================
// Salary Period
// =====================================================

export type SalaryPeriod =
  | "hour"
  | "day"
  | "month"
  | "year";

// =====================================================
// Job Salary
// =====================================================

export interface JobSalary {
  min: number;
  max?: number;
  period: SalaryPeriod;
}

// =====================================================
// Job Position
// =====================================================

export interface JobPosition {
  title: string;

  category: string;

  subcategory?: string;

  description: string;

  employmentType: EmploymentType;

  workMode: WorkMode;

  experience: string;

  salary: JobSalary;

  vacancies: number;
}

// =====================================================
// Employer
// =====================================================

export interface JobEmployer {
  companyName: string;

  contactPerson: string;

  phone: string;

  email?: string;

  website?: string;
}

// =====================================================
// Job Location
// =====================================================

export interface JobLocation {
  country: string;

  state: string;

  district: string;

  city: string;

  pincode: string;

  address?: string;

  coordinates: {
    lat: number;
    lng: number;
  };
}

// =====================================================
// Job Thumbnail
// =====================================================
//
// Cloudinary stores the actual image.
// MongoDB stores only the Cloudinary publicId + URL.
//
// This follows the same concept as Product thumbnail.
// =====================================================

export interface JobThumbnail {
  publicId: string;
  url: string;
}

// =====================================================
// Legacy Job Infographic
// =====================================================
//
// Kept for backward compatibility with older Job records.
// New Job listings should use `thumbnail`.
// =====================================================

export interface JobInfographic {
  publicId: string;
  url: string;
}

// =====================================================
// Job
// =====================================================

export interface Job {
  _id?: ObjectId;

  // ===================================
  // Listing
  // ===================================

  listingType: JobListingType;

  status: JobStatus;

  // ===================================
  // Job Positions
  // ===================================

  jobs: JobPosition[];

  // ===================================
  // Employer
  // ===================================

  employer: JobEmployer;

  // ===================================
  // Location
  // ===================================

  location: JobLocation;

  // ===================================
  // Thumbnail
  // ===================================
  //
  // Primary image for:
  // - Latest Jobs
  // - Featured Jobs
  // - Search results
  // - Job cards
  // - Job details
  //
  // Image itself remains on Cloudinary.
  // ===================================

  thumbnail?: JobThumbnail;

  // ===================================
  // Legacy Infographic
  // ===================================
  //
  // Older Job documents may still contain
  // this field. Do not remove it yet.
  // ===================================

  infographic?: JobInfographic;

  // ===================================
  // Owner
  // ===================================

  employerId: string;

  employerName: string;

  // ===================================
  // Statistics
  // ===================================

  views: number;

  applications: number;

  // ===================================
  // Featured / Boost
  // ===================================

  isFeatured?: boolean;

  featuredAt?: Date;

  featuredUntil?: Date;

  isBoosted?: boolean;

  boostedAt?: Date;

  boostedUntil?: Date;

  // ===================================
  // Timestamps
  // ===================================

  createdAt: Date;

  updatedAt: Date;
}