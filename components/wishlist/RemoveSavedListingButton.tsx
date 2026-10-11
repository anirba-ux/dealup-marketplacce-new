"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartOff, LoaderCircle } from "lucide-react";

type ListingType = "job" | "service" | "business";

interface RemoveSavedListingButtonProps {
  listingId: string;
  listingType: ListingType;
}

export default function RemoveSavedListingButton({
  listingId,
  listingType,
}: RemoveSavedListingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/saved-listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingType,
          listingId,
          saved: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.message || "Unable to remove this saved listing.");
        return;
      }

      window.dispatchEvent(new Event("dealup:saved-listings-updated"));

      router.refresh();

      
    } catch (error) {
      console.error("Remove saved listing error:", error);
      window.alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleRemove()}
      disabled={loading}
      aria-label="Remove from saved listings"
      title="Remove from saved listings"
      className="
        inline-flex items-center justify-center gap-2
        rounded-xl border border-rose-200
        bg-white px-3 py-2 text-sm font-semibold
        text-rose-600 transition hover:bg-rose-50
        disabled:cursor-not-allowed disabled:opacity-60
        dark:border-rose-900 dark:bg-slate-950
        dark:text-rose-400 dark:hover:bg-rose-950/40
      "
    >
      {loading ? (
        <LoaderCircle size={16} className="animate-spin" />
      ) : (
        <HeartOff size={16} />
      )}

      {loading ? "Removing..." : "Remove"}
    </button>
  );
}
