"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

import PhoneVerification from "@/components/verification/PhoneVerification";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  image: string;
  state: string;
  district: string;
  city: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    email: "",
    phone: "",
    image: "",
    state: "",
    district: "",
    city: "",
  });

  // =========================================
  // Load Profile
  // =========================================

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();

      if (data.success) {
        setForm({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          image: data.user.image || "",
          state: data.user.address?.state || "",
          district: data.user.address?.district || "",
          city: data.user.address?.city || "",
        });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // Handle Input Changes
  // =========================================

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  // =========================================
  // Upload Profile Image
  // =========================================

  async function handleImageUpload(
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setForm((prev) => ({
          ...prev,
          image: data.image.url,
        }));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  // =========================================
  // Save Profile
  // =========================================

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Profile updated successfully.");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // Loading State
  // =========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#07111f]">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
          Loading Profile...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 px-4 py-6 dark:from-[#07111f] dark:via-[#091526] dark:to-[#07111f] sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">

        {/* =========================================
            Back + Home
        ========================================= */}

        <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
          <BackButton />

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1565D8]/30 hover:bg-blue-50 hover:text-[#1565D8] hover:shadow-md active:scale-95 dark:border-white/10 dark:bg-[#111b2e] dark:text-slate-200 dark:hover:border-[#1565D8] dark:hover:bg-[#16243b] dark:hover:text-white"
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>Home</span>
          </Link>
        </div>

        {/* =========================================
            Header
        ========================================= */}

        <div className="mb-6 rounded-3xl bg-gradient-to-r from-[#1565D8] to-blue-500 px-6 py-7 shadow-xl shadow-blue-500/15 sm:mb-8 sm:p-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 max-w-md text-sm leading-6 text-blue-100 sm:text-base">
            Manage your DealUp account information.
          </p>
        </div>

        {/* =========================================
            Main Profile Card
        ========================================= */}

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(21,101,216,0.12)] dark:border-white/10 dark:bg-[#0d1628] sm:rounded-[30px] sm:p-8 lg:p-10">

          <form
            onSubmit={handleSubmit}
            className="space-y-7 sm:space-y-8"
          >

            {/* =====================================
                Profile Image
            ===================================== */}

            <div className="flex flex-col items-center">

              <div className="relative">

                <img
                  src={
                    form.image ||
                    "/images/default-avatar.png"
                  }
                  alt="Profile"
                  className="h-32 w-32 rounded-full border-4 border-[#1565D8] object-cover shadow-xl sm:h-40 sm:w-40"
                />

                <div className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#1565D8] text-white shadow-lg sm:bottom-2 sm:right-2 sm:h-10 sm:w-10">
                  📷
                </div>

              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                {form.name || "DealUp User"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Update your profile picture
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-5 w-full max-w-[340px] text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-[#1565D8] file:px-5 file:py-3 file:font-semibold file:text-white file:transition hover:file:bg-blue-700 dark:text-slate-400"
              />

              {uploading && (
                <p className="mt-3 text-sm font-medium text-[#1565D8] dark:text-blue-400">
                  Uploading image...
                </p>
              )}

            </div>

            {/* =====================================
                Full Name
            ===================================== */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                👤 Full Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#1565D8] focus:bg-slate-50 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#1565D8] dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
              />
            </div>

            {/* =====================================
                Email
            ===================================== */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                ✉️ Email Address
              </label>

              <input
                type="email"
                value={form.email}
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-5 py-3 text-slate-700 outline-none dark:border-white/10 dark:bg-[#111b2e] dark:text-slate-300"
              />
            </div>

            {/* =====================================
                Phone
            ===================================== */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                📱 Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#1565D8] focus:bg-slate-50 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#1565D8] dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
              />
            </div>

            {/* =====================================
                Address Divider
            ===================================== */}

            <div className="border-t border-slate-200 pt-6 dark:border-white/10">
              <h2 className="text-xl font-bold text-[#1565D8]">
                📍 Address Information
              </h2>
            </div>

            {/* =====================================
                Address Fields
            ===================================== */}

            <div className="grid gap-5 md:grid-cols-3">

              {/* State */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  🏛 State
                </label>

                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#1565D8] focus:bg-slate-50 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#1565D8] dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
                />
              </div>

              {/* District */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  🏙 District
                </label>

                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="District"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#1565D8] focus:bg-slate-50 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#1565D8] dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
                />
              </div>

              {/* City */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  🌆 City
                </label>

                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#1565D8] focus:bg-slate-50 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#1565D8] dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
                />
              </div>

            </div>

            {/* =====================================
                Save Button
            ===================================== */}

            <div className="pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-[#1565D8] px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0f52ba] hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </form>

          {/* =========================================
              Phone Verification
          ========================================= */}

          <div className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-700 sm:pt-10">
            <PhoneVerification
              phone={form.phone}
              onVerified={(verifiedPhone) => {
                setForm((prev) => ({
                  ...prev,
                  phone: verifiedPhone,
                }));
              }}
            />
          </div>

        </div>
      </div>
    </main>
  );
}