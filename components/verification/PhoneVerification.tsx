"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, Loader2, Phone, ShieldCheck } from "lucide-react";

interface PhoneVerificationProps {
  phone: string;
  onVerified?: (phone: string) => void;
}

export default function PhoneVerification({
  phone,
  onVerified,
}: PhoneVerificationProps) {
  const { data: session, update } = useSession();

  const [otp, setOtp] = useState("");

  const [msg91Ready, setMsg91Ready] = useState(false);

  const [reqId, setReqId] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);

  const [verifying, setVerifying] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [countdown, setCountdown] = useState(0);

  // =====================================
  // Existing Verification State
  // =====================================

  const isPhoneVerified =
  session?.user?.isPhoneVerified === true;

  // =====================================
  // MSG91 SDK
  // =====================================

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;

    const tokenAuth = process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN;

    if (!widgetId || !tokenAuth) {
      console.error("MSG91 Widget ID or Token is missing.");

      return;
    }

    // Prevent duplicate script
    if (
      document.querySelector(
        'script[src="https://verify.msg91.com/otp-provider.js"]',
      )
    ) {
      setMsg91Ready(true);
      return;
    }

    // Make configuration globally available
    const configuration = {
      widgetId,
      tokenAuth,

      exposeMethods: true,

      success: (data: unknown) => {
        console.log("MSG91 success response:", data);
      },

      failure: (error: unknown) => {
        console.error("MSG91 failure response:", error);
      },
    };

    const script = document.createElement("script");

    script.type = "text/javascript";

    script.src = "https://verify.msg91.com/otp-provider.js";

    script.async = true;

    script.onload = () => {
      console.log("MSG91 SDK loaded.");

      try {
        window.initSendOTP(configuration);

        console.log("MSG91 Widget initialized.");

        setMsg91Ready(true);
      } catch (error) {
        console.error("MSG91 initialization error:", error);

        setMsg91Ready(false);
      }
    };

    script.onerror = () => {
      console.error("MSG91 SDK failed to load.");

      setMsg91Ready(false);
    };

    document.body.appendChild(script);
  }, []);

  // =====================================
  // Countdown
  // =====================================

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [countdown]);

  // =====================================
  // Send OTP
  // =====================================

  async function handleSendOTP() {
    setError("");
    setSuccess("");

    if (!phone.trim()) {
      setError("Please enter your phone number in your profile first.");

      return;
    }

    if (countdown > 0) {
      return;
    }

    if (!msg91Ready) {
      setError("OTP service is still loading. Please try again.");

      return;
    }

    setLoading(true);

    try {
      // =====================================
      // Convert phone to MSG91 format
      // =====================================

      let identifier = phone
        .replace(/\s+/g, "")
        .replace(/-/g, "")
        .replace(/[()]/g, "");

      if (identifier.startsWith("+91")) {
        identifier = identifier.substring(1);
      } else if (identifier.startsWith("91")) {
        // already correct
      } else if (/^[6-9]\d{9}$/.test(identifier)) {
        identifier = `91${identifier}`;
      } else {
        setError("Please enter a valid Indian mobile number.");

        return;
      }

      console.log("MSG91 OTP identifier:", identifier);

      // =====================================
      // Check Phone Before Sending OTP
      // =====================================

      const checkResponse = await fetch("/api/verification/phone/check", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          phone,
        }),
      });

      const checkResult = await checkResponse.json();

      console.log("PHONE VERIFICATION CHECK:", checkResult);

      // =====================================
      // Phone Already Verified
      // =====================================

      if (!checkResponse.ok) {
        setError(checkResult.error || "This phone number cannot be verified.");

        return;
      }

      // =====================================
      // MSG91 SDK Check
      // =====================================

      if (typeof window.sendOtp !== "function") {
        setError(
          "MSG91 OTP service is not ready. Please refresh the page and try again.",
        );

        return;
      }

      // =====================================
      // Send OTP through MSG91
      // =====================================

      window.sendOtp(
        identifier,

        (data) => {
          console.log("MSG91 SEND OTP SUCCESS:", data);

          // =====================================
          // Get reqId
          // =====================================

          let receivedReqId = "";

          if (typeof data === "object" && data !== null) {
            const responseData = data as {
              reqId?: unknown;
              message?: unknown;
            };

            receivedReqId = String(
              responseData.reqId ?? responseData.message ?? "",
            );
          }

          console.log("MSG91 REQUEST ID:", receivedReqId);

          if (receivedReqId) {
            setReqId(receivedReqId);
          }

          setOtpSent(true);

          setOtp("");

          setCountdown(60);

          setSuccess("OTP sent successfully to your mobile number.");
        },

        (error) => {
          console.error("MSG91 SEND OTP ERROR:", error);

          setError("Failed to send OTP. Please try again.");
        },
      );
    } catch (error) {
      console.error("SEND OTP ERROR:", error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // =====================================
  // Verify OTP
  // =====================================
  async function handleVerifyOTP() {
    setError("");
    setSuccess("");

    if (!/^\d{4}$/.test(otp)) {
      setError("Please enter the 4-digit OTP.");

      return;
    }

    if (!msg91Ready) {
      setError("OTP service is not ready. Please try again.");

      return;
    }

    // =====================================
    // Check MSG91 Request ID
    // =====================================

    if (!reqId) {
      setError("OTP request ID is missing. Please request a new OTP.");

      return;
    }

    setVerifying(true);

    try {
      window.verifyOtp(
        otp,

        async (data) => {
          console.log("MSG91 OTP VERIFIED:", data);

          console.log(
            "MSG91 VERIFY RAW RESPONSE:",
            JSON.stringify(data, null, 2),
          );

          // =====================================
          // Extract access token
          // =====================================
          // =====================================
          // Extract MSG91 access token
          // =====================================

          let accessToken = "";

          if (typeof data === "object" && data !== null) {
            const responseData = data as {
              message?: unknown;
            };

            accessToken = String(responseData.message ?? "");
          }

          console.log("MSG91 ACCESS TOKEN:", accessToken);

          if (!accessToken) {
            console.error("MSG91 response did not contain access token:", data);

            setError(
              "OTP verified, but server verification token was not received.",
            );

            setVerifying(false);

            return;
          }

          

          // =====================================
          // Send access token to our server
          // =====================================

          const response = await fetch("/api/verification/phone/verify", {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              phone,
              accessToken,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            setError(result.error || "Server verification failed.");

            setVerifying(false);

            return;
          }

          // =====================================
          // Refresh NextAuth Session
          // =====================================

          await update();

          // =====================================
          // Update Parent Profile State
          // =====================================

          onVerified?.(result.phone || phone);

          setOtpSent(false);

          setOtp("");

          setReqId("");

          setCountdown(0);

          setSuccess("Your phone number has been verified successfully.");

          setVerifying(false);
        },

        (error) => {
          console.error("MSG91 VERIFY OTP ERROR:", error);

          setError("Invalid OTP. Please try again.");

          setVerifying(false);
        },

        reqId,
      );
    } catch (error) {
      console.error("VERIFY OTP ERROR:", error);

      setError("Something went wrong. Please try again.");

      setVerifying(false);
    }
  }

  // =====================================
  // No Phone Number
  // =====================================

  if (!phone.trim()) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-orange-200
          bg-orange-50
          p-6
          dark:border-orange-900
          dark:bg-orange-950/30
        "
      >
        <div className="flex items-start gap-4">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-orange-100
              text-orange-600
              dark:bg-orange-900/50
              dark:text-orange-400
            "
          >
            <Phone size={24} />
          </div>

          <div>
            <h3
              className="
                text-lg
                font-bold
                text-orange-800
                dark:text-orange-300
              "
            >
              Add a Phone Number
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-orange-700
                dark:text-orange-400
              "
            >
              Add your phone number above and save your profile before starting
              verification.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================
  // Already Verified
  // =====================================

  if (isPhoneVerified) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-green-200
          bg-green-50
          p-6
          dark:border-green-900
          dark:bg-green-950/30
        "
      >
        <div className="flex items-start gap-4">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-green-100
              text-green-600
              dark:bg-green-900/50
              dark:text-green-400
            "
          >
            <CheckCircle2 size={25} />
          </div>

          <div>
            <h3
              className="
                text-lg
                font-bold
                text-green-800
                dark:text-green-300
              "
            >
              Phone Verified
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-green-700
                dark:text-green-400
              "
            >
              Your phone number has been successfully verified.
            </p>

            <p
              className="
                mt-2
                text-sm
                font-semibold
                text-green-800
                dark:text-green-300
              "
            >
              <Phone size={15} className="mr-1 inline" />

              {phone}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================
  // UI
  // =====================================

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      {/* Header */}

      <div className="flex items-start gap-4">
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-blue-100
            text-blue-600
            dark:bg-blue-950
            dark:text-blue-400
          "
        >
          <ShieldCheck size={25} />
        </div>

        <div>
          <h2
            className="
              text-xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            Verify Your Phone
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Verify the phone number saved in your DealUp profile.
          </p>
        </div>
      </div>

      {/* Current Phone */}

      <div
        className="
          mt-6
          flex
          items-center
          gap-3
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          px-4
          py-3
          dark:border-slate-700
          dark:bg-slate-800
        "
      >
        <Phone size={18} className="text-slate-400" />

        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Phone Number
          </p>

          <p className="font-semibold text-slate-900 dark:text-white">
            {phone}
          </p>
        </div>
      </div>

      {/* Send OTP */}

      {!otpSent && (
        <button
          type="button"
          onClick={handleSendOTP}
          disabled={loading || countdown > 0}
          className="
            mt-5
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#1565d8]
            px-5
            py-3
            font-semibold
            text-white
            transition
            hover:bg-[#0d56bd]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Sending OTP
            </>
          ) : (
            "Send OTP"
          )}
        </button>
      )}

      {/* OTP */}

      {otpSent && (
        <div className="mt-6">
          <label
            htmlFor="verification-otp"
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-700
              dark:text-slate-300
            "
          >
            Enter 4-Digit OTP
          </label>

          <div className="flex gap-3">
            <input
              id="verification-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={otp}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "");

                setOtp(value);
              }}
              placeholder="••••"
              className="
                min-w-0
                flex-1
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                py-3
                text-center
                text-lg
                font-bold
                tracking-[0.5em]
                outline-none
                transition
                focus:border-blue-500
                dark:border-slate-700
                dark:bg-slate-800
              "
            />

            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={verifying || otp.length !== 4}
              className="
                inline-flex
                min-w-[130px]
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-green-600
                px-5
                py-3
                font-semibold
                text-white
                transition
                hover:bg-green-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {verifying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
          </div>

          {/* Resend / Change */}

          <div className="mt-3">
            {countdown > 0 ? (
              <p
                className="
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Resend OTP in{" "}
                <span className="font-semibold">{countdown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setSuccess("");
                  setError("");
                }}
                className="
                  text-sm
                  font-semibold
                  text-blue-600
                  hover:underline
                  dark:text-blue-400
                "
              >
                Send OTP again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}

      {error && (
        <div
          className="
            mt-5
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            font-medium
            text-red-700
            dark:border-red-900
            dark:bg-red-950/30
            dark:text-red-400
          "
        >
          {error}
        </div>
      )}

      {/* Success */}

      {success && (
        <div
          className="
            mt-5
            rounded-xl
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            font-medium
            text-green-700
            dark:border-green-900
            dark:bg-green-950/30
            dark:text-green-400
          "
        >
          {success}
        </div>
      )}
    </div>
  );
}
