"use client";

import { useEffect, useState } from "react";
import ProfileImageCard from "./ProfileImageCard";
import { useSession } from "next-auth/react";

import PasswordSecurityCard from "@/components/settings/PasswordSecurityCard";
import PersonalInfoCard from "@/components/settings/PersonalInfoCard";
import AddressCard from "@/components/settings/AddressCard";
import PreferencesCard from "@/components/settings/PreferencesCard";

import { toast } from "sonner";

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
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { update } = useSession();

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

  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("system");

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    if (["state", "district", "city"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        },
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave() {
    console.log("FORM IMAGE:", form.image);
    try {
      setSaving(true);
      setMessage("");
      setError("");

      console.log("REQUEST BODY:", {
        name: form.name,
        phone: form.phone,
        image: form.image,
        language,
        state: form.address.state,
        district: form.address.district,
        city: form.address.city,
      });
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          image: form.image,
          language,
          state: form.address.state,
          district: form.address.district,
          city: form.address.city,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile.");
      }

      await update({
        name: form.name,
        image: form.image,
      });

      setMessage("Profile updated successfully.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    try {
      setChangingPassword(true);

      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to change password.");
      }

      toast.success(data.message);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setChangingPassword(false);
    }
  }

  function handleLanguageChange(locale: string) {
    setLanguage(locale);
  }

  if (loading) {
    return (
      <div className="animate-pulse rounded-3xl border bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="mb-6 h-32 rounded-xl bg-slate-200" />
        <div className="space-y-4">
          <div className="h-12 rounded bg-slate-200" />
          <div className="h-12 rounded bg-slate-200" />
          <div className="h-12 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-white dark:bg-slate-900 dark:bg-slate-900 p-8 shadow-sm">
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

      <PersonalInfoCard
        name={form.name}
        phone={form.phone}
        email={form.email}
        onChange={handleChange}
      />

      <AddressCard
        state={form.address.state}
        district={form.address.district}
        city={form.address.city}
        onChange={handleChange}
      />

      <PasswordSecurityCard
        loading={changingPassword}
        onChangePassword={handleChangePassword}
      />

      <PreferencesCard
        language={language}
        theme={theme}
        onLanguageChange={handleLanguageChange}
        onThemeChange={setTheme}
      />

      <div className="mt-10">
        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
