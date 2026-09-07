interface Props {
  currentStep: number;
}

const steps = [
  "Basic",
  "Category",
  "Pricing",
  "Images",
  "Location",
  "Preview",
];

export default function ProductStepper({
  currentStep,
}: Props) {
  return (
    <div className="mb-8 sm:mb-10 lg:mb-12">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
          Product Setup
        </h2>

        <span className="shrink-0 text-sm font-semibold text-[#1565d8] sm:text-base">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      {/* =====================================================
          PROGRESS BAR
      ====================================================== */}

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 sm:mb-7 sm:h-3">
        <div
          className="h-full rounded-full bg-[#1565d8] transition-all duration-500"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
        />
      </div>

      {/* =====================================================
          MOBILE / TABLET STEP NAVIGATION
      ====================================================== */}

      <div
        className="
          flex
          gap-2
          overflow-x-auto
          overscroll-x-contain
          pb-2
          [-ms-overflow-style:none]
          [scrollbar-width:none]

          sm:gap-3

          lg:grid
          lg:grid-cols-6
          lg:gap-3
          lg:overflow-visible
          lg:pb-0
        "
      >
        {steps.map((step, index) => {
          const isCurrent = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={step}
              className={`
                flex
                min-w-[78px]
                shrink-0
                items-center
                justify-center
                gap-1.5
                rounded-xl
                border
                px-3
                py-2.5
                text-center
                text-xs
                font-semibold
                transition-all
                duration-300

                sm:min-w-[90px]
                sm:px-4
                sm:py-3
                sm:text-sm

                lg:min-w-0
                lg:rounded-2xl

                ${
                  isCurrent
                    ? "border-[#1565d8] bg-[#1565d8] text-white shadow-md shadow-blue-500/20"
                    : isCompleted
                    ? "border-green-500/40 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-950/30 dark:text-green-400"
                    : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                }
              `}
            >
              {/* Step Number */}
              <span
                className={`
                  flex
                  h-5
                  w-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-[10px]
                  font-bold

                  sm:h-6
                  sm:w-6
                  sm:text-xs

                  ${
                    isCurrent
                      ? "bg-white/20 text-white"
                      : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }
                `}
              >
                {index + 1}
              </span>

              {/* Step Name */}
              <span className="whitespace-nowrap">
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}