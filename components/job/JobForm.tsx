"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import type { ReactNode } from "react";

import { useFieldArray, useForm } from "react-hook-form";

import type { FieldPath } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  BriefcaseBusiness,
  Building2,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";

import { jobSchema, type JobFormData } from "@/lib/validations/job";

// =====================================================
// Types
// =====================================================

interface JobFormProps {
  mode?: "create" | "edit";

  /**
   * Required when mode="edit"
   */
  jobId?: string;

  initialData?: JobFormData;

  listingType?: "single" | "multiple";
}

// =====================================================
// Dynamic Map
// =====================================================

const JobLocationPicker = dynamic(() => import("./JobLocationPicker"), {
  ssr: false,

  loading: () => (
    <div className="flex min-h-[360px] items-center justify-center bg-slate-100 dark:bg-slate-900">
      <div className="text-center">
        <Loader2 size={30} className="mx-auto animate-spin text-[#1565d8]" />

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Loading map...
        </p>
      </div>
    </div>
  ),
});

// =====================================================
// Constants
// =====================================================

const TOTAL_STEPS = 4;

const JOB_CATEGORIES = [
  {
    value: "sales",
    label: "Sales",
  },
  {
    value: "marketing",
    label: "Marketing",
  },
  {
    value: "it",
    label: "IT & Software",
  },
  {
    value: "customer-support",
    label: "Customer Support",
  },
  {
    value: "delivery",
    label: "Delivery",
  },
  {
    value: "driver",
    label: "Driver",
  },
  {
    value: "accounting",
    label: "Accounting",
  },
  {
    value: "education",
    label: "Education",
  },
  {
    value: "healthcare",
    label: "Healthcare",
  },
  {
    value: "other",
    label: "Other",
  },
];

// =====================================================
// Component
// =====================================================

export default function JobForm({
  mode = "create",
  jobId,
  initialData,
  listingType: selectedListingType = "single",
}: JobFormProps) {
  const router = useRouter();

  const [step, setStep] = useState(0);

  const [submitError, setSubmitError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [countdown, setCountdown] = useState(5);

  const [imageUploading, setImageUploading] = useState(false);

  const [imageError, setImageError] = useState("");

  const [locationLoading, setLocationLoading] = useState(false);

  const [locationError, setLocationError] = useState("");

  const [useSameLocation, setUseSameLocation] = useState(
    selectedListingType === "multiple",
  );

  const publishLockRef = useRef(false);

  // ===================================================
  // Default Job
  // ===================================================

  const defaultJob: JobFormData["jobs"][number] = {
    title: "",
    category: "",
    subcategory: "",
    description: "",
    employmentType: "full-time",
    workMode: "on-site",
    experience: "",
    salary: {
      min: 0,
      max: undefined,
      period: "month",
    },
    vacancies: 1,

    applicationUrl: "",
    contactPhone: "",
    contactEmail: "",
  };

  // ===================================================
  // Form
  // ===================================================

  const {
    register,
    control,
    watch,
    handleSubmit,
    trigger,
    setValue,
    getValues,

    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema) as any,

    defaultValues: initialData ?? {
      listingType: selectedListingType,

      employer: {
        companyName: "",

        contactPerson: "",

        phone: "",

        email: "",

        website: "",
      },

      jobs: [defaultJob],

      location: {
        country: "India",

        state: "West Bengal",

        district: "",

        city: "",

        pincode: "",

        address: "",

        coordinates: {
          lat: 0,
          lng: 0,
        },
      },

      thumbnail: {
        publicId: "",
        url: "",
      },
    },
  });

  // ===================================================
  // Job Array
  // ===================================================

  const { fields, append, remove } = useFieldArray({
    control,
    name: "jobs",
  });

  // ===================================================
  // Watch
  // ===================================================

  const listingType = watch("listingType");

  const jobs = watch("jobs");

  const location = watch("location");

  const thumbnail = watch("thumbnail");

  // ===================================================
  // Steps
  // ===================================================

  const steps = useMemo(
    () => [
      {
        title: "Employer",
        description: "Company and contact details",
      },

      {
        title: "Job Details",
        description: "Add vacancy information",
      },

      {
        title: "Location",
        description: "Set exact job location",
      },

      {
        title: "Review",
        description: "Check before publishing",
      },
    ],
    [],
  );

  // ===================================================
  // Success Countdown
  // ===================================================

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    if (countdown <= 0) {
      router.push(mode === "edit" ? "/dashboard/my-jobs" : "/dashboard");

      router.refresh();

      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((previous) => previous - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [successMessage, countdown, router, mode]);

  // ===================================================
  // Helpers
  // ===================================================

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function createDefaultJob(): JobFormData["jobs"][number] {
    return {
      ...defaultJob,

      salary: {
        min: 0,
        max: undefined,
        period: "month",
      },
    };
  }

  // ===================================================
  // Add Job
  // ===================================================

  function handleAddJob() {
    const currentLocation = getValues("location");

    const newJob = createDefaultJob();

    if (listingType === "multiple" && useSameLocation) {
      const lat = Number(currentLocation?.coordinates?.lat);
      const lng = Number(currentLocation?.coordinates?.lng);

      const hasValidLocation =
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat !== 0 &&
        lng !== 0 &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;

      if (hasValidLocation) {
        newJob.location = currentLocation;
      }
    }

    append(newJob);

    setTimeout(() => {
      const nextIndex = fields.length;

      document.getElementById(`job-${nextIndex}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }

  // ===================================================
  // Remove Job
  // ===================================================

  function handleRemoveJob(index: number) {
    if (fields.length <= 1) {
      return;
    }

    remove(index);
  }

  // ===================================================
  // Previous
  // ===================================================

  function previousStep() {
    setSubmitError("");
    setLocationError("");

    setStep((current) => Math.max(current - 1, 0));

    scrollToTop();
  }

  // ===================================================
  // Next
  // ===================================================

  async function nextStep() {
    setSubmitError("");
    setLocationError("");

    let fieldsToValidate: FieldPath<JobFormData>[] | undefined;

    // Step 1 — Employer
    if (step === 0) {
      fieldsToValidate = ["employer"];
    }

    // Step 2 — Job Details
    if (step === 1) {
      fieldsToValidate = ["jobs"];
    }

    // Step 3 — Location
    if (step === 2) {
      fieldsToValidate = ["location"];

      // Multiple / Weekly Hiring: the top-level location is kept
      // for backward compatibility, while every position gets its
      // own location. When the shared-location option is enabled,
      // copy the master location into every position before validation.
      if (listingType === "multiple") {
        const masterLocation = getValues("location");

        if (useSameLocation) {
          jobs.forEach((_, index) => {
            setValue(`jobs.${index}.location`, masterLocation, {
              shouldDirty: true,
              shouldValidate: true,
            });
          });
        } else {
          const firstPositionLocation = getValues("jobs.0.location");

          if (firstPositionLocation) {
            setValue("location", firstPositionLocation, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }
        }

        for (let index = 0; index < jobs.length; index += 1) {
          const positionLocation = getValues(`jobs.${index}.location`);
          const lat = Number(positionLocation?.coordinates?.lat);
          const lng = Number(positionLocation?.coordinates?.lng);

          if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat === 0 ||
            lng === 0 ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
          ) {
            setLocationError(
              `Please select a valid location for Position ${index + 1}.`,
            );
            return;
          }
        }
      } else {
        const lat = Number(getValues("location.coordinates.lat"));
        const lng = Number(getValues("location.coordinates.lng"));

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng) ||
          lat === 0 ||
          lng === 0
        ) {
          setLocationError(
            "Please select the exact job location on the map or use your current location.",
          );
          return;
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          setLocationError(
            "The selected map coordinates are invalid. Please select the location again.",
          );
          return;
        }
      }
    }

    const valid = fieldsToValidate ? await trigger(fieldsToValidate) : true;

    if (!valid) {
      setTimeout(() => {
        const firstInvalid = document.querySelector<HTMLElement>(
          '[aria-invalid="true"]',
        );

        firstInvalid?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        firstInvalid?.focus();
      }, 50);

      return;
    }

    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));

    scrollToTop();
  }

  // ===================================================
  // Location Change
  // ===================================================

  async function handleLocationChange(lat: number, lng: number) {
    setLocationError("");

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setLocationError("Invalid map coordinates.");

      return;
    }

    setValue("location.coordinates.lat", lat, {
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("location.coordinates.lng", lng, {
      shouldDirty: true,
      shouldValidate: true,
    });

    try {
      setLocationLoading(true);

      const response = await fetch(
        `/api/geocode?mode=reverse&lat=${encodeURIComponent(
          lat,
        )}&lng=${encodeURIComponent(lng)}`,
      );

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      if (!result?.success) {
        return;
      }

      const address = result.address ?? {};

      setValue("location.country", address.country || "India", {
        shouldDirty: true,
      });

      setValue("location.state", address.state || "West Bengal", {
        shouldDirty: true,
      });

      setValue("location.district", address.district || "", {
        shouldDirty: true,
      });

      setValue(
        "location.city",
        address.city || address.town || address.village || "",
        {
          shouldDirty: true,
        },
      );

      setValue("location.pincode", address.postcode || "", {
        shouldDirty: true,
      });

      setValue("location.address", result.displayName || "", {
        shouldDirty: true,
      });
    } catch (error) {
      console.error("LOCATION REVERSE GEOCODE ERROR:", error);
    } finally {
      setLocationLoading(false);
    }
  }

  // ===================================================
  // Position Location Change
  // ===================================================

  async function handlePositionLocationChange(
    index: number,
    lat: number,
    lng: number,
  ) {
    setLocationError("");

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setLocationError(`Invalid map coordinates for Position ${index + 1}.`);
      return;
    }

    const baseLocation = getValues(`jobs.${index}.location`) ?? {
      country: "India",
      state: "West Bengal",
      district: "",
      city: "",
      pincode: "",
      address: "",
      coordinates: { lat: 0, lng: 0 },
    };

    setValue(
      `jobs.${index}.location`,
      {
        ...baseLocation,
        coordinates: { lat, lng },
      },
      { shouldDirty: true, shouldValidate: true },
    );

    // Keep the old top-level location populated with the first position.
    if (index === 0) {
      setValue("location.coordinates.lat", lat, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("location.coordinates.lng", lng, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    try {
      setLocationLoading(true);

      const response = await fetch(
        `/api/geocode?mode=reverse&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
      );

      if (!response.ok) return;

      const result = await response.json();
      if (!result?.success) return;

      const address = result.address ?? {};
      const resolvedLocation = {
        country: address.country || "India",
        state: address.state || "West Bengal",
        district: address.district || "",
        city: address.city || address.town || address.village || "",
        pincode: address.postcode || "",
        address: result.displayName || "",
        coordinates: { lat, lng },
      };

      setValue(`jobs.${index}.location`, resolvedLocation, {
        shouldDirty: true,
        shouldValidate: true,
      });

      if (index === 0) {
        setValue("location", resolvedLocation, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }

      if (useSameLocation) {
        jobs.forEach((_, positionIndex) => {
          if (positionIndex === index) return;
          setValue(`jobs.${positionIndex}.location`, resolvedLocation, {
            shouldDirty: true,
            shouldValidate: true,
          });
        });
      }
    } catch (error) {
      console.error("POSITION LOCATION REVERSE GEOCODE ERROR:", error);
    } finally {
      setLocationLoading(false);
    }
  }

  async function handlePositionAddressSearch(index: number) {
    const address = getValues(`jobs.${index}.location.address`);

    if (!address?.trim()) {
      setLocationError(
        `Please enter an address for Position ${index + 1} first.`,
      );
      return;
    }

    try {
      setLocationLoading(true);
      setLocationError("");

      const response = await fetch(
        `/api/geocode?mode=search&q=${encodeURIComponent(address)}`,
      );
      const result = await response.json();

      if (
        !response.ok ||
        !result?.success ||
        !Number.isFinite(Number(result.latitude)) ||
        !Number.isFinite(Number(result.longitude))
      ) {
        throw new Error("Unable to find this address on the map.");
      }

      await handlePositionLocationChange(
        index,
        Number(result.latitude),
        Number(result.longitude),
      );
    } catch (error) {
      console.error("POSITION ADDRESS SEARCH ERROR:", error);
      setLocationError(
        error instanceof Error
          ? error.message
          : "Unable to find this address on the map.",
      );
    } finally {
      setLocationLoading(false);
    }
  }

  function handleUseCurrentPositionLocation(index: number) {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await handlePositionLocationChange(
            index,
            position.coords.latitude,
            position.coords.longitude,
          );
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        setLocationError(
          `Unable to get your current location for Position ${index + 1}.`,
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  // ===================================================
  // Current Location
  // ===================================================

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");

      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await handleLocationChange(
            position.coords.latitude,
            position.coords.longitude,
          );
        } catch (error) {
          console.error("CURRENT LOCATION ERROR:", error);
        } finally {
          setLocationLoading(false);
        }
      },

      () => {
        setLocationLoading(false);

        setLocationError(
          "Unable to get your current location. Please allow location access or select the location on the map.",
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  // ===================================================
  // Find Address On Map
  // ===================================================

  async function handleFindAddressOnMap() {
    const address = getValues("location.address");

    if (!address?.trim()) {
      setLocationError("Please enter an address first.");

      return;
    }

    try {
      setLocationLoading(true);
      setLocationError("");

      const response = await fetch(
        `/api/geocode?mode=search&q=${encodeURIComponent(address)}`,
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result?.success ||
        !Number.isFinite(Number(result.latitude)) ||
        !Number.isFinite(Number(result.longitude))
      ) {
        throw new Error("Unable to find this address on the map.");
      }

      await handleLocationChange(
        Number(result.latitude),
        Number(result.longitude),
      );
    } catch (error) {
      console.error("FIND ADDRESS ERROR:", error);

      setLocationError(
        error instanceof Error
          ? error.message
          : "Unable to find this address on the map.",
      );
    } finally {
      setLocationLoading(false);
    }
  }

  // ===================================================
  // Job Poster Upload
  // ===================================================

  async function handleJobPosterUpload(file: File) {
    setImageError("");

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file.");

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError("Image size must be less than 10 MB.");

      return;
    }

    try {
      setImageUploading(true);

      const formData = new FormData();

      formData.append("file", file);

      formData.append("type", "job");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (
        !response.ok ||
        !result?.success ||
        !result?.image?.url ||
        !result?.image?.publicId
      ) {
        throw new Error(result?.message ?? "Job poster upload failed.");
      }

      // =================================================
      // Cloudinary → Job Thumbnail
      // =================================================

      setValue(
        "thumbnail",
        {
          publicId: result.image.publicId,

          url: result.image.url,
        },
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
    } catch (error) {
      console.error("JOB POSTER UPLOAD ERROR:", error);

      setImageError(
        error instanceof Error ? error.message : "Job poster upload failed.",
      );
    } finally {
      setImageUploading(false);
    }
  }

  // ===================================================
  // Submit
  // ===================================================

  async function onSubmit(data: JobFormData) {
    if (publishLockRef.current) {
      return;
    }

    publishLockRef.current = true;

    try {
      setSubmitError("");
      setSuccessMessage("");

      // Keep position locations synchronized and preserve the legacy
      // top-level location field for existing database records.
      if (data.listingType === "multiple") {
        if (useSameLocation) {
          data.jobs = data.jobs.map((job) => ({
            ...job,
            location: data.location,
          }));
        } else if (data.jobs[0]?.location) {
          data.location = data.jobs[0].location;
        }

        for (let index = 0; index < data.jobs.length; index += 1) {
          const positionLocation = data.jobs[index]?.location;
          const positionLat = Number(positionLocation?.coordinates?.lat);
          const positionLng = Number(positionLocation?.coordinates?.lng);

          if (
            !Number.isFinite(positionLat) ||
            !Number.isFinite(positionLng) ||
            positionLat === 0 ||
            positionLng === 0
          ) {
            throw new Error(
              `Please select a valid location for Position ${index + 1}.`,
            );
          }
        }
      }

      // =================================================
      // EDIT JOB
      // =================================================

      if (mode === "edit") {
        if (!jobId) {
          throw new Error("Job ID is missing.");
        }

        const lat = Number(data.location.coordinates.lat);

        const lng = Number(data.location.coordinates.lng);

        if (
          !Number.isFinite(lat) ||
          !Number.isFinite(lng) ||
          lat === 0 ||
          lng === 0
        ) {
          throw new Error("Please select a valid job location on the map.");
        }

        const response = await fetch(`/api/jobs/${jobId}`, {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message ?? "Failed to update job.");
        }

        setCountdown(5);

        setSuccessMessage("Job updated successfully!");

        setStep(3);

        scrollToTop();

        return;
      }

      // =================================================
      // CREATE JOB
      // =================================================

      const lat = Number(data.location.coordinates.lat);

      const lng = Number(data.location.coordinates.lng);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat === 0 ||
        lng === 0
      ) {
        throw new Error("Please select a valid job location on the map.");
      }

      const response = await fetch("/api/jobs", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to publish job.");
      }

      setCountdown(5);

      setSuccessMessage("Job published successfully!");

      setStep(3);

      scrollToTop();
    } catch (error) {
      publishLockRef.current = false;

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  // ===================================================
  // Classes
  // ===================================================

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

  // ===================================================
  // Error Helper
  // ===================================================

  function ErrorText({ children }: { children?: ReactNode }) {
    if (!children) {
      return null;
    }

    return <p className="mt-1 text-xs font-medium text-red-500">{children}</p>;
  }

  // ===================================================
  // Review Item
  // ===================================================

  function ReviewItem({ label, value }: { label: string; value: ReactNode }) {
    return (
      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
          {value || "—"}
        </div>
      </div>
    );
  }

  // ===================================================
  // Success Screen
  // ===================================================

  if (successMessage) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-16">
        <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl dark:border-emerald-900/50 dark:bg-slate-950">
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
              <CheckCircle2
                size={44}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {mode === "edit"
                ? "Job Updated Successfully"
                : "Job Published Successfully"}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              {mode === "edit"
                ? "Your job listing has been updated successfully."
                : "Your job listing has been published successfully and is now available on DealUp Marketplace."}
            </p>

            <div className="mx-auto mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-[#1565d8]/10 text-2xl font-bold text-[#1565d8]">
              {countdown}
            </div>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Redirecting to {mode === "edit" ? "My Jobs" : "Dashboard"}
              ...
            </p>

            <button
              type="button"
              onClick={() => {
                router.push(
                  mode === "edit" ? "/dashboard/my-jobs" : "/dashboard",
                );

                router.refresh();
              }}
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#1565d8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1154b5]"
            >
              {mode === "edit" ? "Go to My Jobs" : "Go to Dashboard"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // Render
  // ===================================================

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10"
    >
      {/* =================================================
          Header
      ================================================= */}

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1565d8]/10 text-[#1565d8]">
            <BriefcaseBusiness size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {mode === "edit" ? "Edit Job Listing" : "Post a Job"}
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {mode === "edit"
                ? "Update your job listing information"
                : "Find the right candidate through DealUp Marketplace"}
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          Step Indicator
      ================================================= */}

      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex min-w-[650px] items-center">
          {steps.map((item, index) => {
            const active = step === index;

            const completed = step > index;

            return (
              <div key={item.title} className="flex flex-1 items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition",
                      active
                        ? "bg-[#1565d8] text-white"
                        : completed
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                    ].join(" ")}
                  >
                    {completed ? <CheckCircle2 size={19} /> : index + 1}
                  </div>

                  <div className="hidden sm:block">
                    <p
                      className={[
                        "text-sm font-semibold",
                        active
                          ? "text-[#1565d8]"
                          : "text-slate-700 dark:text-slate-200",
                      ].join(" ")}
                    >
                      {item.title}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="mx-4 h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================
          Main Card
      ================================================= */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {/* =================================================
            STEP 1 — EMPLOYER
        ================================================= */}

        {step === 0 && (
          <div className="p-5 sm:p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Employer Information
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter the company or employer details.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Company */}

              <div className="md:col-span-2">
                <label className={labelClass}>Company / Business Name *</label>

                <div className="relative">
                  <Building2
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    {...register("employer.companyName")}
                    className={`${inputClass} pl-11`}
                    placeholder="e.g. NETWARE"
                  />
                </div>

                <ErrorText>{errors.employer?.companyName?.message}</ErrorText>
              </div>

              {/* Contact */}

              <div>
                <label className={labelClass}>Contact Person *</label>

                <input
                  {...register("employer.contactPerson")}
                  className={inputClass}
                  placeholder="Contact person name"
                />

                <ErrorText>{errors.employer?.contactPerson?.message}</ErrorText>
              </div>

              {/* Phone */}

              <div>
                <label className={labelClass}>Phone Number *</label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="tel"
                    {...register("employer.phone")}
                    className={`${inputClass} pl-11`}
                    placeholder="10 digit mobile number"
                  />
                </div>

                <ErrorText>{errors.employer?.phone?.message}</ErrorText>
              </div>

              {/* Email */}

              <div>
                <label className={labelClass}>Email</label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    {...register("employer.email")}
                    className={`${inputClass} pl-11`}
                    placeholder="company@example.com"
                  />
                </div>

                <ErrorText>{errors.employer?.email?.message}</ErrorText>
              </div>

              {/* Website */}

              <div>
                <label className={labelClass}>Website</label>

                <div className="relative">
                  <Globe
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    {...register("employer.website")}
                    className={`${inputClass} pl-11`}
                    placeholder="https://example.com"
                  />
                </div>

                <ErrorText>{errors.employer?.website?.message}</ErrorText>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            STEP 2 — JOB DETAILS
        ================================================= */}

        {step === 1 && (
          <div className="p-5 sm:p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Job Details
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Add the vacancy information for this job listing.
              </p>
            </div>

            {/* Jobs */}

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  id={`job-${index}`}
                  className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50 sm:p-6"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        Job Position {index + 1}
                      </h3>

                      {listingType === "multiple" && (
                        <p className="mt-1 text-xs text-slate-500">
                          Position details
                        </p>
                      )}
                    </div>

                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveJob(index)}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Title */}

                    <div className="md:col-span-2">
                      <label className={labelClass}>Job Title *</label>

                      <input
                        {...register(`jobs.${index}.title`)}
                        className={inputClass}
                        placeholder="e.g. Python Developer"
                      />

                      <ErrorText>
                        {errors.jobs?.[index]?.title?.message}
                      </ErrorText>
                    </div>

                    {/* Category */}

                    <div>
                      <label className={labelClass}>Category *</label>

                      <select
                        {...register(`jobs.${index}.category`)}
                        className={inputClass}
                      >
                        <option value="">Select category</option>

                        {JOB_CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>

                      <ErrorText>
                        {errors.jobs?.[index]?.category?.message}
                      </ErrorText>
                    </div>

                    {/* Subcategory */}

                    <div>
                      <label className={labelClass}>Subcategory</label>

                      <input
                        {...register(`jobs.${index}.subcategory`)}
                        className={inputClass}
                        placeholder="Optional"
                      />
                    </div>

                    {/* Employment */}

                    <div>
                      <label className={labelClass}>Employment Type *</label>

                      <select
                        {...register(`jobs.${index}.employmentType`)}
                        className={inputClass}
                      >
                        <option value="full-time">Full-time</option>

                        <option value="part-time">Part-time</option>

                        <option value="contract">Contract</option>

                        <option value="internship">Internship</option>

                        <option value="temporary">Temporary</option>

                        <option value="freelance">Freelance</option>
                      </select>
                    </div>

                    {/* Work Mode */}

                    <div>
                      <label className={labelClass}>Work Mode *</label>

                      <select
                        {...register(`jobs.${index}.workMode`)}
                        className={inputClass}
                      >
                        <option value="on-site">On-site</option>

                        <option value="hybrid">Hybrid</option>

                        <option value="remote">Remote</option>
                      </select>
                    </div>

                    {/* Experience */}

                    <div>
                      <label className={labelClass}>Experience *</label>

                      <input
                        {...register(`jobs.${index}.experience`)}
                        className={inputClass}
                        placeholder="e.g. 0-2 Years"
                      />

                      <ErrorText>
                        {errors.jobs?.[index]?.experience?.message}
                      </ErrorText>
                    </div>

                    {/* Vacancies */}

                    <div>
                      <label className={labelClass}>
                        Number of Vacancies *
                      </label>

                      <input
                        type="number"
                        min={1}
                        {...register(`jobs.${index}.vacancies`, {
                          valueAsNumber: true,
                        })}
                        className={inputClass}
                      />

                      <ErrorText>
                        {errors.jobs?.[index]?.vacancies?.message}
                      </ErrorText>
                    </div>

                    {/* Salary Min */}

                    <div>
                      <label className={labelClass}>Minimum Salary</label>

                      <input
                        type="number"
                        min={0}
                        {...register(`jobs.${index}.salary.min`, {
                          valueAsNumber: true,
                        })}
                        className={inputClass}
                        placeholder="15000"
                      />
                    </div>

                    {/* Salary Max */}

                    <div>
                      <label className={labelClass}>Maximum Salary</label>

                      <input
                        type="number"
                        min={0}
                        {...register(`jobs.${index}.salary.max`, {
                          setValueAs: (value) =>
                            value === "" || value === undefined
                              ? undefined
                              : Number(value),
                        })}
                        className={inputClass}
                        placeholder="30000"
                      />

                      <ErrorText>
                        {errors.jobs?.[index]?.salary?.message}
                      </ErrorText>
                    </div>

                    {/* Salary Period */}

                    <div>
                      <label className={labelClass}>Salary Period</label>

                      <select
                        {...register(`jobs.${index}.salary.period`)}
                        className={inputClass}
                      >
                        <option value="hour">Per Hour</option>

                        <option value="day">Per Day</option>

                        <option value="month">Per Month</option>

                        <option value="year">Per Year</option>
                      </select>
                    </div>

                    {/* Description */}

                    <div className="md:col-span-2">
                      <label className={labelClass}>Job Description *</label>

                      <textarea
                        {...register(`jobs.${index}.description`)}
                        rows={6}
                        className={inputClass}
                        placeholder="Describe responsibilities, required skills, qualifications and other information..."
                      />

                      <ErrorText>
                        {errors.jobs?.[index]?.description?.message}
                      </ErrorText>
                    </div>
                    {/* =====================================================
    Application Options
===================================================== */}

                    <div className="md:col-span-2">
                      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Application Options
                          </h4>

                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Add one or more ways candidates can apply for this
                            position. Leave any field empty if that application
                            method is not available.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {/* Apply Online */}
                          <div>
                            <label className={labelClass}>
                              Apply Online URL
                            </label>

                            <input
                              type="url"
                              {...register(`jobs.${index}.applicationUrl`)}
                              className={inputClass}
                              placeholder="https://company.com/apply"
                            />

                            <ErrorText>
                              {errors.jobs?.[index]?.applicationUrl?.message}
                            </ErrorText>
                          </div>

                          {/* Recruiter Phone */}
                          <div>
                            <label className={labelClass}>
                              Recruiter Phone
                            </label>

                            <input
                              type="tel"
                              {...register(`jobs.${index}.contactPhone`)}
                              className={inputClass}
                              placeholder="+91 98765 43210"
                            />

                            <ErrorText>
                              {errors.jobs?.[index]?.contactPhone?.message}
                            </ErrorText>
                          </div>

                          {/* Recruiter Email */}
                          <div className="md:col-span-2">
                            <label className={labelClass}>
                              Recruiter Email
                            </label>

                            <input
                              type="email"
                              {...register(`jobs.${index}.contactEmail`)}
                              className={inputClass}
                              placeholder="hr@company.com"
                            />

                            <ErrorText>
                              {errors.jobs?.[index]?.contactEmail?.message}
                            </ErrorText>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Job */}

            {listingType === "multiple" && (
              <button
                type="button"
                onClick={handleAddJob}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#1565d8] px-5 py-3 text-sm font-semibold text-[#1565d8] transition hover:bg-[#1565d8] hover:text-white"
              >
                <Plus size={18} />
                Add Another Job
              </button>
            )}

            {/* Job Poster */}

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1565d8]/10 text-[#1565d8]">
                  <Camera size={22} />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Job Thumbnail / Hiring Poster
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Optional • JPG, PNG or WEBP • Maximum 10 MB
                  </p>
                </div>
              </div>

              <label className="group flex min-h-[230px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-[#1565d8] hover:bg-[#1565d8]/5 dark:border-slate-700 dark:bg-slate-900">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={imageUploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      void handleJobPosterUpload(file);
                    }

                    event.currentTarget.value = "";
                  }}
                />

                {imageUploading ? (
                  <div className="text-center">
                    <Loader2
                      size={34}
                      className="mx-auto animate-spin text-[#1565d8]"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Uploading poster...
                    </p>

                    <p className="mt-1 text-xs text-slate-500">Please wait</p>
                  </div>
                ) : thumbnail?.url ? (
                  <div className="w-full">
                    <img
                      src={thumbnail.url}
                      alt="Job thumbnail preview"
                      className="mx-auto max-h-72 w-auto max-w-full rounded-xl object-contain shadow-md"
                    />

                    <p className="mt-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      Job thumbnail uploaded successfully
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Click here to replace the thumbnail
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera
                      size={38}
                      className="mx-auto text-slate-400 transition group-hover:text-[#1565d8]"
                    />

                    <p className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                      Upload Job Thumbnail
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Upload a professional job thumbnail or hiring poster
                    </p>
                  </div>
                )}
              </label>

              {imageError && (
                <p className="mt-3 text-sm font-medium text-red-500">
                  {imageError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            STEP 3 — LOCATION
        ================================================= */}

        {step === 2 && (
          <div className="p-5 sm:p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {listingType === "multiple"
                  ? "Weekly Hiring Locations"
                  : "Job Location"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {listingType === "multiple"
                  ? "Set the exact location for each position. You can use one shared location or separate locations."
                  : "Select the exact location where the job is available."}
              </p>
            </div>

            {listingType === "multiple" ? (
              <>
                {/* Shared location option */}
                <div className="mb-7 rounded-2xl border border-[#1565d8]/20 bg-[#1565d8]/5 p-4 dark:bg-[#1565d8]/10">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={useSameLocation}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setUseSameLocation(checked);

                        if (checked) {
                          const masterLocation = getValues("location");
                          jobs.forEach((_, index) => {
                            setValue(`jobs.${index}.location`, masterLocation, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          });
                        }
                      }}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#1565d8] focus:ring-[#1565d8]"
                    />

                    <span>
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">
                        Use same location for all positions
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Recommended when all vacancies are available at the same
                        workplace.
                      </span>
                    </span>
                  </label>
                </div>

                {useSameLocation ? (
                  <>
                    <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
                      <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">
                        Shared Hiring Location
                      </h3>

                      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                        <input
                          {...register("location.address")}
                          className={`${inputClass} flex-1`}
                          placeholder="e.g. Chinsurah, Hooghly, West Bengal"
                        />

                        <button
                          type="button"
                          onClick={handleFindAddressOnMap}
                          disabled={locationLoading}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1154b5] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {locationLoading ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <MapPin size={17} />
                          )}
                          Find on Map
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={locationLoading}
                        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#1565d8] px-4 py-3 text-sm font-semibold text-[#1565d8] transition hover:bg-[#1565d8]/5 disabled:opacity-60"
                      >
                        <Navigation size={17} />
                        Use My Current Location
                      </button>

                      <div className="h-[380px] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 sm:h-[420px]">
                        <JobLocationPicker
                          latitude={Number(location?.coordinates?.lat ?? 0)}
                          longitude={Number(location?.coordinates?.lng ?? 0)}
                          onLocationChange={async (lat, lng) => {
                            await handleLocationChange(lat, lng);
                            const resolvedLocation = getValues("location");
                            jobs.forEach((_, index) => {
                              setValue(
                                `jobs.${index}.location`,
                                resolvedLocation,
                                {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                },
                              );
                            });
                          }}
                        />
                      </div>

                      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className={labelClass}>Country</label>
                          <input
                            {...register("location.country")}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>State</label>
                          <input
                            {...register("location.state")}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>District</label>
                          <input
                            {...register("location.district")}
                            className={inputClass}
                            placeholder="e.g. Hooghly"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>City</label>
                          <input
                            {...register("location.city")}
                            className={inputClass}
                            placeholder="e.g. Chinsurah"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>PIN Code</label>
                          <input
                            {...register("location.pincode")}
                            className={inputClass}
                            placeholder="712101"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Latitude</label>
                          <input
                            value={location?.coordinates?.lat ?? 0}
                            readOnly
                            className={`${inputClass} bg-slate-100 dark:bg-slate-800`}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Longitude</label>
                          <input
                            value={location?.coordinates?.lng ?? 0}
                            readOnly
                            className={`${inputClass} bg-slate-100 dark:bg-slate-800`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                      This location will automatically be applied to all{" "}
                      {jobs.length} positions.
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    {fields.map((field, index) => {
                      const positionLocation = jobs[index]?.location;

                      return (
                        <div
                          key={field.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50 sm:p-6"
                        >
                          <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#1565d8]">
                                Position {index + 1}
                              </p>
                              <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                                {jobs[index]?.title || "Job Position"}
                              </h3>
                            </div>

                            <MapPin className="text-[#f5a623]" size={22} />
                          </div>

                          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                            <input
                              {...register(`jobs.${index}.location.address`)}
                              className={`${inputClass} flex-1`}
                              placeholder="Enter area / address"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                void handlePositionAddressSearch(index)
                              }
                              disabled={locationLoading}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1154b5] disabled:opacity-60"
                            >
                              {locationLoading ? (
                                <Loader2 size={17} className="animate-spin" />
                              ) : (
                                <MapPin size={17} />
                              )}
                              Find on Map
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleUseCurrentPositionLocation(index)
                            }
                            disabled={locationLoading}
                            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#1565d8] px-4 py-3 text-sm font-semibold text-[#1565d8] transition hover:bg-[#1565d8]/5 disabled:opacity-60"
                          >
                            <Navigation size={17} />
                            Use My Current Location
                          </button>

                          <div className="h-[380px] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 sm:h-[420px]">
                            <JobLocationPicker
                              latitude={Number(
                                positionLocation?.coordinates?.lat ?? 0,
                              )}
                              longitude={Number(
                                positionLocation?.coordinates?.lng ?? 0,
                              )}
                              onLocationChange={(lat, lng) =>
                                handlePositionLocationChange(index, lat, lng)
                              }
                            />
                          </div>

                          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <label className={labelClass}>Country</label>
                              <input
                                {...register(`jobs.${index}.location.country`)}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>State</label>
                              <input
                                {...register(`jobs.${index}.location.state`)}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>District</label>
                              <input
                                {...register(`jobs.${index}.location.district`)}
                                className={inputClass}
                                placeholder="e.g. Hooghly"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>City</label>
                              <input
                                {...register(`jobs.${index}.location.city`)}
                                className={inputClass}
                                placeholder="e.g. Chinsurah"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>PIN Code</label>
                              <input
                                {...register(`jobs.${index}.location.pincode`)}
                                className={inputClass}
                                placeholder="712101"
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Latitude</label>
                              <input
                                value={positionLocation?.coordinates?.lat ?? 0}
                                readOnly
                                className={`${inputClass} bg-slate-100 dark:bg-slate-800`}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Longitude</label>
                              <input
                                value={positionLocation?.coordinates?.lng ?? 0}
                                readOnly
                                className={`${inputClass} bg-slate-100 dark:bg-slate-800`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-5">
                  <label className={labelClass}>Address / Area</label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      {...register("location.address")}
                      className={`${inputClass} flex-1`}
                      placeholder="e.g. Chinsurah, Hooghly, West Bengal"
                    />
                    <button
                      type="button"
                      onClick={handleFindAddressOnMap}
                      disabled={locationLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1154b5] disabled:opacity-60"
                    >
                      {locationLoading ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <MapPin size={17} />
                      )}
                      Find on Map
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationLoading}
                  className="mb-5 inline-flex items-center gap-2 rounded-xl border border-[#1565d8] px-4 py-3 text-sm font-semibold text-[#1565d8] transition hover:bg-[#1565d8]/5 disabled:opacity-60"
                >
                  <Navigation size={17} />
                  Use My Current Location
                </button>

                <div className="h-[380px] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 sm:h-[420px]">
                  <JobLocationPicker
                    latitude={Number(location?.coordinates?.lat ?? 0)}
                    longitude={Number(location?.coordinates?.lng ?? 0)}
                    onLocationChange={handleLocationChange}
                  />
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className={labelClass}>Country</label>
                    <input
                      {...register("location.country")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input
                      {...register("location.state")}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>District</label>
                    <input
                      {...register("location.district")}
                      className={inputClass}
                      placeholder="e.g. Hooghly"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      {...register("location.city")}
                      className={inputClass}
                      placeholder="e.g. Chinsurah"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>PIN Code</label>
                    <input
                      {...register("location.pincode")}
                      className={inputClass}
                      placeholder="712101"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Latitude</label>
                    <input
                      value={location?.coordinates?.lat ?? 0}
                      readOnly
                      className={`${inputClass} bg-slate-100 dark:bg-slate-800`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Longitude</label>
                    <input
                      value={location?.coordinates?.lng ?? 0}
                      readOnly
                      className={`${inputClass} bg-slate-100 dark:bg-slate-800`}
                    />
                  </div>
                </div>
              </>
            )}

            {locationError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                {locationError}
              </div>
            )}
          </div>
        )}

        {/* =================================================
            STEP 4 — REVIEW
        ================================================= */}

        {step === 3 && (
          <div className="p-5 sm:p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Review Your Job
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Please check all information before{" "}
                {mode === "edit" ? "updating" : "publishing"}.
              </p>
            </div>

            {/* Employer */}

            <div className="mb-6">
              <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
                Employer
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <ReviewItem
                  label="Company"
                  value={watch("employer.companyName")}
                />

                <ReviewItem
                  label="Contact Person"
                  value={watch("employer.contactPerson")}
                />

                <ReviewItem label="Phone" value={watch("employer.phone")} />

                <ReviewItem label="Email" value={watch("employer.email")} />
              </div>
            </div>

            {/* Jobs */}

            <div className="mb-6">
              <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
                Job Positions
              </h3>

              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <div
                    key={`${job.title}-${index}`}
                    className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ReviewItem label="Job Title" value={job.title} />

                      <ReviewItem label="Category" value={job.category} />

                      <ReviewItem
                        label="Employment"
                        value={job.employmentType}
                      />

                      <ReviewItem label="Work Mode" value={job.workMode} />

                      <ReviewItem label="Experience" value={job.experience} />

                      <ReviewItem
                        label="Vacancies"
                        value={String(job.vacancies)}
                      />

                      <ReviewItem
                        label="Salary"
                        value={
                          job.salary?.min !== undefined
                            ? `₹${job.salary.min}${
                                job.salary.max ? ` - ₹${job.salary.max}` : ""
                              } / ${job.salary.period}`
                            : "Not specified"
                        }
                      />

                      <ReviewItem
                        label="Job Location"
                        value={
                          [
                            job.location?.city,
                            job.location?.district,
                            job.location?.state,
                          ]
                            .filter(Boolean)
                            .join(", ") ||
                          job.location?.address ||
                          "Not specified"
                        }
                      />
                    </div>

                    <div className="mt-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="text-xs font-medium text-slate-500">
                        Description
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                        {job.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Poster */}

            {thumbnail?.url && (
              <div className="mb-6">
                <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
                  Job Poster
                </h3>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <img
                    src={thumbnail.url}
                    alt="Job thumbnail"
                    className="mx-auto max-h-80 max-w-full rounded-xl object-contain"
                  />
                </div>
              </div>
            )}

            {/* Location */}

            <div className="mb-6">
              <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
                Location
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <ReviewItem label="City" value={location?.city} />

                <ReviewItem label="District" value={location?.district} />

                <ReviewItem label="State" value={location?.state} />

                <ReviewItem label="PIN" value={location?.pincode} />

                <ReviewItem label="Address" value={location?.address} />

                <ReviewItem
                  label="Coordinates"
                  value={
                    location?.coordinates
                      ? `${location.coordinates.lat}, ${location.coordinates.lng}`
                      : "—"
                  }
                />
              </div>
            </div>

            {/* Submit Error */}

            {submitError && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
                {submitError}
              </div>
            )}

            {/* Submit */}

            <div className="rounded-2xl border border-[#1565d8]/20 bg-[#1565d8]/5 p-5 dark:bg-[#1565d8]/10">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                Please make sure the job information, contact details, location
                and poster are correct before{" "}
                {mode === "edit" ? "updating" : "publishing"}.
              </p>

              <button
                type="submit"
                disabled={
                  isSubmitting || imageUploading || publishLockRef.current
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1154b5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting || publishLockRef.current ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />

                    {mode === "edit" ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />

                    {mode === "edit" ? "Update Job" : "Publish Job"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          Navigation
      ================================================= */}

      {!successMessage && (
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={previousStep}
            disabled={step === 0 || isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          {step < TOTAL_STEPS - 1 && (
            <button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting || imageUploading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1154b5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      )}
    </form>
  );
}
