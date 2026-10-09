"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Home,
  ShoppingBag,
  Users,
  Wrench,
} from "lucide-react";

import ProductForm from "@/components/product/ProductForm";
import JobForm from "@/components/job/JobForm";
import ServiceForm from "@/components/services/ServiceForm";

type ListingType = "product" | "job" | "service";

type JobType = "single" | "multiple";

export default function SellListingSelector() {
  const [listingType, setListingType] =
    useState<ListingType | null>(null);

  const [jobType, setJobType] =
    useState<JobType | null>(null);

  // =====================================================
  // PRODUCT FORM
  // =====================================================

  if (listingType === "product") {
    return (
      <div>
        {/* Back to Post an Ad */}

        <button
          type="button"
          onClick={() => setListingType(null)}
          className="
            mb-6
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

            dark:hover:border-[#1565d8]/40
            dark:hover:bg-[#1565d8]/10
            dark:hover:text-white
          "
        >
          <ArrowLeft size={17} />
          Back to Post an Ad
        </button>

        <ProductForm />
      </div>
    );
  }

  // =====================================================
  // SERVICE FORM
  // =====================================================

  if (listingType === "service") {
    return (
      <div>
        {/* Back to Post an Ad */}

        <button
          type="button"
          onClick={() => setListingType(null)}
          className="
            mb-6
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
            transition-all
            duration-200

            hover:-translate-y-0.5
            hover:border-emerald-300
            hover:bg-emerald-50
            hover:text-emerald-700
            hover:shadow-md

            active:scale-95

            dark:border-white/10
            dark:bg-white/5
            dark:text-slate-200

            dark:hover:border-emerald-500/40
            dark:hover:bg-emerald-500/10
            dark:hover:text-emerald-300
          "
        >
          <ArrowLeft size={17} />
          Back to Post an Ad
        </button>

        <ServiceForm />
      </div>
    );
  }

  // =====================================================
  // JOB FORM
  // =====================================================

  if (listingType === "job") {
    // ---------------------------------------------------
    // JOB FORM
    // ---------------------------------------------------

    if (jobType) {
      return (
        <div>
          {/* Back to Job Type */}

          <button
            type="button"
            onClick={() => setJobType(null)}
            className="
              mb-6
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

              dark:hover:border-[#1565d8]/40
              dark:hover:bg-[#1565d8]/10
              dark:hover:text-white
            "
          >
            <ArrowLeft size={17} />
            Back to Job Type
          </button>

          <JobForm listingType={jobType} />
        </div>
      );
    }

    // ---------------------------------------------------
    // JOB TYPE SELECTOR
    // ---------------------------------------------------

    return (
      <div>
        {/* Back to Post an Ad */}

        <button
          type="button"
          onClick={() => setListingType(null)}
          className="
            mb-6
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

            dark:hover:border-[#1565d8]/40
            dark:hover:bg-[#1565d8]/10
            dark:hover:text-white
          "
        >
          <ArrowLeft size={17} />
          Back to Post an Ad
        </button>

        {/* Job Header */}

        <div className="mb-8 text-center">
          <div
            className="
              mx-auto
              mb-4
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-[#1565d8]/10
              text-[#1565d8]
            "
          >
            <BriefcaseBusiness size={28} />
          </div>

          <h2
            className="
              text-2xl
              font-bold
              text-slate-900
              dark:text-white

              sm:text-3xl
            "
          >
            Post a Job
          </h2>

          <p
            className="
              mx-auto
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-slate-600
              dark:text-slate-400
            "
          >
            Choose how you want to publish your job vacancies.
          </p>
        </div>

        {/* Job Type Cards */}

        <div className="grid gap-5 md:grid-cols-2">
          {/* =================================================
              SINGLE JOB
          ================================================= */}

          <button
            type="button"
            onClick={() => setJobType("single")}
            className="
              group
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              text-left
              shadow-sm
              transition-all
              duration-300

              hover:-translate-y-1
              hover:border-[#1565d8]/40
              hover:shadow-xl

              dark:border-slate-800
              dark:bg-slate-950

              dark:hover:border-[#1565d8]/50
            "
          >
            <div className="mb-5 flex items-center justify-between">
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#1565d8]/10
                  text-[#1565d8]
                "
              >
                <BriefcaseBusiness size={27} />
              </div>

              <CheckCircle2
                size={21}
                className="
                  text-slate-300
                  transition

                  group-hover:text-[#1565d8]

                  dark:text-slate-700
                  dark:group-hover:text-[#1565d8]
                "
              />
            </div>

            <h3
              className="
                text-xl
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              Single Job
            </h3>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-600
                dark:text-slate-400
              "
            >
              Post one specific vacancy with complete job details,
              salary, experience and requirements.
            </p>

            <div
              className="
                mt-5
                rounded-2xl
                bg-slate-50
                p-4
                dark:bg-slate-900
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[#1565d8]
                "
              >
                Example
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-medium
                  text-slate-800
                  dark:text-slate-200
                "
              >
                Sales Executive — 2 Vacancies
              </p>
            </div>

            <div
              className="
                mt-5
                text-sm
                font-semibold
                text-[#1565d8]
              "
            >
              Post Single Job →
            </div>
          </button>

          {/* =================================================
              MULTIPLE JOBS
          ================================================= */}

          <button
            type="button"
            onClick={() => setJobType("multiple")}
            className="
              group
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-6
              text-left
              shadow-sm
              transition-all
              duration-300

              hover:-translate-y-1
              hover:border-[#f5a623]/50
              hover:shadow-xl

              dark:border-slate-800
              dark:bg-slate-950

              dark:hover:border-[#f5a623]/50
            "
          >
            <div className="mb-5 flex items-center justify-between">
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#f5a623]/10
                  text-[#f5a623]
                "
              >
                <Users size={27} />
              </div>

              <CheckCircle2
                size={21}
                className="
                  text-slate-300
                  transition

                  group-hover:text-[#f5a623]

                  dark:text-slate-700
                  dark:group-hover:text-[#f5a623]
                "
              />
            </div>

            <h3
              className="
                text-xl
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              Multiple Jobs
            </h3>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-600
                dark:text-slate-400
              "
            >
              Publish multiple different positions from the same
              employer in one job listing.
            </p>

            <div
              className="
                mt-5
                rounded-2xl
                bg-slate-50
                p-4
                dark:bg-slate-900
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[#f5a623]
                "
              >
                Example
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-medium
                  text-slate-800
                  dark:text-slate-200
                "
              >
                Sales Executive + Accountant + Driver
              </p>
            </div>

            <div
              className="
                mt-5
                text-sm
                font-semibold
                text-[#d48a00]
                dark:text-[#f5b84b]
              "
            >
              Post Multiple Jobs →
            </div>
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN POST AD SELECTION
  // =====================================================

  return (
    <div>
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8 text-center">
        <div
          className="
            mx-auto
            mb-4
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-[#1565d8]/10
            text-[#1565d8]
          "
        >
          <ShoppingBag size={28} />
        </div>

        <h2
          className="
            text-2xl
            font-bold
            text-slate-900
            dark:text-white

            sm:text-3xl
          "
        >
          Post an Ad
        </h2>

        <p
          className="
            mx-auto
            mt-2
            max-w-xl
            text-sm
            leading-6
            text-slate-600
            dark:text-slate-400
          "
        >
          What would you like to post on DealUp?
        </p>
      </div>

      {/* =================================================
          LISTING TYPE CARDS
      ================================================= */}

      <div
        className="
          grid
          gap-5

          md:grid-cols-2
          lg:grid-cols-3
        "
      >
        {/* =================================================
            SELL PRODUCT
        ================================================= */}

        <button
          type="button"
          onClick={() => setListingType("product")}
          className="
            group
            flex
            h-full
            flex-col
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            text-left
            shadow-sm
            transition-all
            duration-300

            hover:-translate-y-1
            hover:border-[#1565d8]/40
            hover:shadow-xl

            dark:border-slate-800
            dark:bg-slate-950

            dark:hover:border-[#1565d8]/50
          "
        >
          <div className="mb-5 flex items-center justify-between">
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-[#1565d8]/10
                text-[#1565d8]
              "
            >
              <ShoppingBag size={27} />
            </div>

            <CheckCircle2
              size={21}
              className="
                text-slate-300
                transition

                group-hover:text-[#1565d8]

                dark:text-slate-700
                dark:group-hover:text-[#1565d8]
              "
            />
          </div>

          <h3
            className="
              text-xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            Sell a Product
          </h3>

          <p
            className="
              mt-2
              flex-1
              text-sm
              leading-6
              text-slate-600
              dark:text-slate-400
            "
          >
            Sell mobiles, vehicles, electronics, furniture,
            property and other products locally.
          </p>

          <div
            className="
              mt-5
              text-sm
              font-semibold
              text-[#1565d8]
            "
          >
            Continue to Product Listing →
          </div>
        </button>

        {/* =================================================
            POST JOB
        ================================================= */}

        <button
          type="button"
          onClick={() => setListingType("job")}
          className="
            group
            flex
            h-full
            flex-col
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            text-left
            shadow-sm
            transition-all
            duration-300

            hover:-translate-y-1
            hover:border-[#f5a623]/50
            hover:shadow-xl

            dark:border-slate-800
            dark:bg-slate-950

            dark:hover:border-[#f5a623]/50
          "
        >
          <div className="mb-5 flex items-center justify-between">
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-[#f5a623]/10
                text-[#f5a623]
              "
            >
              <BriefcaseBusiness size={27} />
            </div>

            <CheckCircle2
              size={21}
              className="
                text-slate-300
                transition

                group-hover:text-[#f5a623]

                dark:text-slate-700
                dark:group-hover:text-[#f5a623]
              "
            />
          </div>

          <h3
            className="
              text-xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            Post a Job
          </h3>

          <p
            className="
              mt-2
              flex-1
              text-sm
              leading-6
              text-slate-600
              dark:text-slate-400
            "
          >
            Find employees by posting a single vacancy or
            multiple positions together.
          </p>

          <div
            className="
              mt-5
              text-sm
              font-semibold
              text-[#d48a00]
              dark:text-[#f5b84b]
            "
          >
            Continue to Job Listing →
          </div>
        </button>

        {/* =================================================
            OFFER A SERVICE
        ================================================= */}

        <button
          type="button"
          onClick={() => setListingType("service")}
          className="
            group
            flex
            h-full
            flex-col
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-6
            text-left
            shadow-sm
            transition-all
            duration-300

            hover:-translate-y-1
            hover:border-emerald-400/60
            hover:shadow-xl

            dark:border-slate-800
            dark:bg-slate-950

            dark:hover:border-emerald-500/50
          "
        >
          <div className="mb-5 flex items-center justify-between">
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-emerald-500/10
                text-emerald-600

                dark:text-emerald-400
              "
            >
              <Wrench size={27} />
            </div>

            <CheckCircle2
              size={21}
              className="
                text-slate-300
                transition

                group-hover:text-emerald-500

                dark:text-slate-700
                dark:group-hover:text-emerald-400
              "
            />
          </div>

          <h3
            className="
              text-xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            Offer a Service
          </h3>

          <p
            className="
              mt-2
              flex-1
              text-sm
              leading-6
              text-slate-600
              dark:text-slate-400
            "
          >
            List your local service or business and connect
            with nearby customers.
          </p>

          <div
            className="
              mt-5
              text-sm
              font-semibold
              text-emerald-600
              dark:text-emerald-400
            "
          >
            Continue to Service Listing →
          </div>
        </button>
      </div>

      {/* =================================================
          HELPER NOTE
      ================================================= */}

      <div
        className="
          mt-6
          flex
          items-start
          gap-3
          rounded-2xl
          border
          border-slate-200
          bg-slate-50
          p-4
          dark:border-slate-800
          dark:bg-slate-900/60
        "
      >
        <Home
          size={18}
          className="
            mt-0.5
            shrink-0
            text-[#1565d8]
          "
        />

        <p
          className="
            text-xs
            leading-5
            text-slate-500
            dark:text-slate-400
          "
        >
          Choose the option that best matches what you want
          to publish on DealUp Marketplace.
        </p>
      </div>
    </div>
  );
}