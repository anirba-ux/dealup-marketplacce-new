import { ObjectId } from "mongodb";

// =====================================
// Product Condition
// =====================================

export type ProductCondition =
  | "new"
  | "used"
  | "refurbished";

// =====================================
// Product Status
// =====================================

export type ProductStatus =
  | "draft"
  | "active"
  | "sold"
  | "expired"
  | "blocked";

// =====================================
// Product Image
// =====================================

export interface ProductImage {
  publicId: string;
  url: string;
}

// =====================================
// Product Location
// =====================================

export interface ProductLocation {
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

// =====================================
// Product Price History
// =====================================

export interface ProductPriceHistory {
  price: number;
  changedAt: Date;
}

// =====================================
// Product Location History
// =====================================

export interface ProductLocationHistory {
  city: string;
  district: string;
  state: string;
  pincode: string;

  coordinates: {
    lat: number;
    lng: number;
  };

  changedAt: Date;
}

// =====================================
// Product Location Verification
// =====================================

export interface ProductLocationVerification {
  sellerLatitude: number;

  sellerLongitude: number;

  productLatitude: number;

  productLongitude: number;

  distanceKm: number;

  accuracy: number;

  status:
    | "nearby"
    | "different"
    | "far";

  method: "device-gps";

  capturedAt: Date;
}

// =====================================
// Product Risk Status
// =====================================

export type ProductRiskStatus =
  | "low"
  | "watch"
  | "review"
  | "high";

// =====================================
// Product Risk Flags
// =====================================

export type ProductRiskFlag =
  | "image_reuse"
  | "frequent_price_change"
  | "frequent_location_change"
  | "unusually_low_price"
  | "buyer_reports"
  | "suspicious_activity";

// =====================================
// Product Risk
// =====================================

export interface ProductRisk {
  score: number;

  status: ProductRiskStatus;

  flags: ProductRiskFlag[];

  lastCalculatedAt?: Date;
}

// =====================================
// Product
// =====================================

export interface Product {
  _id?: ObjectId;

  // ===================================
  // Basic Information
  // ===================================

  title: string;

  slug: string;

  description: string;

  // ===================================
  // Pricing
  // ===================================

  price: number;

  currency: "INR";

  negotiable: boolean;

  // ===================================
  // Category
  // ===================================

  category: string;

  subcategory: string;

  // ===================================
  // Product Details
  // ===================================

  brand?: string;

  model?: string;

  condition: ProductCondition;

  // ===================================
  // Images
  // ===================================

  images: ProductImage[];

  thumbnail: string;

  // ===================================
  // Seller
  // ===================================

  sellerId: string;

  sellerName: string;

  sellerPhone?: string;

  // ===================================
  // Location
  // ===================================

  location: ProductLocation;

  // ===================================
  // Location Verification
  // ===================================

  locationVerification?: ProductLocationVerification;

  // ===================================
  // Status
  // ===================================

  status: ProductStatus;

  // ===================================
  // Engagement
  // ===================================

  views: number;

  favorites: number;

  // ===================================
  // Premium / Promotion
  // ===================================

  isFeatured: boolean;

  isPremium: boolean;

  isBoosted?: boolean;

  boostedUntil?: Date;

  // ===================================
  // Risk & Trust
  // ===================================

  risk?: ProductRisk;

  priceHistory?: ProductPriceHistory[];

  locationHistory?: ProductLocationHistory[];

  // ===================================
  // Timestamps
  // ===================================

  createdAt: Date;

  updatedAt: Date;
}