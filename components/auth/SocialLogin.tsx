"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import {
  ArrowLeft,
  Home,
} from "lucide-react";

export default function SocialLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl =
    searchParams.get("callbackUrl") || "/";

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    // If browser has a previous page, go back.
    // Otherwise go safely to homepage.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // =====================================================
  // HOME
  // =====================================================

  const handleHome = () => {
    router.push("/");
  };

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleLogin = async () => {
    await signIn("google", {
      callbackUrl,
    });
  };

  // =====================================================
  // FACEBOOK LOGIN
  // =====================================================

  const handleFacebookLogin = async () => {
    await signIn("facebook", {
      callbackUrl,
    });
  };

  return (
    <div className="w-full space-y-5">

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="flex w-full items-center justify-between">

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="
            group
            inline-flex
            min-h-10
            items-center
            gap-2
            rounded-lg
            px-2
            py-1.5
            text-sm
            font-medium
            text-slate-600
            transition-all
            duration-200

            hover:bg-slate-100
            hover:text-[#1565d8]

            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#1565d8]/40

            dark:text-slate-300
            dark:hover:bg-slate-800
            dark:hover:text-blue-400

            sm:text-[15px]
          "
        >
          <ArrowLeft
            size={18}
            strokeWidth={2}
            className="
              shrink-0
              transition-transform
              duration-200
              group-hover:-translate-x-0.5
            "
          />

          <span className="whitespace-nowrap">
            Back
          </span>
        </button>

        {/* HOME BUTTON */}

        <button
          type="button"
          onClick={handleHome}
          aria-label="Go to homepage"
          className="
            group
            inline-flex
            min-h-10
            items-center
            gap-2
            rounded-lg
            px-2
            py-1.5
            text-sm
            font-medium
            text-slate-600
            transition-all
            duration-200

            hover:bg-blue-50
            hover:text-[#1565d8]

            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#1565d8]/40

            dark:text-slate-300
            dark:hover:bg-slate-800
            dark:hover:text-blue-400

            sm:text-[15px]
          "
        >
          <Home
            size={18}
            strokeWidth={2}
            className="
              shrink-0
              transition-transform
              duration-200
              group-hover:scale-105
            "
          />

          <span className="whitespace-nowrap">
            Home
          </span>
        </button>
      </div>

      {/* =================================================
          GOOGLE LOGIN
      ================================================= */}

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="
          flex
          h-12
          w-full
          items-center
          justify-center
          gap-2.5
          whitespace-nowrap
          rounded-xl
          border
          border-slate-300
          bg-white
          px-4
          text-[15px]
          font-semibold
          text-slate-700
          shadow-sm
          transition-all
          duration-300

          hover:border-[#1565d8]
          hover:bg-blue-50
          hover:shadow-md

          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#1565d8]/40

          dark:border-slate-700
          dark:bg-slate-900
          dark:text-white
          dark:hover:bg-slate-800
        "
      >
        <FcGoogle
          size={21}
          className="shrink-0"
        />

        <span className="whitespace-nowrap">
          Continue with Google
        </span>
      </button>

      {/* =================================================
          FACEBOOK LOGIN
      ================================================= */}

      <button
        type="button"
        onClick={handleFacebookLogin}
        className="
          flex
          h-12
          w-full
          items-center
          justify-center
          gap-2.5
          whitespace-nowrap
          rounded-xl
          border
          border-slate-300
          bg-white
          px-4
          text-[15px]
          font-semibold
          text-slate-700
          shadow-sm
          transition-all
          duration-300

          hover:border-[#1565d8]
          hover:bg-blue-50
          hover:shadow-md

          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#1565d8]/40

          dark:border-slate-700
          dark:bg-slate-900
          dark:text-white
          dark:hover:bg-slate-800
        "
      >
        <FaFacebookF
          size={19}
          className="
            shrink-0
            text-[#1877F2]
          "
        />

        <span className="whitespace-nowrap">
          Continue with Facebook
        </span>
      </button>
    </div>
  );
}