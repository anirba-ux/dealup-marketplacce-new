
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ContactSellerButtonProps {
  productId: string;
  sellerId: string;
  listingType?: "product" | "service" | "business";
}

export default function ContactSellerButton({
  productId,
  sellerId,
  listingType = "product",
}: ContactSellerButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleContactSeller() {
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          sellerId,
          listingType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create conversation");
        return;
      }

      if (!data._id) {
        alert("Conversation could not be opened. Please try again.");
        return;
      }

      router.push(`/messages/${data._id}`);
    } catch (error) {
      console.error("Contact seller error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleContactSeller}
      disabled={loading}
      className="rounded-2xl bg-[#1565d8] px-8 py-4 font-semibold text-white transition hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Opening chat..." : "💬 Chat on DealUp"}
    </button>
  );
}
