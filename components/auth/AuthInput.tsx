import { InputHTMLAttributes } from "react";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function AuthInput({
  label,
  error,
  className,
  ...props
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        {...props}
        className={`w-full rounded-xl border px-4 py-3 text-slate-900 dark:text-white dark:text-white outline-none transition-all duration-300 placeholder:text-slate-400 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
            : "border-slate-300 focus:border-[#1565d8] focus:ring-4 focus:ring-[#1565d8]/10"
        } ${className ?? ""}`}
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}