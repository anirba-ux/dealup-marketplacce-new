"use client";

interface Props {
  register: any;
  errors: any;
}

export default function PricingSection({
  register,
  errors,
}: Props) {
  return (
    <section className="space-y-8">
      {/* Header */}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Pricing & Condition
        </h2>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Set a fair price and tell buyers about the condition of your product.
        </p>
      </div>

      {/* Price */}

      <div>
        <label className="mb-2 block font-medium text-slate-700">
          Selling Price (₹)
        </label>

        <input
          type="number"
          placeholder="Enter product price"
          {...register("price", {
            valueAsNumber: true,
          })}
          className="h-14 w-full rounded-2xl border border-slate-300 bg-white dark:bg-slate-900 px-4 text-slate-900 dark:text-white outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100"
        />

        {errors.price && (
          <p className="mt-2 text-sm text-red-500">
            {errors.price.message}
          </p>
        )}
      </div>

      {/* Negotiable */}

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 p-4">

        <input
          id="negotiable"
          type="checkbox"
          {...register("negotiable")}
          className="h-5 w-5 accent-[#1565d8]"
        />

        <label
          htmlFor="negotiable"
          className="cursor-pointer font-medium text-slate-700"
        >
          Price is Negotiable
        </label>

      </div>

      {/* Condition */}

      <div>

        <label className="mb-4 block font-medium text-slate-700">
          Product Condition
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-300 p-4 transition hover:border-[#1565d8]">

            <input
              type="radio"
              value="new"
              {...register("condition")}
            />

            <span className="font-medium">
              🆕 New
            </span>

          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-300 p-4 transition hover:border-[#1565d8]">

            <input
              type="radio"
              value="used"
              {...register("condition")}
            />

            <span className="font-medium">
              📦 Used
            </span>

          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-300 p-4 transition hover:border-[#1565d8]">

            <input
              type="radio"
              value="refurbished"
              {...register("condition")}
            />

            <span className="font-medium">
              ♻️ Refurbished
            </span>

          </label>

        </div>

        {errors.condition && (
          <p className="mt-2 text-sm text-red-500">
            {errors.condition.message}
          </p>
        )}

      </div>

      {/* Info */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

        <h3 className="font-semibold text-[#1565d8]">
          💡 Pricing Tip
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Products with competitive pricing and clear descriptions usually
          receive more buyer enquiries.
        </p>

      </div>

    </section>
  );
}