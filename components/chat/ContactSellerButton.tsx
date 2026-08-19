"use client";

import { useRouter } from "next/navigation";

interface ContactSellerButtonProps {
  productId: string;
  sellerId: string;
}

export default function ContactSellerButton({
  productId,
  sellerId,
}: ContactSellerButtonProps) {
  const router = useRouter();

  async function handleContactSeller() {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          sellerId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create conversation");
        return;
      }

      router.push(`/messages/${data._id}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  return (
    <button
      onClick={handleContactSeller}
      className="rounded-2xl bg-[#1565d8] px-8 py-4 font-semibold text-white transition hover:bg-[#0f52ba]"
    >
      💬 Chat on DealUp
    </button>
  );
}