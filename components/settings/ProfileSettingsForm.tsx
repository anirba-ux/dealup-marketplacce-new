"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "@teispace/next-themes";
import { toast } from "sonner";

import ProfileImageCard from "./ProfileImageCard";
import PasswordSecurityCard from "@/components/settings/PasswordSecurityCard";
import PersonalInfoCard from "@/components/settings/PersonalInfoCard";
import AddressCard from "@/components/settings/AddressCard";
import PreferencesCard from "@/components/settings/PreferencesCard";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  image: string;
  address: {
    state: string;
    district: string;
    city: string;
  };
}

export default function ProfileSettingsForm() {
  /* --------------------------------
     Loading / Saving States
  -------------------------------- */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  /* --------------------------------
     Messages
  -------------------------------- */
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* --------------------------------
     Session
  -------------------------------- */
  const { update } = useSession();

  /* --------------------------------
     Theme
  -------------------------------- */
  const { theme } = useTheme();

  /* --------------------------------
     Profile Form
  -------------------------------- */
  const [form, setForm] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    image: "",
    address: {
      state: "",
      district: "",
      city: "",
    },
  });

  /* --------------------------------
     Language
  -------------------------------- */
  const [language, setLanguage] = useState("en");

  /* --------------------------------
     Load Profile
  -------------------------------- */
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
          address: {
            state: data.user.address?.state || "",
            district: data.user.address?.district || "",
            city: data.user.address?.city || "",
          },
        });

        setLanguage(data.user.language || "en");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  }

  /* --------------------------------
     Handle Profile Input Changes
  -------------------------------- */
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const { name, value } = e.target;

    /* Address fields */
    if (
      ["state", "district", "city"].includes(name)
    ) {
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));

      return;
    }

    /* Normal fields */
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /* --------------------------------
     Language Change
  -------------------------------- */
  function handleLanguageChange(locale: string) {
    setLanguage(locale);
  }

  /* --------------------------------
     Save Profile
  -------------------------------- */
  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const requestBody = {
        name: form.name,
        phone: form.phone,
        image: form.image,
        language,
        state: form.address.state,
        district: form.address.district,
        city: form.address.city,
      };

      console.log("PROFILE UPDATE:", requestBody);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update profile.",
        );
      }

      /* Update NextAuth session */
      await update({
        name: form.name,
        image: form.image,
      });

      setMessage(
        "Profile updated successfully.",
      );

      toast.success(
        "Profile updated successfully.",
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError("Something went wrong.");
        toast.error("Something went wrong.");
      }
    } finally {
      setSaving(false);
    }
  }

  /* --------------------------------
     Change Password
  -------------------------------- */
  async function handleChangePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      toast.error(
        "Please fill in all password fields.",
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      toast.error(
        "Passwords do not match.",
      );
      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        "Password must be at least 8 characters.",
      );
      return;
    }

    try {
      setChangingPassword(true);

      const res = await fetch(
        "/api/profile/password",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to change password.",
        );
      }

      toast.success(
        data.message ||
          "Password changed successfully.",
      );
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error(
          "Something went wrong.",
        );
      }
    } finally {
      setChangingPassword(false);
    }
  }

  /* --------------------------------
     Loading UI
  -------------------------------- */
  if (loading) {
    return (
      <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 h-32 rounded-xl bg-slate-200 dark:bg-slate-800" />

        <div className="space-y-4">
          <div className="h-12 rounded bg-slate-200 dark:bg-slate-800" />

          <div className="h-12 rounded bg-slate-200 dark:bg-slate-800" />

          <div className="h-12 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  /* --------------------------------
     Main UI
  -------------------------------- */
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">

      {/* Profile Image */}
      <ProfileImageCard
        image={form.image}
        name={form.name}
        email={form.email}
        onImageChange={(url) =>
          setForm((prev) => ({
            ...prev,
            image: url,
          }))
        }
      />

      {/* Personal Information */}
      <PersonalInfoCard
        name={form.name}
        phone={form.phone}
        email={form.email}
        onChange={handleChange}
      />

      {/* Address */}
      <AddressCard
        state={form.address.state}
        district={form.address.district}
        city={form.address.city}
        onChange={handleChange}
      />

      {/* Password & Security */}
      <PasswordSecurityCard
        loading={changingPassword}
        onChangePassword={
          handleChangePassword
        }
      />

      {/* Preferences */}
      <PreferencesCard
        language={language}
        theme={theme || "system"}
        onLanguageChange={
          handleLanguageChange
        }
        onThemeChange={() => {
          // Theme is controlled directly
          // by next-themes inside PreferencesCard.
        }}
      />

      {/* Save Changes */}
      <div className="mt-10">

        {/* Success Message */}
        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="
            rounded-xl
            bg-blue-600
            px-6
            py-3
            font-semibold
            text-white
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </div>
  );
}