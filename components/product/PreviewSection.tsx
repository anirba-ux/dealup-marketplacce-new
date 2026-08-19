"use client";

import Image from "next/image";

interface UploadedImage {
  publicId: string;
  url: string;
}

interface Props {
  values: any;
  images: UploadedImage[];
}

export default function PreviewSection({
  values,
  images,
}: Props) {
  return (
    <section className="space-y-8">

      {/* Header */}

      <div className="text-center">

        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Preview Your Product
        </h2>

        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Review all information carefully before publishing.
        </p>

      </div>

      {/* Product Images */}

      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">

        <h3 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">
          Product Images
        </h3>

        {images.length === 0 ? (
          <div className="flex h-60 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-400">
            No Images Uploaded
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            {images.map((image) => (

              <div
                key={image.publicId}
                className="overflow-hidden rounded-2xl border"
              >
                <Image
                  src={image.url}
                  alt="Product"
                  width={400}
                  height={300}
                  className="h-44 w-full object-cover transition duration-300 hover:scale-105"
                />
              </div>

            ))}

          </div>
        )}

      </div>

      {/* Product Details */}

      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm">

        <h3 className="mb-6 text-xl font-bold">
          Product Information
        </h3>

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Product Title
            </p>

            <h4 className="mt-1 text-lg font-bold">
              {values.title || "-"}
            </h4>

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Price
            </p>

            <h4 className="mt-1 text-xl font-bold text-[#1565d8]">
              ₹ {values.price || 0}
            </h4>

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Category
            </p>

            <h4 className="mt-1 font-semibold">
              {values.category || "-"}
            </h4>

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Subcategory
            </p>

            <h4 className="mt-1 font-semibold">
              {values.subcategory || "-"}
            </h4>

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Brand
            </p>

            <h4 className="mt-1 font-semibold">
              {values.brand || "-"}
            </h4>

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Model
            </p>

            <h4 className="mt-1 font-semibold">
              {values.model || "-"}
            </h4>

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Condition
            </p>

            <h4 className="mt-1 font-semibold capitalize">
              {values.condition}
            </h4>

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Negotiable
            </p>

            <h4 className="mt-1 font-semibold">
              {values.negotiable ? "Yes" : "No"}
            </h4>

          </div>

        </div>

      </div>
            {/* Description */}

      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm">

        <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
          Description
        </h3>

        <p className="leading-8 text-slate-600">
          {values.description || "No description provided."}
        </p>

      </div>

      {/* Location */}

      <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm">

        <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
          Product Location
        </h3>

        <div className="grid gap-5 md:grid-cols-2">

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              State
            </p>

            <h4 className="mt-1 font-semibold">
              {values.state || "-"}
            </h4>

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              District
            </p>

            <h4 className="mt-1 font-semibold">
              {values.district || "-"}
            </h4>

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              City
            </p>

            <h4 className="mt-1 font-semibold">
              {values.city || "-"}
            </h4>

          </div>

          <div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pincode
            </p>

            <h4 className="mt-1 font-semibold">
              {values.pincode || "-"}
            </h4>

          </div>

        </div>

        <div className="mt-6">

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Address
          </p>

          <p className="mt-2 leading-7 text-slate-600">
            {values.address || "-"}
          </p>

        </div>

      </div>

      {/* Product Summary */}

      <div className="rounded-3xl bg-gradient-to-r from-[#1565d8] to-[#0f52ba] p-8 text-white shadow-xl">

        <h3 className="text-2xl font-bold">
          Product Summary
        </h3>

        <div className="mt-6 grid gap-5 md:grid-cols-2">

          <div>

            <p className="text-sm text-blue-100">
              Product
            </p>

            <h4 className="mt-1 font-semibold">
              {values.title || "-"}
            </h4>

          </div>

          <div>

            <p className="text-sm text-blue-100">
              Price
            </p>

            <h4 className="mt-1 font-semibold">
              ₹ {values.price || 0}
            </h4>

          </div>

          <div>

            <p className="text-sm text-blue-100">
              Category
            </p>

            <h4 className="mt-1 font-semibold">
              {values.category || "-"}
            </h4>

          </div>

          <div>

            <p className="text-sm text-blue-100">
              Condition
            </p>

            <h4 className="mt-1 font-semibold capitalize">
              {values.condition}
            </h4>

          </div>

        </div>

      </div>

      {/* Ready */}

      <div className="rounded-3xl border border-green-200 bg-green-50 p-8">

        <h3 className="text-xl font-bold text-green-700">
          ✅ Ready to Publish
        </h3>

        <p className="mt-3 leading-7 text-green-700">
          Please review all information carefully.
          If everything is correct, click
          <span className="font-bold">
            {" "}
            Publish Product
          </span>{" "}
          to make your product live on DealUp Marketplace.
        </p>

      </div>

    </section>
  );
}