"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";

import {
  BriefcaseBusiness,
  Building2,
  Eye,
  Loader2,
  MapPin,
  Pencil,
  Rocket,
  Star,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";

// =====================================================
// TYPES
// =====================================================

type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "temporary"
  | "freelance";

type WorkMode = "on-site" | "hybrid" | "remote";

interface JobPosition {
  title?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  experience?: string;

  salary?: {
    min?: number;
    max?: number;
    period?: "hour" | "day" | "month" | "year";
  };

  vacancies?: number;
}

interface JobEmployer {
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
}

interface JobLocation {
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  address?: string;

  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

interface JobThumbnail {
  publicId?: string;
  url?: string;
}

export interface MyJob {
  _id: string;

  listingType?: "single" | "multiple";

  status?: "draft" | "active" | "expired" | "blocked";

  jobs?: JobPosition[];

  employer?: JobEmployer;

  employerId?: string;

  employerName?: string;

  location?: JobLocation;

  thumbnail?: JobThumbnail;

  infographic?: JobThumbnail;

  views?: number;

  applications?: number;

  featuredAt?: string | Date;

  featuredUntil?: string | Date;

  boostedAt?: string | Date;

  boostedUntil?: string | Date;

  createdAt?: string | Date;

  updatedAt?: string | Date;
}

// =====================================================
// CASHFREE TYPES
// =====================================================

type PromotionPaymentType = "BOOST_AD" | "FEATURED_AD";

interface CashfreeOrderResponse {
  success?: boolean;
  message?: string;

  paymentSessionId?: string;

  environment?: "SANDBOX" | "PRODUCTION";

  orderId?: string;

  paymentId?: string;

  price?: number;

  durationDays?: number;
}

// =====================================================
// HELPERS
// =====================================================

function formatSalary(salary?: JobPosition["salary"]): string {
  if (!salary) {
    return "Salary not specified";
  }

  const min = salary.min ?? 0;
  const max = salary.max;

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);

  let amount = "";

  if (
    max !== undefined &&
    max !== null &&
    max > 0 &&
    max !== min
  ) {
    amount = `₹${formatAmount(min)} - ₹${formatAmount(max)}`;
  } else if (min > 0) {
    amount = `₹${formatAmount(min)}`;
  } else {
    return "Salary not specified";
  }

  const periodMap: Record<
    "hour" | "day" | "month" | "year",
    string
  > = {
    hour: "/hr",
    day: "/day",
    month: "/month",
    year: "/year",
  };

  const period =
    salary.period && periodMap[salary.period]
      ? periodMap[salary.period]
      : "";

  return `${amount}${period}`;
}

function formatEmploymentType(
  value?: EmploymentType,
): string {
  if (!value) {
    return "Job";
  }

  const labels: Record<EmploymentType, string> = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    internship: "Internship",
    temporary: "Temporary",
    freelance: "Freelance",
  };

  return labels[value];
}

function formatWorkMode(value?: WorkMode): string {
  if (!value) {
    return "";
  }

  const labels: Record<WorkMode, string> = {
    "on-site": "On-site",
    hybrid: "Hybrid",
    remote: "Remote",
  };

  return labels[value];
}

function getLocation(location?: JobLocation): string {
  const parts = [
    location?.city,
    location?.district,
    location?.state,
  ].filter(Boolean);

  return parts.join(", ") || "Location not specified";
}

function getTotalVacancies(
  jobs?: JobPosition[],
): number {
  return (
    jobs?.reduce(
      (total, position) =>
        total + Number(position.vacancies ?? 0),
      0,
    ) ?? 0
  );
}

function formatDate(
  value?: string | Date,
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// =====================================================
// CARD PROPS
// =====================================================

interface MyJobCardProps {
  job: MyJob;
}

// =====================================================
// CARD
// =====================================================

export default function MyJobCard({
  job,
}: MyJobCardProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [promotionLoading, setPromotionLoading] =
    useState<"boost" | "feature" | null>(null);

  // ===================================================
  // PRIMARY POSITION
  // ===================================================

  const position = job.jobs?.[0];

  // ===================================================
  // BASIC INFORMATION
  // ===================================================

  const title =
    position?.title?.trim() || "Untitled Job";

  const companyName =
    job.employer?.companyName?.trim() ||
    job.employerName?.trim() ||
    "Company";

  const location = getLocation(job.location);

  const salary = formatSalary(position?.salary);

  const employmentType =
    formatEmploymentType(position?.employmentType);

  const workMode =
    formatWorkMode(position?.workMode);

  const totalVacancies =
    getTotalVacancies(job.jobs);

  const views = job.views ?? 0;

  const applications = job.applications ?? 0;

  // ===================================================
  // IMAGE
  // ===================================================

  const imageUrl =
    job.thumbnail?.url?.trim() ||
    job.infographic?.url?.trim() ||
    "";

  // ===================================================
  // PROMOTION STATUS
  // ===================================================

  const now = new Date();

  const boostedUntilDate = job.boostedUntil
    ? new Date(job.boostedUntil)
    : null;

  const featuredUntilDate = job.featuredUntil
    ? new Date(job.featuredUntil)
    : null;

  const isBoosted = Boolean(
    job.boostedAt &&
      boostedUntilDate &&
      !Number.isNaN(
        boostedUntilDate.getTime(),
      ) &&
      boostedUntilDate.getTime() >
        now.getTime(),
  );

  const isFeatured = Boolean(
    job.featuredAt &&
      featuredUntilDate &&
      !Number.isNaN(
        featuredUntilDate.getTime(),
      ) &&
      featuredUntilDate.getTime() >
        now.getTime(),
  );

  // ===================================================
  // STATUS
  // ===================================================

  const status = job.status ?? "draft";

  const statusColor: Record<
    typeof status,
    string
  > = {
    draft: "bg-slate-500",
    active: "bg-green-500",
    expired: "bg-orange-500",
    blocked: "bg-red-500",
  };

  // ===================================================
  // DELETE
  // ===================================================

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/jobs/${job._id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete job.",
        );
      }

      alert("Job deleted successfully.");

      router.refresh();
    } catch (error) {
      console.error(
        "DELETE JOB ERROR:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete job.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ===================================================
  // CASHFREE CHECKOUT
  // ===================================================

  async function openCashfreeCheckout(
    options: {
      type: PromotionPaymentType;
    },
  ) {
    const orderResponse = await fetch(
      "/api/payment/cashfree/create-order",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          type: options.type,
          jobId: job._id,
        }),
      },
    );

    const orderData =
      (await orderResponse.json()) as CashfreeOrderResponse;

    if (
      !orderResponse.ok ||
      !orderData?.success
    ) {
      throw new Error(
        orderData?.message ||
          "Unable to create Cashfree payment order.",
      );
    }

    const paymentSessionId =
      orderData.paymentSessionId;

    if (!paymentSessionId) {
      throw new Error(
        "Cashfree payment session was not created. Please try again.",
      );
    }

    const cashfree = await load({
      mode:
        orderData.environment ===
        "PRODUCTION"
          ? "production"
          : "sandbox",
    });

    if (!cashfree) {
      throw new Error(
        "Unable to load Cashfree Checkout. Please refresh and try again.",
      );
    }

    const result =
      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });

    if (result?.error) {
      console.error(
        "CASHFREE CHECKOUT ERROR:",
        result.error,
      );

      throw new Error(
        result.error.message ||
          "Cashfree payment could not be completed.",
      );
    }
  }

  // ===================================================
  // BOOST JOB
  // ===================================================

  async function handleBoost() {
    if (promotionLoading !== null) {
      return;
    }

    if (isBoosted) {
      alert(
        "This job is already boosted.",
      );
      return;
    }

    try {
      setPromotionLoading("boost");

      const response = await fetch(
        `/api/jobs/${job._id}/boost`,
        {
          method: "PATCH",
        },
      );

      const data = await response.json();

      // ===============================================
      // PAYMENT REQUIRED
      // ===============================================

      if (response.status === 402) {
        const price = data.price ?? 29;
        const duration =
          data.durationDays ?? 7;

        const confirmed =
          window.confirm(
            data.message ||
              `Payment required: ₹${price} for ${duration} days.\n\nProceed to Cashfree payment?`,
          );

        if (!confirmed) {
          return;
        }

        await openCashfreeCheckout({
          type: "BOOST_AD",
        });

        return;
      }

      // ===============================================
      // ALREADY BOOSTED
      // ===============================================

      if (response.status === 409) {
        alert(
          data.message ||
            "This job is already boosted.",
        );

        router.refresh();

        return;
      }

      // ===============================================
      // OTHER ERROR
      // ===============================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to boost job.",
        );
      }

      // ===============================================
      // FREE BOOST SUCCESS
      // ===============================================

      alert(
        data.message ||
          "Job boosted successfully.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "BOOST JOB ERROR:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to boost job.",
      );
    } finally {
      setPromotionLoading(null);
    }
  }

  // ===================================================
  // FEATURE JOB
  // ===================================================

  async function handleFeature() {
    if (promotionLoading !== null) {
      return;
    }

    if (isFeatured) {
      alert(
        "This job is already featured.",
      );
      return;
    }

    try {
      setPromotionLoading("feature");

      const response = await fetch(
        `/api/jobs/${job._id}/feature`,
        {
          method: "PATCH",
        },
      );

      const data = await response.json();

      // ===============================================
      // PREMIUM REQUIRED
      // ===============================================

      if (response.status === 403) {
        alert(
          data.message ||
            "Premium Seller membership is required to feature a job.",
        );

        return;
      }

      // ===============================================
      // PAYMENT REQUIRED
      // ===============================================

      if (response.status === 402) {
        const price = data.price ?? 29;

        const duration =
          data.durationDays ?? 14;

        const confirmed =
          window.confirm(
            data.message ||
              `Payment required: ₹${price} for ${duration} days.\n\nProceed to Cashfree payment?`,
          );

        if (!confirmed) {
          return;
        }

        await openCashfreeCheckout({
          type: "FEATURED_AD",
        });

        return;
      }

      // ===============================================
      // ALREADY FEATURED
      // ===============================================

      if (response.status === 409) {
        alert(
          data.message ||
            "This job is already featured.",
        );

        router.refresh();

        return;
      }

      // ===============================================
      // OTHER ERROR
      // ===============================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to feature job.",
        );
      }

      // ===============================================
      // FREE FEATURE SUCCESS
      // ===============================================

      alert(
        data.message ||
          "Job featured successfully.",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "FEATURE JOB ERROR:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to feature job.",
      );
    } finally {
      setPromotionLoading(null);
    }
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <article
      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-200
        hover:shadow-md
        dark:border-slate-800
        dark:bg-slate-900
      "
    >
      {/* =================================================
          POSTER
      ================================================= */}

      <div
        className="
          relative
          aspect-[4/3]
          w-full
          overflow-hidden
          bg-slate-100
          dark:bg-slate-800
        "
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="
              (max-width: 640px) 92vw,
              (max-width: 1024px) 45vw,
              33vw
            "
            className="
              object-cover
              transition-transform
              duration-500
              hover:scale-105
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-gradient-to-br
              from-blue-50
              to-slate-100
              dark:from-blue-950/30
              dark:to-slate-800
            "
          >
            <BriefcaseBusiness
              size={55}
              strokeWidth={1.4}
              className="
                text-[#1565d8]/50
                dark:text-blue-400/50
              "
            />
          </div>
        )}

        {/* STATUS */}

        <div
          className="
            absolute
            left-3
            top-3
          "
        >
          <span
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-full
              px-3
              py-1.5
              text-[11px]
              font-extrabold
              uppercase
              tracking-wide
              text-white
              shadow-sm
              ${statusColor[status]}
            `}
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-white
              "
            />

            {status}
          </span>
        </div>

        {/* BOOSTED BADGE */}

        {isBoosted && (
          <div
            className="
              absolute
              right-3
              top-3
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-1
                rounded-full
                bg-amber-500
                px-3
                py-1.5
                text-[11px]
                font-extrabold
                text-white
                shadow-sm
              "
            >
              <Rocket size={12} />
              BOOSTED
            </span>
          </div>
        )}

        {/* FEATURED BADGE */}

        {isFeatured && (
          <div
            className="
              absolute
              bottom-3
              left-3
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-1
                rounded-full
                bg-[#1565d8]
                px-3
                py-1.5
                text-[11px]
                font-bold
                text-white
                shadow-sm
              "
            >
              <Star
                size={12}
                fill="currentColor"
              />

              FEATURED
            </span>
          </div>
        )}
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className="
          p-4
          sm:p-5
        "
      >
        {/* TITLE */}

        <h3
          className="
            line-clamp-2
            min-h-[48px]
            text-lg
            font-extrabold
            leading-6
            text-slate-900
            dark:text-white
          "
        >
          {title}
        </h3>

        {/* COMPANY */}

        <div
          className="
            mt-2
            flex
            items-center
            gap-2
            text-sm
            text-slate-600
            dark:text-slate-400
          "
        >
          <Building2
            size={15}
            className="
              shrink-0
              text-[#1565d8]
            "
          />

          <span className="truncate">
            {companyName}
          </span>
        </div>

        {/* SALARY */}

        <div
          className="
            mt-4
            text-2xl
            font-extrabold
            tracking-tight
            text-[#1565d8]
          "
        >
          {salary}
        </div>

        {/* LOCATION */}

        <div
          className="
            mt-2
            flex
            items-center
            gap-2
            text-sm
            text-slate-500
            dark:text-slate-400
          "
        >
          <MapPin
            size={15}
            className="
              shrink-0
              text-slate-400
            "
          />

          <span className="truncate">
            {location}
          </span>
        </div>

        {/* JOB META */}

        <div
          className="
            mt-3
            flex
            flex-wrap
            gap-2
          "
        >
          {employmentType && (
            <span
              className="
                rounded-full
                bg-blue-50
                px-2.5
                py-1
                text-[11px]
                font-semibold
                text-[#1565d8]
                dark:bg-blue-950/40
                dark:text-blue-300
              "
            >
              {employmentType}
            </span>
          )}

          {workMode && (
            <span
              className="
                rounded-full
                bg-slate-100
                px-2.5
                py-1
                text-[11px]
                font-semibold
                text-slate-600
                dark:bg-slate-800
                dark:text-slate-300
              "
            >
              {workMode}
            </span>
          )}

          {job.listingType === "multiple" && (
            <span
              className="
                rounded-full
                bg-purple-50
                px-2.5
                py-1
                text-[11px]
                font-semibold
                text-purple-600
                dark:bg-purple-950/40
                dark:text-purple-300
              "
            >
              Multiple Jobs
            </span>
          )}
        </div>

        {/* STATS */}

        <div
          className="
            mt-4
            grid
            grid-cols-3
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            dark:border-slate-700
            dark:bg-slate-800/60
          "
        >
          {/* Views */}

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-1
              border-r
              border-slate-200
              px-2
              py-3
              dark:border-slate-700
            "
          >
            <Eye
              size={16}
              className="text-[#1565d8]"
            />

            <span
              className="
                text-[10px]
                text-slate-500
                dark:text-slate-400
              "
            >
              Views
            </span>

            <span
              className="
                text-sm
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              {views}
            </span>
          </div>

          {/* Applications */}

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-1
              border-r
              border-slate-200
              px-2
              py-3
              dark:border-slate-700
            "
          >
            <Users
              size={16}
              className="text-purple-600"
            />

            <span
              className="
                text-[10px]
                text-slate-500
                dark:text-slate-400
              "
            >
              Applications
            </span>

            <span
              className="
                text-sm
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              {applications}
            </span>
          </div>

          {/* Vacancies */}

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-1
              px-2
              py-3
            "
          >
            <BriefcaseBusiness
              size={16}
              className="text-green-600"
            />

            <span
              className="
                text-[10px]
                text-slate-500
                dark:text-slate-400
              "
            >
              Vacancies
            </span>

            <span
              className="
                text-sm
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              {totalVacancies}
            </span>
          </div>
        </div>

        {/* MAIN ACTIONS */}

        <div
          className="
            mt-4
            grid
            grid-cols-3
            gap-2
          "
        >
          {/* View */}

          <Link
            href={`/jobs/${job._id}`}
            target="_blank"
            className="
              inline-flex
              items-center
              justify-center
              gap-1.5
              rounded-xl
              border
              border-slate-300
              bg-white
              px-3
              py-3
              text-xs
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
          >
            <Eye size={15} />

            View
          </Link>

          {/* Edit */}

          <Link
            href={`/dashboard/my-jobs/${job._id}/edit`}
            className="
              inline-flex
              items-center
              justify-center
              gap-1.5
              rounded-xl
              bg-[#1565d8]
              px-3
              py-3
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-[#0f52ba]
            "
          >
            <Pencil size={15} />

            Edit
          </Link>

          {/* Delete */}

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-1.5
              rounded-xl
              bg-red-500
              px-3
              py-3
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-red-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={15} />
            )}

            {loading ? "..." : "Delete"}
          </button>
        </div>

        {/* =================================================
            PROMOTION CONTROLS
        ================================================= */}

        {status === "active" && (
          <div
            className="
              mt-3
              space-y-2.5
            "
          >
            {/* =================================================
                BOOST
            ================================================= */}

            {isBoosted ? (
              <div
                className="
                  flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-amber-300
                  bg-amber-50
                  px-3
                  py-3
                  text-center
                  dark:border-amber-800
                  dark:bg-amber-950/30
                "
              >
                <Rocket
                  size={16}
                  className="
                    text-amber-600
                    dark:text-amber-400
                  "
                />

                <div className="flex flex-col">
                  <span
                    className="
                      text-xs
                      font-bold
                      text-amber-700
                      dark:text-amber-300
                    "
                  >
                    Boost Active
                  </span>

                  {job.boostedUntil && (
                    <span
                      className="
                        text-[10px]
                        text-amber-600
                        dark:text-amber-400
                      "
                    >
                      Until{" "}
                      {formatDate(
                        job.boostedUntil,
                      )}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleBoost}
                disabled={
                  promotionLoading !== null
                }
                className="
                  flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-amber-500
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition-all
                  hover:bg-amber-600
                  hover:shadow-md
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {promotionLoading ===
                "boost" ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Rocket size={16} />
                )}

                {promotionLoading ===
                "boost"
                  ? "Boosting..."
                  : "Boost This Job"}
              </button>
            )}

            {/* =================================================
                FEATURE
            ================================================= */}

            {isFeatured ? (
              <div
                className="
                  flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-blue-200
                  bg-blue-50
                  px-3
                  py-3
                  text-center
                  dark:border-blue-900
                  dark:bg-blue-950/30
                "
              >
                <Star
                  size={16}
                  fill="currentColor"
                  className="
                    text-[#1565d8]
                    dark:text-blue-400
                  "
                />

                <div className="flex flex-col">
                  <span
                    className="
                      text-xs
                      font-bold
                      text-[#1565d8]
                      dark:text-blue-300
                    "
                  >
                    Featured Job Active
                  </span>

                  {job.featuredUntil && (
                    <span
                      className="
                        text-[10px]
                        text-blue-600
                        dark:text-blue-400
                      "
                    >
                      Until{" "}
                      {formatDate(
                        job.featuredUntil,
                      )}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFeature}
                disabled={
                  promotionLoading !== null
                }
                className="
                  flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#1565d8]
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition-all
                  hover:bg-[#0f52ba]
                  hover:shadow-md
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {promotionLoading ===
                "feature" ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Star
                    size={16}
                    fill="currentColor"
                  />
                )}

                {promotionLoading ===
                "feature"
                  ? "Featuring..."
                  : "Feature This Job"}
              </button>
            )}
          </div>
        )}

        {/* =================================================
            MULTIPLE JOB SUMMARY
        ================================================= */}

        {job.listingType ===
          "multiple" &&
          (job.jobs?.length ?? 0) > 1 && (
            <div
              className="
                mt-3
                flex
                items-center
                gap-2
                rounded-xl
                bg-purple-50
                px-3
                py-2.5
                text-xs
                font-semibold
                text-purple-700
                dark:bg-purple-950/30
                dark:text-purple-300
              "
            >
              <WalletCards size={14} />

              <span>
                {job.jobs?.length} different
                positions
              </span>
            </div>
          )}
      </div>
    </article>
  );
}