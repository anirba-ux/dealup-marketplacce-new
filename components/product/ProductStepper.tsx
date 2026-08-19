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
    <div className="mb-12">

      <div className="mb-4 flex items-center justify-between">

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Product Setup
        </h2>

        <span className="font-medium text-[#1565d8]">
          Step {currentStep + 1} of {steps.length}
        </span>

      </div>

      {/* Progress */}

      <div className="mb-8 h-3 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-[#1565d8] transition-all duration-500"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
          }}
        />

      </div>

      {/* Step Names */}

      <div className="grid grid-cols-6 gap-3">

        {steps.map((step, index) => (

          <div
            key={step}
            className={`rounded-2xl border px-4 py-3 text-center text-sm font-semibold transition ${
              index === currentStep
                ? "border-[#1565d8] bg-[#1565d8] text-white"
                : index < currentStep
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400"
            }`}
          >
            {step}
          </div>

        ))}

      </div>

    </div>
  );
}