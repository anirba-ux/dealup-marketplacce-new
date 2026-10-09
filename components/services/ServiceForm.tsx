"use client";

import { FormEvent, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Clock3,
  ImagePlus,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";

const JobLocationPicker = dynamic(
  () => import("@/components/job/JobLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[380px] items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-900 sm:h-[420px]">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#1565d8]" />

          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading map...
          </p>
        </div>
      </div>
    ),
  },
);

type ListingType = "service" | "business";

type ServiceMode = "at_business" | "home_visit" | "both" | "remote";

type PriceUnit = "hour" | "visit" | "day" | "service" | "project" | "month";

interface ServiceImage {
  publicId: string;
  url: string;
}

interface FormData {
  title: string;
  description: string;

  listingType: ListingType;

  category: string;
  subcategory: string;

  businessName: string;
  businessType: string;

  yearsOfExperience: string;

  serviceMode: ServiceMode;

  servicesOffered: string[];
  serviceAreas: string[];

  startingPrice: string;
  priceUnit: PriceUnit;
  priceOnRequest: boolean;

  images: ServiceImage[];
  thumbnail: string;

  location: {
    country: string;
    state: string;
    district: string;
    city: string;
    pincode: string;
    address: string;

    coordinates: {
      lat: number;
      lng: number;
    };
  };

  contact: {
    phone: string;
    alternativePhone: string;
    whatsapp: string;
    email: string;
    website: string;
  };

  openingHours: {
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }[];
}

interface ServiceFormProps {
  initialData?: Partial<FormData>;
  serviceId?: string;
  mode?: "create" | "edit";
}

const CATEGORIES = [
  {
    value: "home-services",
    label: "Home Services",
    subcategories: [
      "Electrician",
      "Plumber",
      "Carpenter",
      "Painter",
      "AC Repair",
      "Cleaning",
      "Pest Control",
      "Other",
    ],
  },

  {
    value: "repair-services",
    label: "Repair Services",
    subcategories: [
      "Mobile Repair",
      "Computer Repair",
      "Laptop Repair",
      "TV Repair",
      "Appliance Repair",
      "Other",
    ],
  },

  {
    value: "education",
    label: "Education",
    subcategories: [
      "Home Tutor",
      "Coaching",
      "Computer Training",
      "Language Classes",
      "Music Classes",
      "Other",
    ],
  },

  {
    value: "beauty",
    label: "Beauty & Personal Care",
    subcategories: [
      "Salon",
      "Beauty Parlour",
      "Makeup Artist",
      "Mehendi Artist",
      "Spa",
      "Other",
    ],
  },

  {
    value: "professional",
    label: "Professional Services",
    subcategories: [
      "Photography",
      "Digital Marketing",
      "Graphic Design",
      "Web Development",
      "Accounting",
      "Legal Services",
      "Other",
    ],
  },

  {
    value: "automotive",
    label: "Automotive",
    subcategories: [
      "Car Repair",
      "Bike Repair",
      "Car Wash",
      "Towing",
      "Driving Service",
      "Other",
    ],
  },

  {
    value: "local-business",
    label: "Local Business",
    subcategories: [
      "Mobile Shop",
      "Grocery",
      "Restaurant",
      "Hardware Shop",
      "Electronics Shop",
      "Other",
    ],
  },

  {
    value: "other",
    label: "Other Services",
    subcategories: ["Other"],
  },
] as const;

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DEFAULT_FORM: FormData = {
  title: "",

  description: "",

  listingType: "service",

  category: "",
  subcategory: "",

  businessName: "",
  businessType: "",

  yearsOfExperience: "",

  serviceMode: "home_visit",

  servicesOffered: [],
  serviceAreas: [],

  startingPrice: "",
  priceUnit: "service",
  priceOnRequest: false,

  images: [],
  thumbnail: "",

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

  contact: {
    phone: "",
    alternativePhone: "",
    whatsapp: "",
    email: "",
    website: "",
  },

  openingHours: DAYS.map((day) => ({
    day,
    isOpen: false,
    openTime: "09:00",
    closeTime: "18:00",
  })),
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-[#1565d8]/10 dark:border-white/10 dark:bg-white/5 dark:text-white";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1565d8] dark:border-white/10 dark:bg-slate-900 dark:text-white";

export default function ServiceForm({
  initialData,
  serviceId,
  mode = "create",
}: ServiceFormProps) {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState<FormData>(() => ({
    ...DEFAULT_FORM,

    ...initialData,

    location: {
      ...DEFAULT_FORM.location,
      ...(initialData?.location || {}),

      coordinates: {
        ...DEFAULT_FORM.location.coordinates,
        ...(initialData?.location?.coordinates || {}),
      },
    },

    contact: {
      ...DEFAULT_FORM.contact,
      ...(initialData?.contact || {}),
    },

    openingHours: initialData?.openingHours || DEFAULT_FORM.openingHours,
  }));

  const [serviceInput, setServiceInput] = useState("");

  const [areaInput, setAreaInput] = useState("");

  const [addressSearch, setAddressSearch] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [serverError, setServerError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLocating, setIsLocating] = useState(false);

  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const selectedCategory = useMemo(
    () => CATEGORIES.find((item) => item.value === form.category),
    [form.category],
  );

  // =====================================================
  // Generic field update
  // =====================================================

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [String(field)]: "",
    }));
  }

  // =====================================================
  // Location update
  // =====================================================

  function updateLocation(
    field: keyof FormData["location"],
    value: string | FormData["location"]["coordinates"],
  ) {
    setForm((current) => ({
      ...current,

      location: {
        ...current.location,
        [field]: value,
      },
    }));

    setErrors((current) => ({
      ...current,
      [String(field)]: "",
      location: "",
    }));
  }

  // =====================================================
  // Contact update
  // =====================================================

  function updateContact(field: keyof FormData["contact"], value: string) {
    setForm((current) => ({
      ...current,

      contact: {
        ...current.contact,
        [field]: value,
      },
    }));

    setErrors((current) => ({
      ...current,
      [String(field)]: "",
    }));
  }

  // =====================================================
  // Services
  // =====================================================

  function addService() {
    const value = serviceInput.trim();

    if (!value) return;

    const exists = form.servicesOffered.some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );

    if (!exists) {
      updateField("servicesOffered", [...form.servicesOffered, value]);
    }

    setServiceInput("");
  }

  function removeService(index: number) {
    updateField(
      "servicesOffered",
      form.servicesOffered.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  // =====================================================
  // Service Areas
  // =====================================================

  function addArea() {
    const value = areaInput.trim();

    if (!value) return;

    const exists = form.serviceAreas.some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );

    if (!exists) {
      updateField("serviceAreas", [...form.serviceAreas, value]);
    }

    setAreaInput("");
  }

  function removeArea(index: number) {
    updateField(
      "serviceAreas",
      form.serviceAreas.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  // =====================================================
  // Category
  // =====================================================

  function handleCategoryChange(value: string) {
    setForm((current) => ({
      ...current,
      category: value,
      subcategory: "",
    }));

    setErrors((current) => ({
      ...current,
      category: "",
      subcategory: "",
    }));
  }

  // =====================================================
  // Opening Hours
  // =====================================================

  function updateOpeningHour(
    index: number,
    field: keyof FormData["openingHours"][number],
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,

      openingHours: current.openingHours.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  }

  // =====================================================
  // Coordinate validation
  // =====================================================

  function isValidCoordinates(lat: number, lng: number) {
    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !(lat === 0 && lng === 0)
    );
  }

  // =====================================================
  // Reverse Geocoding
  // =====================================================

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const response = await fetch(
        `/api/geocode?mode=reverse&lat=${encodeURIComponent(
          lat,
        )}&lng=${encodeURIComponent(lng)}`,
      );

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      const address = result?.address || {};

      setForm((current) => ({
        ...current,

        location: {
          ...current.location,

          country: address.country || current.location.country || "India",

          state: address.state || current.location.state || "West Bengal",

          district:
            address.district || address.county || current.location.district,

          city:
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            current.location.city,

          pincode: address.postcode || current.location.pincode,

          address:
            result?.displayName ||
            result?.display_name ||
            current.location.address,

          coordinates: {
            lat,
            lng,
          },
        },
      }));
    } catch (error) {
      console.error("[ServiceForm] reverse geocoding failed", error);
    }
  }

  // =====================================================
  // Map location change
  // =====================================================

  function handleLocationChange(lat: number, lng: number) {
    if (!isValidCoordinates(lat, lng)) {
      setErrors((current) => ({
        ...current,

        location: "Please select a valid location on the map",
      }));

      return;
    }

    updateLocation("coordinates", {
      lat,
      lng,
    });

    void reverseGeocode(lat, lng);
  }

  // =====================================================
  // Current Location
  // =====================================================

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setErrors((current) => ({
        ...current,

        location: "Location is not supported by this browser.",
      }));

      return;
    }

    setIsLocating(true);

    setErrors((current) => ({
      ...current,
      location: "",
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);

        handleLocationChange(
          position.coords.latitude,
          position.coords.longitude,
        );
      },

      (error) => {
        setIsLocating(false);

        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Please allow location access and try again."
            : "Unable to get your current location. Please select a point on the map.";

        setErrors((current) => ({
          ...current,
          location: message,
        }));
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  }

  // =====================================================
  // Find Address On Map
  // =====================================================

  async function handleFindAddressOnMap() {
    const query = addressSearch.trim() || form.location.address.trim();

    if (!query) {
      setErrors((current) => ({
        ...current,

        location: "Enter an address to find it on the map.",
      }));

      return;
    }

    setIsSearchingLocation(true);

    setErrors((current) => ({
      ...current,
      location: "",
    }));

    try {
      const response = await fetch(
        `/api/geocode?mode=search&q=${encodeURIComponent(query)}`,
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Unable to search this address.");
      }

      const candidate = Array.isArray(result)
        ? result[0]
        : result?.result || result?.results?.[0] || result?.data?.[0] || result;

      const lat = Number(
        candidate?.lat ?? candidate?.latitude ?? candidate?.coordinates?.lat,
      );

      const lng = Number(
        candidate?.lng ??
          candidate?.lon ??
          candidate?.longitude ??
          candidate?.coordinates?.lng,
      );

      if (!isValidCoordinates(lat, lng)) {
        throw new Error(
          "Address could not be located. Please try a more specific address.",
        );
      }

      handleLocationChange(lat, lng);

      setAddressSearch(
        candidate?.displayName || candidate?.display_name || query,
      );
    } catch (error) {
      setErrors((current) => ({
        ...current,

        location:
          error instanceof Error
            ? error.message
            : "Unable to find this address.",
      }));
    } finally {
      setIsSearchingLocation(false);
    }
  }

  // =====================================================
  // Image Upload
  // =====================================================

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({
        ...current,
        images: "Please select an image file.",
      }));

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        images: "Image must be smaller than 5MB.",
      }));

      return;
    }

    setUploadingImage(true);

    setErrors((current) => ({
      ...current,
      images: "",
    }));

    try {
      const formData = new FormData();

      formData.append("file", file);

      formData.append("type", "service");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result?.image?.url) {
        throw new Error(result?.message || "Image upload failed.");
      }

      const image = {
        publicId: result.image.publicId,
        url: result.image.url,
      };

      setForm((current) => ({
        ...current,

        images: [...current.images, image],

        thumbnail: current.thumbnail || image.url,
      }));
    } catch (error) {
      setErrors((current) => ({
        ...current,

        images: error instanceof Error ? error.message : "Image upload failed.",
      }));
    } finally {
      setUploadingImage(false);
    }
  }

  // =====================================================
  // Remove Image
  // =====================================================

  function removeImage(index: number) {
    setForm((current) => {
      const images = current.images.filter(
        (_, imageIndex) => imageIndex !== index,
      );

      const removed = current.images[index]?.url;

      return {
        ...current,

        images,

        thumbnail:
          current.thumbnail === removed
            ? images[0]?.url || ""
            : current.thumbnail,
      };
    });
  }

  // =====================================================
  // Set Thumbnail
  // =====================================================

  function setThumbnail(url: string) {
    updateField("thumbnail", url);
  }

  // =====================================================
  // Validation
  // =====================================================

  function validateStep(currentStep: number) {
    const nextErrors: Record<string, string> = {};

    // STEP 1
    if (currentStep === 1) {
      if (!form.title.trim()) {
        nextErrors.title = "Please enter a service title";
      } else if (form.title.trim().length < 3) {
        nextErrors.title = "Title must contain at least 3 characters";
      }

      if (!form.category) {
        nextErrors.category = "Please select a category";
      }

      if (!form.subcategory) {
        nextErrors.subcategory = "Please select a subcategory";
      }

      if (form.description.trim().length < 20) {
        nextErrors.description =
          "Description should contain at least 20 characters";
      }

      if (form.listingType === "business" && !form.businessName.trim()) {
        nextErrors.businessName = "Business name is required";
      }
    }

    // STEP 2
    if (currentStep === 2) {
      if (!form.servicesOffered.length) {
        nextErrors.servicesOffered = "Add at least one service";
      }

      if (!form.serviceAreas.length) {
        nextErrors.serviceAreas = "Add at least one service area";
      }

      if (!form.priceOnRequest && form.startingPrice === "") {
        nextErrors.startingPrice =
          "Enter a starting price or select Price on Request";
      }

      if (form.images.length === 0) {
        nextErrors.images = "Add at least one service image";
      }
    }

    // STEP 3
    if (currentStep === 3) {
      if (!form.location.district.trim()) {
        nextErrors.district = "District is required";
      }

      if (!form.location.city.trim()) {
        nextErrors.city = "City is required";
      }

      if (!/^\d{6}$/.test(form.location.pincode.trim())) {
        nextErrors.pincode = "Enter a valid 6-digit pincode";
      }

      if (
        !isValidCoordinates(
          form.location.coordinates.lat,
          form.location.coordinates.lng,
        )
      ) {
        nextErrors.location = "Please select a valid location on the map";
      }
    }

    // STEP 4
    if (currentStep === 4) {
      if (!form.contact.phone.trim()) {
        nextErrors.phone = "Phone number is required";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  // =====================================================
  // Next
  // =====================================================

  function handleNext() {
    if (!validateStep(step)) {
      return;
    }

    setStep((current) => Math.min(current + 1, 5));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =====================================================
  // Previous
  // =====================================================

  function handlePrevious() {
    setStep((current) => Math.max(current - 1, 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =====================================================
  // Submit
  // =====================================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setServerError("");
    setSuccessMessage("");

    for (const requiredStep of [1, 2, 3, 4]) {
      if (!validateStep(requiredStep)) {
        setStep(requiredStep);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),

        description: form.description.trim(),

        listingType: form.listingType,

        category: form.category,

        subcategory: form.subcategory,

        businessName: form.businessName.trim() || undefined,

        businessType: form.businessType.trim() || undefined,

        yearsOfExperience: form.yearsOfExperience
          ? Number(form.yearsOfExperience)
          : undefined,

        serviceMode: form.serviceMode,

        servicesOffered: form.servicesOffered,

        serviceAreas: form.serviceAreas,

        startingPrice: form.priceOnRequest
          ? undefined
          : form.startingPrice
            ? Number(form.startingPrice)
            : undefined,

        priceUnit: form.priceUnit,

        priceOnRequest: form.priceOnRequest,

        currency: "INR",

        images: form.images,

        thumbnail: form.thumbnail,

        location: form.location,

        contact: form.contact,

        openingHours: form.openingHours,
      };

      const endpoint =
        mode === "edit" && serviceId
          ? `/api/services/${serviceId}`
          : "/api/services";

      const response = await fetch(endpoint, {
        method: mode === "edit" ? "PATCH" : "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Unable to publish service");
      }

      setSuccessMessage(
        mode === "edit"
          ? "Service updated successfully."
          : "Service published successfully.",
      );

      const target = result?.service?.slug
        ? `/services/${result.service.slug}`
        : result?.service?._id
          ? `/services/${result.service._id}`
          : "/services";

      setTimeout(() => {
        router.push(target);
      }, 700);
    } catch (error) {
      console.error("[ServiceForm]", error);

      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // =====================================================
  // Render
  // =====================================================

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-5xl">
      {/* HEADER */}

      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1565d8]/10 text-[#1565d8]">
            {form.listingType === "business" ? (
              <Building2 className="h-5 w-5" />
            ) : (
              <Wrench className="h-5 w-5" />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              {mode === "edit" ? "Edit Service" : "Add a Service"}
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Reach local customers with your service or business.
            </p>
          </div>
        </div>
      </div>

      {/* PROGRESS */}

      <div className="mb-8 overflow-x-auto">
        <div className="flex min-w-[620px] items-center">
          {[
            "Basic Info",
            "Service Details",
            "Location",
            "Contact",
            "Review",
          ].map((label, index) => {
            const itemStep = index + 1;

            const active = itemStep === step;

            const completed = itemStep < step;

            return (
              <div key={label} className="flex flex-1 items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (itemStep < step) {
                      setStep(itemStep);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <span
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition",

                      completed || active
                        ? "bg-[#1565d8] text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400",
                    ].join(" ")}
                  >
                    {completed ? <Check className="h-4 w-4" /> : itemStep}
                  </span>

                  <span
                    className={[
                      "hidden text-sm font-semibold sm:block",

                      active
                        ? "text-[#1565d8]"
                        : "text-slate-500 dark:text-slate-400",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                </button>

                {itemStep < 5 && (
                  <div className="mx-3 h-px flex-1 bg-slate-200 dark:bg-white/10" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ERRORS */}

      {serverError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          {successMessage}
        </div>
      )}

      {/* MAIN CARD */}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950 sm:p-8">
        {/* =================================================
            STEP 1
        ================================================= */}

        {step === 1 && (
          <div className="space-y-7">
            <SectionTitle
              title="What are you listing?"
              description="Choose whether you are offering a service or adding a local business."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ChoiceCard
                active={form.listingType === "service"}
                icon={<Wrench className="mb-3 h-7 w-7 text-[#1565d8]" />}
                title="Local Service"
                description="Offer your skills or professional services to nearby customers."
                onClick={() => updateField("listingType", "service")}
              />

              <ChoiceCard
                active={form.listingType === "business"}
                icon={<Building2 className="mb-3 h-7 w-7 text-[#1565d8]" />}
                title="Local Business"
                description="Add your shop, business, studio or local establishment."
                onClick={() => updateField("listingType", "business")}
              />
            </div>

            <Field
              label={
                form.listingType === "business"
                  ? "Business / Listing Title"
                  : "Service Title"
              }
              error={errors.title}
            >
              <input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder={
                  form.listingType === "business"
                    ? "Example: Maa Tara Mobile Centre"
                    : "Example: Professional AC Repair Service"
                }
                maxLength={120}
                className={inputClass}
              />
            </Field>

            {form.listingType === "business" && (
              <Field label="Business Name" error={errors.businessName}>
                <input
                  value={form.businessName}
                  onChange={(e) => updateField("businessName", e.target.value)}
                  placeholder="Enter your business name"
                  className={inputClass}
                />
              </Field>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Category" error={errors.category}>
                <select
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select category</option>

                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Subcategory" error={errors.subcategory}>
                <select
                  value={form.subcategory}
                  onChange={(e) => updateField("subcategory", e.target.value)}
                  disabled={!selectedCategory}
                  className={selectClass}
                >
                  <option value="">Select subcategory</option>

                  {selectedCategory?.subcategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              label="Description"
              error={errors.description}
              right={
                <span>
                  {form.description.length}
                  /5000
                </span>
              }
            >
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={6}
                maxLength={5000}
                placeholder="Describe your service, experience, what you offer and why customers should choose you..."
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>
        )}

        {/* =================================================
            STEP 2
        ================================================= */}

        {step === 2 && (
          <div className="space-y-7">
            <SectionTitle
              title="Service Details"
              description="Tell customers exactly what you offer."
            />

            <Field label="Services Offered" error={errors.servicesOffered}>
              <div className="flex gap-2">
                <input
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addService();
                    }
                  }}
                  placeholder="Example: AC Gas Refill"
                  className={`${inputClass} min-w-0 flex-1`}
                />

                <button
                  type="button"
                  onClick={addService}
                  className="rounded-xl bg-[#1565d8] px-5 font-bold text-white hover:bg-[#0f52ba]"
                >
                  Add
                </button>
              </div>

              <Tags items={form.servicesOffered} onRemove={removeService} />
            </Field>

            {/* SERVICE MODE */}

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Service Mode
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "at_business",
                    "At Business",
                    "Customers visit your location.",
                  ],
                  ["home_visit", "Home Visit", "You travel to the customer."],
                  ["both", "Both", "Business location and home visit."],
                  ["remote", "Remote", "Service can be provided online."],
                ].map(([value, label, description]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      updateField("serviceMode", value as ServiceMode)
                    }
                    className={[
                      "rounded-2xl border p-4 text-left transition",

                      form.serviceMode === value
                        ? "border-[#1565d8] bg-blue-50 ring-2 ring-[#1565d8]/10 dark:bg-blue-500/10"
                        : "border-slate-200 dark:border-white/10",
                    ].join(" ")}
                  >
                    <p className="font-bold text-slate-900 dark:text-white">
                      {label}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* EXPERIENCE */}

            <Field label="Years of Experience">
              <input
                type="number"
                min="0"
                max="100"
                value={form.yearsOfExperience}
                onChange={(e) =>
                  updateField("yearsOfExperience", e.target.value)
                }
                placeholder="Example: 5"
                className={`${inputClass} sm:max-w-xs`}
              />
            </Field>

            {/* PRICING */}

            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Pricing
                  </label>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Let customers know your starting price.
                  </p>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.priceOnRequest}
                    onChange={(e) =>
                      updateField("priceOnRequest", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-[#1565d8]"
                  />
                  Price on Request
                </label>
              </div>

              {!form.priceOnRequest && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    min="0"
                    value={form.startingPrice}
                    onChange={(e) =>
                      updateField("startingPrice", e.target.value)
                    }
                    placeholder="Starting price"
                    className={inputClass}
                  />

                  <select
                    value={form.priceUnit}
                    onChange={(e) =>
                      updateField("priceUnit", e.target.value as PriceUnit)
                    }
                    className={selectClass}
                  >
                    <option value="hour">Per Hour</option>

                    <option value="visit">Per Visit</option>

                    <option value="day">Per Day</option>

                    <option value="service">Per Service</option>

                    <option value="project">Per Project</option>

                    <option value="month">Per Month</option>
                  </select>
                </div>
              )}

              {errors.startingPrice && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.startingPrice}
                </p>
              )}
            </div>

            {/* SERVICE AREAS */}

            <Field label="Service Areas" error={errors.serviceAreas}>
              <div className="flex gap-2">
                <input
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addArea();
                    }
                  }}
                  placeholder="Example: Bansberia"
                  className={`${inputClass} min-w-0 flex-1`}
                />

                <button
                  type="button"
                  onClick={addArea}
                  className="rounded-xl bg-[#1565d8] px-5 font-bold text-white hover:bg-[#0f52ba]"
                >
                  Add
                </button>
              </div>

              <Tags items={form.serviceAreas} onRemove={removeArea} amber />
            </Field>

            {/* IMAGES */}

            <Field label="Service Images" error={errors.images}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {form.images.map((image, index) => (
                  <div
                    key={`${image.publicId}-${index}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10"
                  >
                    <img
                      src={image.url}
                      alt={`Service image ${index + 1}`}
                      className="h-44 w-full object-cover"
                    />

                    <div className="absolute inset-x-2 bottom-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setThumbnail(image.url)}
                        className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold ${
                          form.thumbnail === image.url
                            ? "bg-[#1565d8] text-white"
                            : "bg-white/90 text-slate-800"
                        }`}
                      >
                        {form.thumbnail === image.url
                          ? "Thumbnail ✓"
                          : "Set Thumbnail"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="rounded-lg bg-red-500 px-3 py-2 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center dark:border-white/10 dark:bg-white/5">
                  <ImagePlus className="h-8 w-8 text-[#1565d8]" />

                  <span className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    {uploadingImage ? "Uploading..." : "Add Image"}
                  </span>

                  <span className="mt-1 text-xs text-slate-400">
                    PNG, JPG, WEBP · Max 5MB
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        void uploadImage(file);
                      }

                      e.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Upload at least one clear image. The first uploaded image
                becomes the thumbnail automatically.
              </p>
            </Field>
          </div>
        )}

        {/* =================================================
            STEP 3 — LOCATION
        ================================================= */}

        {step === 3 && (
          <div className="space-y-7">
            <SectionTitle
              title="Service Location"
              description="Customers should be able to find your service easily."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Country">
                <input
                  value={form.location.country}
                  disabled
                  className={`${inputClass} bg-slate-50 dark:bg-white/5`}
                />
              </Field>

              <Field label="State">
                <input
                  value={form.location.state}
                  disabled
                  className={`${inputClass} bg-slate-50 dark:bg-white/5`}
                />
              </Field>

              <Field label="District" error={errors.district}>
                <input
                  value={form.location.district}
                  onChange={(e) => updateLocation("district", e.target.value)}
                  placeholder="Example: Hooghly"
                  className={inputClass}
                />
              </Field>

              <Field label="City / Town" error={errors.city}>
                <input
                  value={form.location.city}
                  onChange={(e) => updateLocation("city", e.target.value)}
                  placeholder="Example: Bansberia"
                  className={inputClass}
                />
              </Field>

              <Field label="Pincode" error={errors.pincode}>
                <input
                  value={form.location.pincode}
                  onChange={(e) =>
                    updateLocation(
                      "pincode",
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="712502"
                  className={inputClass}
                />
              </Field>

              <Field label="Address">
                <input
                  value={form.location.address}
                  onChange={(e) => {
                    updateLocation("address", e.target.value);

                    setAddressSearch(e.target.value);
                  }}
                  placeholder="Area / road / landmark"
                  className={inputClass}
                />
              </Field>
            </div>

            {/* MAP AREA */}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={addressSearch}
                    onChange={(e) => setAddressSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();

                        void handleFindAddressOnMap();
                      }
                    }}
                    placeholder="Search an address, area or landmark"
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleFindAddressOnMap()}
                  disabled={isSearchingLocation}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-bold text-white hover:bg-[#0f52ba] disabled:opacity-60"
                >
                  <Search className="h-4 w-4" />

                  {isSearchingLocation ? "Finding..." : "Find on Map"}
                </button>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-[#1565d8] dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 disabled:opacity-60"
                >
                  <Navigation className="h-4 w-4" />

                  {isLocating ? "Locating..." : "Use My Location"}
                </button>
              </div>

              {/* ACTUAL DEALUP MAP */}

              <div className="h-[380px] overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 sm:h-[420px]">
                <JobLocationPicker
                  latitude={Number(form.location.coordinates.lat || 0)}
                  longitude={Number(form.location.coordinates.lng || 0)}
                  onLocationChange={handleLocationChange}
                />
              </div>

              {/* COORDINATES */}

              <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-white p-4 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#1565d8]" />

                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Selected coordinates
                  </span>
                </div>

                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {form.location.coordinates.lat.toFixed(6)},{" "}
                  {form.location.coordinates.lng.toFixed(6)}
                </span>
              </div>

              {errors.location && (
                <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-300">
                  {errors.location}
                </p>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            STEP 4 — CONTACT
        ================================================= */}

        {step === 4 && (
          <div className="space-y-7">
            <SectionTitle
              title="Contact & Business Hours"
              description="Give customers convenient ways to contact you."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone *" error={errors.phone}>
                <input
                  value={form.contact.phone}
                  onChange={(e) => updateContact("phone", e.target.value)}
                  inputMode="tel"
                  placeholder="Phone number"
                  className={inputClass}
                />
              </Field>

              <Field label="WhatsApp">
                <input
                  value={form.contact.whatsapp}
                  onChange={(e) => updateContact("whatsapp", e.target.value)}
                  inputMode="tel"
                  placeholder="WhatsApp number"
                  className={inputClass}
                />
              </Field>

              <Field label="Alternative Phone">
                <input
                  value={form.contact.alternativePhone}
                  onChange={(e) =>
                    updateContact("alternativePhone", e.target.value)
                  }
                  inputMode="tel"
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={form.contact.email}
                  onChange={(e) => updateContact("email", e.target.value)}
                  placeholder="business@example.com"
                  className={inputClass}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Website">
                  <input
                    type="url"
                    value={form.contact.website}
                    onChange={(e) => updateContact("website", e.target.value)}
                    placeholder="https://example.com"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            {/* OPENING HOURS */}

            <div>
              <div className="mb-4 flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-[#1565d8]" />

                <h3 className="font-bold text-slate-900 dark:text-white">
                  Opening Hours
                </h3>
              </div>

              <div className="space-y-3">
                {form.openingHours.map((item, index) => (
                  <div
                    key={item.day}
                    className="grid gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10 sm:grid-cols-[120px_90px_1fr_1fr]"
                  >
                    <div className="flex items-center font-semibold capitalize text-slate-700 dark:text-slate-300">
                      {item.day}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={item.isOpen}
                        onChange={(e) =>
                          updateOpeningHour(index, "isOpen", e.target.checked)
                        }
                      />
                      Open
                    </label>

                    <input
                      type="time"
                      disabled={!item.isOpen}
                      value={item.openTime}
                      onChange={(e) =>
                        updateOpeningHour(index, "openTime", e.target.value)
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />

                    <input
                      type="time"
                      disabled={!item.isOpen}
                      value={item.closeTime}
                      onChange={(e) =>
                        updateOpeningHour(index, "closeTime", e.target.value)
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            STEP 5 — REVIEW
        ================================================= */}

        {step === 5 && (
          <div className="space-y-7">
            <SectionTitle
              title="Review Your Listing"
              description="Check the information before publishing."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <ReviewItem
                label="Listing Type"
                value={
                  form.listingType === "business"
                    ? "Local Business"
                    : "Local Service"
                }
              />

              <ReviewItem label="Title" value={form.title} />

              <ReviewItem
                label="Category"
                value={selectedCategory?.label || form.category}
              />

              <ReviewItem label="Subcategory" value={form.subcategory} />

              <ReviewItem label="Service Mode" value={form.serviceMode} />

              <ReviewItem
                label="Location"
                value={`${form.location.city}, ${form.location.district}`}
              />

              <ReviewItem label="Phone" value={form.contact.phone} />

              <ReviewItem
                label="Pricing"
                value={
                  form.priceOnRequest
                    ? "Price on Request"
                    : `₹${form.startingPrice} / ${form.priceUnit}`
                }
              />
            </div>

            {/* IMAGES */}

            {form.images.length > 0 && (
              <div>
                <h3 className="mb-3 font-bold text-slate-900 dark:text-white">
                  Images
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {form.images.map((image, index) => (
                    <div
                      key={image.publicId || index}
                      className="relative overflow-hidden rounded-xl"
                    >
                      <img
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        className="h-28 w-full object-cover"
                      />

                      {form.thumbnail === image.url && (
                        <span className="absolute left-2 top-2 rounded-full bg-[#1565d8] px-2 py-1 text-[10px] font-bold text-white">
                          Thumbnail
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SERVICES */}

            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-white/5">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Services Offered
              </h3>

              <Tags
                items={form.servicesOffered}
                onRemove={() => undefined}
                readOnly
              />
            </div>

            {/* READY */}

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
              <div className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#1565d8]" />

                <div>
                  <h3 className="font-bold text-[#1565d8] dark:text-blue-300">
                    Ready to publish
                  </h3>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Your listing will be published on DealUp after the final
                    submission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-white/10 sm:flex-row sm:justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:border-slate-300 disabled:opacity-50 dark:border-white/10 dark:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={uploadingImage}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-[#0f52ba] disabled:opacity-60"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />

                  {mode === "edit" ? "Update Service" : "Publish Service"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

// =====================================================
// Section Title
// =====================================================

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

// =====================================================
// Field
// =====================================================

function Field({
  label,
  error,
  right,
  children,
}: {
  label: string;
  error?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>

        {right && <span className="text-xs text-slate-400">{right}</span>}
      </div>

      {children}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// =====================================================
// Choice Card
// =====================================================

function ChoiceCard({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-5 text-left transition",

        active
          ? "border-[#1565d8] bg-blue-50 ring-2 ring-[#1565d8]/20 dark:bg-blue-500/10"
          : "border-slate-200 hover:border-[#1565d8]/50 dark:border-white/10",
      ].join(" ")}
    >
      {icon}

      <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </button>
  );
}

// =====================================================
// Tags
// =====================================================

function Tags({
  items,
  onRemove,
  amber = false,
  readOnly = false,
}: {
  items: string[];
  onRemove: (index: number) => void;
  amber?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item, index) => (
        <button
          key={`${item}-${index}`}
          type="button"
          disabled={readOnly}
          onClick={() => onRemove(index)}
          className={
            readOnly
              ? "rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:bg-white/10 dark:text-slate-300"
              : amber
                ? "rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                : "rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1565d8] dark:bg-blue-500/10 dark:text-blue-300"
          }
        >
          {item}

          {!readOnly && " ×"}
        </button>
      ))}
    </div>
  );
}

// =====================================================
// Review Item
// =====================================================

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold text-slate-900 dark:text-white">
        {value || "Not provided"}
      </p>
    </div>
  );
}
