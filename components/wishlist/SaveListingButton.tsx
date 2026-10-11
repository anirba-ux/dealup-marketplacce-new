
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

type ListingType = "job" | "service" | "business";

interface SaveListingButtonProps {
  listingId: string;
  listingType: ListingType;
}

const SAVED_LISTINGS_EVENT = "dealup:saved-listings-updated";

export default function SaveListingButton({
  listingId,
  listingType,
}: SaveListingButtonProps) {
  const router = useRouter();

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSavedStatus = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/saved-listings?type=${listingType}&listingId=${encodeURIComponent(listingId)}`,
        {
          cache: "no-store",
        },
      );

      if (response.status === 401) {
        setSaved(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load saved listing status");
      }

      const data = await response.json();
      setSaved(Boolean(data.saved));
    } catch (error) {
      console.error("Unable to load saved listing status:", error);
    } finally {
      setLoading(false);
    }
  }, [listingId, listingType]);

  useEffect(() => {
    let cancelled = false;

    async function initialise() {
      try {
        const response = await fetch(
          `/api/saved-listings?type=${listingType}&listingId=${encodeURIComponent(listingId)}`,
          { cache: "no-store" },
        );

        if (response.status === 401) {
          if (!cancelled) setSaved(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load saved listing status");
        }

        const data = await response.json();

        if (!cancelled) {
          setSaved(Boolean(data.saved));
        }
      } catch (error) {
        console.error("Unable to load saved listing status:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initialise();

    return () => {
      cancelled = true;
    };
  }, [listingId, listingType]);

  async function handleSave() {
    if (saving || loading) return;

    setSaving(true);

    try {
      const nextSavedState = !saved;

      const response = await fetch("/api/saved-listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingType,
          listingId,
          saved: nextSavedState,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        window.alert(
          data.message || "Unable to update saved listing.",
        );
        return;
      }

      setSaved(Boolean(data.saved));

      // Refresh the navbar's combined saved-listing count.
      window.dispatchEvent(new Event(SAVED_LISTINGS_EVENT));
    } catch (error) {
      console.error("Unable to update saved listing:", error);
      window.alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void handleSave();
      }}
      disabled={loading || saving}
      aria-label={saved ? "Remove from saved listings" : "Save listing"}
      aria-pressed={saved}
      title={saved ? "Remove from saved listings" : "Save listing"}
      className="
        inline-flex h-10 w-10 items-center justify-center
        rounded-full border border-slate-200 bg-white/95
        text-slate-600 shadow-md backdrop-blur-sm
        transition hover:scale-105 hover:text-rose-600
        disabled:cursor-not-allowed disabled:opacity-60
        dark:border-slate-700 dark:bg-slate-900/95
        dark:text-slate-300 dark:hover:text-rose-400
      "
    >
      <Heart
        size={19}
        className={
          saved
            ? "fill-rose-500 text-rose-500"
            : "text-current"
        }
      />
    </button>
  );
}
