import { ObjectId } from "mongodb";

// =====================================================
// Service Listing Type
// =====================================================

export type ServiceListingType =
  | "service"
  | "business";

// =====================================================
// Service Status
// =====================================================

export type ServiceStatus =
  | "draft"
  | "active"
  | "paused"
  | "expired"
  | "blocked";

// =====================================================
// Service Mode
// =====================================================

export type ServiceMode =
  | "at_business"
  | "home_visit"
  | "both"
  | "remote";

// =====================================================
// Service Image
// =====================================================

export interface ServiceImage {
  publicId: string;
  url: string;
}

// =====================================================
// Service Location
// =====================================================

export interface ServiceLocation {
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
// Business Contact
// =====================================================

export interface ServiceContact {
  phone: string;
  alternativePhone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
}

// =====================================================
// Opening Hours
// =====================================================

export interface ServiceOpeningHour {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

  isOpen: boolean;

  openTime?: string;
  closeTime?: string;
}

// =====================================================
// Service
// =====================================================

export interface Service {
  _id?: ObjectId;

  // ===================================================
  // Basic Information
  // ===================================================

  title: string;

  slug: string;

  listingType: ServiceListingType;

  description: string;

  // ===================================================
  // Category
  // ===================================================

  category: string;

  subcategory: string;

  // ===================================================
  // Provider / Owner
  // ===================================================

  sellerId: string;

  sellerName: string;

  sellerPhone?: string;

  // ===================================================
  // Business Information
  // ===================================================

  businessName?: string;

  businessType?: string;

  yearsOfExperience?: number;

  // ===================================================
  // Service Information
  // ===================================================

  serviceMode: ServiceMode;

  servicesOffered: string[];

  serviceAreas: string[];

  // ===================================================
  // Pricing
  // ===================================================

  startingPrice?: number;

  priceUnit?:
    | "hour"
    | "visit"
    | "day"
    | "service"
    | "project"
    | "month";

  priceOnRequest?: boolean;

  currency: "INR";

  // ===================================================
  // Images
  // ===================================================

  images: ServiceImage[];

  thumbnail: string;

  // ===================================================
  // Location
  // ===================================================

  location: ServiceLocation;

  // ===================================================
  // Contact
  // ===================================================

  contact: ServiceContact;

  // ===================================================
  // Opening Hours
  // ===================================================

  openingHours?: ServiceOpeningHour[];

  // ===================================================
  // Verification
  // ===================================================

  phoneVerified?: boolean;

  identityVerified?: boolean;

  businessVerified?: boolean;

  trustedProvider?: boolean;

  // ===================================================
  // Promotion
  // ===================================================

  isFeatured?: boolean;

  isBoosted?: boolean;

  featuredAt?: Date;

  featuredUntil?: Date;

  boostedAt?: Date;

  boostedUntil?: Date;

  // ===================================================
  // Stats
  // ===================================================

  views?: number;

  enquiries?: number;

  favorites?: number;

  // ===================================================
  // Status
  // ===================================================

  status: ServiceStatus;

  // ===================================================
  // Timestamps
  // ===================================================

  createdAt: Date;

  updatedAt: Date;
}