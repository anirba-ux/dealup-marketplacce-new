"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    const trimmedEmail =
      email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/newsletter/subscribe",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: trimmedEmail,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to subscribe. Please try again.",
        );

        return;
      }

      setMessage(
        data.alreadySubscribed
          ? "You are already subscribed."
          : "Thanks! You are now subscribed to DealUp.",
      );

      setEmail("");
    } catch (error) {
      console.error(
        "NEWSLETTER SUBSCRIBE CLIENT ERROR:",
        error,
      );

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* =====================================================
          REFERENCE STYLE NEWSLETTER PILL
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="
          flex
          h-[50px]
          w-full
          items-center
          rounded-full
          border
          border-white/40
          bg-transparent
          p-[3px]
          transition-all
          duration-200

          focus-within:border-white/70

          sm:h-[52px]
        "
      >
        {/* ===================================================
            EMAIL INPUT
        ==================================================== */}

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="Enter your email"
          disabled={loading}
          className="
            min-w-0
            flex-1
            appearance-none
            border-0
            bg-transparent
            px-3
            text-sm
            text-white
            outline-none
            ring-0
            placeholder:text-white/50

            focus:border-0
            focus:outline-none
            focus:ring-0

            disabled:cursor-not-allowed
            disabled:opacity-60

            sm:px-4
            sm:text-sm
          "
        />

        {/* ===================================================
            SUBSCRIBE BUTTON
        ==================================================== */}

        <button
          type="submit"
          disabled={loading}
          className="
            inline-flex
            h-[42px]
            shrink-0
            items-center
            justify-center
            gap-1.5
            rounded-full
            bg-white
            px-5
            text-sm
            font-bold
            leading-none
            text-[#1565d8]
            shadow-sm
            transition-all
            duration-200

            hover:bg-slate-50
            hover:shadow-md

            active:scale-95

            disabled:cursor-not-allowed
            disabled:opacity-60

            sm:h-[44px]
            sm:px-6
            sm:text-sm
          "
        >
          {loading ? (
            <>
              <Loader2
                className="
                  h-3
                  w-3
                  animate-spin
                "
              />

              <span className="whitespace-nowrap">
                Subscribing...
              </span>
            </>
          ) : (
            <span className="whitespace-nowrap">
              Subscribe
            </span>
          )}
        </button>
      </form>

      {/* =====================================================
          SUCCESS MESSAGE
      ====================================================== */}

      {message && (
        <div
          className="
            mt-2.5
            flex
            items-center
            gap-1.5
            px-2
            text-[10px]
            font-medium
            text-white/90

            sm:text-xs
          "
        >
          <CheckCircle2
            className="
              h-3.5
              w-3.5
              shrink-0
            "
          />

          <span>
            {message}
          </span>
        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <p
          className="
            mt-2.5
            px-2
            text-[10px]
            font-medium
            text-red-100

            sm:text-xs
          "
        >
          {error}
        </p>
      )}
    </div>
  );
}