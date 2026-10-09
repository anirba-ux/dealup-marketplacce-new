
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import {
  Eye,
  MapPin,
  MessageCircle,
  Pencil,
  Trash2,
  Wrench,
  Building2,
  Zap,
  Star,
  LoaderCircle,
  Clock3,
  ExternalLink,
} from "lucide-react";

export interface MyService {
  _id: string;
  title: string;
  slug: string;
  listingType: "service" | "business";
  category: string;
  subcategory: string;
  description: string;
  status: "draft" | "active" | "paused" | "expired" | "blocked";
  thumbnail?: string;
  location: {
    city?: string;
    district?: string;
    state?: string;
  };
  startingPrice?: number;
  priceUnit?: string;
  priceOnRequest?: boolean;
  views?: number;
  enquiries?: number;
  createdAt?: string;
  isFeatured?: boolean;
  isBoosted?: boolean;
  featuredUntil?: string;
  boostedUntil?: string;
}

interface MyServiceCardProps {
  service: MyService;
}

type PromotionAction = "boost" | "feature";

interface ApiResponse {
  success?: boolean;
  message?: string;
  paymentRequired?: boolean;
  paymentType?: "BOOST_AD" | "FEATURED_AD";
  price?: number;
  durationDays?: number;
  paymentSessionId?: string;
  environment?: string;
}

export default function MyServiceCard({
  service,
}: MyServiceCardProps) {
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);
  const [promotionAction, setPromotionAction] =
    useState<PromotionAction | null>(null);
  const [error, setError] = useState("");

  const isActive = service.status === "active";
  const isBusy = deleting || promotionAction !== null;

  const viewHref = `/services/${service.slug || service._id}`;
  const editHref = `/dashboard/my-services/${service._id}/edit`;

  const isFeatured =
    service.isFeatured === true &&
    (!service.featuredUntil ||
      new Date(service.featuredUntil).getTime() > Date.now());

  const isBoosted =
    service.isBoosted === true &&
    (!service.boostedUntil ||
      new Date(service.boostedUntil).getTime() > Date.now());

  const locationText = [
    service.location?.city,
    service.location?.district,
    service.location?.state,
  ]
    .filter(Boolean)
    .join(", ");

  const formattedPrice =
    service.priceOnRequest || service.startingPrice == null
      ? "Price on request"
      : `₹${service.startingPrice.toLocaleString("en-IN")}${
          service.priceUnit ? ` / ${service.priceUnit}` : ""
        }`;

  async function readResponse(
    response: Response,
  ): Promise<ApiResponse> {
    return response.json().catch(() => ({}));
  }

  async function openCashfreeCheckout(
    type: "BOOST_AD" | "FEATURED_AD",
  ) {
    const orderResponse = await fetch(
      "/api/payment/cashfree/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          serviceId: service._id,
        }),
      },
    );

    const orderData = await readResponse(orderResponse);

    if (!orderResponse.ok || !orderData.success) {
      throw new Error(
        orderData.message ||
          "Unable to create the payment order. Please try again.",
      );
    }

    if (!orderData.paymentSessionId) {
      throw new Error(
        "Cashfree payment session was not created. Please try again.",
      );
    }

    const cashfree = await load({
      mode:
        orderData.environment === "PRODUCTION"
          ? "production"
          : "sandbox",
    });

    if (!cashfree) {
      throw new Error(
        "Unable to load Cashfree Checkout. Please refresh and try again.",
      );
    }

    const result = await cashfree.checkout({
      paymentSessionId: orderData.paymentSessionId,
      redirectTarget: "_self",
    });

    if (result?.error) {
      throw new Error(
        result.error.message ||
          "Cashfree payment could not be completed.",
      );
    }
  }

  async function handlePromotion(action: PromotionAction) {
    if (!isActive || isBusy) return;

    setError("");
    setPromotionAction(action);

    const isBoost = action === "boost";
    const endpoint = isBoost
      ? `/api/services/${service._id}/boost`
      : `/api/services/${service._id}/feature`;

    const method = isBoost ? "PATCH" : "POST";
    const paymentType = isBoost ? "BOOST_AD" : "FEATURED_AD";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await readResponse(response);

      if (response.ok && data.success && !data.paymentRequired) {
        router.refresh();
        return;
      }

      if (
        response.status === 402 &&
        data.paymentRequired === true
      ) {
        const promotionName = isBoost ? "Boost" : "Featured";
        const priceText =
          typeof data.price === "number"
            ? `₹${data.price}`
            : "the applicable price";
        const durationText =
          typeof data.durationDays === "number"
            ? ` for ${data.durationDays} days`
            : "";

        const confirmed = window.confirm(
          `${promotionName} this service for ${priceText}${durationText}?\n\nYou will be redirected to Cashfree Checkout.`,
        );

        if (!confirmed) return;

        await openCashfreeCheckout(paymentType);
        return;
      }

      throw new Error(
        data.message ||
          `Unable to ${isBoost ? "boost" : "feature"} this service.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPromotionAction(null);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");
    setDeleting(true);

    try {
      const response = await fetch(
        `/api/services/${service._id}`,
        { method: "DELETE" },
      );

      const data = await readResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete this service.",
        );
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this service.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="w-full max-w-[355px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* Image and status badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {service.thumbnail ? (
          <Image
            src={service.thumbnail}
            alt={service.title}
            fill
            sizes="(max-width: 640px) 100vw, 355px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            {service.listingType === "business" ? (
              <Building2 size={48} strokeWidth={1.5} />
            ) : (
              <Wrench size={48} strokeWidth={1.5} />
            )}
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white ${
              isActive ? "bg-emerald-500" : "bg-slate-600"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {service.status.toUpperCase()}
          </span>

          {isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
              <Star size={12} fill="currentColor" />
              FEATURED
            </span>
          )}

          {isBoosted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
              <Zap size={12} fill="currentColor" />
              BOOSTED
            </span>
          )}
        </div>
      </div>

      {/* Service details */}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {service.listingType === "business" ? "Business" : "Service"}
          </span>

          {service.category && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {service.category}
            </span>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-900 dark:text-white">
          {service.title}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600 dark:text-slate-300">
          {service.description || "No description provided."}
        </p>

        <p className="mt-4 text-2xl font-extrabold text-[#1565d8]">
          {formattedPrice}
        </p>

        {locationText && (
          <div className="mt-3 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span>{locationText}</span>
          </div>
        )}

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
          <div className="flex items-center justify-center gap-2 border-r border-slate-200 px-2 py-3 dark:border-slate-700">
            <Eye size={16} className="text-[#1565d8]" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Views
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {service.views ?? 0}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 px-2 py-3">
            <MessageCircle size={16} className="text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enquiries
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {service.enquiries ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Promotion expiry */}
        {(isFeatured || isBoosted) && (
          <div className="mt-3 space-y-1">
            {isFeatured && service.featuredUntil && (
              <p className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                <Clock3 size={13} />
                Featured until{" "}
                {new Date(service.featuredUntil).toLocaleDateString("en-IN")}
              </p>
            )}

            {isBoosted && service.boostedUntil && (
              <p className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400">
                <Clock3 size={13} />
                Boosted until{" "}
                {new Date(service.boostedUntil).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            {error}
          </p>
        )}

        {/* View, Edit and Delete */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Link
            href={viewHref}
            className="inline-flex min-w-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-2 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <ExternalLink size={14} />
            View
          </Link>

          <Link
            href={editHref}
            className="inline-flex min-w-0 items-center justify-center gap-1 rounded-xl bg-[#1565d8] px-2 py-3 text-sm font-semibold text-white transition hover:bg-[#0f52ba]"
          >
            <Pencil size={14} />
            Edit
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isBusy}
            className="inline-flex min-w-0 items-center justify-center gap-1 rounded-xl bg-red-500 px-2 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {deleting ? "Wait" : "Delete"}
          </button>
        </div>

        {/* Boost button */}
        {isActive && (
          <button
            type="button"
            onClick={() => handlePromotion("boost")}
            disabled={isBusy || isBoosted}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {promotionAction === "boost" ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}
            {promotionAction === "boost"
              ? "Processing..."
              : isBoosted
                ? "Boost Active"
                : "Boost This Service"}
          </button>
        )}

        {/* Featured button */}
        {isActive && (
          <button
            type="button"
            onClick={() => handlePromotion("feature")}
            disabled={isBusy || isFeatured}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {promotionAction === "feature" ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Star size={16} fill="currentColor" />
            )}
            {promotionAction === "feature"
              ? "Processing..."
              : isFeatured
                ? "Featured Active"
                : "Feature This Service"}
          </button>
        )}
      </div>
    </article>
  );
}
