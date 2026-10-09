
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import ServiceForm from "@/components/services/ServiceForm";
import { findServiceById } from "@/lib/repositories/service.repository";

interface EditServicePageProps {
  params: Promise<{ serviceId: string }>;
}

export default async function EditServicePage({
  params,
}: EditServicePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { serviceId } = await params;

  // Invalid IDs should not be queried as valid listings.
  if (!/^[a-f\d]{24}$/i.test(serviceId)) {
    notFound();
  }

  const service = await findServiceById(serviceId);

  if (!service) {
    notFound();
  }

  // A user can edit only their own service or business listing.
  if (String(service.sellerId) !== String(session.user.id)) {
    notFound();
  }

  const initialData = {
    title: service.title ?? "",
    description: service.description ?? "",
    listingType: service.listingType ?? "service",
    category: service.category ?? "",
    subcategory: service.subcategory ?? "",
    businessName: service.businessName ?? "",
    businessType: service.businessType ?? "",
    yearsOfExperience:
      service.yearsOfExperience != null
        ? String(service.yearsOfExperience)
        : "",
    serviceMode: service.serviceMode ?? "home_visit",
    servicesOffered: service.servicesOffered ?? [],
    serviceAreas: service.serviceAreas ?? [],
    startingPrice:
      service.startingPrice != null ? String(service.startingPrice) : "",
    priceUnit: service.priceUnit ?? "service",
    priceOnRequest: service.priceOnRequest ?? false,
    images: service.images ?? [],
    thumbnail: service.thumbnail ?? "",
    location: {
      country: service.location?.country ?? "India",
      state: service.location?.state ?? "West Bengal",
      district: service.location?.district ?? "",
      city: service.location?.city ?? "",
      pincode: service.location?.pincode ?? "",
      address: service.location?.address ?? "",
      coordinates: {
        lat: service.location?.coordinates?.lat ?? 0,
        lng: service.location?.coordinates?.lng ?? 0,
      },
    },
    contact: {
      phone: service.contact?.phone ?? "",
      alternativePhone: service.contact?.alternativePhone ?? "",
      whatsapp: service.contact?.whatsapp ?? "",
      email: service.contact?.email ?? "",
      website: service.contact?.website ?? "",
    },
    openingHours: service.openingHours?.map((hour) => ({
      day: hour.day,
      isOpen: hour.isOpen,
      openTime: hour.openTime ?? "09:00",
      closeTime: hour.closeTime ?? "18:00",
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard/my-services"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#1565d8] hover:text-[#1565d8] dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Services
        </Link>

        <ServiceForm
          mode="edit"
          serviceId={serviceId}
          initialData={initialData}
        />
      </div>
    </main>
  );
}
