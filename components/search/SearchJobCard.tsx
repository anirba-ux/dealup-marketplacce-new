import Link from "next/link";

import {
  BriefcaseBusiness,
  ChevronRight,
  Clock3,
  MapPin,
  Users,
  WalletCards,
} from "lucide-react";

import type { Job } from "@/lib/models/job";

/* =========================================================
   Helpers
========================================================= */

function getFirstPosition(job: Job) {
  return job.jobs?.[0];
}

function getCompanyName(job: Job) {
  return (
    job.employer?.companyName?.trim() ||
    job.employerName?.trim() ||
    "Company"
  );
}

function getLocation(job: Job) {
  const location = job.location;

  const parts = [
    location?.city,
    location?.district,
    location?.state,
  ].filter(Boolean);

  return parts.join(", ") || "Location not specified";
}

function getSalaryLabel(
  salary?: {
    min?: number;
    max?: number;
    period?: "hour" | "day" | "month" | "year";
  },
) {
  if (!salary) {
    return "Salary not specified";
  }

  const min = Number(salary.min ?? 0);
  const max = Number(salary.max ?? 0);

  const period = salary.period
    ? ` / ${salary.period}`
    : "";

  if (min > 0 && max > 0) {
    return `₹${min.toLocaleString(
      "en-IN",
    )} – ₹${max.toLocaleString(
      "en-IN",
    )}${period}`;
  }

  if (min > 0) {
    return `From ₹${min.toLocaleString(
      "en-IN",
    )}${period}`;
  }

  if (max > 0) {
    return `Up to ₹${max.toLocaleString(
      "en-IN",
    )}${period}`;
  }

  return "Salary not specified";
}

function formatLabel(value?: string) {
  if (!value) {
    return null;
  }

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

/* =========================================================
   Search Job Card
========================================================= */

export default function SearchJobCard({
  job,
}: {
  job: Job;
}) {
  const firstPosition = getFirstPosition(job);

  /* =======================================================
     Basic Job Information
  ======================================================= */

  const title =
    firstPosition?.title?.trim() ||
    "Job Opportunity";

  const company =
    getCompanyName(job);

  const location =
    getLocation(job);

  const positions =
    job.jobs ?? [];

  const extraPositions =
    Math.max(
      0,
      positions.length - 1,
    );

  /* =======================================================
     Position Information
  ======================================================= */

  const employmentType =
    formatLabel(
      firstPosition?.employmentType,
    );

  const workMode =
    formatLabel(
      firstPosition?.workMode,
    );

  const salary =
    getSalaryLabel(
      firstPosition?.salary,
    );

  const vacancies =
    Number(
      firstPosition?.vacancies ?? 0,
    );

  const experience =
    firstPosition?.experience?.trim() ||
    "";

  const category =
    firstPosition?.category?.trim() ||
    "";

  /* =======================================================
     Promotion Status

     IMPORTANT:
     Job model does NOT use:
       job.featured
       job.boosted

     It uses:
       featuredAt
       featuredUntil
       boostedAt
       boostedUntil

     A promotion is active only when its
     corresponding "Until" date is still in
     the future.
  ======================================================= */

  const now = new Date();

  const isFeatured =
    !!job.featuredUntil &&
    new Date(
      job.featuredUntil,
    ).getTime() > now.getTime();

  const isBoosted =
    !!job.boostedUntil &&
    new Date(
      job.boostedUntil,
    ).getTime() > now.getTime();

  /* =======================================================
     Job URL
  ======================================================= */

  const href =
    `/jobs/${String(job._id)}`;

  /* =======================================================
     Render
  ======================================================= */

  return (
    <Link
      href={href}
      className="
        group
        block
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#1565d8]/30
        hover:shadow-lg

        dark:border-white/10
        dark:bg-[#0d1b2a]
        dark:hover:border-blue-400/30
      "
    >
      <div className="p-5 sm:p-6">

        {/* =================================================
            Header
        ================================================= */}

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-3 flex flex-wrap items-center gap-2">

              {/* Job Badge */}

              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-blue-50
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  text-[#1565d8]

                  dark:bg-blue-500/10
                  dark:text-blue-300
                "
              >
                <BriefcaseBusiness
                  className="h-3.5 w-3.5"
                />

                Job
              </span>

              {/* Featured */}

              {isFeatured && (
                <span
                  className="
                    rounded-full
                    bg-amber-50
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-amber-700

                    dark:bg-amber-500/10
                    dark:text-amber-300
                  "
                >
                  Featured
                </span>
              )}

              {/* Boosted */}

              {isBoosted && (
                <span
                  className="
                    rounded-full
                    bg-orange-50
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-orange-700

                    dark:bg-orange-500/10
                    dark:text-orange-300
                  "
                >
                  Boosted
                </span>
              )}

            </div>

            {/* Job Title */}

            <h2
              className="
                line-clamp-2
                text-xl
                font-bold
                tracking-tight
                text-slate-900
                transition-colors
                group-hover:text-[#1565d8]

                dark:text-white
                dark:group-hover:text-blue-300

                sm:text-2xl
              "
            >
              {title}
            </h2>

            {/* Company */}

            <p
              className="
                mt-1
                text-sm
                font-medium
                text-slate-600

                dark:text-slate-300
              "
            >
              {company}
            </p>

          </div>

          {/* Desktop Arrow */}

          <div
            className="
              hidden
              shrink-0
              rounded-full
              border
              border-slate-200
              p-2
              text-slate-400
              transition-all

              group-hover:border-[#1565d8]/30
              group-hover:bg-blue-50
              group-hover:text-[#1565d8]

              sm:block

              dark:border-white/10
              dark:text-slate-500
              dark:group-hover:bg-blue-500/10
              dark:group-hover:text-blue-300
            "
          >
            <ChevronRight
              className="h-5 w-5"
            />
          </div>

        </div>

        {/* =================================================
            Job Information
        ================================================= */}

        <div
          className="
            mt-5
            grid
            gap-3
            sm:grid-cols-2
          "
        >

          {/* Location */}

          <div
            className="
              flex
              min-w-0
              items-start
              gap-2.5
            "
          >
            <MapPin
              className="
                mt-0.5
                h-4
                w-4
                shrink-0
                text-[#1565d8]
              "
            />

            <span
              className="
                truncate
                text-sm
                text-slate-600

                dark:text-slate-300
              "
            >
              {location}
            </span>
          </div>

          {/* Salary */}

          <div
            className="
              flex
              min-w-0
              items-start
              gap-2.5
            "
          >
            <WalletCards
              className="
                mt-0.5
                h-4
                w-4
                shrink-0
                text-[#1565d8]
              "
            />

            <span
              className="
                truncate
                text-sm
                font-semibold
                text-slate-800

                dark:text-slate-200
              "
            >
              {salary}
            </span>
          </div>

          {/* Employment Type */}

          {employmentType && (
            <div
              className="
                flex
                min-w-0
                items-start
                gap-2.5
              "
            >
              <BriefcaseBusiness
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-slate-400
                "
              />

              <span
                className="
                  truncate
                  text-sm
                  text-slate-600

                  dark:text-slate-300
                "
              >
                {employmentType}
              </span>
            </div>
          )}

          {/* Work Mode */}

          {workMode && (
            <div
              className="
                flex
                min-w-0
                items-start
                gap-2.5
              "
            >
              <Clock3
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-slate-400
                "
              />

              <span
                className="
                  truncate
                  text-sm
                  text-slate-600

                  dark:text-slate-300
                "
              >
                {workMode}
              </span>
            </div>
          )}

          {/* Experience */}

          {experience && (
            <div
              className="
                flex
                min-w-0
                items-start
                gap-2.5
              "
            >
              <Clock3
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-slate-400
                "
              />

              <span
                className="
                  truncate
                  text-sm
                  text-slate-600

                  dark:text-slate-300
                "
              >
                {experience}
              </span>
            </div>
          )}

          {/* Vacancies */}

          {vacancies > 0 && (
            <div
              className="
                flex
                min-w-0
                items-start
                gap-2.5
              "
            >
              <Users
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-slate-400
                "
              />

              <span
                className="
                  truncate
                  text-sm
                  text-slate-600

                  dark:text-slate-300
                "
              >
                {vacancies}{" "}
                {vacancies === 1
                  ? "vacancy"
                  : "vacancies"}
              </span>
            </div>
          )}

        </div>

        {/* =================================================
            Footer
        ================================================= */}

        <div
          className="
            mt-5
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
            border-t
            border-slate-100
            pt-4

            dark:border-white/10
          "
        >

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >

            {/* Category */}

            {category && (
              <span
                className="
                  rounded-lg
                  bg-slate-100
                  px-2.5
                  py-1
                  text-xs
                  font-medium
                  text-slate-600

                  dark:bg-white/5
                  dark:text-slate-300
                "
              >
                {category}
              </span>
            )}

            {/* Multiple Jobs */}

            {extraPositions > 0 && (
              <span
                className="
                  rounded-lg
                  bg-purple-50
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  text-purple-700

                  dark:bg-purple-500/10
                  dark:text-purple-300
                "
              >
                +{extraPositions} more{" "}
                {extraPositions === 1
                  ? "position"
                  : "positions"}
              </span>
            )}

          </div>

          {/* View Job */}

          <span
            className="
              inline-flex
              items-center
              gap-1
              text-sm
              font-semibold
              text-[#1565d8]

              dark:text-blue-300
            "
          >
            View job

            <ChevronRight
              className="
                h-4
                w-4
                transition-transform
                group-hover:translate-x-0.5
              "
            />
          </span>

        </div>

      </div>
    </Link>
  );
}