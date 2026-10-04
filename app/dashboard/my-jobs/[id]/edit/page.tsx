import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ArrowLeft, BriefcaseBusiness, Home } from "lucide-react";

import { auth } from "@/auth";

import { findJobById } from "@/lib/repositories/job.repository";

import JobForm from "@/components/job/JobForm";

import type { JobFormData } from "@/lib/validations/job";

// =====================================================
// TYPES
// =====================================================

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// =====================================================
// PAGE
// =====================================================

export default async function EditJobPage({ params }: Props) {
  // ---------------------------------------------------
  // Get Job ID
  // ---------------------------------------------------

  const { id } = await params;

  // ---------------------------------------------------
  // Authentication
  // ---------------------------------------------------

  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/my-jobs/${id}/edit`);
  }

  // ---------------------------------------------------
  // Employer ID
  // ---------------------------------------------------

  const employerId = String(session.user.id);

  // ---------------------------------------------------
  // Load Job
  // ---------------------------------------------------

  const job = await findJobById(id);

  if (!job) {
    notFound();
  }

  // ---------------------------------------------------
  // Ownership Protection
  // ---------------------------------------------------

  if (String(job.employerId) !== employerId) {
    notFound();
  }

  // ---------------------------------------------------
  // Ensure Jobs Exist
  // ---------------------------------------------------

  if (!job.jobs || job.jobs.length === 0) {
    notFound();
  }

  // ---------------------------------------------------
  // Convert MongoDB Job → Form Data
  // ---------------------------------------------------

  const initialData: JobFormData = {
    listingType: job.listingType === "multiple" ? "multiple" : "single",

    employer: {
      companyName: job.employer?.companyName ?? job.employerName ?? "",

      contactPerson: job.employer?.contactPerson ?? "",

      phone: job.employer?.phone ?? "",

      email: job.employer?.email ?? "",

      website: job.employer?.website ?? "",
    },

    jobs: job.jobs.map((position) => ({
      title: position.title ?? "",

      category: position.category ?? "",

      subcategory: position.subcategory ?? "",

      description: position.description ?? "",

      employmentType: position.employmentType ?? "full-time",

      workMode: position.workMode ?? "on-site",

      experience: position.experience ?? "",

      salary: {
        min: position.salary?.min ?? 0,

        max: position.salary?.max,

        period: position.salary?.period ?? "month",
      },

      vacancies: position.vacancies ?? 1,
    })),

    location: {
      country: job.location?.country ?? "India",

      state: job.location?.state ?? "West Bengal",

      district: job.location?.district ?? "",

      city: job.location?.city ?? "",

      pincode: job.location?.pincode ?? "",

      address: job.location?.address ?? "",

      coordinates: {
        lat: job.location?.coordinates?.lat ?? 0,

        lng: job.location?.coordinates?.lng ?? 0,
      },
    },

    // Keep the existing poster.
    //
    // If thumbnail exists, use it.
    thumbnail:
      job.thumbnail?.publicId && job.thumbnail?.url
        ? {
            publicId: job.thumbnail.publicId,

            url: job.thumbnail.url,
          }
        : undefined,

    // Keep old infographic data
    // for backward compatibility.
    infographic:
      job.infographic?.publicId && job.infographic?.url
        ? {
            publicId: job.infographic.publicId,

            url: job.infographic.url,
          }
        : undefined,
  };

  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        py-5
        text-slate-900
        dark:bg-slate-950
        dark:text-white
        sm:py-8
        lg:py-10
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-6xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* ================================================= */}
        {/* TOP NAVIGATION */}
        {/* ================================================= */}

        <div
          className="
            mb-6
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
          "
        >
          {/* Back */}

          <Link
            href="/dashboard/my-jobs"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:border-[#1565d8]
              hover:text-[#1565d8]
              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-200
              dark:hover:border-[#1565d8]
              dark:hover:text-[#60a5fa]
            "
          >
            <ArrowLeft size={17} />

            <span>Back to My Jobs</span>
          </Link>

          {/* Home */}

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
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:border-[#1565d8]
              hover:text-[#1565d8]
              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-200
              dark:hover:border-[#1565d8]
              dark:hover:text-[#60a5fa]
            "
          >
            <Home size={17} />

            <span>Home</span>
          </Link>
        </div>

        {/* ================================================= */}
        {/* PAGE HEADER */}
        {/* ================================================= */}

        <div
          className="
            mb-8
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
            sm:p-7
          "
        >
          <div
            className="
              flex
              items-start
              gap-4
            "
          >
            {/* Icon */}

            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#1565d8]/10
                text-[#1565d8]
                dark:bg-[#1565d8]/20
              "
            >
              <BriefcaseBusiness size={25} />
            </div>

            {/* Text */}

            <div className="min-w-0">
              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                  sm:text-3xl
                "
              >
                Edit Job Listing
              </h1>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Update your job information, employer details, location and job
                poster.
              </p>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* JOB FORM */}
        {/* ================================================= */}

        <JobForm
          mode="edit"
          jobId={id}
          initialData={initialData}
          listingType={initialData.listingType}
        />
      </div>
    </main>
  );
}
