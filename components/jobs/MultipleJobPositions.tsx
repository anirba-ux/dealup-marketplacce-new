"use client";

import { useState } from "react";

import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Users,
  WalletCards,
  X,
} from "lucide-react";

// =====================================================
// Types
// =====================================================

type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "temporary"
  | "freelance";

type WorkMode = "on-site" | "hybrid" | "remote";

interface JobLocation {
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  pincode?: string;
  address?: string;
}

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

  // ===================================================
  // Application Options
  // ===================================================

  applicationUrl?: string;
  contactPhone?: string;
  contactEmail?: string;

  // ===================================================
  // Position-specific Location
  // ===================================================

  location?: JobLocation;
}

interface Props {
  positions: JobPosition[];
  agencyLocation?: JobLocation;
}

// =====================================================
// Salary Formatter
// =====================================================

function formatSalary(salary?: JobPosition["salary"]) {
  if (!salary) return "Salary not specified";

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

  const periodMap = {
    hour: "/hour",
    day: "/day",
    month: "/month",
    year: "/year",
  };

  return `${amount}${
    salary.period ? periodMap[salary.period] : ""
  }`;
}

// =====================================================
// Employment Type Formatter
// =====================================================

function formatEmploymentType(value?: EmploymentType) {
  if (!value) return "Not specified";

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

// =====================================================
// Work Mode Formatter
// =====================================================

function formatWorkMode(value?: WorkMode) {
  if (!value) return "Not specified";

  const labels: Record<WorkMode, string> = {
    "on-site": "On-site",
    hybrid: "Hybrid",
    remote: "Remote",
  };

  return labels[value];
}

// =====================================================
// Location Formatter
// =====================================================

function getLocation(location?: JobLocation) {
  if (!location) return "Location not specified";

  const parts = [
    location.city,
    location.district,
    location.state,
  ].filter(Boolean);

  return (
    parts.join(", ") ||
    location.address ||
    "Location not specified"
  );
}

// =====================================================
// Main Component
// =====================================================

export default function MultipleJobPositions({
  positions,
  agencyLocation,
}: Props) {
  // Currently opened position
  const [openIndex, setOpenIndex] = useState<number | null>(
    null,
  );

  // Position selected for application
  const [applyPosition, setApplyPosition] =
    useState<JobPosition | null>(null);

  if (!positions.length) return null;

  return (
    <>
      {/* =================================================
          WEEKLY HIRING SECTION
      ================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 dark:border-white/10 dark:bg-[#091526]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1565d8]">
            Weekly Hiring
          </p>

          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight sm:text-2xl">
                Available Positions
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {positions.length}{" "}
                {positions.length === 1
                  ? "position"
                  : "positions"}{" "}
                available
              </p>
            </div>

            <span className="hidden rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1565d8] sm:block dark:bg-blue-500/10 dark:text-blue-300">
              {positions.length} Openings
            </span>
          </div>
        </div>

        {/* =================================================
            POSITIONS
        ================================================= */}

        <div className="space-y-3">
          {positions.map((position, index) => {
            const isOpen = openIndex === index;

            // Position location takes priority.
            // Agency location is used as fallback.
            const location =
              position.location ?? agencyLocation;

            const hasApplicationOptions =
              Boolean(
                position.applicationUrl?.trim() ||
                  position.contactPhone?.trim() ||
                  position.contactEmail?.trim(),
              );

            return (
              <div
                key={`${position.title}-${index}`}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "border-[#1565d8]/40 bg-blue-50/40 shadow-md dark:border-[#1565d8]/40 dark:bg-[#0b1c31]"
                    : "border-slate-200 bg-slate-50 hover:border-[#1565d8]/30 hover:shadow-sm dark:border-white/10 dark:bg-[#07111f]"
                }`}
              >
                {/* =================================================
                    POSITION HEADER
                ================================================= */}

                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(
                      isOpen ? null : index,
                    )
                  }
                  className="w-full p-4 text-left sm:p-5"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* TITLE */}

                    <div className="flex min-w-0 items-start gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1565d8]/10 text-[#1565d8] dark:bg-[#1565d8]/15">
                        <BriefcaseBusiness size={16} />
                      </span>

                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-extrabold text-slate-900 sm:text-base dark:text-white">
                          {position.title ||
                            "Job Position"}
                        </h3>

                        {(position.category ||
                          position.subcategory) && (
                          <p className="mt-0.5 text-[11px] font-medium text-[#1565d8]">
                            {position.category}

                            {position.subcategory
                              ? ` • ${position.subcategory}`
                              : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* TOGGLE */}

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                      {isOpen ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </span>
                  </div>

                  {/* =================================================
                      SUMMARY
                  ================================================= */}

                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                    {/* Employment */}

                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness
                        size={14}
                        className="shrink-0 text-[#1565d8]"
                      />

                      <span className="truncate text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {formatEmploymentType(
                          position.employmentType,
                        )}
                      </span>
                    </div>

                    {/* Work Mode */}

                    <div className="flex items-center gap-2">
                      <Clock3
                        size={14}
                        className="shrink-0 text-[#1565d8]"
                      />

                      <span className="truncate text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {formatWorkMode(
                          position.workMode,
                        )}
                      </span>
                    </div>

                    {/* Experience */}

                    <div className="flex items-center gap-2">
                      <Users
                        size={14}
                        className="shrink-0 text-[#1565d8]"
                      />

                      <span className="truncate text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {position.experience ||
                          "Experience not specified"}
                      </span>
                    </div>

                    {/* Salary */}

                    <div className="flex items-center gap-2 text-[#1565d8]">
                      <WalletCards
                        size={14}
                        className="shrink-0"
                      />

                      <span className="truncate text-[11px] font-bold">
                        {formatSalary(
                          position.salary,
                        )}
                      </span>
                    </div>
                  </div>

                  {/* =================================================
                      LOCATION SUMMARY
                  ================================================= */}

                  <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin
                      size={14}
                      className="mt-0.5 shrink-0 text-[#1565d8]"
                    />

                    <span className="line-clamp-2">
                      {getLocation(location)}
                    </span>
                  </div>

                  {/* =================================================
                      VIEW DETAILS
                  ================================================= */}

                  <div className="mt-4 text-right">
                    <span className="text-xs font-bold text-[#1565d8]">
                      {isOpen
                        ? "Hide Details ↑"
                        : "View Details →"}
                    </span>
                  </div>
                </button>

                {/* =================================================
                    EXPANDED DETAILS
                ================================================= */}

                {isOpen && (
                  <div className="border-t border-slate-200 px-4 pb-5 pt-5 dark:border-white/10 sm:px-5">
                    <div className="space-y-5">
                      {/* =================================================
                          BASIC DETAILS
                      ================================================= */}

                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          [
                            "Employment",
                            formatEmploymentType(
                              position.employmentType,
                            ),
                          ],
                          [
                            "Work Mode",
                            formatWorkMode(
                              position.workMode,
                            ),
                          ],
                          [
                            "Experience",
                            position.experience ||
                              "Not specified",
                          ],
                          [
                            "Salary",
                            formatSalary(
                              position.salary,
                            ),
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950"
                          >
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {label}
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* =================================================
                          VACANCIES
                      ================================================= */}

                      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Number of Vacancies
                        </span>

                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {position.vacancies ??
                            "Not specified"}
                        </span>
                      </div>

                      {/* =================================================
                          LOCATION
                      ================================================= */}

                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <MapPin
                            size={16}
                            className="text-[#1565d8]"
                          />

                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            Job Location
                          </h4>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
                          {getLocation(location)}
                        </div>
                      </div>

                      {/* =================================================
                          DESCRIPTION
                      ================================================= */}

                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <BriefcaseBusiness
                            size={16}
                            className="text-[#1565d8]"
                          />

                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            Job Description
                          </h4>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300">
                          {position.description ||
                            "No job description provided."}
                        </div>
                      </div>

                      {/* =================================================
                          APPLICATION OPTIONS
                      ================================================= */}

                      {hasApplicationOptions && (
                        <div className="border-t border-slate-200 pt-5 dark:border-white/10">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                Interested in this
                                position?
                              </h4>

                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Choose your preferred
                                application method.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setApplyPosition(
                                  position,
                                )
                              }
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f55b8] active:scale-[0.98] sm:w-auto"
                            >
                              Apply Now
                              <ExternalLink
                                size={16}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =================================================
          APPLY MODAL
      ================================================= */}

      {applyPosition && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setApplyPosition(null)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#091526]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1565d8]">
                  Apply Now
                </p>

                <h3 className="mt-1 line-clamp-2 text-base font-extrabold text-slate-900 dark:text-white">
                  {applyPosition.title ||
                    "Job Position"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setApplyPosition(null)
                }
                aria-label="Close application options"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* =================================================
                MODAL BODY
            ================================================= */}

            <div className="space-y-3 p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                How would you like to apply for this
                position?
              </p>

              {/* =================================================
                  APPLY ONLINE
              ================================================= */}

              {applyPosition.applicationUrl && (
                <a
                  href={
                    applyPosition.applicationUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#1565d8]/40 hover:bg-blue-50 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-blue-500/10"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1565d8] dark:bg-blue-500/10 dark:text-blue-300">
                    <ExternalLink size={20} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">
                      Apply Online
                    </span>

                    <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                      Open the employer&apos;s
                      application page
                    </span>
                  </span>
                </a>
              )}

              {/* =================================================
                  CALL RECRUITER
              ================================================= */}

              {applyPosition.contactPhone && (
                <a
                  href={`tel:${applyPosition.contactPhone}`}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-green-500/40 hover:bg-green-50 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-green-500/10"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                    <Phone size={20} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">
                      Call Recruiter
                    </span>

                    <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                      {applyPosition.contactPhone}
                    </span>
                  </span>
                </a>
              )}

              {/* =================================================
                  EMAIL RESUME
              ================================================= */}

              {applyPosition.contactEmail && (
                <a
                  href={`mailto:${applyPosition.contactEmail}?subject=${encodeURIComponent(
                    `Application for ${
                      applyPosition.title ||
                      "Job Position"
                    }`,
                  )}`}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-orange-500/40 hover:bg-orange-50 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-orange-500/10"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                    <Mail size={20} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">
                      Email Resume
                    </span>

                    <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                      {applyPosition.contactEmail}
                    </span>
                  </span>
                </a>
              )}
            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="border-t border-slate-200 px-5 py-4 dark:border-white/10">
              <button
                type="button"
                onClick={() =>
                  setApplyPosition(null)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}