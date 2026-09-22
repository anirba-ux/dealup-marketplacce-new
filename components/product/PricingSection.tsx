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
      {/* =====================================================
          Header
      ===================================================== */}

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Pricing & Condition
        </h2>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Set a fair price and tell buyers about the condition of your product.
        </p>
      </div>

      {/* =====================================================
          Price
      ===================================================== */}

      <div>
        <label
          htmlFor="selling-price"
          className="mb-2 block font-medium text-slate-700 dark:text-slate-200"
        >
          Selling Price (₹)
        </label>

        <div className="relative">
          {/* Rupee Symbol */}

          <span
            className="
              pointer-events-none
              absolute
              left-5
              top-1/2
              z-10
              -translate-y-1/2
              text-lg
              font-semibold
              text-slate-700
              dark:text-slate-200
            "
          >
            ₹
          </span>

          <input
            id="selling-price"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            placeholder="Enter product price"
            {...register("price", {
              valueAsNumber: true,
            })}
            className="
              h-14
              w-full
              rounded-2xl
              border
              border-slate-300
              bg-white
              pl-12
              pr-4
              text-[16px]
              font-medium
              text-slate-900
              placeholder:text-slate-400
              shadow-sm
              outline-none
              transition-all
              duration-200

              hover:border-slate-400
              hover:shadow-md

              focus:border-[#1565d8]
              focus:ring-4
              focus:ring-blue-100

              dark:border-slate-600
              dark:bg-slate-900
              dark:text-white
              dark:placeholder:text-slate-500
              dark:hover:border-slate-500
              dark:focus:ring-blue-900/40
            "
          />
        </div>

        {errors.price && (
          <p className="mt-2 text-sm font-medium text-red-500 dark:text-red-400">
            {errors.price.message}
          </p>
        )}
      </div>

      {/* =====================================================
          Negotiable
      ===================================================== */}

      <div
        className="
          flex
          items-center
          gap-3
          rounded-2xl
          border
          border-slate-200
          bg-slate-50
          p-4
          transition-colors

          dark:border-slate-700
          dark:bg-slate-900
        "
      >
        <input
          id="negotiable"
          type="checkbox"
          {...register("negotiable")}
          className="h-5 w-5 cursor-pointer accent-[#1565d8]"
        />

        <label
          htmlFor="negotiable"
          className="
            cursor-pointer
            font-medium
            text-slate-700
            dark:text-slate-200
          "
        >
          Price is Negotiable
        </label>
      </div>

      {/* =====================================================
          Condition
      ===================================================== */}

      <div>
        <label
          className="
            mb-4
            block
            font-medium
            text-slate-700
            dark:text-slate-200
          "
        >
          Product Condition
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* New */}

          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              rounded-2xl
              border
              border-slate-300
              bg-white
              p-4
              text-slate-800
              transition-all
              duration-200

              hover:border-[#1565d8]
              hover:shadow-sm

              dark:border-slate-600
              dark:bg-slate-900
              dark:text-slate-100
              dark:hover:border-blue-500
            "
          >
            <input
              type="radio"
              value="new"
              {...register("condition")}
              className="h-4 w-4 accent-[#1565d8]"
            />

            <span className="font-medium">
              🆕 New
            </span>
          </label>

          {/* Used */}

          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              rounded-2xl
              border
              border-slate-300
              bg-white
              p-4
              text-slate-800
              transition-all
              duration-200

              hover:border-[#1565d8]
              hover:shadow-sm

              dark:border-slate-600
              dark:bg-slate-900
              dark:text-slate-100
              dark:hover:border-blue-500
            "
          >
            <input
              type="radio"
              value="used"
              {...register("condition")}
              className="h-4 w-4 accent-[#1565d8]"
            />

            <span className="font-medium">
              📦 Used
            </span>
          </label>

          {/* Refurbished */}

          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              rounded-2xl
              border
              border-slate-300
              bg-white
              p-4
              text-slate-800
              transition-all
              duration-200

              hover:border-[#1565d8]
              hover:shadow-sm

              dark:border-slate-600
              dark:bg-slate-900
              dark:text-slate-100
              dark:hover:border-blue-500
            "
          >
            <input
              type="radio"
              value="refurbished"
              {...register("condition")}
              className="h-4 w-4 accent-[#1565d8]"
            />

            <span className="font-medium">
              ♻️ Refurbished
            </span>
          </label>
        </div>

        {errors.condition && (
          <p className="mt-2 text-sm font-medium text-red-500 dark:text-red-400">
            {errors.condition.message}
          </p>
        )}
      </div>

      {/* =====================================================
          Pricing Tip
      ===================================================== */}

      <div
        className="
          rounded-2xl
          border
          border-blue-100
          bg-blue-50
          p-5

          dark:border-blue-900/50
          dark:bg-blue-950/40
        "
      >
        <h3 className="font-semibold text-[#1565d8] dark:text-blue-400">
          💡 Pricing Tip
        </h3>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-600
            dark:text-slate-300
          "
        >
          Products with competitive pricing and clear descriptions usually
          receive more buyer enquiries.
        </p>
      </div>
    </section>
  );
}