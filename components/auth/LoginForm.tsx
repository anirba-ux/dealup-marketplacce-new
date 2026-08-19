"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { signIn } from "next-auth/react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import AuthInput from "./AuthInput";
import PasswordInput from "./PasswordInput";
import Divider from "./Divider";
import SocialLogin from "./SocialLogin";

import { loginSchema, LoginFormData } from "@/lib/validation";

export default function LoginForm() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
     
     
  try {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid Email or Password");
      return;
    }

    if (!result?.ok) {
      toast.error("Login failed.");
      return;
    }

    toast.success("Login Successful 🎉");

    console.log("Callback URL:", callbackUrl);

    router.replace(callbackUrl);
    router.refresh();
  } catch (error) {
    console.error(error);

    toast.error("Something went wrong. Please try again.");
  }
};

  return (
    <div className="flex items-center justify-center p-8 lg:p-14">
      <div className="w-full max-w-md">
        {/* Heading */}

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white dark:text-white">Welcome Back 👋</h1>

          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Login to continue to your DealUp account.
          </p>
        </div>

        {/* Social Login */}

        <SocialLogin />

        <Divider />

        {/* Login Form */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />

          {/* Forgot Password */}

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#1565d8] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-14 w-full rounded-2xl bg-[#1565d8] text-lg font-semibold text-white transition-all duration-300 hover:bg-[#0f52ba] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing In..." : "Login"}
          </button>
        </form>

        {/* Register Link */}

        <p className="mt-8 text-center text-slate-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#1565d8] hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
