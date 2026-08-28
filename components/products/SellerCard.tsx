"use client";

import Image from "next/image";
import { useState } from "react";

import ContactSellerButton from "@/components/chat/ContactSellerButton";
import CallSellerModal from "@/components/products/CallSellerModal";

import {
  BadgeCheck,
  ShieldCheck,
  Phone,
  BarChart3,
} from "lucide-react";

// =====================================================
// Seller Badge
// =====================================================

interface SellerBadge {
  badge?: string;
  type?: string;
  label?: string;
  name?: string;
  eligible?: boolean;
}

// =====================================================
// Seller Card Props
// =====================================================

interface SellerCardProps {
  seller: any;
  productId: string;
  productTitle: string;

  sellerStats: {
    activeAds: number;
    totalViews: number;
  };
}

// =====================================================
// Seller Card
// =====================================================

export default function SellerCard({
  seller,
  productId,
  productTitle,
  sellerStats,
}: SellerCardProps) {
  const [showCallModal, setShowCallModal] =
    useState(false);

  // ===================================================
  // SELLER BASIC DATA
  // ===================================================

  const phoneNumber =
    seller.phone?.replace(/\D/g, "") ?? "";

  // ===================================================
  // VERIFICATION STATUS
  // ===================================================

  const verificationStatus =
    seller.verificationStatus ??
    seller.sellerVerificationStatus ??
    seller.sellerVerification?.status ??
    "unverified";

  // ===================================================
  // PHONE VERIFIED
  //
  // Phone verification is an independent badge.
  // ===================================================

  const phoneVerified =
    seller.phoneVerified === true ||
    seller.sellerPhoneVerified === true ||
    seller.sellerIsPhoneVerified === true ||
    seller.isPhoneVerified === true ||
    seller.sellerVerification?.phoneVerified === true;

  // ===================================================
  // SELLER BADGE
  //
  // Backend is the SINGLE SOURCE OF TRUTH.
  //
  // Possible values:
  //
  // none
  // verified
  // trusted
  //
  // IMPORTANT:
  //
  // Frontend does NOT calculate trust eligibility.
  // ===================================================

  const rawSellerBadge =
    seller.sellerBadge ??
    seller.badge ??
    null;

  // ===================================================
  // NORMALIZE BADGE TYPE
  // ===================================================

  const sellerBadgeType =
    typeof rawSellerBadge === "string"
      ? rawSellerBadge
      : (
          rawSellerBadge?.badge ??
          rawSellerBadge?.type ??
          "none"
        );

  // ===================================================
  // FINAL BADGE STATE
  //
  // IMPORTANT:
  //
  // We display THREE independent badges:
  //
  // 1. Phone Verified
  // 2. Verified Seller
  // 3. Trusted Seller
  //
  // Trusted Seller does NOT replace
  // Verified Seller.
  //
  // Backend Trusted Seller requires a
  // fully Verified Seller.
  //
  // Therefore:
  //
  // trusted
  //   -> Verified Seller + Trusted Seller
  //
  // verified
  //   -> Verified Seller
  //
  // none
  //   -> no seller verification badge
  // ===================================================

  const showTrustedSeller =
    sellerBadgeType === "trusted";

  const showVerifiedSeller =
    sellerBadgeType === "verified" ||
    sellerBadgeType === "trusted";

  const hasSellerBadge =
    showVerifiedSeller ||
    showTrustedSeller;

  // ===================================================
  // WHATSAPP MESSAGE
  // ===================================================

  const whatsappMessage =
    encodeURIComponent(
      `Hi ${seller.name},

I'm interested in your product.

📦 Product: ${productTitle}

Is it still available?

Thank you.`,
    );

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <div
      className="
        mt-10
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      {/* =================================================
          TITLE
      ================================================= */}

      <h2
        className="
          mb-6
          text-xl
          font-bold
          text-slate-900
          dark:text-white
        "
      >
        Seller Information
      </h2>

      {/* =================================================
          SELLER INFO
      ================================================= */}

      <div className="flex items-center gap-4">
        <Image
          src={
            seller.image ||
            "/avatar/male avatar.avif"
          }
          alt={
            seller.name ||
            "Seller"
          }
          width={72}
          height={72}
          className="
            h-[72px]
            w-[72px]
            shrink-0
            rounded-full
            border
            border-slate-200
            object-cover
            dark:border-slate-700
          "
        />

        <div className="min-w-0 flex-1">
          {/* NAME */}

          <h3
            className="
              truncate
              text-lg
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            {seller.name}
          </h3>

          {/* PHONE */}

          <p
            className="
              mt-1
              flex
              items-center
              gap-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            <Phone size={14} />

            {seller.phone ||
              "Phone not available"}
          </p>

          {/* LOCATION */}

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            📍 {seller.address?.city || ""}

            {seller.address?.district
              ? `, ${seller.address.district}`
              : ""}

            {seller.address?.state
              ? `, ${seller.address.state}`
              : ""}
          </p>

          {/* MEMBER SINCE */}

          {seller.createdAt && (
            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Member Since{" "}
              {new Date(
                seller.createdAt,
              ).toLocaleDateString(
                "en-IN",
                {
                  month: "long",
                  year: "numeric",
                },
              )}
            </p>
          )}
        </div>
      </div>

      {/* =================================================
          SELLER BADGES
          
          THREE POSSIBLE BADGES:
          
          Phone Verified
          Verified Seller
          Trusted Seller
      ================================================= */}

      {(hasSellerBadge ||
        phoneVerified) && (
        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          {/* =================================================
              VERIFIED SELLER

              If backend says:
              sellerBadge = verified
              OR
              sellerBadge = trusted

              Verified Seller is shown.
          ================================================= */}

          {showVerifiedSeller && (
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-200
                bg-gradient-to-r
                from-emerald-50
                via-teal-50
                to-cyan-50
                px-3.5
                py-1.5
                text-xs
                font-bold
                tracking-wide
                text-emerald-700
                shadow-sm
                shadow-emerald-100
                transition-all
                duration-200
                hover:shadow-md
                dark:border-emerald-800
                dark:from-emerald-950/50
                dark:via-teal-950/50
                dark:to-cyan-950/50
                dark:text-emerald-300
                dark:shadow-none
              "
            >
              <span
                className="
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-emerald-500
                  to-teal-600
                  text-white
                  shadow-sm
                "
              >
                <BadgeCheck
                  size={13}
                  strokeWidth={2.7}
                />
              </span>

              <span>
                Verified Seller
              </span>
            </span>
          )}

          {/* =================================================
              TRUSTED SELLER

              If backend says:
              sellerBadge = trusted

              Trusted Seller is shown IN ADDITION
              to Verified Seller.
          ================================================= */}

          {showTrustedSeller && (
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-amber-200
                bg-gradient-to-r
                from-amber-50
                via-yellow-50
                to-orange-50
                px-3.5
                py-1.5
                text-xs
                font-bold
                tracking-wide
                text-amber-700
                shadow-sm
                shadow-amber-100
                transition-all
                duration-200
                hover:shadow-md
                dark:border-amber-800
                dark:from-amber-950/50
                dark:via-yellow-950/50
                dark:to-orange-950/50
                dark:text-amber-300
                dark:shadow-none
              "
            >
              <span
                className="
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-amber-500
                  to-orange-600
                  text-white
                  shadow-sm
                "
              >
                <ShieldCheck
                  size={13}
                  strokeWidth={2.7}
                />
              </span>

              <span>
                Trusted Seller
              </span>
            </span>
          )}

          {/* =================================================
              PHONE VERIFIED

              Completely independent from seller badges.
          ================================================= */}

          {phoneVerified && (
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-blue-200
                bg-blue-50
                px-3
                py-1.5
                text-xs
                font-semibold
                text-blue-700
                shadow-sm
                dark:border-blue-800
                dark:bg-blue-950/30
                dark:text-blue-300
              "
            >
              <Phone size={14} />

              Phone Verified
            </span>
          )}
        </div>
      )}

      {/* =================================================
          TRUST INFORMATION

          Only Trusted Sellers receive this section.
      ================================================= */}

      {showTrustedSeller && (
        <div
          className="
            mt-4
            rounded-2xl
            border
            border-amber-200
            bg-amber-50
            p-3
            dark:border-amber-900
            dark:bg-amber-950/20
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <ShieldCheck
                size={18}
                className="
                  text-amber-600
                  dark:text-amber-400
                "
              />

              <span
                className="
                  text-sm
                  font-semibold
                  text-amber-800
                  dark:text-amber-400
                "
              >
                Trusted Seller
              </span>
            </div>

            {/* TRUST SCORE */}

            {Number.isFinite(
              Number(
                seller.trustScore ??
                  seller.sellerTrustScore,
              ),
            ) && (
              <span
                className="
                  text-sm
                  font-bold
                  text-amber-700
                  dark:text-amber-400
                "
              >
                {Number(
                  seller.trustScore ??
                    seller.sellerTrustScore ??
                    0,
                )}
                /100
              </span>
            )}
          </div>

          <p
            className="
              mt-1
              text-xs
              text-amber-700
              dark:text-amber-500
            "
          >
            This seller has earned a high
            trust score based on verification,
            activity and marketplace behaviour.
          </p>
        </div>
      )}

      {/* =================================================
          SELLER STATISTICS
      ================================================= */}

      <div
        className="
          mt-6
          rounded-2xl
          border
          border-slate-200
          bg-slate-50
          p-4
          dark:border-slate-700
          dark:bg-slate-800
        "
      >
        <h3
          className="
            mb-4
            flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-slate-900
            dark:text-white
          "
        >
          <BarChart3 size={16} />

          Seller Statistics
        </h3>

        <div className="space-y-3">
          {/* ACTIVE ADS */}

          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <span
              className="
                text-sm
                text-slate-600
                dark:text-slate-400
              "
            >
              Active Ads
            </span>

            <span
              className="
                rounded-full
                bg-blue-100
                px-3
                py-1
                text-sm
                font-bold
                text-blue-700
              "
            >
              {sellerStats.activeAds}
            </span>
          </div>

          {/* TOTAL VIEWS */}

          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <span
              className="
                text-sm
                text-slate-600
                dark:text-slate-400
              "
            >
              Total Views
            </span>

            <span
              className="
                rounded-full
                bg-orange-100
                px-3
                py-1
                text-sm
                font-bold
                text-orange-700
              "
            >
              {sellerStats.totalViews.toLocaleString(
                "en-IN",
              )}
            </span>
          </div>
        </div>
      </div>

      {/* =================================================
          BUTTONS
      ================================================= */}

      <div className="mt-8 space-y-3">
        {/* CHAT */}

        <ContactSellerButton
          productId={productId}
          sellerId={seller._id}
        />

        {/* CALL */}

        <button
          type="button"
          onClick={() =>
            setShowCallModal(true)
          }
          className="
            flex
            h-12
            w-full
            items-center
            justify-center
            rounded-xl
            bg-green-600
            font-semibold
            text-white
            transition-all
            duration-300
            hover:scale-[1.02]
            hover:bg-green-700
            active:scale-95
          "
        >
          📞 Call Seller
        </button>

        {/* WHATSAPP */}

        <a
          href={
            phoneNumber
              ? `https://wa.me/91${phoneNumber}?text=${whatsappMessage}`
              : "#"
          }
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            if (!phoneNumber) {
              event.preventDefault();

              alert(
                "Seller phone number is not available.",
              );
            }
          }}
          className="
            flex
            h-12
            w-full
            items-center
            justify-center
            rounded-xl
            bg-[#25D366]
            font-semibold
            text-white
            transition-all
            duration-300
            hover:scale-[1.02]
            hover:opacity-90
            active:scale-95
          "
        >
          🟢 WhatsApp Seller
        </a>
      </div>

      {/* =================================================
          CALL MODAL
      ================================================= */}

      <CallSellerModal
        open={showCallModal}
        onClose={() =>
          setShowCallModal(false)
        }
        sellerName={seller.name}
        phoneNumber={phoneNumber}
      />
    </div>
  );
}