"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { User } from "lucide-react";

export default function SocialLogin() {
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleGoogleLogin = async () => {
    await signIn("google", {
      callbackUrl,
    });
  };

  const handleFacebookLogin = async () => {
    await signIn("facebook", {
      callbackUrl,
    });
  };

  return (
    <div className="space-y-4">
      {/* Google Login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition-all duration-300 hover:border-[#1565d8] hover:bg-blue-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
      >
        <FcGoogle size={22} />
        <span>Continue with Google</span>
      </button>

      {/* Facebook Login */}
      <button
        type="button"
        onClick={handleFacebookLogin}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition-all duration-300 hover:border-[#1565d8] hover:bg-blue-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
      >
        <FaFacebookF size={20} className="text-[#1877F2]" />
        <span>Continue with Facebook</span>
      </button>

      {/* Guest Login */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-3 font-semibold text-slate-600 transition-all duration-300 hover:border-[#1565d8] hover:bg-blue-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >
        <User size={20} />
        <span>Continue as Guest</span>
      </button>
    </div>
  );
}
