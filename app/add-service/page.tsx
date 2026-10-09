import type { Metadata } from "next";
import ServiceForm from "@/components/services/ServiceForm";

export const metadata: Metadata = {
  title: "Add Service | DealUp Marketplace",
  description:
    "List your local service or business on DealUp Marketplace and connect with nearby customers.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AddServicePage() {
  return <ServiceForm />;
}