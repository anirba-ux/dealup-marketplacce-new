"use client";

import Link from "next/link";

import AuthInput from "./AuthInput";

export default function ForgotPasswordForm() {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl">

      {/* Heading */}

      <div className="mb-8 text-center">

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white dark:text-white">
          Forgot Password?
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Enter your email address and we'll send you a password reset link.
        </p>

      </div>

      {/* Form */}

      <form className="space-y-6">

        <AuthInput
          label="Email Address"
          type="email"
          placeholder="Enter your email"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-[#1565d8] py-3 font-semibold text-white transition-all duration-300 hover:bg-[#0f52ba]"
        >
          Send Reset Link
        </button>

      </form>

      {/* Back */}

      <p className="mt-8 text-center text-slate-600">

        Remember your password?{" "}

        <Link
          href="/login"
          className="font-semibold text-[#1565d8] hover:underline"
        >
          Back to Login
        </Link>

      </p>

    </div>
  );
}