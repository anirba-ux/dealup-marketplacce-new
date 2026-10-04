import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  Clock3,
  Eye,
  Globe,
  Home,
  Mail,
  MapPin,
  Phone,
  Users,
  WalletCards,
} from "lucide-react";
import { notFound } from "next/navigation";

import MultipleJobPositions from "@/components/jobs/MultipleJobPositions";

import { findJobById } from "@/lib/repositories/job.repository";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

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

  location?: JobLocation;
}

interface JobEmployer {
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  alternativePhone?: string;
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

interface Job {
  _id: string | { toString(): string };

  listingType?: "single" | "multiple";
  status?: "draft" | "active" | "expired" | "blocked";

  jobs?: JobPosition[];

  employer?: JobEmployer;
  employerId?: string;
  employerName?: string;

  location?: JobLocation;

  thumbnail?: JobThumbnail;
  infographic?: {
    publicId?: string;
    url?: string;
  };

  views?: number;
  applications?: number;

  featured?: boolean;
  boosted?: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;
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

  if (max !== undefined && max !== null && max > 0 && max !== min) {
    amount = `₹${formatAmount(min)} - ₹${formatAmount(max)}`;
  } else if (min > 0) {
    amount = `₹${formatAmount(min)}`;
  } else {
    return "Salary not specified";
  }

  const periodMap: Record<"hour" | "day" | "month" | "year", string> = {
    hour: "/hr",
    day: "/day",
    month: "/month",
    year: "/year",
  };

  const period =
    salary.period && periodMap[salary.period] ? periodMap[salary.period] : "";

  return `${amount}${period}`;
}

function formatEmploymentType(value?: EmploymentType) {
  if (!value) return "Job";

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

function formatWorkMode(value?: WorkMode) {
  if (!value) return "";

  const labels: Record<WorkMode, string> = {
    "on-site": "On-site",
    hybrid: "Hybrid",
    remote: "Remote",
  };

  return labels[value];
}

function formatDate(value?: string | Date) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getLocation(job: Job) {
  const parts = [
    job.location?.city,
    job.location?.district,
    job.location?.state,
  ].filter(Boolean);

  return parts.join(", ") || "Location not specified";
}

// =====================================================
// METADATA
// =====================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const job = await findJobById(id);

  if (!job) {
    return {
      title: "Job Not Found | DealUp Marketplace",
      description:
        "The requested job could not be found on DealUp Marketplace.",
    };
  }

  const firstJob = job.jobs?.[0];

  const title = firstJob?.title?.trim() || "Job Opportunity";

  const company = job.employer?.companyName || job.employerName || "Company";

  const location = getLocation(job);

  const description = firstJob?.description?.trim()
    ? firstJob.description.trim().slice(0, 155)
    : `Apply for ${title} at ${company}${location ? ` in ${location}` : ""} on DealUp Marketplace.`;

  const canonicalUrl = `https://www.dealupmarketplace.com/jobs/${id}`;

  const image =
    job.thumbnail?.url?.trim() || job.infographic?.url?.trim() || "";

  return {
    title: `${title} at ${company}`,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: "DealUp Marketplace",
      locale: "en_IN",
      title: `${title} at ${company}`,
      description,

      ...(image
        ? {
            images: [
              {
                url: image,
                alt: `${title} - ${company}`,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title: `${title} at ${company}`,
      description,

      ...(image
        ? {
            images: [image],
          }
        : {}),
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

// =====================================================
// PAGE
// =====================================================

export default async function JobDetailsPage({ params }: Props) {
  const { id } = await params;

  const rawJob = await findJobById(id);

  if (!rawJob) {
    notFound();
  }

  const job = rawJob as unknown as Job;

  // ---------------------------------------------------
  // Only public active jobs
  // ---------------------------------------------------

  if (job.status !== "active") {
    notFound();
  }

  const positions = job.jobs ?? [];

  if (positions.length === 0) {
    notFound();
  }

  const firstPosition = positions[0];

  const companyName =
    job.employer?.companyName || job.employerName || "Company";

  const location = getLocation(job);

  const imageUrl =
    job.thumbnail?.url?.trim() || job.infographic?.url?.trim() || "";

  const coordinates = job.location?.coordinates;

  const hasCoordinates =
    typeof coordinates?.lat === "number" &&
    typeof coordinates?.lng === "number" &&
    !(coordinates.lat === 0 && coordinates.lng === 0);

  return (
    <main className="min-h-screen bg-slate-50 py-4 text-slate-900 sm:py-8 lg:py-10 dark:bg-[#07111f] dark:text-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* =================================================
            TOP NAVIGATION
        ================================================== */}

        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-[#1565d8]/30
              hover:bg-blue-50
              hover:text-[#1565d8]
              hover:shadow-md
              active:scale-95

              dark:border-white/10
              dark:bg-white/5
              dark:text-slate-200
              dark:hover:border-white/20
              dark:hover:bg-white/10
              dark:hover:text-white
            "
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-[#1565d8]/30
              hover:bg-blue-50
              hover:text-[#1565d8]
              hover:shadow-md
              active:scale-95

              dark:border-white/10
              dark:bg-white/5
              dark:text-slate-200
              dark:hover:border-white/20
              dark:hover:bg-white/10
              dark:hover:text-white
            "
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
        </div>

        {/* =================================================
            BREADCRUMB
        ================================================== */}

        <div className="mb-5 flex items-center gap-1.5 overflow-hidden text-[11px] text-slate-500 sm:mb-7 sm:gap-2 sm:text-sm dark:text-slate-400">
          <Link
            href="/"
            className="shrink-0 transition-colors hover:text-[#1565d8]"
          >
            Home
          </Link>

          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />

          <span className="shrink-0 text-[#1565d8]">Career Opportunities</span>

          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />

          <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
            {firstPosition.title || "Job Opportunity"}
          </span>
        </div>

        {/* =================================================
            MAIN GRID
        ================================================== */}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] lg:gap-10">
          {/* =================================================
              LEFT COLUMN
          ================================================== */}

          <div className="min-w-0 space-y-5 sm:space-y-7">
            {/* JOB POSTER */}

            <section
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-2
                shadow-sm
                sm:rounded-3xl
                sm:p-3

                dark:border-white/10
                dark:bg-[#091526]
              "
            >
              {job.featured && (
                <div
                  className="
                    absolute
                    left-4
                    top-4
                    z-20
                    rounded-full
                    bg-amber-500
                    px-3
                    py-1.5
                    text-xs
                    font-extrabold
                    text-white
                    shadow-lg
                    sm:left-6
                    sm:top-6
                  "
                >
                  ⭐ Featured
                </div>
              )}

              <div
                className="
                  relative
                  h-[260px]
                  w-full
                  overflow-hidden
                  rounded-xl
                  bg-slate-100
                  sm:h-[420px]
                  sm:rounded-2xl
                  dark:bg-slate-900
                "
              >
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={`${firstPosition.title || "Job"} - ${companyName}`}
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      w-full
                      flex-col
                      items-center
                      justify-center
                      gap-3
                      bg-gradient-to-br
                      from-blue-50
                      via-slate-50
                      to-slate-100
                      text-slate-400

                      dark:from-blue-950/30
                      dark:via-slate-900
                      dark:to-slate-950
                    "
                  >
                    <BriefcaseBusiness className="h-14 w-14 text-[#1565d8]/50" />

                    <span className="text-sm font-semibold">
                      Job Opportunity
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* DESCRIPTION */}

            <section
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-sm
                sm:rounded-3xl
                sm:p-6

                dark:border-white/10
                dark:bg-[#091526]
              "
            >
              <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                <h2 className="text-lg font-extrabold tracking-tight sm:text-2xl">
                  Job Description
                </h2>

                <span className="h-1 w-10 rounded-full bg-[#1565d8] sm:w-14" />
              </div>

              <p className="whitespace-pre-line text-sm leading-6 text-slate-600 sm:text-[15px] sm:leading-7 dark:text-slate-300">
                {firstPosition.description || "No job description provided."}
              </p>
            </section>

            {/* =================================================
    MULTIPLE / WEEKLY HIRING
================================================= */}

            {job.listingType === "multiple" && positions.length > 1 && (
              <MultipleJobPositions
                positions={positions}
                agencyLocation={job.location}
              />
            )}

            {/* LOCATION */}

            <section
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-sm
                sm:rounded-3xl
                sm:p-6

                dark:border-white/10
                dark:bg-[#091526]
              "
            >
              <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1565d8]">
                    Where to work
                  </p>

                  <h2 className="text-lg font-extrabold tracking-tight sm:text-2xl">
                    Job Location
                  </h2>
                </div>

                <MapPin className="h-5 w-5 text-[#1565d8] sm:h-6 sm:w-6" />
              </div>

              {hasCoordinates ? (
                <div
                  className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    dark:border-white/10
                  "
                >
                  <iframe
                    title="Job Location"
                    className="h-[280px] w-full border-0 sm:h-[360px]"
                    loading="lazy"
                    src={`https://www.google.com/maps?q=${coordinates!.lat},${coordinates!.lng}&z=15&output=embed`}
                  />
                </div>
              ) : (
                <div
                  className="
                    flex
                    min-h-[180px]
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-dashed
                    border-slate-300
                    bg-slate-50
                    text-center
                    text-sm
                    text-slate-500

                    dark:border-white/10
                    dark:bg-[#07111f]
                    dark:text-slate-400
                  "
                >
                  Exact map location is not available.
                </div>
              )}

              <div className="mt-4 rounded-xl bg-slate-50 p-3.5 dark:bg-[#07111f]">
                {job.location?.address && (
                  <p className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
                    {job.location.address}
                  </p>
                )}

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {location}

                  {job.location?.pincode ? ` - ${job.location.pincode}` : ""}
                </p>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================== */}

          <div className="min-w-0 lg:sticky lg:top-6">
            {/* MAIN JOB SUMMARY */}

            <section
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-sm
                sm:rounded-3xl
                sm:p-6
                lg:p-7

                dark:border-white/10
                dark:bg-[#091526]
              "
            >
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-[#1565d8] dark:bg-blue-500/10 dark:text-blue-300">
                  {formatEmploymentType(firstPosition.employmentType)}
                </span>

                {firstPosition.workMode && (
                  <span className="rounded-full bg-green-50 px-3 py-1.5 text-[11px] font-bold text-green-700 dark:bg-green-500/10 dark:text-green-300">
                    {formatWorkMode(firstPosition.workMode)}
                  </span>
                )}

                {job.listingType === "multiple" && (
                  <span className="rounded-full bg-purple-50 px-3 py-1.5 text-[11px] font-bold text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                    Multiple Positions
                  </span>
                )}

                {job.featured && (
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    ⭐ Featured
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-2xl font-black leading-tight tracking-[-0.035em] text-slate-950 sm:mt-5 sm:text-4xl lg:text-[2.7rem] dark:text-white">
                {firstPosition.title || "Job Opportunity"}
              </h1>

              <div className="mt-4">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <Building2 className="h-4 w-4 text-[#1565d8]" />

                  {companyName}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
                <p className="text-2xl font-black tracking-tight text-[#1565d8] sm:text-4xl">
                  {formatSalary(firstPosition.salary)}
                </p>

                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Eye className="h-4 w-4" />
                  {job.views ?? 0} views
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#1565d8]" />
                  {job.location?.city || "Location"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-[#1565d8]" />
                  Posted {formatDate(job.createdAt)}
                </span>
              </div>
            </section>

            {/* JOB DETAILS */}

            <section
              className="
                mt-5
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-sm
                sm:mt-6
                sm:rounded-3xl
                sm:p-6

                dark:border-white/10
                dark:bg-[#091526]
              "
            >
              <h2 className="mb-4 text-lg font-extrabold sm:mb-5 sm:text-xl">
                Job Details
              </h2>

              <div className="divide-y divide-slate-100 dark:divide-white/10">
                <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                    <BriefcaseBusiness className="h-4 w-4 text-[#1565d8]" />
                    Employment
                  </span>

                  <span className="text-right text-xs font-bold sm:text-sm">
                    {formatEmploymentType(firstPosition.employmentType)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                    <Clock3 className="h-4 w-4 text-[#1565d8]" />
                    Work Mode
                  </span>

                  <span className="text-right text-xs font-bold sm:text-sm">
                    {formatWorkMode(firstPosition.workMode) || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                    <Users className="h-4 w-4 text-[#1565d8]" />
                    Experience
                  </span>

                  <span className="max-w-[55%] text-right text-xs font-bold sm:text-sm">
                    {firstPosition.experience || "Not specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                    Category
                  </span>

                  <span className="max-w-[55%] text-right text-xs font-bold capitalize sm:text-sm">
                    {firstPosition.category || "—"}
                  </span>
                </div>

                {firstPosition.subcategory && (
                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                      Subcategory
                    </span>

                    <span className="max-w-[55%] text-right text-xs font-bold sm:text-sm">
                      {firstPosition.subcategory}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                    <Users className="h-4 w-4 text-[#1565d8]" />
                    Vacancies
                  </span>

                  <span className="text-xs font-bold sm:text-sm">
                    {firstPosition.vacancies ?? 1}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                    <Eye className="h-4 w-4 text-[#1565d8]" />
                    Views
                  </span>

                  <span className="text-xs font-bold sm:text-sm">
                    {job.views ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                    <MapPin className="h-4 w-4 text-[#1565d8]" />
                    Location
                  </span>

                  <span className="max-w-[55%] text-right text-xs font-bold sm:text-sm">
                    {job.location?.city || "—"}
                  </span>
                </div>
              </div>
            </section>

            {/* EMPLOYER */}

            <section
              className="
                mt-5
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-sm
                sm:mt-6
                sm:rounded-3xl
                sm:p-6

                dark:border-white/10
                dark:bg-[#091526]
              "
            >
              <div className="mb-5">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1565d8]">
                  Employer
                </p>

                <h2 className="text-xl font-extrabold">{companyName}</h2>
              </div>

              <div className="space-y-3">
                {job.employer?.contactPerson && (
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#1565d8]" />

                    <div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Contact Person
                      </p>

                      <p className="text-sm font-bold">
                        {job.employer.contactPerson}
                      </p>
                    </div>
                  </div>
                )}

                {job.employer?.phone && (
                  <a
                    href={`tel:${job.employer.phone}`}
                    className="flex items-center gap-3 text-sm font-semibold text-slate-700 transition-colors hover:text-[#1565d8] dark:text-slate-200"
                  >
                    <Phone className="h-4 w-4 text-[#1565d8]" />
                    {job.employer.phone}
                  </a>
                )}

                {job.employer?.email && (
                  <a
                    href={`mailto:${job.employer.email}`}
                    className="flex items-center gap-3 break-all text-sm font-semibold text-slate-700 transition-colors hover:text-[#1565d8] dark:text-slate-200"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-[#1565d8]" />
                    {job.employer.email}
                  </a>
                )}

                {job.employer?.website && (
                  <a
                    href={job.employer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 break-all text-sm font-semibold text-slate-700 transition-colors hover:text-[#1565d8] dark:text-slate-200"
                  >
                    <Globe className="h-4 w-4 shrink-0 text-[#1565d8]" />
                    {job.employer.website}
                  </a>
                )}
              </div>
            </section>

            {/* APPLY / CONTACT */}

            <section
              className="
                mt-5
                rounded-2xl
                border
                border-[#1565d8]/15
                bg-blue-50
                p-4
                shadow-sm
                sm:mt-6
                sm:rounded-3xl
                sm:p-6

                dark:border-blue-400/20
                dark:bg-blue-500/10
              "
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[#1565d8] p-2.5 text-white">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-extrabold sm:text-lg">
                    Interested in this job?
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    Contact the employer using the available contact information
                    to discuss the opportunity and application process.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {job.employer?.phone && (
                  <a
                    href={`tel:${job.employer.phone}`}
                    className="
                      inline-flex
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
                      shadow-sm
                      transition-all
                      hover:-translate-y-0.5
                      hover:shadow-md
                      active:scale-95
                    "
                  >
                    <Phone className="h-4 w-4" />
                    Call Employer
                  </a>
                )}

                {job.employer?.email && (
                  <a
                    href={`mailto:${job.employer.email}`}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-[#1565d8]/20
                      bg-white
                      px-4
                      py-3
                      text-sm
                      font-bold
                      text-[#1565d8]
                      transition-all
                      hover:-translate-y-0.5
                      hover:bg-blue-50
                      active:scale-95

                      dark:border-white/10
                      dark:bg-white/5
                      dark:text-blue-300
                    "
                  >
                    <Mail className="h-4 w-4" />
                    Email Employer
                  </a>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
