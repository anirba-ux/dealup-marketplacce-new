import Link from "next/link";

import { auth } from "@/auth";

import {
  findJobsByEmployer,
} from "@/lib/repositories/job.repository";

import MyJobCard, {
  type MyJob,
} from "@/components/dashboard/MyJobCard";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Home,
  Plus,
  Rocket,
} from "lucide-react";

// =====================================================
// PAGE PROPS
// =====================================================

interface MyJobsPageProps {
  searchParams?: Promise<{
    view?: string;
  }>;
}

// =====================================================
// PAGE
// =====================================================

export default async function MyJobsPage({
  searchParams,
}: MyJobsPageProps) {
  // ===================================================
  // AUTHENTICATION
  // ===================================================

  const session = await auth();

  // ===================================================
  // UNAUTHORIZED
  // ===================================================

  if (!session?.user?.id) {
    return (
      <main
        className="
          min-h-screen
          bg-slate-50
          px-4
          py-12
          dark:bg-slate-950
        "
      >
        <div
          className="
            mx-auto
            max-w-3xl
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-10
            text-center
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <h1
            className="
              text-3xl
              font-extrabold
              text-slate-900
              dark:text-white
            "
          >
            Unauthorized
          </h1>

          <p
            className="
              mt-3
              text-slate-500
              dark:text-slate-400
            "
          >
            Please login to manage your jobs.
          </p>

          <Link
            href="/login"
            className="
              mt-6
              inline-flex
              rounded-xl
              bg-[#1565d8]
              px-6
              py-3
              font-semibold
              text-white
              transition
              hover:bg-[#0f52ba]
            "
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  // ===================================================
  // EMPLOYER ID
  // ===================================================

  const employerId = String(
    session.user.id,
  );

  // ===================================================
  // SEARCH PARAMS
  // ===================================================

  const params = await searchParams;

  const showAll =
    params?.view === "all";

  // ===================================================
  // LOAD JOBS
  // ===================================================

  const jobs =
    await findJobsByEmployer(
      employerId,
    );

  // ===================================================
  // SERIALIZE MONGODB VALUES
  // ===================================================

  const serializedJobs: MyJob[] =
    jobs.map((job) => ({
      // -------------------------------------------------
      // ID
      // -------------------------------------------------

      _id: job._id.toString(),

      // -------------------------------------------------
      // BASIC JOB DATA
      // -------------------------------------------------

      listingType:
        job.listingType,

      status:
        job.status,

      jobs:
        job.jobs,

      // -------------------------------------------------
      // EMPLOYER
      // -------------------------------------------------

      employer:
        job.employer,

      employerId:
        job.employerId,

      employerName:
        job.employerName,

      // -------------------------------------------------
      // LOCATION
      // -------------------------------------------------

      location:
        job.location,

      // -------------------------------------------------
      // IMAGES
      // -------------------------------------------------

      thumbnail:
        job.thumbnail,

      infographic:
        job.infographic,

      // -------------------------------------------------
      // STATISTICS
      // -------------------------------------------------

      views:
        job.views ?? 0,

      applications:
        job.applications ?? 0,

      // -------------------------------------------------
      // FEATURED
      // -------------------------------------------------

      featuredAt:
        job.featuredAt
          ? new Date(
              job.featuredAt,
            ).toISOString()
          : undefined,

      featuredUntil:
        job.featuredUntil
          ? new Date(
              job.featuredUntil,
            ).toISOString()
          : undefined,

      // -------------------------------------------------
      // BOOSTED
      // -------------------------------------------------

      boostedAt:
        job.boostedAt
          ? new Date(
              job.boostedAt,
            ).toISOString()
          : undefined,

      boostedUntil:
        job.boostedUntil
          ? new Date(
              job.boostedUntil,
            ).toISOString()
          : undefined,

      // -------------------------------------------------
      // DATES
      // -------------------------------------------------

      createdAt:
        job.createdAt
          ? new Date(
              job.createdAt,
            ).toISOString()
          : undefined,

      updatedAt:
        job.updatedAt
          ? new Date(
              job.updatedAt,
            ).toISOString()
          : undefined,
    }));

  // ===================================================
  // STATISTICS
  // ===================================================

  const totalJobs =
    serializedJobs.length;

  const activeJobs =
    serializedJobs.filter(
      (job) =>
        job.status === "active",
    ).length;

  const totalApplications =
    serializedJobs.reduce(
      (total, job) =>
        total +
        Number(
          job.applications ?? 0,
        ),
      0,
    );

  // ===================================================
  // VISIBLE JOBS
  //
  // Default:
  // First 3 jobs
  //
  // ?view=all:
  // All jobs
  // ===================================================

  const visibleJobs = showAll
    ? serializedJobs
    : serializedJobs.slice(0, 3);

  // ===================================================
  // HAS MORE JOBS
  // ===================================================

  const hasMoreJobs =
    totalJobs > 3;

  // ===================================================
  // RENDER
  // ===================================================

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
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =================================================
            TOP NAVIGATION
        ================================================= */}

        <div
          className="
            mb-5
            flex
            items-center
            justify-between
            gap-3
            sm:mb-8
          "
        >
          {/* Back */}

          <Link
            href="/dashboard"
            className="
              inline-flex
              items-center
              gap-2
              rounded-2xl
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
              hover:bg-slate-50
              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
          >
            <ArrowLeft
              size={17}
            />

            <span>
              Back
            </span>
          </Link>

          {/* Home */}

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2
              rounded-2xl
              bg-[#1565d8]
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#0f52ba]
            "
          >
            <Home
              size={17}
            />

            <span>
              Home
            </span>
          </Link>
        </div>

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div
          className="
            mb-6
            flex
            flex-col
            gap-4
            sm:mb-8
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#1565d8]/10
                  text-[#1565d8]
                "
              >
                <BriefcaseBusiness
                  size={23}
                />
              </div>

              <h1
                className="
                  text-3xl
                  font-extrabold
                  tracking-tight
                  text-slate-900
                  dark:text-white
                  sm:text-4xl
                "
              >
                My Jobs
              </h1>
            </div>

            <p
              className="
                mt-2
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              Manage all your published job
              listings.
            </p>
          </div>

          {/* Post New Job */}

          <Link
            href="/sell"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-[#1565d8]
              px-5
              py-3
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-[#0f52ba]
              sm:w-auto
            "
          >
            <Plus
              size={18}
            />

            Post a New Job
          </Link>
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {serializedJobs.length === 0 ? (
          <div
            className="
              rounded-3xl
              border
              border-dashed
              border-slate-300
              bg-white
              px-5
              py-16
              text-center
              shadow-sm
              dark:border-slate-700
              dark:bg-slate-900
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-[#1565d8]/10
                text-[#1565d8]
              "
            >
              <BriefcaseBusiness
                size={30}
              />
            </div>

            <h2
              className="
                mt-5
                text-2xl
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              No Jobs Yet
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              You haven't published any job
              listings yet. Create your first
              job and start finding the right
              candidates.
            </p>

            <Link
              href="/sell"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-2xl
                bg-[#1565d8]
                px-6
                py-3
                font-semibold
                text-white
                transition
                hover:bg-[#0f52ba]
              "
            >
              <Plus
                size={18}
              />

              Post Your First Job
            </Link>
          </div>
        ) : (
          <>
            {/* =================================================
                STATISTICS
            ================================================= */}

            <div
              className="
                mb-6
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-3
              "
            >
              {/* Total Jobs */}

              <div
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >
                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Total Jobs
                </p>

                <p
                  className="
                    mt-2
                    text-3xl
                    font-extrabold
                    text-[#1565d8]
                  "
                >
                  {totalJobs}
                </p>
              </div>

              {/* Active Jobs */}

              <div
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >
                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Active Jobs
                </p>

                <p
                  className="
                    mt-2
                    text-3xl
                    font-extrabold
                    text-green-600
                  "
                >
                  {activeJobs}
                </p>
              </div>

              {/* Applications */}

              <div
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >
                <p
                  className="
                    text-sm
                    font-medium
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Applications
                </p>

                <p
                  className="
                    mt-2
                    text-3xl
                    font-extrabold
                    text-purple-600
                  "
                >
                  {totalApplications}
                </p>
              </div>
            </div>

            {/* =================================================
                PROMOTION BANNER
            ================================================= */}

            <div
              className="
                mb-8
                overflow-hidden
                rounded-3xl
                border
                border-blue-100
                bg-gradient-to-br
                from-blue-50
                via-white
                to-amber-50
                p-5
                shadow-sm
                dark:border-slate-800
                dark:from-blue-950/30
                dark:via-slate-900
                dark:to-amber-950/20
                sm:p-6
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-5
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div>
                  <div
                    className="
                      mb-3
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      bg-amber-100
                      text-amber-600
                      dark:bg-amber-950/50
                      dark:text-amber-400
                    "
                  >
                    <Rocket
                      size={23}
                    />
                  </div>

                  <h2
                    className="
                      text-xl
                      font-extrabold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    Promote Your Jobs
                  </h2>

                  <p
                    className="
                      mt-1
                      max-w-xl
                      text-sm
                      leading-6
                      text-slate-600
                      dark:text-slate-400
                    "
                  >
                    Featured and boosted job
                    listings can get additional
                    visibility from candidates.
                  </p>
                </div>

                <Link
                  href="/dashboard/premium"
                  className="
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#1565d8]
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-[#0f52ba]
                    sm:w-auto
                  "
                >
                  Go Premium
                </Link>
              </div>
            </div>

            {/* =================================================
                JOBS HEADER
            ================================================= */}

            <div
              className="
                mb-4
                flex
                items-end
                justify-between
                gap-3
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-extrabold
                    text-slate-900
                    dark:text-white
                    sm:text-2xl
                  "
                >
                  Your Jobs
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {showAll
                    ? "Showing all your published job listings."
                    : "Showing your latest 3 job listings."}
                </p>
              </div>

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                "
              >
                {/* Job Count */}

                <span
                  className="
                    rounded-full
                    bg-[#1565d8]/10
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    text-[#1565d8]
                  "
                >
                  {totalJobs}{" "}
                  {totalJobs === 1
                    ? "Job"
                    : "Jobs"}
                </span>

                {/* View All / Show Less */}

                {hasMoreJobs && (
                  <Link
                    href={
                      showAll
                        ? "/dashboard/my-jobs"
                        : "/dashboard/my-jobs?view=all"
                    }
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-[#1565d8]
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-white
                      transition
                      hover:bg-[#0f52ba]
                    "
                  >
                    {showAll
                      ? "Show Less"
                      : "View All"}

                    <ArrowRight
                      size={13}
                      className={
                        showAll
                          ? "rotate-180"
                          : ""
                      }
                    />
                  </Link>
                )}
              </div>
            </div>

            {/* =================================================
                JOB CARDS
            ================================================= */}

            <div
              className="
                -mx-4
                flex
                snap-x
                snap-mandatory
                gap-4
                overflow-x-auto
                px-4
                pb-3

                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden

                sm:mx-0
                sm:grid
                sm:grid-cols-2
                sm:gap-5
                sm:overflow-visible
                sm:px-0
                sm:pb-0

                lg:grid-cols-3
              "
            >
              {visibleJobs.map(
                (job) => (
                  <div
                    key={job._id}
                    className="
                      w-[92%]
                      shrink-0
                      snap-start

                      sm:w-auto
                      sm:shrink
                    "
                  >
                    <MyJobCard
                      job={job}
                    />
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}