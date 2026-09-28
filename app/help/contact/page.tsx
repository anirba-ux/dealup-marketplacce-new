"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Headphones,
  Loader2,
  ShieldCheck,
  Ticket,
} from "lucide-react";

const categories = [
  {
    value: "account",
    label: "Account & Login",
  },
  {
    value: "buying",
    label: "Buying",
  },
  {
    value: "selling",
    label: "Selling & Listings",
  },
  {
    value: "payment",
    label: "Payments",
  },
  {
    value: "verification",
    label: "Verification",
  },
  {
    value: "messages",
    label: "Chat & Messages",
  },
  {
    value: "safety",
    label: "Safety & Security",
  },
  {
    value: "technical",
    label: "Technical Issue",
  },
  {
    value: "other",
    label: "Other",
  },
];

export default function ContactSupportPage() {
  const [category, setCategory] = useState("technical");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [productId, setProductId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) return;

    setError("");

    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe your problem.");
      return;
    }

    if (description.trim().length < 10) {
      setError(
        "Please provide at least 10 characters describing your problem.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/support/tickets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category,
            subject: subject.trim(),
            description: description.trim(),
            productId: productId.trim() || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to submit your support request.",
        );
      }

      setTicketId(data.ticketId || "");
      setSubject("");
      setDescription("");
      setProductId("");
    } catch (err) {
      console.error(
        "Support request submission error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your support request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ========================================================
     SUCCESS STATE
  ======================================================== */

  if (ticketId) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/help"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#1565d8] dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowLeft size={16} />
            Back to Help Center
          </Link>

          <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl shadow-slate-200/50 dark:border-emerald-900/40 dark:bg-slate-900 dark:shadow-none">
            <div className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-6 py-12 text-center dark:from-emerald-950/30 dark:via-slate-900 dark:to-blue-950/20 sm:px-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 size={42} />
              </div>

              <h1 className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                Support request submitted
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Your request has been successfully submitted.
                Our support team will review it and assist you.
              </p>

              <div className="mx-auto mt-7 max-w-md rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-blue-900/40 dark:bg-slate-950">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Your Ticket ID
                </p>

                <p className="mt-2 font-mono text-lg font-extrabold text-[#1565d8] dark:text-blue-400">
                  {ticketId}
                </p>
              </div>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/dashboard/support"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1565d8] px-5 text-sm font-bold text-white transition hover:bg-[#0f56bb]"
                >
                  <Ticket size={17} />
                  View My Tickets
                </Link>

                <Link
                  href="/help"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ========================================================
     CONTACT FORM
  ======================================================== */

  return (
    <main className="min-h-screen bg-slate-50 pb-16 dark:bg-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#1565d8] dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowLeft size={16} />
            Back to Help Center
          </Link>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#1565d8] dark:bg-blue-950/60 dark:text-blue-400">
              <Headphones size={27} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Contact Support
              </h1>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                Tell us what you need help with and our team
                will assist you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-7 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        {/* Form */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="mb-7">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Submit a support request
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Please provide as much detail as possible so we
              can help you faster.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Category */}
            <div>
              <label
                htmlFor="support-category"
                className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                Category
              </label>

              <div className="relative">
                <select
                  id="support-category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  {categories.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="support-subject"
                className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                Subject
              </label>

              <input
                id="support-subject"
                type="text"
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                maxLength={150}
                placeholder="What do you need help with?"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />

              <div className="mt-1.5 text-right text-xs text-slate-400">
                {subject.length}/150
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="support-description"
                className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                Describe your problem
              </label>

              <textarea
                id="support-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                maxLength={3000}
                rows={7}
                placeholder="Please explain what happened, what you expected, and any relevant details..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />

              <div className="mt-1.5 text-right text-xs text-slate-400">
                {description.length}/3000
              </div>
            </div>

            {/* Product ID */}
            <div>
              <label
                htmlFor="support-product"
                className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                Product ID
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
              </label>

              <input
                id="support-product"
                type="text"
                value={productId}
                onChange={(event) =>
                  setProductId(event.target.value)
                }
                placeholder="Add a Product ID if your issue is related to a listing"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1565d8] to-[#1976e8] px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Headphones size={18} />
                  Submit Support Request
                </>
              )}
            </button>
          </form>
        </section>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Safety */}
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 dark:border-emerald-900/40 dark:from-slate-900 dark:to-emerald-950/20">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck size={21} />
            </div>

            <h3 className="mt-4 font-extrabold text-slate-900 dark:text-white">
              Stay safe on DealUp
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Never share passwords, OTPs, payment PINs or
              sensitive account information with anyone.
            </p>
          </div>

          {/* Ticket */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 dark:border-blue-900/40 dark:from-slate-900 dark:to-blue-950/20">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Ticket size={21} />
            </div>

            <h3 className="mt-4 font-extrabold text-slate-900 dark:text-white">
              Track your request
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              After submitting your request, you can track
              its status from your My Support page.
            </p>

            <Link
              href="/dashboard/support"
              className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#1565d8] dark:text-blue-400"
            >
              My Support
              <ArrowLeft
                size={15}
                className="rotate-180"
              />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}