import { notFound } from "next/navigation";

import PublicSellerHeader from "@/components/profile/PublicSellerHeader";
import ProductCard from "@/components/products/ProductCard";

import { serialize } from "@/lib/utils/serialize";

import {
  findUserById,
} from "@/lib/repositories/user.repository";

import {
  findActiveProductsBySeller,
} from "@/lib/repositories/product.repository";

import {
  getSellerBadge,
  type SellerVerificationStatus,
} from "@/lib/risk/sellerTrust";

// =====================================================
// Page Props
// =====================================================

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

// =====================================================
// Seller Trust Level
// =====================================================

type SellerTrustLevel =
  | "low"
  | "basic"
  | "trusted"
  | "highly_trusted";

// =====================================================
// Seller Profile Page
// =====================================================

export default async function SellerProfilePage({
  params,
}: PageProps) {
  // ===================================================
  // Params
  // ===================================================

  const { userId } = await params;

  // ===================================================
  // Find Seller
  // ===================================================

  const rawSeller =
    await findUserById(userId);

  if (!rawSeller) {
    notFound();
  }

  // ===================================================
  // Find Active Products
  // ===================================================

  const rawProducts =
    await findActiveProductsBySeller(
      userId,
    );

  // ===================================================
  // Serialize MongoDB Data
  // ===================================================

  const serializedSeller =
    serialize(rawSeller) as any;

  const products =
    serialize(rawProducts);

  // ===================================================
  // Seller Verification Status
  //
  // This is the FINAL admin approval status.
  //
  // Possible values:
  //
  // unverified
  // pending
  // verified
  // rejected
  // suspended
  // ===================================================

  const verificationStatus: SellerVerificationStatus =
    serializedSeller.sellerVerification
      ?.status ?? "unverified";

  // ===================================================
  // Phone Verification
  // ===================================================

  const phoneVerified =
    Boolean(
      serializedSeller.isPhoneVerified ||
        serializedSeller.sellerVerification
          ?.phoneVerified,
    );

  // ===================================================
  // Identity Verification
  //
  // Aadhaar verification
  // ===================================================

  const identityVerified =
    Boolean(
      serializedSeller.sellerVerification
        ?.identityVerified,
    );

  // ===================================================
  // Location Verification
  //
  // Support both possible database structures.
  // ===================================================

  const locationVerified =
    Boolean(
      serializedSeller.locationVerified ||
        serializedSeller.sellerVerification
          ?.locationVerified,
    );

  // ===================================================
  // Trust Score
  // ===================================================

  const trustScore =
    Number(
      serializedSeller.trustScore ?? 0,
    );

  // ===================================================
  // Trust Level
  // ===================================================

  const trustLevel: SellerTrustLevel =
    serializedSeller.trustLevel ===
      "highly_trusted"
      ? "highly_trusted"
      : serializedSeller.trustLevel ===
          "trusted"
        ? "trusted"
        : serializedSeller.trustLevel ===
            "basic"
          ? "basic"
          : "low";

  // ===================================================
  // Serious Bad History
  //
  // Temporary:
  // Reports system will be connected here later.
  // ===================================================

  const hasSeriousBadHistory =
    false;

  // ===================================================
  // Calculate Seller Badge
  // ===================================================

  const badge =
    getSellerBadge({
      verificationStatus,

      phoneVerified,

      identityVerified,

      locationVerified,

      trustScore,

      trustLevel,

      hasSeriousBadHistory,
    });

  // ===================================================
  // Public Seller Object
  // ===================================================

  const seller = {
    _id:
      String(
        serializedSeller._id,
      ),

    name:
      serializedSeller.name,

    image:
      serializedSeller.image,

    isVerified:
      Boolean(
        serializedSeller.isVerified,
      ),

    createdAt:
      serializedSeller.createdAt,

    address:
      serializedSeller.address,

    // =================================================
    // Verification
    // =================================================

    verificationStatus,

    phoneVerified,

    identityVerified,

    locationVerified,

    // =================================================
    // Trust
    // =================================================

    trustScore,

    trustLevel,

    // =================================================
    // Badge
    // =================================================

    badge,
  };

  // ===================================================
  // Render
  // ===================================================

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">

      {/* =================================================
          Seller Header
          ================================================= */}

      <PublicSellerHeader
        seller={seller}
        totalProducts={
          products.length
        }
      />

      {/* =================================================
          Active Listings
          ================================================= */}

      <section className="mt-10">

        <h2 className="mb-6 text-2xl font-bold">
          Active Listings (
          {products.length}
          )
        </h2>

        {/* =================================================
            No Products
            ================================================= */}

        {products.length === 0 ? (

          <div className="rounded-2xl border border-dashed p-10 text-center">

            <h3 className="text-lg font-semibold">
              No Active Listings
            </h3>

            <p className="mt-2 text-slate-500">
              This seller has no active products.
            </p>

          </div>

        ) : (

          /* =================================================
             Product Grid
             ================================================= */

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {products.map(
              (product: any) => (

                <ProductCard
                  key={String(
                    product._id,
                  )}
                  product={product}
                />

              ),
            )}

          </div>

        )}

      </section>

    </main>
  );
}