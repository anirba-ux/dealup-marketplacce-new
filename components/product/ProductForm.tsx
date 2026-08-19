"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ProductStepper from "./ProductStepper";
import BasicInformation from "./BasicInformation";
import CategorySection from "./CategorySection";
import PricingSection from "./PricingSection";
import ImageUploadSection from "./ImageUploadSection";
import LocationSection from "./LocationSection";
import PreviewSection from "./PreviewSection";

import { productSchema, ProductFormData } from "@/lib/validations/product";

import { Product } from "@/lib/models/product";

// =====================================================
// Types
// =====================================================

type ProductFormInitialData = Omit<Product, "_id"> & {
  _id?: string;
};

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
  // Step
  // ===================================================

  const [step, setStep] = useState(0);

  // ===================================================
  // Success
  // ===================================================

  const [successMessage, setSuccessMessage] = useState("");

  const [countdown, setCountdown] = useState(5);

  // ===================================================
  // Product Images
  // ===================================================

  const [productImages, setProductImages] = useState<
    {
      publicId: string;
      url: string;
    }[]
  >(initialData?.images ?? []);

  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  const [imageError, setImageError] = useState("");

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

    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),

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

      latitude: 22.9765,

      longitude: 88.4011,
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
    if (mode !== "edit" || !initialData) {
      return;
    }

    reset({
      title: initialData.title,

      description: initialData.description,

      category: initialData.category,

      subcategory: initialData.subcategory,

      brand: initialData.brand ?? "",

      model: initialData.model ?? "",

      price: initialData.price,

      negotiable: initialData.negotiable,

      condition: initialData.condition,

      state: initialData.location.state,

      district: initialData.location.district,

      city: initialData.location.city,

      pincode: initialData.location.pincode,

      address: initialData.location.address ?? "",

      latitude: initialData.location.coordinates.lat,

      longitude: initialData.location.coordinates.lng,
    });

    // Existing images
    setProductImages(initialData.images ?? []);

    // Existing thumbnail
    if (initialData.images?.length) {
      const index = initialData.images.findIndex(
        (img) => img.url === initialData.thumbnail,
      );

      setThumbnailIndex(index >= 0 ? index : 0);
    }
  }, [mode, initialData, reset]);

  // ===================================================
  // Get Seller Live Location
  //
  // IMPORTANT:
  // This is OPTIONAL.
  //
  // Product location does NOT depend on
  // seller live GPS.
  // ===================================================

  function getSellerLiveLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
  }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error("Location services are not supported on this device."),
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,

            longitude: position.coords.longitude,

            accuracy: position.coords.accuracy,
          });
        },

        (error) => {
          console.warn("SELLER GPS UNAVAILABLE:", error);

          reject(new Error("Seller live location unavailable."));
        },

        {
          enableHighAccuracy: true,

          timeout: 15000,

          maximumAge: 0,
        },
      );
    });
  }

  // ===================================================
  // Submit Product
  // ===================================================

  async function onSubmit(data: ProductFormData) {
    try {
      // =================================================
      // STEP 1
      // Validate Product Map Coordinates
      // =================================================

      const productLatitude = Number(data.latitude);

      const productLongitude = Number(data.longitude);

      if (
        !Number.isFinite(productLatitude) ||
        !Number.isFinite(productLongitude)
      ) {
        throw new Error("Please select a valid product location on the map.");
      }

      // =================================================
      // STEP 2
      // Try Seller Live GPS
      //
      // IMPORTANT:
      // Failure here will NOT stop publishing.
      // =================================================

      let sellerLocation:
        | {
            latitude: number;
            longitude: number;
            accuracy: number;
          }
        | undefined;

      try {
        sellerLocation = await getSellerLiveLocation();

        console.log("SELLER LIVE LOCATION:", sellerLocation);
      } catch (locationError) {
        console.warn("SELLER LIVE LOCATION NOT AVAILABLE:", locationError);

        sellerLocation = undefined;
      }

      // =================================================
      // STEP 3
      // Prepare Product Payload
      // =================================================

      const payload = {
        ...data,

        // -----------------------------------------------
        // Product Images
        // -----------------------------------------------

        images: productImages,

        // -----------------------------------------------
        // Thumbnail
        // -----------------------------------------------

        thumbnail:
          productImages[thumbnailIndex]?.url ?? productImages[0]?.url ?? "",

        // -----------------------------------------------
        // Product Location
        //
        // This is the actual location selected
        // on the product map.
        // -----------------------------------------------

        latitude: productLatitude,

        longitude: productLongitude,

        // -----------------------------------------------
        // Optional Seller Live GPS
        // -----------------------------------------------

        ...(sellerLocation
          ? {
              sellerLocation: {
                latitude: sellerLocation.latitude,

                longitude: sellerLocation.longitude,

                accuracy: sellerLocation.accuracy,
              },
            }
          : {}),
      };

      console.log("PRODUCT SUBMIT PAYLOAD:", payload);

      // =================================================
      // STEP 4
      // API URL
      // =================================================

      const url =
        mode === "edit" ? `/api/products/${initialData?._id}` : "/api/products";

      // =================================================
      // STEP 5
      // HTTP Method
      // =================================================

      const method = mode === "edit" ? "PUT" : "POST";

      // =================================================
      // STEP 6
      // API Request
      // =================================================

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      // =================================================
      // STEP 7
      // API Response
      // =================================================

      const result = await response.json();

      console.log("PRODUCT API RESULT:", result);

      // =================================================
      // STEP 8
      // API Error
      // =================================================

      if (!response.ok) {
        throw new Error(result.message ?? "Something went wrong.");
      }

      // =================================================
      // STEP 9
      // Location Verification Result
      //
      // Only available when seller live GPS
      // was successfully captured.
      // =================================================

      if (result.locationVerification) {
        console.log("LOCATION VERIFICATION:", result.locationVerification);
      } else {
        console.log("Seller live location verification was not available.");
      }

      // =================================================
      // STEP 10
      // Clear Draft
      // =================================================

      localStorage.removeItem("dealup-product-draft");

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
      console.error("PRODUCT SUBMIT ERROR:", error);

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
    if (step >= TOTAL_STEPS - 1) {
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
        isValid = await trigger(["title", "description"]);

        break;

      // -----------------------------------------------
      // Step 2 — Category
      // -----------------------------------------------

      case 1:
        isValid = await trigger(["category", "subcategory"]);

        break;

      // -----------------------------------------------
      // Step 3 — Pricing
      // -----------------------------------------------

      case 2:
        isValid = await trigger(["price", "condition"]);

        break;

      // -----------------------------------------------
      // Step 4 — Images
      // -----------------------------------------------

      case 3:
        if (productImages.length === 0) {
          setImageError("Please upload at least one image.");

          return;
        }

        setImageError("");

        isValid = true;

        break;

      // -----------------------------------------------
      // Step 5 — Location
      // -----------------------------------------------

      case 4:
        isValid = await trigger(["state", "district", "city", "pincode"]);

        break;

      default:
        isValid = true;
    }

    // =================================================
    // Validation Failed
    // =================================================

    if (!isValid) {
      switch (step) {
        // ---------------------------------------------
        // Basic Information
        // ---------------------------------------------

        case 0:
          setFocus(errors.title ? "title" : "description");

          break;

        // ---------------------------------------------
        // Category
        // ---------------------------------------------

        case 1:
          setFocus(errors.category ? "category" : "subcategory");

          break;

        // ---------------------------------------------
        // Pricing
        // ---------------------------------------------

        case 2:
          setFocus(errors.price ? "price" : "condition");

          break;

        // ---------------------------------------------
        // Location
        // ---------------------------------------------

        case 4:
          if (errors.state) {
            setFocus("state");
          } else if (errors.district) {
            setFocus("district");
          } else if (errors.city) {
            setFocus("city");
          } else if (errors.pincode) {
            setFocus("pincode");
          } else if (errors.address) {
            setFocus("address");
          }

          break;
      }

      return;
    }

    // =================================================
    // Move To Next Step
    // =================================================

    setStep((previous) => previous + 1);
  }

  // ===================================================
  // Previous Step
  // ===================================================

  function previousStep() {
    if (step <= 0) {
      return;
    }

    setStep((previous) => previous - 1);
  }

  // ===================================================
  // Unsaved Changes Protection
  // ===================================================

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();

      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // ===================================================
  // Load Draft
  // ===================================================

  useEffect(() => {
    // Do not restore draft during edit mode.
    if (mode === "edit") {
      return;
    }

    const draft = localStorage.getItem("dealup-product-draft");

    if (!draft) {
      return;
    }

    try {
      const parsed = JSON.parse(draft);

      // Form values
      if (parsed.values) {
        reset(parsed.values);
      }

      // Step
      setStep(parsed.step ?? 0);

      // Images
      setProductImages(parsed.productImages ?? []);

      // Thumbnail
      setThumbnailIndex(parsed.thumbnailIndex ?? 0);
    } catch (error) {
      console.error("DRAFT LOAD ERROR:", error);
    }
  }, [mode, reset]);

  // ===================================================
  // Success Countdown
  // ===================================================

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    if (countdown === 0) {
      router.push("/dashboard");

      router.refresh();

      return;
    }

    const timer = setTimeout(() => {
      setCountdown((previous) => previous - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [successMessage, countdown, router]);

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
            Your changes have been saved successfully.
          </p>

          {/* Countdown */}

          <p className="mt-6 text-xl font-semibold text-[#1565d8]">
            Redirecting in {countdown} second
            {countdown !== 1 ? "s" : ""}
            ...
          </p>

          {/* Dashboard Button */}

          <button
            type="button"
            onClick={() => {
              router.push("/dashboard");

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* =================================================
          Stepper
      ================================================= */}

      <ProductStepper currentStep={step} />

      {/* =================================================
          Form Sections
      ================================================= */}

      <div className="mt-10">
        {/* ===============================================
            STEP 1 — Basic Information
        =============================================== */}

        <div className={step === 0 ? "block" : "hidden"}>
          <BasicInformation register={register} errors={errors} />
        </div>

        {/* ===============================================
            STEP 2 — Category
        =============================================== */}

        <div className={step === 1 ? "block" : "hidden"}>
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

        <div className={step === 2 ? "block" : "hidden"}>
          <PricingSection register={register} errors={errors} />
        </div>

        {/* ===============================================
            STEP 4 — Images
        =============================================== */}

        <div className={step === 3 ? "block" : "hidden"}>
          <ImageUploadSection
            uploadedImages={productImages}
            setUploadedImages={(images) => {
              setProductImages(images);

              if (images.length > 0) {
                setImageError("");
              }
            }}
            thumbnailIndex={thumbnailIndex}
            setThumbnailIndex={setThumbnailIndex}
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

        <div className={step === 4 ? "block" : "hidden"}>
          <LocationSection
            register={register}
            errors={errors}
            setValue={setValue}
            getValues={getValues}
            watch={watch}
            mode={mode}
          />
        </div>

        {/* ===============================================
            STEP 6 — Preview
        =============================================== */}

        <div className={step === 5 ? "block" : "hidden"}>
          <PreviewSection values={formValues} images={productImages} />
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
          onClick={previousStep}
          disabled={step === 0 || isSubmitting}
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
            Final Submit
        =============================================== */}

        {step === TOTAL_STEPS - 1 ? (
          <button
            type="submit"
            disabled={isSubmitting}
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
              ? mode === "edit"
                ? "Updating..."
                : "Publishing..."
              : mode === "edit"
                ? "💾 Update Product"
                : "🚀 Publish Product"}
          </button>
        ) : (
          /* =============================================
             Continue Button
          ============================================= */

          <button
            type="button"
            onClick={nextStep}
            disabled={isSubmitting}
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
