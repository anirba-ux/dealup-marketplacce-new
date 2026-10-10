"use client";

import Image from "next/image";
import Link from "next/link";

import {
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  Clock3,
  MapPin,
  WalletCards,
} from "lucide-react";

import ViewAllLink from "@/components/ui/ViewAllLink";

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

interface JobInfographic {
  publicId?: string;
  url?: string;
}

type JobThumbnail = {
  publicId?: string;
  url?: string;
};

interface Job {
  _id: string;

  listingType?: "single" | "multiple";

  status?: "draft" | "active" | "expired" | "blocked";

  jobs?: JobPosition[];

  employer?: JobEmployer;

  location?: JobLocation;

  infographic?: JobInfographic;

  thumbnail?: JobThumbnail;

  employerId?: string;

  employerName?: string;

  views?: number;

  applications?: number;

  featured?: boolean;

  boosted?: boolean;

  createdAt?: string | Date;

  updatedAt?: string | Date;
}

interface LatestJobsProps {
  jobs: Job[];
}

// =====================================================
// HELPERS
// =====================================================

function formatSalary(salary?: JobPosition["salary"]) {
  if (!salary) {
    return "Salary not specified";
  }

  const min = salary.min ?? 0;
  const max = salary.max;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

function formatWorkMode(value?: WorkMode) {
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

function getLocation(job: Job) {
  const parts = [
    job.location?.city,
    job.location?.district,
    job.location?.state,
  ].filter(Boolean);

  return parts.join(", ") || "Location not specified";
}

// =====================================================
// JOB CARD
// =====================================================

function JobCard({ job }: { job: Job }) {
  const position = job.jobs?.[0];

  const imageUrl =
    job.thumbnail?.url?.trim() || job.infographic?.url?.trim() || "";

  const companyName =
    job.employer?.companyName || job.employerName || "Company";

  const jobTitle = position?.title || "Job Opportunity";

  const location = getLocation(job);

  const employmentType = formatEmploymentType(position?.employmentType);

  const workMode = formatWorkMode(position?.workMode);

  const salary = formatSalary(position?.salary);

  return (
    <article
      className="
        group
        flex
        h-full
        w-[calc(100vw-3rem)]
        max-w-[320px]
        min-w-[290px]
        shrink-0
        snap-start
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl

        dark:border-slate-800
        dark:bg-slate-950

        sm:w-full
        sm:min-w-0
        sm:max-w-none
        sm:snap-none
      "
    >
      {/* =================================================
          JOB IMAGE
      ================================================== */}

      <div
        className="
          relative
          h-48
          w-full
          shrink-0
          overflow-hidden
          bg-slate-100

          dark:bg-slate-900
        "
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${jobTitle} - ${companyName}`}
            fill
            sizes="
              (max-width: 640px) 85vw,
              (max-width: 1024px) 45vw,
              25vw
            "
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
            unoptimized
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
              from-[#1565d8]/10
              via-slate-100
              to-[#f5a623]/10

              dark:from-[#1565d8]/20
              dark:via-slate-900
              dark:to-[#f5a623]/10
            "
          >
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-white
                text-[#1565d8]
                shadow-md

                dark:bg-slate-950
              "
            >
              <BriefcaseBusiness size={30} />
            </div>
          </div>
        )}

        {/* Listing type */}

        <div
          className="
            absolute
            left-3
            top-3
            rounded-full
            bg-white/95
            px-3
            py-1.5
            text-xs
            font-bold
            text-[#1565d8]
            shadow-sm
            backdrop-blur

            dark:bg-slate-950/90
          "
        >
          {job.listingType === "multiple" ? "Multiple Jobs" : "Job Opening"}
        </div>
      </div>

      {/* =================================================
          CARD CONTENT
      ================================================== */}

      <div
        className="
          flex
          flex-1
          flex-col
          p-5
        "
      >
        {/* Company */}

        <div
          className="
            mb-2
            flex
            items-center
            gap-2
          "
        >
          <Building2 size={15} className="shrink-0 text-[#1565d8]" />

          <span
            className="
              truncate
              text-sm
              font-semibold
              text-slate-600

              dark:text-slate-400
            "
          >
            {companyName}
          </span>
        </div>

        {/* Job title */}

        <h3
          className="
            line-clamp-2
            min-h-[56px]
            text-lg
            font-bold
            leading-7
            text-slate-900
            transition-colors
            group-hover:text-[#1565d8]

            dark:text-white
          "
        >
          {jobTitle}
        </h3>

        {/* Location */}

        <div
          className="
            mt-3
            flex
            items-start
            gap-2
            text-sm
            text-slate-500

            dark:text-slate-400
          "
        >
          <MapPin
            size={16}
            className="
              mt-0.5
              shrink-0
              text-[#1565d8]
            "
          />

          <span className="line-clamp-2">{location}</span>
        </div>

        {/* Employment + Work mode */}

        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-[#1565d8]/10
              px-3
              py-1.5
              text-xs
              font-semibold
              text-[#1565d8]
            "
          >
            <Clock3 size={13} />

            {employmentType}
          </span>

          {workMode && (
            <span
              className="
                rounded-full
                bg-slate-100
                px-3
                py-1.5
                text-xs
                font-semibold
                text-slate-600

                dark:bg-slate-900
                dark:text-slate-300
              "
            >
              {workMode}
            </span>
          )}
        </div>

        {/* Salary */}

        <div
          className="
            mt-4
            flex
            items-center
            gap-2
            text-sm
            font-bold
            text-slate-900

            dark:text-white
          "
        >
          <WalletCards size={16} className="text-[#f5a623]" />

          <span>{salary}</span>
        </div>

        {/* Spacer */}

        <div className="flex-1" />

        {/* Bottom */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            border-t
            border-slate-100
            pt-4

            dark:border-slate-800
          "
        >
          <span
            className="
              text-xs
              font-medium
              text-slate-500

              dark:text-slate-400
            "
          >
            {position?.vacancies
              ? `${position.vacancies} ${
                  position.vacancies === 1 ? "vacancy" : "vacancies"
                }`
              : "Hiring now"}
          </span>

          <Link
            href={`/jobs/${job._id}`}
            className="
              inline-flex
              items-center
              gap-1
              text-sm
              font-bold
              text-[#1565d8]
              transition
              hover:gap-2
            "
          >
            View
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// =====================================================
// LATEST JOBS / CAREER OPPORTUNITIES
// =====================================================

export default function LatestJobs({ jobs }: LatestJobsProps) {
  const visibleJobs =
    jobs
      ?.filter(
        (job) =>
          job &&
          job._id &&
          job.status !== "blocked" &&
          job.status !== "expired",
      )
      .slice(0, 8) || [];

  // ===================================================
  // EMPTY STATE
  // ===================================================

  if (visibleJobs.length === 0) {
    return null;
  }

  return (
    <section
      className="
        w-full
        py-10
        sm:py-14
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =================================================
            SECTION HEADER
        ================================================== */}

        <div
          className="
            mb-6
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <div
              className="
                mb-2
                flex
                items-center
                gap-2
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#1565d8]/10
                  text-[#1565d8]
                "
              >
                <BriefcaseBusiness size={19} />
              </div>

              <span
                className="
                  text-sm
                  font-bold
                  uppercase
                  tracking-wider
                  text-[#1565d8]
                "
              >
                Jobs Near You
              </span>
            </div>

            <h2
              className="
                text-2xl
                font-extrabold
                tracking-tight
                text-slate-900

                dark:text-white

                sm:text-3xl
              "
            >
              Career Opportunities
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500

                dark:text-slate-400
              "
            >
              Discover the latest job opportunities on DealUp.
            </p>
          </div>

          {/* DESKTOP VIEW ALL */}

          <div className="hidden sm:block">
            <ViewAllLink href="/jobs" />
          </div>
        </div>

        {/* =================================================
            MOBILE HORIZONTAL SLIDER
            DESKTOP RESPONSIVE GRID
        ================================================== */}

        <div
          className="
            -mx-4
            overflow-x-auto
            overscroll-x-contain
            px-4
            pb-4
            snap-x
            snap-mandatory

            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden

            sm:mx-0
            sm:overflow-visible
            sm:px-0
            sm:pb-0
            sm:snap-none
          "
        >
          <div
            className="
              flex
              w-max
              gap-4

              sm:grid
              sm:w-auto
              sm:grid-cols-2

              lg:grid-cols-3

              xl:grid-cols-4
            "
          >
            {visibleJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </div>

        {/* MOBILE VIEW ALL */}

        <div className="mt-5 flex justify-center sm:hidden">
          <ViewAllLink href="/jobs" />
        </div>
      </div>
    </section>
  );
}
