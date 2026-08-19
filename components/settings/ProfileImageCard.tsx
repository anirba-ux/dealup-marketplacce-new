"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";

interface ProfileImageCardProps {
  image: string;
  name: string;
  email: string;
  onImageChange: (url: string) => void;
}

export default function ProfileImageCard({
  image,
  name,
  email,
  onImageChange,
}: ProfileImageCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);
      formData.append("type", "profile");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed.");
      }

      console.log("UPLOAD RESPONSE:", data);
      console.log("IMAGE URL:", data.image?.url);

      onImageChange(data.image.url);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      alert("Image upload failed.");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="mb-10 flex flex-col items-center border-b border-slate-200 dark:border-slate-700 pb-8">
      <div className="relative">
        <Image
          src={image || "/images/default-avatar.png"}
          alt={name || "Profile"}
          width={120}
          height={120}
          className="h-[120px] w-[120px] rounded-full border-4 border-white object-cover shadow-lg"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">{name}</h2>

      <p className="text-slate-500 dark:text-slate-400">{email}</p>
    </div>
  );
}
