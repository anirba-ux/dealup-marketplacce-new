"use client";

import { ChangeEvent, useEffect, useState } from "react";

import Link from "next/link";

import { ArrowLeft, Home } from "lucide-react";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  image: string;
  state: string;
  district: string;
  city: string;
};

import PhoneVerification from "@/components/verification/PhoneVerification";

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
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
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Loading Profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1565D8]"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
        {/* Header */}

        <div className="mb-8 rounded-3xl bg-gradient-to-r from-[#1565D8] to-blue-500 p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-white">My Profile</h1>

          <p className="mt-2 text-blue-100">
            Manage your DealUp account information.
          </p>
        </div>

        {/* Main Card */}

        <div className="rounded-[30px] border border-blue-100 bg-white dark:bg-slate-900 p-10 shadow-[0_20px_60px_rgba(21,101,216,0.12)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={form.image || "/images/default-avatar.png"}
                  alt="Profile"
                  className="h-40 w-40 rounded-full border-4 border-[#1565D8] object-cover shadow-xl"
                />

                <div className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#1565D8] text-white shadow-lg">
                  📷
                </div>
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white dark:text-white">
                {form.name || "DealUp User"}
              </h2>

              <p className="text-slate-500 dark:text-slate-400">
                Update your profile picture
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-5
      file:cursor-pointer
      file:rounded-xl
      file:border-0
      file:bg-[#1565D8]
      file:px-5
      file:py-3
      file:font-semibold
      file:text-white
      file:hover:bg-blue-700"
              />

              {uploading && (
                <p className="mt-3 text-sm font-medium text-[#1565D8]">
                  Uploading image...
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                👤 Full Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 px-5 py-3 transition-all outline-none focus:border-[#1565D8] focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                ✉️ Email Address
              </label>

              <input
                type="email"
                value={form.email}
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 text-slate-600"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                📱 Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 px-5 py-3 transition-all outline-none focus:border-[#1565D8] focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div className="border-t border-blue-100 pt-6">
              <h2 className="mb-6 text-xl font-bold text-[#1565D8]">
                📍 Address Information
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  🏛 State
                </label>

                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 px-5 py-3 transition-all outline-none focus:border-[#1565D8] focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  🏙 District
                </label>

                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="District"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 px-5 py-3 transition-all outline-none focus:border-[#1565D8] focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  🌆 City
                </label>

                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 px-5 py-3 transition-all outline-none focus:border-[#1565D8] focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          {/* ===================================== */}
          {/* Phone Verification */}
          {/* ===================================== */}

          <div className="mt-10 border-t border-slate-200 pt-10 dark:border-slate-700">
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
