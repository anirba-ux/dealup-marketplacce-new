"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ContactSellerButton from "@/components/chat/ContactSellerButton";
import CallSellerModal from "@/components/products/CallSellerModal";
import { BadgeCheck, ShieldCheck, Zap, Award } from "lucide-react";

interface SellerCardProps {
  seller: any;
  productId: string;
  productTitle: string;

  sellerStats: {
    activeAds: number;
    totalViews: number;
  };
}

const badgeConfig: Record<
  string,
  {
    icon: any;
    className: string;
  }
> = {
  "Verified Seller": {
    icon: BadgeCheck,
    className: "bg-green-100 text-green-700 border-green-200",
  },

  "Fast Responder": {
    icon: Zap,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },

  "Trusted Seller": {
    icon: ShieldCheck,
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },

  "Top Seller": {
    icon: Award,
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
};

export default function SellerCard({
  seller,
  productId,
  productTitle,
  sellerStats,
}: SellerCardProps) {
  console.log("Seller Object:", seller);
  console.log("Seller Phone:", seller.phone);

  // Clean Phone Number
  const phoneNumber = seller.phone?.replace(/\D/g, "") || "";

  // ===========================
  // Seller Badges
  // ===========================

  const sellerBadges = [];

  // =====================================================
  // IMPORTANT
  // Do NOT use seller.isVerified here.
  //
  // The old system used:
  // seller.isVerified === true
  //
  // The new system uses the calculated seller badge.
  // =====================================================

  if (seller.badge?.eligible && seller.badge?.badge === "verified") {
    sellerBadges.push({
      label: "Verified Seller",
      color: "border-green-200 bg-green-50 text-green-700",
      icon: "🛡️",
    });
  }

  if (seller.badge?.eligible && seller.badge?.badge === "trusted") {
    sellerBadges.push({
      label: "Trusted Seller",
      color: "border-yellow-200 bg-yellow-50 text-yellow-700",
      icon: "⭐",
    });
  }

  // =====================================================
  // Phone Verification
  // =====================================================

  if (seller.isPhoneVerified) {
    sellerBadges.push({
      label: "Phone Verified",
      color: "border-blue-200 bg-blue-50 text-blue-700",
      icon: "📞",
    });
  }

  const [showCallModal, setShowCallModal] = useState(false);

  // WhatsApp Message
  const whatsappMessage = encodeURIComponent(
    `Hi ${seller.name},

I'm interested in your product.

📦 Product: ${productTitle}

Is it still available?

Thank you.`,
  );

  return (
    <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
        Seller Information
      </h2>

      {/* Seller Info */}

      <div className="flex items-center gap-4">
        <Image
          src={seller.image || "/avatar/male avatar.avif"}
          alt={seller.name}
          width={72}
          height={72}
          className="h-[72px] w-[72px] rounded-full border object-cover"
        />

        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {seller.name}
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            📞 {seller.phone || "Phone not available"}
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            📍 {seller.address?.city}, {seller.address?.district},{" "}
            {seller.address?.state}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Member Since{" "}
            {new Date(seller.createdAt).toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>

          {sellerBadges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {sellerBadges.map((badge) => (
                <div
                  key={badge.label}
                  className={`
          flex items-center gap-1
          rounded-full
          border
          px-3
          py-1.5
          text-xs
          font-semibold
          shadow-sm
          ${badge.color}
        `}
                >
                  <span>{badge.icon}</span>

                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Seller Badges */}
        </div>
      </div>

      {/* Seller Statistics */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          📊 Seller Statistics
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Active Ads
            </span>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
              {sellerStats.activeAds}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Total Views
            </span>

            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
              {sellerStats.totalViews.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}

      <div className="mt-8 space-y-3">
        {/* Chat */}

        <ContactSellerButton productId={productId} sellerId={seller._id} />

        {/* Call */}

        <button
          type="button"
          onClick={() => setShowCallModal(true)}
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

    hover:bg-green-700
    hover:scale-[1.02]

    active:scale-95
  "
        >
          📞 Call Seller
        </button>

        {/* WhatsApp */}

        <a
          href={
            phoneNumber
              ? `https://wa.me/91${phoneNumber}?text=${whatsappMessage}`
              : "#"
          }
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!phoneNumber) {
              e.preventDefault();
              alert("Seller phone number is not available.");
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

      <CallSellerModal
        open={showCallModal}
        onClose={() => setShowCallModal(false)}
        sellerName={seller.name}
        phoneNumber={phoneNumber}
      />
    </div>
  );
}
