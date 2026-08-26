"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import {
  useForm,
  type FieldErrors,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import ProductStepper from "./ProductStepper";
import BasicInformation from "./BasicInformation";
import CategorySection from "./CategorySection";
import PricingSection from "./PricingSection";
import ImageUploadSection from "./ImageUploadSection";
import LocationSection from "./LocationSection";
import PreviewSection from "./PreviewSection";

import {
  productSchema,
  type ProductFormData,
} from "@/lib/validations/product";

import type { Product } from "@/lib/models/product";

// =====================================================
// Types
// =====================================================

type ProductFormInitialData =
  Omit<Product, "_id"> & {
    _id?: string;
  };

interface LiveSellerLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
}

interface ProductFormProps {
  mode?: "create" | "edit";
  initialData?: ProductFormInitialData;
}

type OriginalLocation = {
  state: string;
  district: string;
  city: string;
  pincode: string;
  address: string;
  latitude: number;
  longitude: number;
};

// =====================================================
// Constants
// =====================================================

const TOTAL_STEPS = 6;

// =====================================================
// Helpers
// =====================================================

function normalizeText(
  value: unknown,
): string {
  return String(
    value ?? "",
  )
    .trim()
    .toLowerCase();
}

function coordinatesAreValid(
  latitude: number,
  longitude: number,
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude !== 0 &&
    longitude !== 0 &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function locationsAreEqual(
  first: OriginalLocation,
  second: OriginalLocation,
): boolean {
  return (
    normalizeText(first.state) ===
      normalizeText(second.state) &&
    normalizeText(first.district) ===
      normalizeText(second.district) &&
    normalizeText(first.city) ===
      normalizeText(second.city) &&
    normalizeText(first.pincode) ===
      normalizeText(second.pincode) &&
    normalizeText(first.address) ===
      normalizeText(second.address) &&
    Math.abs(
      Number(first.latitude) -
        Number(second.latitude),
    ) < 0.000001 &&
    Math.abs(
      Number(first.longitude) -
        Number(second.longitude),
    ) < 0.000001
  );
}

// =====================================================
// Component
// =====================================================

export default function ProductForm({
  mode = "create",
  initialData,
}: ProductFormProps) {
  const router = useRouter();

  // ===================================================
  // Authentication
  // ===================================================

  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const userId =
    session?.user?.id ?? null;

  // ===================================================
  // Draft Key
  // ===================================================

  const draftKey = useMemo(() => {
    if (!userId) {
      return null;
    }

    return `dealup-product-draft:${userId}`;
  }, [userId]);

  // ===================================================
  // Step
  // ===================================================

  const [step, setStep] =
    useState(0);

  // ===================================================
  // Success
  // ===================================================

  const [successMessage, setSuccessMessage] =
    useState("");

  const [countdown, setCountdown] =
    useState(5);

  // ===================================================
  // Product Images
  // ===================================================

  const [productImages, setProductImages] =
    useState<
      {
        publicId: string;
        url: string;
        imageHash?: string;
      }[]
    >(initialData?.images ?? []);

  const [thumbnailIndex, setThumbnailIndex] =
    useState(0);

  const [imageError, setImageError] =
    useState("");

  // ===================================================
  // Live Seller GPS
  //
  // OPTIONAL.
  //
  // This is NOT permanent seller verification.
  // ===================================================

  const [sellerLiveLocation, setSellerLiveLocation] =
    useState<LiveSellerLocation | null>(
      null,
    );

  // ===================================================
  // Original Product Location
  //
  // Used only in edit mode to determine whether the
  // product location was actually changed.
  // ===================================================

  const [originalLocation, setOriginalLocation] =
    useState<OriginalLocation | null>(
      null,
    );

  // ===================================================
  // React Hook Form
  // ===================================================

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    trigger,
    setFocus,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } = useForm<ProductFormData>({
    resolver:
      zodResolver(productSchema),

    defaultValues: {
      title: "",
      description: "",
      category: "",
      subcategory: "",
      brand: "",
      model: "",
      price: 0,
      negotiable: false,
      condition: "used",

      state: "",
      district: "",
      city: "",
      pincode: "",
      address: "",

      latitude: 0,
      longitude: 0,
    },
  });

  // ===================================================
  // Form Values
  // ===================================================

  const formValues =
    watch();

  // ===================================================
  // Detect Location Change
  // ===================================================

  const currentLocation =
    useMemo<OriginalLocation>(
      () => ({
        state:
          formValues.state ??
          "",

        district:
          formValues.district ??
          "",

        city:
          formValues.city ??
          "",

        pincode:
          formValues.pincode ??
          "",

        address:
          formValues.address ??
          "",

        latitude:
          Number(
            formValues.latitude,
          ),

        longitude:
          Number(
            formValues.longitude,
          ),
      }),
      [
        formValues.state,
        formValues.district,
        formValues.city,
        formValues.pincode,
        formValues.address,
        formValues.latitude,
        formValues.longitude,
      ],
    );

  const locationChanged =
    mode === "edit" &&
    originalLocation !== null
      ? !locationsAreEqual(
          originalLocation,
          currentLocation,
        )
      : false;

  // ===================================================
  // Auto Fill Edit Data
  // ===================================================

  useEffect(() => {
    if (
      mode !== "edit" ||
      !initialData
    ) {
      return;
    }

    const existingLocation: OriginalLocation =
      {
        state:
          initialData.location
            .state,

        district:
          initialData.location
            .district,

        city:
          initialData.location
            .city,

        pincode:
          initialData.location
            .pincode,

        address:
          initialData.location
            .address ?? "",

        latitude:
          initialData.location
            .coordinates.lat,

        longitude:
          initialData.location
            .coordinates.lng,
      };

    reset({
      title:
        initialData.title,

      description:
        initialData.description,

      category:
        initialData.category,

      subcategory:
        initialData.subcategory,

      brand:
        initialData.brand ?? "",

      model:
        initialData.model ?? "",

      price:
        initialData.price,

      negotiable:
        initialData.negotiable,

      condition:
        initialData.condition,

      state:
        initialData.location.state,

      district:
        initialData.location
          .district,

      city:
        initialData.location.city,

      pincode:
        initialData.location
          .pincode,

      address:
        initialData.location
          .address ?? "",

      latitude:
        initialData.location
          .coordinates.lat,

      longitude:
        initialData.location
          .coordinates.lng,
    });

    setOriginalLocation(
      existingLocation,
    );

    setSellerLiveLocation(
      null,
    );

    setProductImages(
      initialData.images ?? [],
    );

    if (
      initialData.images?.length
    ) {
      const index =
        initialData.images.findIndex(
          (image) =>
            image.url ===
            initialData.thumbnail,
        );

      setThumbnailIndex(
        index >= 0
          ? index
          : 0,
      );
    }
  }, [
    mode,
    initialData,
    reset,
  ]);

  // ===================================================
  // Submit Product
  // ===================================================

  async function onSubmit(
    data: ProductFormData,
  ) {
    try {
      // =================================================
      // Authentication
      // =================================================

      if (
        sessionStatus ===
        "loading"
      ) {
        throw new Error(
          "Please wait while your account is being verified.",
        );
      }

      if (!userId) {
        throw new Error(
          "Please log in before publishing a product.",
        );
      }

      // =================================================
      // Product Coordinates
      // =================================================

      const productLatitude =
        Number(
          data.latitude,
        );

      const productLongitude =
        Number(
          data.longitude,
        );

      const coordinatesValid =
        coordinatesAreValid(
          productLatitude,
          productLongitude,
        );

      // =================================================
      // EDIT MODE
      //
      // Existing location is allowed.
      //
      // If the user has NOT changed the location,
      // do not require any new GPS.
      // =================================================

      if (
        mode === "edit" &&
        !locationChanged
      ) {
        if (
          !coordinatesValid
        ) {
          throw new Error(
            "The existing product location is invalid. Please select the product location again.",
          );
        }
      }

      // =================================================
      // CREATE MODE
      //
      // New product must always have a valid location.
      // =================================================

      if (
        mode === "create" &&
        !coordinatesValid
      ) {
        throw new Error(
          "Please select a valid product location on the map.",
        );
      }

      // =================================================
      // EDIT MODE + LOCATION CHANGED
      //
      // New manual/map location is allowed.
      // No live GPS is mandatory.
      // =================================================

      if (
        mode === "edit" &&
        locationChanged &&
        !coordinatesValid
      ) {
        throw new Error(
          "Please select a valid product location on the map.",
        );
      }

      // =================================================
      // Product Address
      // =================================================

      const state =
        data.state?.trim() ??
        "";

      const district =
        data.district?.trim() ??
        "";

      const city =
        data.city?.trim() ??
        "";

      const pincode =
        data.pincode?.trim() ??
        "";

      const address =
        data.address?.trim() ??
        "";

      if (
        !state ||
        !district ||
        !city ||
        !pincode
      ) {
        throw new Error(
          "Please complete the product location details before saving.",
        );
      }

      // =================================================
      // Validate Optional Live GPS
      //
      // NEVER block update/publish because GPS is absent.
      // =================================================

      const validSellerLiveLocation =
        sellerLiveLocation &&
        Number.isFinite(
          sellerLiveLocation.latitude,
        ) &&
        Number.isFinite(
          sellerLiveLocation.longitude,
        ) &&
        Number.isFinite(
          sellerLiveLocation.accuracy,
        ) &&
        sellerLiveLocation.accuracy >
          0 &&
        sellerLiveLocation.accuracy <=
          200
          ? sellerLiveLocation
          : null;

      // =================================================
      // Payload
      // =================================================

      const payload: Record<
        string,
        unknown
      > = {
        ...data,

        images:
          productImages,

        thumbnail:
          productImages[
            thumbnailIndex
          ]?.url ??
          productImages[0]?.url ??
          "",

        state,

        district,

        city,

        pincode,

        address,

        latitude:
          productLatitude,

        longitude:
          productLongitude,
      };

      // =================================================
      // Optional Live Seller GPS
      //
      // Only send when actually available.
      // =================================================

      if (
        validSellerLiveLocation
      ) {
        payload.sellerLocation =
          {
            latitude:
              validSellerLiveLocation.latitude,

            longitude:
              validSellerLiveLocation.longitude,

            accuracy:
              validSellerLiveLocation.accuracy,

            capturedAt:
              validSellerLiveLocation.capturedAt,
          };
      }

      // =================================================
      // Important Edit Flag
      //
      // This allows the API to distinguish:
      //
      // 1. Normal edit
      // 2. Actual location change
      // =================================================

      if (
        mode === "edit"
      ) {
        payload.locationChanged =
          locationChanged;
      }

      // =================================================
      // Debug
      // =================================================

      console.log(
        "PRODUCT SUBMIT MODE:",
        mode,
      );

      console.log(
        "PRODUCT LOCATION CHANGED:",
        locationChanged,
      );

      console.log(
        "PRODUCT SUBMIT PAYLOAD:",
        payload,
      );

      // =================================================
      // API
      // =================================================

      const url =
        mode === "edit"
          ? `/api/products/${initialData?._id}`
          : "/api/products";

      const method =
        mode === "edit"
          ? "PUT"
          : "POST";

      // =================================================
      // Request
      // =================================================

      const response =
        await fetch(
          url,
          {
            method,

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      // =================================================
      // Response
      // =================================================

      let result:
        | any
        | null = null;

      try {
        result =
          await response.json();
      } catch {
        result = null;
      }

      console.log(
        "PRODUCT API RESULT:",
        result,
      );

      // =================================================
      // API Error
      // =================================================

      if (
        !response.ok
      ) {
        throw new Error(
          result?.message ??
            (mode === "edit"
              ? "Failed to update product."
              : "Failed to publish product."),
        );
      }

      // =================================================
      // Location Verification
      // =================================================

      if (
        result?.locationVerification
      ) {
        console.log(
          "LOCATION VERIFICATION:",
          result.locationVerification,
        );
      }

      // =================================================
      // Seller → Product Distance
      // =================================================

      if (
        result?.sellerProductDistance
      ) {
        console.log(
          "SELLER → PRODUCT DISTANCE:",
          result.sellerProductDistance,
        );
      }

      // =================================================
      // Clear Draft
      // =================================================

      if (
        draftKey &&
        mode === "create"
      ) {
        localStorage.removeItem(
          draftKey,
        );
      }

      // =================================================
      // Success
      // =================================================

      setSuccessMessage(
        mode === "edit"
          ? "✅ Product updated successfully."
          : "✅ Product published successfully.",
      );

      setCountdown(5);
    } catch (error) {
      console.error(
        "PRODUCT SUBMIT ERROR:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : mode === "edit"
            ? "Failed to update product."
            : "Failed to publish product.",
      );
    }
  }

  // ===================================================
  // Next Step
  // ===================================================

  async function nextStep() {
    if (
      step >=
      TOTAL_STEPS - 1
    ) {
      return;
    }

    let isValid =
      false;

    // =================================================
    // Validate Current Step
    // =================================================

    switch (step) {
      // ===============================================
      // Step 1
      // ===============================================

      case 0:
        isValid =
          await trigger([
            "title",
            "description",
          ]);

        break;

      // ===============================================
      // Step 2
      // ===============================================

      case 1:
        isValid =
          await trigger([
            "category",
            "subcategory",
          ]);

        break;

      // ===============================================
      // Step 3
      // ===============================================

      case 2:
        isValid =
          await trigger([
            "price",
            "condition",
          ]);

        break;

      // ===============================================
      // Step 4
      // ===============================================

      case 3:
        if (
          productImages.length ===
          0
        ) {
          setImageError(
            "Please upload at least one image.",
          );

          return;
        }

        setImageError("");

        isValid = true;

        break;

      // ===============================================
      // Step 5
      // Product Location
      // ===============================================

      case 4:
        isValid =
          await trigger([
            "state",
            "district",
            "city",
            "pincode",
            "address",
            "latitude",
            "longitude",
          ]);

        // ---------------------------------------------
        // Coordinates
        // ---------------------------------------------

        if (isValid) {
          const latitude =
            Number(
              getValues(
                "latitude",
              ),
            );

          const longitude =
            Number(
              getValues(
                "longitude",
              ),
            );

          if (
            !coordinatesAreValid(
              latitude,
              longitude,
            )
          ) {
            isValid = false;

            alert(
              "Please select a valid product location on the map.",
            );
          }
        }

        break;

      default:
        isValid = true;
    }

    // =================================================
    // Validation Failed
    // =================================================

    if (!isValid) {
      const formErrors =
        errors as FieldErrors<ProductFormData>;

      switch (step) {
        case 0:
          setFocus(
            formErrors.title
              ? "title"
              : "description",
          );

          break;

        case 1:
          setFocus(
            formErrors.category
              ? "category"
              : "subcategory",
          );

          break;

        case 2:
          setFocus(
            formErrors.price
              ? "price"
              : "condition",
          );

          break;

        case 4:
          if (
            formErrors.state
          ) {
            setFocus("state");
          } else if (
            formErrors.district
          ) {
            setFocus(
              "district",
            );
          } else if (
            formErrors.city
          ) {
            setFocus("city");
          } else if (
            formErrors.pincode
          ) {
            setFocus(
              "pincode",
            );
          } else if (
            formErrors.address
          ) {
            setFocus(
              "address",
            );
          } else if (
            formErrors.latitude
          ) {
            setFocus(
              "latitude",
            );
          } else if (
            formErrors.longitude
          ) {
            setFocus(
              "longitude",
            );
          }

          break;
      }

      return;
    }

    // =================================================
    // Next
    // =================================================

    setStep(
      (previous) =>
        previous + 1,
    );
  }

  // ===================================================
  // Previous
  // ===================================================

  function previousStep() {
    if (step <= 0) {
      return;
    }

    setStep(
      (previous) =>
        previous - 1,
    );
  }

  // ===================================================
  // Unsaved Changes Protection
  // ===================================================

  useEffect(() => {
    const handleBeforeUnload =
      (
        event: BeforeUnloadEvent,
      ) => {
        if (!isDirty) {
          return;
        }

        event.preventDefault();

        event.returnValue = "";
      };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
    };
  }, [isDirty]);

  // ===================================================
  // Load Draft
  //
  // Never load draft in edit mode.
  // ===================================================

  useEffect(() => {
    if (
      mode === "edit"
    ) {
      return;
    }

    if (
      sessionStatus ===
      "loading"
    ) {
      return;
    }

    if (!draftKey) {
      return;
    }

    const draft =
      localStorage.getItem(
        draftKey,
      );

    if (!draft) {
      return;
    }

    try {
      const parsed =
        JSON.parse(draft);

      if (
        parsed.values
      ) {
        reset(
          parsed.values,
        );
      }

      setStep(
        parsed.step ?? 0,
      );

      setProductImages(
        parsed.productImages ??
          [],
      );

      setThumbnailIndex(
        parsed.thumbnailIndex ??
          0,
      );
    } catch (error) {
      console.error(
        "DRAFT LOAD ERROR:",
        error,
      );

      localStorage.removeItem(
        draftKey,
      );
    }
  }, [
    mode,
    sessionStatus,
    draftKey,
    reset,
  ]);

  // ===================================================
  // Save Draft
  //
  // Create mode only.
  // ===================================================

  useEffect(() => {
    if (
      mode === "edit"
    ) {
      return;
    }

    if (successMessage) {
      return;
    }

    if (
      sessionStatus ===
      "loading"
    ) {
      return;
    }

    if (!draftKey) {
      return;
    }

    const draft = {
      values:
        formValues,

      step,

      productImages,

      thumbnailIndex,
    };

    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify(
          draft,
        ),
      );
    } catch (error) {
      console.warn(
        "DRAFT SAVE ERROR:",
        error,
      );
    }
  }, [
    mode,
    sessionStatus,
    draftKey,
    formValues,
    step,
    productImages,
    thumbnailIndex,
    successMessage,
  ]);

  // ===================================================
  // Success Countdown
  // ===================================================

  useEffect(() => {
    if (
      !successMessage
    ) {
      return;
    }

    if (
      countdown === 0
    ) {
      router.push(
        "/dashboard",
      );

      router.refresh();

      return;
    }

    const timer =
      setTimeout(() => {
        setCountdown(
          (previous) =>
            previous - 1,
        );
      }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [
    successMessage,
    countdown,
    router,
  ]);

  // ===================================================
  // Success Screen
  // ===================================================

  if (
    successMessage
  ) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-green-200 bg-white p-10 text-center shadow-2xl dark:bg-slate-900">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl">
            ✅
          </div>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {successMessage}
          </h2>

          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Your changes have
            been saved
            successfully.
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Product location is
            handled separately
            from permanent seller
            verification.
          </p>

          <p className="mt-6 text-xl font-semibold text-[#1565d8]">
            Redirecting in{" "}
            {countdown} second
            {countdown !== 1
              ? "s"
              : ""}
            ...
          </p>

          <button
            type="button"
            onClick={() => {
              router.push(
                "/dashboard",
              );

              router.refresh();
            }}
            className="mt-8 rounded-2xl bg-[#1565d8] px-8 py-3 font-semibold text-white transition hover:bg-[#0f52ba]"
          >
            Go to Dashboard Now
          </button>
        </div>
      </div>
    );
  }

  // ===================================================
  // Main Form
  // ===================================================

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit,
      )}
      className="space-y-10"
    >
      {/* =================================================
          Stepper
      ================================================= */}

      <ProductStepper
        currentStep={step}
      />

      {/* =================================================
          Form Sections
      ================================================= */}

      <div className="mt-10">
        {/* ===============================================
            STEP 1
        =============================================== */}

        <div
          className={
            step === 0
              ? "block"
              : "hidden"
          }
        >
          <BasicInformation
            register={register}
            errors={errors}
          />
        </div>

        {/* ===============================================
            STEP 2
        =============================================== */}

        <div
          className={
            step === 1
              ? "block"
              : "hidden"
          }
        >
          <CategorySection
            register={register}
            watch={watch}
            errors={errors}
            setValue={setValue}
          />
        </div>

        {/* ===============================================
            STEP 3
        =============================================== */}

        <div
          className={
            step === 2
              ? "block"
              : "hidden"
          }
        >
          <PricingSection
            register={register}
            errors={errors}
          />
        </div>

        {/* ===============================================
            STEP 4
        =============================================== */}

        <div
          className={
            step === 3
              ? "block"
              : "hidden"
          }
        >
          <ImageUploadSection
            uploadedImages={
              productImages
            }
            setUploadedImages={(
              images,
            ) => {
              setProductImages(
                images,
              );

              if (
                images.length > 0
              ) {
                setImageError(
                  "",
                );
              }
            }}
            thumbnailIndex={
              thumbnailIndex
            }
            setThumbnailIndex={
              setThumbnailIndex
            }
          />

          {imageError && (
            <p className="mt-3 text-sm font-medium text-red-500">
              {imageError}
            </p>
          )}
        </div>

        {/* ===============================================
            STEP 5
        =============================================== */}

        <div
          className={
            step === 4
              ? "block"
              : "hidden"
          }
        >
          <LocationSection
            register={register}
            errors={errors}
            setValue={setValue}
            getValues={
              getValues
            }
            watch={watch}
            mode={mode}
            onMobileLocationChange={
              setSellerLiveLocation
            }
          />
        </div>

        {/* ===============================================
            STEP 6
        =============================================== */}

        <div
          className={
            step === 5
              ? "block"
              : "hidden"
          }
        >
          <PreviewSection
            values={
              formValues
            }
            images={
              productImages
            }
          />
        </div>
      </div>

      {/* =================================================
          Footer
      ================================================= */}

      <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-700">
        {/* ===============================================
            Previous
        =============================================== */}

        <button
          type="button"
          onClick={
            previousStep
          }
          disabled={
            step === 0 ||
            isSubmitting
          }
          className="
            rounded-2xl
            border
            border-slate-300
            bg-white
            px-8
            py-3
            font-semibold
            text-slate-700
            transition
            hover:border-[#1565d8]
            hover:text-[#1565d8]
            disabled:cursor-not-allowed
            disabled:opacity-40
            dark:bg-slate-900
            dark:text-slate-200
          "
        >
          ← Previous
        </button>

        {/* ===============================================
            Submit / Continue
        =============================================== */}

        {step ===
        TOTAL_STEPS - 1 ? (
          <button
            type="submit"
            disabled={
              isSubmitting ||
              sessionStatus ===
                "loading"
            }
            className="
              rounded-2xl
              bg-[#1565d8]
              px-10
              py-3
              font-semibold
              text-white
              shadow-lg
              transition
              hover:bg-[#0f52ba]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isSubmitting
              ? mode ===
                "edit"
                ? "Updating..."
                : "Publishing..."
              : mode ===
                  "edit"
                ? "💾 Update Product"
                : "🚀 Publish Product"}
          </button>
        ) : (
          <button
            type="button"
            onClick={
              nextStep
            }
            disabled={
              isSubmitting
            }
            className="
              rounded-2xl
              bg-[#1565d8]
              px-10
              py-3
              font-semibold
              text-white
              shadow-lg
              transition
              hover:bg-[#0f52ba]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            Continue →
          </button>
        )}
      </div>
    </form>
  );
}