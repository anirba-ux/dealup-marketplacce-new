"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Headphones,
  HelpCircle,
  Home,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

type PaymentState = "loading" | "success" | "pending" | "failed";

interface PaymentResult {
  success: boolean;

  status?: PaymentState;

  message?: string;

  payment?: {
    orderId?: string;

    paymentId?: string | null;

    type?: string;

    amount?: number;

    currency?: string;
  };
}

export default function CashfreePaymentSuccessPage() {
  const [status, setStatus] = useState<PaymentState>("loading");

  const [message, setMessage] = useState("Verifying your Cashfree payment...");

  const [orderId, setOrderId] = useState<string | null>(null);

  const [payment, setPayment] = useState<PaymentResult["payment"]>();

  const [copied, setCopied] = useState(false);

  const [countdown, setCountdown] = useState(8);

  // =====================================================
  // VERIFY PAYMENT
  // =====================================================

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        const currentOrderId = params.get("order_id");

        if (!currentOrderId) {
          setStatus("failed");

          setMessage("Payment order ID is missing.");

          return;
        }

        setOrderId(currentOrderId);

        const response = await fetch(
          `/api/payment/cashfree/verify?order_id=${encodeURIComponent(
            currentOrderId,
          )}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = (await response.json()) as PaymentResult;

        if (!response.ok) {
          throw new Error(data?.message ?? "Unable to verify payment.");
        }

        // Save payment information
        if (data.payment) {
          setPayment(data.payment);
        }

        // SUCCESS
        if (data.status === "success" || data.success === true) {
          setStatus("success");

          setMessage(
            data.message ?? "Your payment was completed successfully.",
          );

          return;
        }

        // PENDING
        if (data.status === "pending") {
          setStatus("pending");

          setMessage(
            data.message ??
              "Your payment is still being processed. Please check again shortly.",
          );

          return;
        }

        // FAILED
        setStatus("failed");

        setMessage(data.message ?? "Your Cashfree payment was not successful.");
      } catch (error) {
        console.error("CASHFREE PAYMENT SUCCESS PAGE ERROR:", error);

        setStatus("failed");

        setMessage(
          error instanceof Error ? error.message : "Unable to verify payment.",
        );
      }
    };

    verifyPayment();
  }, []);

  // =====================================================
  // SUCCESS AUTO REDIRECT
  // =====================================================

  useEffect(() => {
    if (status !== "success") {
      return;
    }

    setCountdown(8);

    const interval = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(interval);

          window.location.href = "/dashboard/premium";

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [status]);

  // =====================================================
  // COPY ORDER ID
  // =====================================================

  const handleCopyOrderId = async () => {
    if (!orderId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(orderId);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("COPY ORDER ID ERROR:", error);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const formattedAmount =
    typeof payment?.amount === "number"
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: payment.currency ?? "INR",
          maximumFractionDigits: 0,
        }).format(payment.amount)
      : null;

  const paymentType =
    payment?.type?.replaceAll("_", " ").replace("PREMIUM", "").trim() ||
    "Premium Seller";

  const paymentDate = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main
      className="
        relative min-h-screen overflow-hidden
        bg-[#f5f8fc]
        text-slate-950
        dark:bg-[#020817]
        dark:text-white
      "
    >
      {/* =================================================
          BACKGROUND DECORATION
      ================================================== */}

      <div
        className="
          pointer-events-none
          absolute -left-32 -top-32
          h-72 w-72
          rounded-full
          bg-blue-400/10
          blur-3xl
          dark:bg-blue-500/10
        "
      />

      <div
        className="
          pointer-events-none
          absolute -bottom-40 -right-32
          h-96 w-96
          rounded-full
          bg-purple-400/10
          blur-3xl
          dark:bg-purple-500/10
        "
      />

      <div
        className="
          pointer-events-none
          absolute left-1/2 top-1/3
          h-64 w-64
          -translate-x-1/2
          rounded-full
          bg-blue-500/[0.04]
          blur-3xl
        "
      />

      {/* =================================================
          PAGE CONTAINER
      ================================================== */}

      <div
        className="
          relative z-10
          mx-auto
          min-h-screen
          w-full
          max-w-6xl
          px-4
          py-6
          sm:px-6
          sm:py-8
          lg:px-8
          lg:py-10
        "
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <header
          className="
            mb-6
            flex
            items-center
            justify-between
            gap-4
            sm:mb-8
          "
        >
          {/* DealUp Logo */}

          <Link
            href="/"
            aria-label="DealUp Home"
            className="
    group
    inline-flex
    items-center
    transition-transform
    duration-200
    hover:scale-[1.02]
  "
          >
            {/* Light Theme Logo */}
            <Image
              src="/images/dealup-logo.png"
              alt="DealUp"
              width={150}
              height={52}
              priority
              className="
                h-auto
                w-[118px]
                object-contain
                dark:hidden
                sm:w-[140px]
              "
            />

            {/* Dark Theme Logo */}
            <Image
              src="/images/dealup-dark-logo.png"
              alt="DealUp"
              width={150}
              height={52}
              priority
              className="
                hidden
                h-auto
                w-[118px]
                object-contain
                dark:block
                sm:w-[140px]
              "
            />
          </Link>
          {/* Secure payment */}

          <div
            className="
              hidden
              items-center
              gap-3
              sm:flex
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-emerald-200
                bg-emerald-50
                text-emerald-600
                dark:border-emerald-500/20
                dark:bg-emerald-500/10
                dark:text-emerald-400
              "
            >
              <ShieldCheck size={21} />
            </div>

            <div>
              <p
                className="
                  text-xs
                  font-bold
                  text-slate-700
                  dark:text-slate-200
                "
              >
                Safe & Secure Payments
              </p>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Powered by Cashfree
              </p>
            </div>
          </div>
        </header>

        {/* =================================================
            MAIN CARD
        ================================================== */}

        <section
          className="
            mx-auto
            w-full
            max-w-4xl
            overflow-hidden
            rounded-[28px]
            border
            border-slate-200/80
            bg-white/95
            shadow-[0_25px_80px_rgba(15,23,42,0.10)]
            backdrop-blur-xl
            dark:border-white/[0.09]
            dark:bg-[#081426]/95
            dark:shadow-[0_25px_90px_rgba(0,0,0,0.40)]
            sm:rounded-[34px]
          "
        >
          {/* =================================================
              TOP BRAND / SECURITY BAR
          ================================================== */}

          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-slate-100
              px-5
              py-5
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-8
              sm:py-6
              dark:border-white/[0.07]
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.22em]
                  text-[#1565d8]
                  dark:text-blue-400
                "
              >
                Payment Status
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                DealUp Premium Seller
              </p>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                self-start
                rounded-full
                border
                border-slate-200
                bg-slate-50
                px-3
                py-1.5
                dark:border-white/10
                dark:bg-white/[0.04]
              "
            >
              <ShieldCheck
                size={15}
                className="
                  text-emerald-600
                  dark:text-emerald-400
                "
              />

              <span
                className="
                  text-[11px]
                  font-bold
                  text-slate-600
                  dark:text-slate-300
                "
              >
                Secure Payment
              </span>
            </div>
          </div>

          {/* =================================================
              CONTENT
          ================================================== */}

          <div
            className="
              px-5
              py-8
              sm:px-10
              sm:py-12
              lg:px-14
              lg:py-14
            "
          >
            {/* =================================================
                LOADING
            ================================================== */}

            {status === "loading" && (
              <div
                className="
                  mx-auto
                  max-w-xl
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-24
                    w-24
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-50
                    text-[#1565d8]
                    ring-8
                    ring-blue-50/70
                    dark:bg-blue-500/10
                    dark:text-blue-400
                    dark:ring-blue-500/5
                  "
                >
                  <Loader2 size={44} className="animate-spin" />
                </div>

                <p
                  className="
                    mt-7
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-[#1565d8]
                    dark:text-blue-400
                  "
                >
                  Please wait
                </p>

                <h1
                  className="
                    mt-2
                    text-2xl
                    font-black
                    tracking-tight
                    sm:text-4xl
                  "
                >
                  Verifying Your Payment
                </h1>

                <p
                  className="
                    mx-auto
                    mt-4
                    max-w-md
                    text-sm
                    leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  We are securely checking your Cashfree payment. Please do not
                  close this page.
                </p>

                <div
                  className="
                    mx-auto
                    mt-8
                    h-1.5
                    max-w-sm
                    overflow-hidden
                    rounded-full
                    bg-slate-100
                    dark:bg-white/10
                  "
                >
                  <div
                    className="
                      h-full
                      w-1/2
                      animate-pulse
                      rounded-full
                      bg-[#1565d8]
                    "
                  />
                </div>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================== */}

            {status === "success" && (
              <div>
                {/* Success Icon */}

                <div className="text-center">
                  <div
                    className="
                      relative
                      mx-auto
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-full
                      bg-emerald-50
                      text-emerald-600
                      ring-8
                      ring-emerald-50/70
                      dark:bg-emerald-500/10
                      dark:text-emerald-400
                      dark:ring-emerald-500/5
                    "
                  >
                    <CheckCircle2 size={52} strokeWidth={1.8} />

                    <div
                      className="
                        absolute
                        -right-1
                        -top-1
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        bg-[#1565d8]
                        text-white
                        shadow-lg
                      "
                    >
                      <Sparkles size={14} />
                    </div>
                  </div>

                  <p
                    className="
                      mt-7
                      text-xs
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-emerald-600
                      dark:text-emerald-400
                    "
                  >
                    Payment Confirmed
                  </p>

                  <h1
                    className="
                      mt-2
                      text-3xl
                      font-black
                      tracking-tight
                      sm:text-5xl
                    "
                  >
                    Payment Successful
                  </h1>

                  <p
                    className="
                      mx-auto
                      mt-4
                      max-w-xl
                      text-sm
                      leading-6
                      text-slate-500
                      dark:text-slate-400
                      sm:text-base
                    "
                  >
                    {message}
                  </p>
                </div>

                {/* Success Details */}

                <div
                  className="
                    mx-auto
                    mt-9
                    max-w-2xl
                    rounded-2xl
                    border
                    border-emerald-100
                    bg-emerald-50/60
                    p-4
                    dark:border-emerald-500/10
                    dark:bg-emerald-500/[0.05]
                    sm:p-5
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-emerald-100
                        text-emerald-600
                        dark:bg-emerald-500/10
                        dark:text-emerald-400
                      "
                    >
                      <Check size={21} strokeWidth={3} />
                    </div>

                    <div>
                      <p
                        className="
                          text-sm
                          font-black
                          text-emerald-800
                          dark:text-emerald-300
                        "
                      >
                        Premium Seller Activated
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-xs
                          text-emerald-700/70
                          dark:text-emerald-400/70
                        "
                      >
                        Your Premium benefits are now available.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}

                <div
                  className="
                    mx-auto
                    mt-5
                    max-w-2xl
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    dark:border-white/10
                    dark:bg-white/[0.035]
                  "
                >
                  <div
                    className="
                      grid
                      grid-cols-1
                      divide-y
                      divide-slate-200
                      sm:grid-cols-3
                      sm:divide-x
                      sm:divide-y-0
                      dark:divide-white/10
                    "
                  >
                    <PaymentInfo label="Plan" value={paymentType} />

                    <PaymentInfo
                      label="Amount"
                      value={formattedAmount ?? "Paid"}
                    />

                    <PaymentInfo label="Payment" value="Cashfree" />
                  </div>
                </div>

                {/* Order ID */}

                {orderId && (
                  <div
                    className="
                      mx-auto
                      mt-4
                      max-w-2xl
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                      dark:border-white/10
                      dark:bg-white/[0.02]
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >
                      <div className="min-w-0">
                        <p
                          className="
                            text-[11px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-slate-400
                          "
                        >
                          Order ID
                        </p>

                        <p
                          className="
                            mt-1
                            break-all
                            font-mono
                            text-xs
                            font-semibold
                            text-slate-700
                            dark:text-slate-300
                          "
                        >
                          {orderId}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyOrderId}
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          text-slate-500
                          transition
                          hover:border-[#1565d8]/30
                          hover:bg-blue-50
                          hover:text-[#1565d8]
                          dark:border-white/10
                          dark:bg-white/[0.04]
                          dark:text-slate-400
                          dark:hover:bg-blue-500/10
                          dark:hover:text-blue-400
                        "
                        aria-label="Copy Order ID"
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>

                    {copied && (
                      <p
                        className="
                          mt-2
                          text-[11px]
                          font-bold
                          text-emerald-600
                          dark:text-emerald-400
                        "
                      >
                        Order ID copied
                      </p>
                    )}
                  </div>
                )}

                {/* Auto Redirect */}

                <div
                  className="
                    mx-auto
                    mt-7
                    max-w-2xl
                    rounded-2xl
                    border
                    border-blue-100
                    bg-blue-50/70
                    p-4
                    dark:border-blue-500/10
                    dark:bg-blue-500/[0.05]
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <div className="min-w-0">
                      <p
                        className="
                          text-sm
                          font-bold
                          text-slate-800
                          dark:text-slate-200
                        "
                      >
                        Taking you to Premium
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        Redirecting automatically in{" "}
                        <span className="font-black text-[#1565d8] dark:text-blue-400">
                          {countdown}s
                        </span>
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border-4
                        border-blue-100
                        border-t-[#1565d8]
                        text-sm
                        font-black
                        text-[#1565d8]
                        dark:border-blue-500/10
                        dark:border-t-blue-400
                        dark:text-blue-400
                      "
                    >
                      {countdown}
                    </div>
                  </div>

                  <div
                    className="
                      mt-4
                      h-1.5
                      overflow-hidden
                      rounded-full
                      bg-blue-100
                      dark:bg-blue-500/10
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                        bg-[#1565d8]
                        transition-all
                        duration-1000
                        ease-linear
                      "
                      style={{
                        width: `${((8 - countdown) / 8) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Buttons */}

                <div
                  className="
                    mx-auto
                    mt-6
                    flex
                    max-w-2xl
                    flex-col
                    gap-3
                    sm:flex-row
                  "
                >
                  <Link
                    href="/dashboard/premium"
                    className="
                      inline-flex
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#1565d8]
                      px-6
                      py-3.5
                      text-sm
                      font-black
                      text-white
                      shadow-lg
                      shadow-blue-500/20
                      transition
                      hover:-translate-y-0.5
                      hover:bg-[#0f52ba]
                    "
                  >
                    Go to Premium Dashboard
                  </Link>

                  <Link
                    href="/"
                    className="
                      inline-flex
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-6
                      py-3.5
                      text-sm
                      font-black
                      text-slate-700
                      transition
                      hover:bg-slate-50
                      dark:border-white/10
                      dark:bg-white/[0.03]
                      dark:text-slate-200
                      dark:hover:bg-white/[0.06]
                    "
                  >
                    <Home size={17} />
                    Back to Home
                  </Link>
                </div>
              </div>
            )}

            {/* =================================================
                PENDING
            ================================================== */}

            {status === "pending" && (
              <div
                className="
                  mx-auto
                  max-w-2xl
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-24
                    w-24
                    items-center
                    justify-center
                    rounded-full
                    bg-amber-50
                    text-amber-600
                    ring-8
                    ring-amber-50/70
                    dark:bg-amber-500/10
                    dark:text-amber-400
                    dark:ring-amber-500/5
                  "
                >
                  <Clock3 size={50} strokeWidth={1.8} />
                </div>

                <p
                  className="
                    mt-7
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-amber-600
                    dark:text-amber-400
                  "
                >
                  Payment Processing
                </p>

                <h1
                  className="
                    mt-2
                    text-3xl
                    font-black
                    tracking-tight
                    sm:text-5xl
                  "
                >
                  Payment is Processing
                </h1>

                <p
                  className="
                    mx-auto
                    mt-4
                    max-w-xl
                    text-sm
                    leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {message}
                </p>

                <div
                  className="
                    mt-8
                    rounded-2xl
                    border
                    border-amber-100
                    bg-amber-50/60
                    p-5
                    text-left
                    dark:border-amber-500/10
                    dark:bg-amber-500/[0.05]
                  "
                >
                  <div className="flex gap-3">
                    <Clock3
                      size={19}
                      className="
                        mt-0.5
                        shrink-0
                        text-amber-600
                        dark:text-amber-400
                      "
                    />

                    <div>
                      <p
                        className="
                          text-sm
                          font-bold
                          text-slate-800
                          dark:text-slate-200
                        "
                      >
                        Please don't make another payment yet.
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        Your payment status may take a short time to be updated.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    mt-7
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:justify-center
                  "
                >
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#1565d8]
                      px-6
                      py-3.5
                      text-sm
                      font-black
                      text-white
                      transition
                      hover:bg-[#0f52ba]
                    "
                  >
                    <RefreshCw size={17} />
                    Check Again
                  </button>

                  <Link
                    href="/dashboard/premium"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-6
                      py-3.5
                      text-sm
                      font-black
                      text-slate-700
                      dark:border-white/10
                      dark:bg-white/[0.03]
                      dark:text-slate-200
                    "
                  >
                    <ArrowLeft size={17} />
                    Back to Premium
                  </Link>
                </div>
              </div>
            )}

            {/* =================================================
                FAILED
            ================================================== */}

            {status === "failed" && (
              <div>
                {/* Failed Header */}

                <div className="text-center">
                  <div
                    className="
                      relative
                      mx-auto
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-full
                      bg-red-50
                      text-red-600
                      ring-8
                      ring-red-50/70
                      dark:bg-red-500/10
                      dark:text-red-400
                      dark:ring-red-500/5
                    "
                  >
                    <XCircle size={54} strokeWidth={1.8} />
                  </div>

                  <p
                    className="
                      mt-7
                      text-xs
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-red-600
                      dark:text-red-400
                    "
                  >
                    Payment Unsuccessful
                  </p>

                  <h1
                    className="
                      mt-2
                      text-3xl
                      font-black
                      tracking-tight
                      sm:text-5xl
                    "
                  >
                    Payment Not Completed
                  </h1>

                  <p
                    className="
                      mx-auto
                      mt-4
                      max-w-xl
                      text-sm
                      leading-6
                      text-slate-500
                      dark:text-slate-400
                      sm:text-base
                    "
                  >
                    {message}
                  </p>
                </div>

                {/* Important Notice */}

                <div
                  className="
                    mx-auto
                    mt-8
                    max-w-2xl
                    rounded-2xl
                    border
                    border-red-100
                    bg-red-50/60
                    p-4
                    dark:border-red-500/10
                    dark:bg-red-500/[0.05]
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-red-100
                        text-red-600
                        dark:bg-red-500/10
                        dark:text-red-400
                      "
                    >
                      <XCircle size={18} />
                    </div>

                    <div>
                      <p
                        className="
                          text-sm
                          font-black
                          text-red-800
                          dark:text-red-300
                        "
                      >
                        Your Premium plan was not activated
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-red-700/70
                          dark:text-red-400/70
                        "
                      >
                        No Premium benefits have been activated for this
                        payment.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}

                <div
                  className="
                    mx-auto
                    mt-5
                    max-w-2xl
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    dark:border-white/10
                    dark:bg-white/[0.035]
                  "
                >
                  {/* Order */}

                  {orderId && (
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        border-slate-200
                        p-4
                        dark:border-white/10
                        sm:p-5
                      "
                    >
                      <div className="min-w-0">
                        <p
                          className="
                            text-[11px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-slate-400
                          "
                        >
                          Order ID
                        </p>

                        <p
                          className="
                            mt-1
                            break-all
                            font-mono
                            text-xs
                            font-semibold
                            text-slate-700
                            dark:text-slate-300
                          "
                        >
                          {orderId}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyOrderId}
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          text-slate-500
                          transition
                          hover:border-[#1565d8]/30
                          hover:text-[#1565d8]
                          dark:border-white/10
                          dark:bg-white/[0.04]
                          dark:text-slate-400
                        "
                        aria-label="Copy Order ID"
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  )}

                  {/* Time */}

                  <div
                    className="
                      flex
                      items-center
                      gap-4
                      p-4
                      sm:p-5
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        text-slate-500
                        shadow-sm
                        dark:bg-white/[0.04]
                        dark:text-slate-400
                      "
                    >
                      <Clock3 size={19} />
                    </div>

                    <div>
                      <p
                        className="
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-400
                        "
                      >
                        Failed At
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-bold
                          text-slate-700
                          dark:text-slate-300
                        "
                      >
                        {paymentDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Failed Actions */}

                <div
                  className="
                    mx-auto
                    mt-6
                    grid
                    max-w-2xl
                    grid-cols-1
                    gap-3
                    sm:grid-cols-2
                  "
                >
                  <Link
                    href="/dashboard/premium"
                    className="
                      group
                      flex
                      min-h-[78px]
                      items-center
                      justify-center
                      gap-3
                      rounded-2xl
                      bg-[#1565d8]
                      px-5
                      py-4
                      text-white
                      shadow-lg
                      shadow-blue-500/20
                      transition
                      hover:-translate-y-0.5
                      hover:bg-[#0f52ba]
                    "
                  >
                    <RefreshCw
                      size={22}
                      className="
                        transition-transform
                        duration-300
                        group-hover:rotate-180
                      "
                    />

                    <div className="text-left">
                      <p className="text-sm font-black">Try Again</p>

                      <p className="mt-0.5 text-xs text-white/70">
                        Complete your payment
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/premium"
                    className="
                      flex
                      min-h-[78px]
                      items-center
                      justify-center
                      gap-3
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      px-5
                      py-4
                      text-slate-700
                      transition
                      hover:-translate-y-0.5
                      hover:border-[#1565d8]/30
                      hover:bg-blue-50/50
                      dark:border-white/10
                      dark:bg-white/[0.03]
                      dark:text-slate-200
                      dark:hover:bg-white/[0.06]
                    "
                  >
                    <ArrowLeft size={22} />

                    <div className="text-left">
                      <p className="text-sm font-black">Go to Premium</p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Choose another plan
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Help Section */}

                <div className="mx-auto mt-10 max-w-2xl">
                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >
                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />

                    <span
                      className="
                        text-xs
                        font-bold
                        text-slate-400
                      "
                    >
                      Need Help?
                    </span>

                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                  </div>

                  <div
                    className="
                      mt-5
                      grid
                      grid-cols-1
                      gap-3
                      sm:grid-cols-3
                    "
                  >
                    <HelpItem
                      icon={<Headphones size={19} />}
                      title="Contact Support"
                      text="We're here to help"
                    />

                    <HelpItem
                      icon={<HelpCircle size={19} />}
                      title="Payment Help"
                      text="Common issues"
                    />

                    <HelpItem
                      icon={<ShieldCheck size={19} />}
                      title="Secure Payments"
                      text="Protected by Cashfree"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              FOOTER SECURITY
          ================================================== */}

          <div
            className="
              border-t
              border-slate-100
              px-5
              py-5
              dark:border-white/[0.07]
              sm:px-8
            "
          >
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                gap-2
                text-center
                sm:flex-row
                sm:gap-3
              "
            >
              <ShieldCheck
                size={18}
                className="
                  text-emerald-600
                  dark:text-emerald-400
                "
              />

              <p
                className="
                  text-xs
                  font-semibold
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Your payment information is securely processed by Cashfree.
              </p>
            </div>

            <p
              className="
                mt-1
                text-center
                text-[10px]
                text-slate-400
              "
            >
              DealUp never stores your card, UPI or banking credentials.
            </p>
          </div>
        </section>

        {/* =================================================
            BOTTOM BRAND
        ================================================== */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-2
            text-center
          "
        >
          <span
            className="
              text-[10px]
              font-bold
              text-slate-400
              dark:text-slate-500
            "
          >
            DealUp
          </span>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          <span
            className="
              text-[10px]
              text-slate-400
              dark:text-slate-500
            "
          >
            Buy • Sell • Local
          </span>
        </div>
      </div>
    </main>
  );
}

// =====================================================
// PAYMENT INFO COMPONENT
// =====================================================

function PaymentInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 sm:p-5">
      <p
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-wider
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          truncate
          text-sm
          font-black
          text-slate-800
          dark:text-slate-200
        "
      >
        {value}
      </p>
    </div>
  );
}

// =====================================================
// HELP ITEM
// =====================================================

function HelpItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        dark:border-white/10
        dark:bg-white/[0.025]
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-blue-50
          text-[#1565d8]
          dark:bg-blue-500/10
          dark:text-blue-400
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p
          className="
            truncate
            text-xs
            font-black
            text-slate-800
            dark:text-slate-200
          "
        >
          {title}
        </p>

        <p
          className="
            mt-0.5
            truncate
            text-[10px]
            text-slate-400
          "
        >
          {text}
        </p>
      </div>
    </div>
  );
}
