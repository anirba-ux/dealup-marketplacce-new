"use client";

import AuthInput from "@/components/auth/AuthInput";

interface Props {
  register: any;
  errors: any;
}

export default function BasicInformation({ register, errors }: Props) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Basic Information</h2>

        <p className="mt-1 text-slate-500 dark:text-slate-400">Tell buyers about your product.</p>
      </div>

      <AuthInput
        label="Product Title"
        type="text"
        placeholder="e.g. iPhone 15 Pro Max 256GB"
        error={errors.title?.message}
        {...register("title")}
      />

      <div>
        <label className="mb-2 block font-medium text-slate-700">
          Description
        </label>

        <textarea
          rows={6}
          placeholder="Describe your product..."
          className="min-h-40 w-full rounded-2xl border border-slate-300 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all duration-200 resize-none focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100"
          {...register("description")}
        />

        {errors.description && (
          <p className="mt-2 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>
    </section>
  );
}
