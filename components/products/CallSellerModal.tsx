"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react";

// =====================================================
// PROPS
// =====================================================

interface CallSellerModalProps {
  open: boolean;
  onClose: () => void;
  sellerName: string;
  productId: string;
}

// =====================================================
// CALL STATE
// =====================================================

type CallState =
  | "idle"
  | "calling"
  | "success"
  | "error";

// =====================================================
// CALL SELLER MODAL
// =====================================================

export default function CallSellerModal({
  open,
  onClose,
  sellerName,
  productId,
}: CallSellerModalProps) {
  const [mounted, setMounted] =
    useState(false);

  const [callState, setCallState] =
    useState<CallState>("idle");

  const [errorMessage, setErrorMessage] =
    useState("");

  // ===================================================
  // CLIENT MOUNT
  // ===================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // ===================================================
  // RESET STATE WHEN CLOSED
  // ===================================================

  useEffect(() => {
    if (!open) {
      setCallState("idle");
      setErrorMessage("");
    }
  }, [open]);

  // ===================================================
  // RENDER GUARD
  // ===================================================

  if (!mounted || !open) {
    return null;
  }

  // ===================================================
  // START SECURE CALL
  // ===================================================

  const handleCall = async () => {
    if (!productId) {
      setCallState("error");
      setErrorMessage(
        "Product information is missing.",
      );
      return;
    }

    setCallState("calling");
    setErrorMessage("");

    try {
      const response = await fetch(
        "/api/calls/seller",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            productId,
          }),
        },
      );

      const data = await response.json();

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.message ??
            "Unable to start the secure call.",
        );
      }

      setCallState("success");
    } catch (error) {
      console.error(
        "Secure seller call error:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start the secure call.",
      );

      setCallState("error");
    }
  };

  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const handleClose = () => {
    if (callState === "calling") {
      return;
    }

    onClose();
  };

  // ===================================================
  // MODAL
  // ===================================================

  return createPortal(
    <div
      className="
        fixed
        inset-0
        z-[2147483647]
        flex
        items-center
        justify-center
        bg-slate-950/55
        px-3
        py-3
        backdrop-blur-[2px]

        sm:px-4
        sm:py-4
      "
    >
      {/* =================================================
          MODAL CARD
      ================================================= */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="secure-call-title"
        className="
          w-full
          max-w-[350px]
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl

          max-h-[calc(100dvh-24px)]

          dark:border-slate-700
          dark:bg-slate-900

          sm:max-w-[400px]
          sm:rounded-3xl
          sm:max-h-[calc(100dvh-32px)]
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            px-4
            py-2.5

            dark:border-slate-700

            sm:px-5
            sm:py-3
          "
        >
          <div className="flex items-center gap-2.5">
            {/* PHONE ICON */}

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-green-100
                text-green-600

                dark:bg-green-500/15
                dark:text-green-400

                sm:h-10
                sm:w-10
                sm:rounded-2xl
              "
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            {/* TITLE */}

            <div className="min-w-0">
              <h2
                id="secure-call-title"
                className="
                  text-sm
                  font-bold
                  text-slate-900
                  dark:text-white

                  sm:text-base
                "
              >
                Call Seller
              </h2>

              <p
                className="
                  text-[9px]
                  text-slate-500
                  dark:text-slate-400

                  sm:text-[11px]
                "
              >
                Secure private calling
              </p>
            </div>
          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={handleClose}
            disabled={
              callState === "calling"
            }
            aria-label="Close"
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              text-slate-500
              transition

              hover:bg-slate-100
              hover:text-slate-800

              disabled:cursor-not-allowed
              disabled:opacity-50

              dark:hover:bg-slate-800
              dark:hover:text-white

              sm:h-8
              sm:w-8
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            px-4
            py-3.5

            sm:px-5
            sm:py-4
          "
        >
          {/* =================================================
              IDLE STATE
          ================================================= */}

          {callState === "idle" && (
            <>
              {/* SELLER */}

              <div className="mb-2.5">
                <p
                  className="
                    text-[10px]
                    text-slate-500
                    dark:text-slate-400

                    sm:text-xs
                  "
                >
                  You are calling
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-base
                    font-bold
                    text-slate-900
                    dark:text-white

                    sm:text-lg
                  "
                >
                  {sellerName}
                </p>
              </div>

              {/* =================================================
                  PRIVACY BOX
              ================================================= */}

              <div
                className="
                  mb-2.5
                  flex
                  items-start
                  gap-2.5
                  rounded-xl
                  border
                  border-green-200
                  bg-green-50
                  px-3
                  py-2.5

                  dark:border-green-500/20
                  dark:bg-green-500/10

                  sm:mb-3
                  sm:gap-3
                  sm:rounded-2xl
                  sm:px-4
                  sm:py-3
                "
              >
                <ShieldCheck
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-green-600
                    dark:text-green-400

                    sm:h-5
                    sm:w-5
                  "
                />

                <div className="min-w-0">
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      text-green-800
                      dark:text-green-300

                      sm:text-xs
                    "
                  >
                    Seller number protected
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[8px]
                      leading-3.5
                      text-green-700
                      dark:text-green-400

                      sm:text-[10px]
                      sm:leading-4
                    "
                  >
                    Your phone number is never
                    shared with the seller.
                  </p>
                </div>
              </div>

              {/* =================================================
                  SECURE CALL INFO
              ================================================= */}

              <div
                className="
                  mb-2.5
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  py-2.5
                  text-center

                  dark:border-slate-700
                  dark:bg-slate-800

                  sm:mb-3
                  sm:rounded-2xl
                  sm:px-4
                  sm:py-3
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-1.5
                  "
                >
                  <ShieldCheck
                    className="
                      h-3.5
                      w-3.5
                      text-green-600
                      dark:text-green-400
                    "
                  />

                  <p
                    className="
                      text-[10px]
                      font-semibold
                      text-slate-700
                      dark:text-slate-200

                      sm:text-xs
                    "
                  >
                    Secure Calling
                  </p>
                </div>

                <p
                  className="
                    mt-0.5
                    text-[8px]
                    leading-3
                    text-slate-400

                    sm:text-[10px]
                    sm:leading-4
                  "
                >
                  A call will be placed to your
                  verified phone.
                </p>
              </div>

              {/* =================================================
                  CALL BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={handleCall}
                className="
                  flex
                  h-10
                  w-full
                  items-center
                  justify-center
                  gap-1.5
                  rounded-xl
                  bg-green-600
                  text-xs
                  font-semibold
                  text-white
                  shadow-md
                  shadow-green-600/15
                  transition-all

                  hover:bg-green-700
                  active:scale-[0.98]

                  sm:h-11
                  sm:rounded-2xl
                  sm:text-sm
                "
              >
                <Phone className="h-4 w-4" />

                Secure Call
              </button>

              {/* FOOTER */}

              <p
                className="
                  mt-1.5
                  text-center
                  text-[7px]
                  text-slate-400

                  sm:mt-2
                  sm:text-[9px]
                "
              >
                Protected by DealUp secure calling
              </p>
            </>
          )}

          {/* =================================================
              CALLING STATE
          ================================================= */}

          {callState === "calling" && (
            <div
              className="
                py-3
                text-center

                sm:py-4
              "
            >
              <div
                className="
                  mx-auto
                  mb-2.5
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-green-100

                  dark:bg-green-500/15

                  sm:mb-3
                  sm:h-14
                  sm:w-14
                "
              >
                <Loader2
                  className="
                    h-6
                    w-6
                    animate-spin
                    text-green-600
                    dark:text-green-400

                    sm:h-7
                    sm:w-7
                  "
                />
              </div>

              <h3
                className="
                  text-base
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Connecting...
              </h3>

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-4
                  text-slate-500
                  dark:text-slate-400

                  sm:text-xs
                  sm:leading-5
                "
              >
                DealUp is starting your
                secure call.
              </p>
            </div>
          )}

          {/* =================================================
              SUCCESS STATE
          ================================================= */}

          {callState === "success" && (
            <div
              className="
                py-2
                text-center

                sm:py-3
              "
            >
              <div
                className="
                  mx-auto
                  mb-2.5
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-green-100

                  dark:bg-green-500/15

                  sm:mb-3
                  sm:h-14
                  sm:w-14
                "
              >
                <CheckCircle2
                  className="
                    h-7
                    w-7
                    text-green-600
                    dark:text-green-400

                    sm:h-8
                    sm:w-8
                  "
                />
              </div>

              <h3
                className="
                  text-base
                  font-bold
                  text-slate-900
                  dark:text-white

                  sm:text-lg
                "
              >
                Call Requested
              </h3>

              <p
                className="
                  mt-1.5
                  text-[11px]
                  leading-4
                  text-slate-500
                  dark:text-slate-400

                  sm:text-xs
                  sm:leading-5
                "
              >
                Please answer the incoming
                call on your phone. DealUp will
                securely connect you with the
                seller.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="
                  mt-3
                  h-10
                  w-full
                  rounded-xl
                  bg-slate-900
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-slate-800

                  dark:bg-white
                  dark:text-slate-900
                  dark:hover:bg-slate-200

                  sm:h-11
                  sm:rounded-2xl
                  sm:text-sm
                "
              >
                Done
              </button>
            </div>
          )}

          {/* =================================================
              ERROR STATE
          ================================================= */}

          {callState === "error" && (
            <div className="py-1">
              <div
                className="
                  mb-3
                  flex
                  items-start
                  gap-2.5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  p-3

                  dark:border-red-500/20
                  dark:bg-red-500/10

                  sm:rounded-2xl
                  sm:p-4
                "
              >
                <AlertCircle
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-red-600
                    dark:text-red-400

                    sm:h-5
                    sm:w-5
                  "
                />

                <div className="min-w-0">
                  <p
                    className="
                      text-[11px]
                      font-semibold
                      text-red-800
                      dark:text-red-300

                      sm:text-sm
                    "
                  >
                    Call could not be started
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[9px]
                      leading-4
                      text-red-700
                      dark:text-red-400

                      sm:text-xs
                      sm:leading-5
                    "
                  >
                    {errorMessage}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="
                    h-10
                    flex-1
                    rounded-xl
                    border
                    border-slate-200
                    text-xs
                    font-semibold
                    text-slate-700

                    dark:border-slate-700
                    dark:text-slate-200

                    sm:h-11
                    sm:rounded-2xl
                    sm:text-sm
                  "
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCallState("idle")
                  }
                  className="
                    h-10
                    flex-1
                    rounded-xl
                    bg-green-600
                    text-xs
                    font-semibold
                    text-white
                    hover:bg-green-700

                    sm:h-11
                    sm:rounded-2xl
                    sm:text-sm
                  "
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}