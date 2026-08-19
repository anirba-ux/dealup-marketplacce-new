"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthInput from "./AuthInput";
import PasswordInput from "./PasswordInput";
import Divider from "./Divider";
import SocialLogin from "./SocialLogin";

import {
  registerSchema,
  RegisterFormData,
} from "@/lib/validation";

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message);
        return;
      }

      alert("Registration Successful 🎉");

      router.push("/login");
    } catch (error) {
      console.error(error);

      alert("Something went wrong.");
    }
  };

  return (
    <div className="flex items-center justify-center p-8 lg:p-14">
      <div className="w-full max-w-md">
        {/* Heading */}

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white dark:text-white">
            Create Account 🚀
          </h1>

          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Join DealUp and start buying & selling today.
          </p>
        </div>

        {/* Social */}

        <SocialLogin />

        <Divider />

        {/* Form */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <AuthInput
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            error={errors.name?.message}
            {...register("name")}
          />

          <AuthInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="Create password"
            error={errors.password?.message}
            {...register("password")}
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {/* Terms */}

          <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
            <input
              type="checkbox"
              required
              className="mt-1 h-4 w-4 accent-[#1565d8]"
            />

            <span>
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-semibold text-[#1565d8]"
              >
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="font-semibold text-[#1565d8]"
              >
                Privacy Policy
              </Link>
            </span>
          </label>

          {/* Button */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-14 w-full rounded-2xl bg-[#1565d8] text-lg font-semibold text-white transition-all duration-300 hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        {/* Footer */}

        <p className="mt-8 text-center text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#1565d8] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}