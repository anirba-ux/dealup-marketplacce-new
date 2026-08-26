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

// =====================================================
// Constants
// =====================================================

const TOTAL_STEPS = 6;

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
  //
  // Draft is now user-specific.
  // This prevents User A's draft appearing
  // for User B.
  // ===================================================

  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const userId =
    session?.user?.id ?? null;

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
  // This is captured during the current product
  // publishing flow. It is NOT permanent seller
  // verification and is NOT saved in the draft.
  // ===================================================

  const [sellerLiveLocation, setSellerLiveLocation] =
    useState<LiveSellerLocation | null>(null);

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

      // IMPORTANT:
      // No fake/default location.
      // 0,0 means location has not
      // been selected yet.
      latitude: 0,

      longitude: 0,
    },
  });

  // ===================================================
  // Form Values
  // ===================================================

  const formValues = watch();

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
        initialData.location.district,

      city:
        initialData.location.city,

      pincode:
        initialData.location.pincode,

      address:
        initialData.location.address ??
        "",

      latitude:
        initialData.location
          .coordinates.lat,

      longitude:
        initialData.location
          .coordinates.lng,
    });

    // Existing images
    setProductImages(
      initialData.images ?? [],
    );

    // A new live GPS capture is required only when
    // publishing/updating from the current device.
    // Never reuse an old live GPS snapshot.
    setSellerLiveLocation(null);

    // Existing thumbnail
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
  //
  // Product location and live seller GPS are kept
  // as two separate pieces of information.
  //
  // Product coordinates = where the product is.
  // sellerLocation = seller/device GPS captured now.
  //
  // Permanent seller verification remains separate.
  // ===================================================

  async function onSubmit(
    data: ProductFormData,
  ) {
    try {
      // =================================================
      // Authentication Ready Check
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
      // STEP 1
      // Validate Product Coordinates
      // =================================================

      const productLatitude =
        Number(data.latitude);

      const productLongitude =
        Number(data.longitude);

      if (
        !Number.isFinite(
          productLatitude,
        ) ||
        !Number.isFinite(
          productLongitude,
        ) ||
        productLatitude === 0 ||
        productLongitude === 0
      ) {
        throw new Error(
          "Please select a valid product location on the map.",
        );
      }

      // =================================================
      // STEP 2
      // Validate Product Address
      // =================================================

      const state =
        data.state?.trim() ?? "";

      const district =
        data.district?.trim() ?? "";

      const city =
        data.city?.trim() ?? "";

      const pincode =
        data.pincode?.trim() ?? "";

      const address =
        data.address?.trim() ?? "";

      if (
        !state ||
        !district ||
        !city ||
        !pincode
      ) {
        throw new Error(
          "Please complete the product location details before publishing.",
        );
      }

      // =================================================
      // STEP 3
      // Validate Live Seller GPS
      // =================================================

      if (mode === "create") {
        if (
          !sellerLiveLocation ||
          !Number.isFinite(sellerLiveLocation.latitude) ||
          !Number.isFinite(sellerLiveLocation.longitude) ||
          !Number.isFinite(sellerLiveLocation.accuracy) ||
          sellerLiveLocation.accuracy <= 0
        ) {
          throw new Error(
            "Please capture your current location using GPS before publishing this product.",
          );
        }

        if (sellerLiveLocation.accuracy > 200) {
          throw new Error(
            "Your GPS accuracy is too low. Please enable precise location and try again.",
          );
        }
      }

      // =================================================
      // STEP 4
      // Prepare Product Payload
      // =================================================

      const payload = {
        ...data,

        // Product Images
        images:
          productImages,

        // Thumbnail
        thumbnail:
          productImages[
            thumbnailIndex
          ]?.url ??
          productImages[0]?.url ??
          "",

        // Product Location
        state,

        district,

        city,

        pincode,

        address,

        latitude:
          productLatitude,

        longitude:
          productLongitude,

        // Live seller/device GPS snapshot.
        // Permanent seller verification remains separate.
        ...(sellerLiveLocation
          ? {
              sellerLocation: {
                latitude: sellerLiveLocation.latitude,
                longitude: sellerLiveLocation.longitude,
                accuracy: sellerLiveLocation.accuracy,
                capturedAt: sellerLiveLocation.capturedAt,
              },
            }
          : {}),
      };

      console.log(
        "PRODUCT SUBMIT PAYLOAD:",
        payload,
      );

      // =================================================
      // STEP 4
      // API URL
      // =================================================

      const url =
        mode === "edit"
          ? `/api/products/${initialData?._id}`
          : "/api/products";

      // =================================================
      // STEP 5
      // HTTP Method
      // =================================================

      const method =
        mode === "edit"
          ? "PUT"
          : "POST";

      // =================================================
      // STEP 6
      // API Request
      // =================================================

      const response =
        await fetch(url, {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              payload,
            ),
        });

      // =================================================
      // STEP 7
      // API Response
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
      // STEP 8
      // API Error
      // =================================================

      if (!response.ok) {
        throw new Error(
          result?.message ??
            (mode === "edit"
              ? "Failed to update product."
              : "Failed to publish product."),
        );
      }

      // =================================================
      // STEP 9
      // Location Information
      // =================================================

      if (
        result?.locationVerification
      ) {
        console.log(
          "LOCATION VERIFICATION:",
          result.locationVerification,
        );
      }

      if (
        result?.sellerProductDistance
      ) {
        console.log(
          "SELLER → PRODUCT DISTANCE:",
          result.sellerProductDistance,
        );
      }

      // =================================================
      // STEP 10
      // Clear ONLY current user's draft
      // =================================================

      if (draftKey) {
        localStorage.removeItem(
          draftKey,
        );
      }

      // =================================================
      // STEP 11
      // Success Message
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

    let isValid = false;

    // =================================================
    // Validate Current Step
    // =================================================

    switch (step) {
      // -----------------------------------------------
      // Step 1 — Basic Information
      // -----------------------------------------------

      case 0:
        isValid =
          await trigger([
            "title",
            "description",
          ]);

        break;

      // -----------------------------------------------
      // Step 2 — Category
      // -----------------------------------------------

      case 1:
        isValid =
          await trigger([
            "category",
            "subcategory",
          ]);

        break;

      // -----------------------------------------------
      // Step 3 — Pricing
      // -----------------------------------------------

      case 2:
        isValid =
          await trigger([
            "price",
            "condition",
          ]);

        break;

      // -----------------------------------------------
      // Step 4 — Images
      // -----------------------------------------------

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

      // -----------------------------------------------
      // Step 5 — Product Location
      // -----------------------------------------------

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
        // Coordinate validation
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
            !Number.isFinite(
              latitude,
            ) ||
            !Number.isFinite(
              longitude,
            ) ||
            latitude === 0 ||
            longitude === 0
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
        // ---------------------------------------------
        // Basic Information
        // ---------------------------------------------

        case 0:
          setFocus(
            formErrors.title
              ? "title"
              : "description",
          );

          break;

        // ---------------------------------------------
        // Category
        // ---------------------------------------------

        case 1:
          setFocus(
            formErrors.category
              ? "category"
              : "subcategory",
          );

          break;

        // ---------------------------------------------
        // Pricing
        // ---------------------------------------------

        case 2:
          setFocus(
            formErrors.price
              ? "price"
              : "condition",
          );

          break;

        // ---------------------------------------------
        // Location
        // ---------------------------------------------

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
    // Move To Next Step
    // =================================================

    setStep(
      (previous) =>
        previous + 1,
    );
  }

  // ===================================================
  // Previous Step
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
    const handleBeforeUnload = (
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
  // IMPORTANT:
  //
  // Never load draft until authentication
  // has finished.
  //
  // Never load draft in edit mode.
  // ===================================================

  useEffect(() => {
    if (mode === "edit") {
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

      // -----------------------------------------------
      // Form values
      // -----------------------------------------------

      if (
        parsed.values
      ) {
        reset(
          parsed.values,
        );
      }

      // -----------------------------------------------
      // Step
      // -----------------------------------------------

      setStep(
        parsed.step ?? 0,
      );

      // -----------------------------------------------
      // Images
      // -----------------------------------------------

      setProductImages(
        parsed.productImages ??
          [],
      );

      // -----------------------------------------------
      // Thumbnail
      // -----------------------------------------------

      setThumbnailIndex(
        parsed.thumbnailIndex ??
          0,
      );
    } catch (error) {
      console.error(
        "DRAFT LOAD ERROR:",
        error,
      );

      // Remove corrupted draft
      // for this user only.
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
  // Each logged-in user gets a separate draft.
  // ===================================================

  useEffect(() => {
    if (mode === "edit") {
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

      // Do NOT store sellerLiveLocation in localStorage.
      // GPS must be freshly captured for publishing.
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
    if (!successMessage) {
      return;
    }

    if (countdown === 0) {
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

  if (successMessage) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-green-200 bg-white p-10 text-center shadow-2xl dark:bg-slate-900">
          {/* Success Icon */}

          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl">
            ✅
          </div>

          {/* Success Title */}

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {successMessage}
          </h2>

          {/* Description */}

          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Your changes have been
            saved successfully.
          </p>

          {/* Location Note */}

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-500">
            Product location has
            been saved separately
            from seller verification.
          </p>

          {/* Countdown */}

          <p className="mt-6 text-xl font-semibold text-[#1565d8]">
            Redirecting in{" "}
            {countdown} second
            {countdown !== 1
              ? "s"
              : ""}
            ...
          </p>

          {/* Dashboard Button */}

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
            STEP 1 — Basic Information
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
            STEP 2 — Category
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
            STEP 3 — Pricing
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
            STEP 4 — Images
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

          {/* Image Error */}

          {imageError && (
            <p className="mt-3 text-sm font-medium text-red-500">
              {imageError}
            </p>
          )}
        </div>

        {/* ===============================================
            STEP 5 — Product Location
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
            STEP 6 — Preview
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
          Footer Navigation
      ================================================= */}

      <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-700">
        {/* ===============================================
            Previous Button
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
            Final Submit / Continue
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