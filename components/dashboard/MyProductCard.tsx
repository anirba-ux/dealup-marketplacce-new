"use client";

import Image from "next/image";

import { useRouter } from "next/navigation";

import { useState } from "react";

import Link from "next/link";

import type { ProductStatus } from "@/lib/models/product";

import {
  Eye,
  Heart,
  Pencil,
  Trash2,
  MapPin,
  MessageCircle,
  Rocket,
} from "lucide-react";

interface MyProductCardProps {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  location: string;
  views: number;
  favorites: number;
  status: ProductStatus;
  chatCount: number;

  isBoosted?: boolean;
  boostedUntil?: Date | string;
}

export default function MyProductCard({
  id,
  slug,
  title,
  price,
  image,
  location,
  views,
  favorites,
  status,
  chatCount,
  isBoosted,
  boostedUntil,
}: MyProductCardProps) {
  const statusColor: Record<ProductStatus, string> = {
    draft: "bg-slate-500",
    active: "bg-green-500",
    sold: "bg-gray-500",
    expired: "bg-orange-500",
    blocked: "bg-red-500",
  };

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert("✅ Product deleted successfully.");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert("❌ Failed to delete product.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkSold() {
    const confirmed = window.confirm(
      "Are you sure you want to mark this product as sold?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert("✅ Product marked as sold.");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert("❌ Failed to mark product as sold.");
    } finally {
      setLoading(false);
    }
  }
  async function handleBoost() {
    try {
      setLoading(true);

      const res = await fetch(`/api/products/${id}/boost`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      alert("⭐ Product boosted successfully.");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert("❌ Failed to boost product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      {/* Image */}

      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width:768px)100vw,(max-width:1200px)50vw,33vw"
          className="object-cover transition duration-500 hover:scale-110"
        />

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold text-white ${
            statusColor[status]
          }`}
        >
          {status}
        </span>
        {isBoosted && (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900 dark:text-white dark:text-white shadow-lg">
            <Rocket size={12} />
            <span>BOOSTED</span>
          </div>
        )}
      </div>

      {/* Content */}

      <div className="space-y-4 p-5">
        <h2 className="line-clamp-2 text-xl font-bold text-slate-900 dark:text-white dark:text-white">
          {title}
        </h2>

        <p className="text-3xl font-extrabold text-[#1565d8]">
          ₹{price.toLocaleString("en-IN")}
        </p>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <MapPin size={18} />

          <span>{location}</span>
        </div>
        {/* Statistics */}

        <div className="grid grid-cols-3 gap-4 rounded-2xl bg-slate-50 p-4">
          {/* Views */}
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-[#1565d8]" />

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Views</p>
              <p className="font-bold text-slate-900 dark:text-white dark:text-white">{views}</p>
            </div>
          </div>

          {/* Favorites */}
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-red-500" />

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Favorites</p>
              <p className="font-bold text-slate-900 dark:text-white dark:text-white">{favorites}</p>
            </div>
          </div>

          {/* Chats */}
          <Link
            href="/messages"
            className="flex items-center gap-2 rounded-lg transition hover:bg-slate-100"
          >
            <MessageCircle size={18} className="text-green-600" />

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Chats</p>

              <p className="font-bold text-slate-900 dark:text-white dark:text-white">{chatCount}</p>
            </div>
          </Link>
        </div>

        {/* Actions */}

        <div className="grid grid-cols-3 gap-3">
          <Link
            href={`/products/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-xl border border-slate-300 bg-[var(--secondary)] py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#1565d8]"
          >
            View
          </Link>

          {status === "active" ? (
            <>
              <Link
                href={`/dashboard/my-ads/${id}/edit`}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] py-3 text-sm font-semibold text-white transition hover:bg-[#0f52ba]"
              >
                <Pencil size={16} />
                Edit
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                {loading ? "Deleting..." : "Delete"}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center rounded-xl bg-slate-200 py-3 text-sm font-semibold text-slate-600">
                ✔ SOLD
              </div>

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </>
          )}
        </div>

        {status === "active" && (
          <div className="mt-3 space-y-3">
            {/* Mark Sold Button */}

            <button
              type="button"
              onClick={handleMarkSold}
              disabled={loading}
              className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              ✔ Mark Sold
            </button>

            {/* Boost Section */}

            {isBoosted ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
                <p className="font-semibold text-amber-700">🚀 Boost Active</p>

                <p className="mt-2 text-sm text-slate-600">Active until</p>

                <p className="font-bold text-slate-800">
                  {boostedUntil
                    ? new Date(boostedUntil).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "--"}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleBoost}
                disabled={loading}
                className="w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                {loading ? "Boosting..." : "🚀 Boost Ad"}
              </button>
            )}
          </div>
        )}

        {status === "sold" && (
          <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4 text-center">
            <p className="font-semibold text-green-700">
              ✅ This product has been sold
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Buyers can no longer contact you for this product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
