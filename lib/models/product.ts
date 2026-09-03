import { ObjectId } from "mongodb";

// =====================================
// Product Condition
// =====================================

export type ProductCondition = "new" | "used" | "refurbished";

// =====================================
// Product Status
// =====================================

export type ProductStatus = "draft" | "active" | "sold" | "expired" | "blocked";

// =====================================
// Product Image
// =====================================

export interface ProductImage {
  publicId: string;
  url: string;

  /**
   * Exact SHA-256 fingerprint of the
   * originally uploaded image file.
   *
   * Optional for backward compatibility
   * with existing products.
   */
  imageHash?: string;
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
  previousPrice?: number;
  changedAt: Date;
  changedBy?: string;
  changedByName?: string;
}

// =====================================
// Product Location History
// =====================================

export interface ProductLocationHistory {
  city: string;
  district: string;
  state: string;
  pincode: string;
  address?: string;

  coordinates: {
    lat: number;
    lng: number;
  };

  previousLocation?: {
    country?: string;
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
    address?: string;

    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  country?: string;

  changedAt: Date;

  changedBy?: string;

  changedByName?: string;
}

// =====================================
// Product Location Verification
// =====================================

export interface ProductLocationVerification {
  // ===================================
  // Seller Live GPS
  //
  // Optional because the seller can
  // select the product location
  // manually on the map.
  // ===================================

  sellerLatitude: number | null;

  sellerLongitude: number | null;

  // ===================================
  // Product Location
  // ===================================

  productLatitude: number;

  productLongitude: number;

  // ===================================
  // Distance
  //
  // null when seller live GPS is
  // not available.
  // ===================================

  distanceKm: number | null;

  // ===================================
  // GPS Accuracy
  //
  // null when seller live GPS is
  // not available.
  // ===================================

  accuracy: number | null;

  // ===================================
  // Location Status
  // ===================================

  status: "nearby" | "different" | "far" | "unverified";

  // ===================================
  // Verification Method
  // ===================================

  method: "device-gps" | "mobile-qr" | "seller-profile" | "map";

  // ===================================
  // Timestamp
  // ===================================

  capturedAt: Date;
}

// =====================================
// Product Risk Status
// =====================================

export type ProductRiskStatus = "low" | "watch" | "review" | "high";

// =====================================
// Product Risk Flag
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

  // Featured Ad
  //
  // Featured is a product-level promotion.
  // It has its own activation and expiry time.

  isFeatured: boolean;

  featuredAt?: Date;

  featuredUntil?: Date;

  // Premium Seller product flag

  isPremium: boolean;

  // Boost Ad
  //
  // Boost is independent from Featured
  // and Premium Seller.

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
