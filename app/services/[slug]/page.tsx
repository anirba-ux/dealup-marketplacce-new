import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Eye,
  Home,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { findServiceBySlug } from "@/lib/repositories/service.repository";
import ContactSellerButton from "@/components/chat/ContactSellerButton";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

function formatDate(value?: Date | string) {
  if (!value) return "Recently listed";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently listed";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPrice(service: {
  startingPrice?: number;
  priceOnRequest?: boolean;
  priceUnit?: string;
}) {
  if (service.priceOnRequest || service.startingPrice == null) {
    return "Price on request";
  }

  const amount = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(service.startingPrice);

  return `₹${amount}${service.priceUnit ? ` / ${service.priceUnit}` : ""}`;
}

export default async function ServiceDetailsPage({ params }: Props) {
  const { slug } = await params;
  const service = await findServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const title =
    service.listingType === "business"
      ? service.businessName || service.title
      : service.title;

  const image =
    service.thumbnail || service.images?.find((item) => item.url)?.url || "";

  const location = [
    service.location?.city,
    service.location?.district,
    service.location?.state,
  ]
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .join(", ");

  const phone = service.contact?.phone || service.sellerPhone;

 

  const serviceModeLabels: Record<string, string> = {
    at_business: "At business location",
    home_visit: "Home visit",
    both: "Home visit & business location",
    remote: "Remote service",
  };

  const isBusiness = service.listingType === "business";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-blue-400"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:text-blue-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-blue-400"
          >
            <Home size={15} />
            Home
          </Link>
        </div>

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
        >
          <Link href="/" className="hover:text-blue-500">
            DealUp
          </Link>

          <ArrowRight size={12} />

          <Link
            href={
              isBusiness
                ? "/search?listingType=business"
                : "/search?listingType=service"
            }
            className="hover:text-blue-500"
          >
            {isBusiness ? "Local Business" : "Services"}
          </Link>

          <ArrowRight size={12} />

          <span className="max-w-[55vw] truncate font-medium text-slate-700 dark:text-slate-200">
            {title}
          </span>
        </nav>

        {/* Main Layout */}
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.95fr)] lg:gap-7">
          {/* Left Column */}
          <div className="min-w-0 space-y-5">
            {/* Main Image */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover"
                    fetchPriority="high"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
                    {isBusiness ? (
                      <BriefcaseBusiness size={48} />
                    ) : (
                      <Wrench size={48} />
                    )}

                    <span className="text-sm">No image available</span>
                  </div>
                )}

                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-950/85 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                  {isBusiness ? (
                    <BriefcaseBusiness size={14} />
                  ) : (
                    <Wrench size={14} />
                  )}

                  {isBusiness ? "Local Business" : "Service"}
                </span>

                {service.trustedProvider && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
                    <BadgeCheck size={14} />
                    Trusted Provider
                  </span>
                )}
              </div>

              {service.images?.length > 1 && (
                <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  {service.images.length} photos available
                </div>
              )}
            </section>

            {/* Description */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">About this listing</h2>

                <div className="h-1 w-9 rounded-full bg-blue-600" />
              </div>

              <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-600 dark:text-slate-300">
                {service.description || "No description provided."}
              </p>

              {service.servicesOffered?.length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <h3 className="font-semibold">Services Offered</h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {service.servicesOffered.map((item, index) => (
                      <span
                        key={`${item}-${index}`}
                        className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {service.serviceAreas?.length > 0 && (
                <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <h3 className="font-semibold">Service Areas</h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {service.serviceAreas.map((area, index) => (
                      <span
                        key={`${area}-${index}`}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Location */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                Where to find it
              </p>

              <div className="mt-2 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">
                  {isBusiness ? "Business Location" : "Service Location"}
                </h2>

                <MapPin size={20} className="shrink-0 text-blue-500" />
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="flex items-start gap-2 text-sm font-medium">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-blue-500" />

                  {location || "Location not specified"}
                </p>

                {service.location?.address && (
                  <p className="mt-2 pl-6 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {service.location.address}
                  </p>
                )}

                {service.location?.pincode && (
                  <p className="mt-1 pl-6 text-xs text-slate-500 dark:text-slate-400">
                    PIN: {service.location.pincode}
                  </p>
                )}
              </div>

              {Number.isFinite(service.location?.coordinates?.lat) &&
                Number.isFinite(service.location?.coordinates?.lng) &&
                service.location.coordinates.lat !== 0 &&
                service.location.coordinates.lng !== 0 && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${service.location.coordinates.lat},${service.location.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <MapPin size={16} />
                    Get Directions
                  </a>
                )}
            </section>
          </div>

          {/* Right Column */}
          <aside className="min-w-0 space-y-5 lg:sticky lg:top-5">
            {/* Listing Summary */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {service.category}
                </span>

                {service.subcategory && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {service.subcategory}
                  </span>
                )}
              </div>

              <h1 className="mt-4 break-words text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {title}
              </h1>

              <p className="mt-4 break-words text-2xl font-extrabold text-[#1565d8] dark:text-blue-400 sm:text-3xl">
                {getPrice(service)}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 pb-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} className="text-blue-500" />
                  {service.location?.city || "Location unavailable"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-blue-500" />
                  Posted {formatDate(service.createdAt)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <Eye size={13} className="mr-1 inline" />
                    Views
                  </p>

                  <p className="mt-1 text-lg font-bold">{service.views ?? 0}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <Clock3 size={13} className="mr-1 inline" />
                    Service Mode
                  </p>

                  <p className="mt-1 text-xs font-semibold leading-5">
                    {serviceModeLabels[service.serviceMode] ||
                      "Contact provider"}
                  </p>
                </div>
              </div>
            </section>

            {/* Provider Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-lg font-bold">
                {isBusiness ? "Business Information" : "Provider Information"}
              </h2>

              <div className="mt-5 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400">
                  {isBusiness ? (
                    <BriefcaseBusiness size={22} />
                  ) : (
                    <Wrench size={22} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="break-words font-bold">
                    {service.businessName || service.sellerName}
                  </p>

                  {service.businessVerified && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck size={13} />
                      Verified Business
                    </p>
                  )}

                  {service.phoneVerified && (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <BadgeCheck size={13} />
                      Phone Verified
                    </p>
                  )}

                  {service.yearsOfExperience != null && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {service.yearsOfExperience} years of experience
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                {service.serviceMode && (
                  <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Wrench
                      size={16}
                      className="mt-0.5 shrink-0 text-blue-500"
                    />
                    <span>
                      {serviceModeLabels[service.serviceMode] ||
                        service.serviceMode}
                    </span>
                  </p>
                )}

                {service.contact?.email && (
                  <a
                    href={`mailto:${service.contact.email}`}
                    className="flex min-w-0 items-start gap-2 break-all text-sm text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                  >
                    <Mail size={16} className="mt-0.5 shrink-0" />
                    {service.contact.email}
                  </a>
                )}

                {service.contact?.website && (
                  <a
                    href={
                      /^https?:\/\//i.test(service.contact.website)
                        ? service.contact.website
                        : `https://${service.contact.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Visit Website →
                  </a>
                )}
              </div>

              {/* Contact Actions */}
              <div className="mt-6 space-y-3">
                <ContactSellerButton
                  productId={service._id.toString()}
                  sellerId={String(service.sellerId)}
                  listingType={service.listingType}
                />

                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <Phone size={16} />
                    Call Provider
                  </a>
                )}

                {!phone && (
                  <p className="rounded-xl bg-slate-50 p-3 text-center text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                    Phone number is not available. You can still message this
                    provider on DealUp.
                  </p>
                )}
              </div>
            </section>

            {/* Listing Details */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="font-bold">Listing Details</h2>

              <dl className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
                <div className="flex items-start justify-between gap-4 py-3 text-sm">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Category
                  </dt>
                  <dd className="text-right font-semibold">
                    {service.category}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-4 py-3 text-sm">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Listing Type
                  </dt>
                  <dd className="text-right font-semibold">
                    {isBusiness ? "Local Business" : "Service"}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-4 py-3 text-sm">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Location
                  </dt>
                  <dd className="max-w-[60%] text-right font-semibold">
                    {location || "Not specified"}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-4 py-3 text-sm">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Listed On
                  </dt>
                  <dd className="text-right font-semibold">
                    {formatDate(service.createdAt)}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>

        {/* Back to Services */}
        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <Link
            href={
              isBusiness
                ? "/search?listingType=business"
                : "/search?listingType=service"
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            <ArrowLeft size={16} />
            Explore more {isBusiness ? "local businesses" : "services"}
          </Link>
        </div>
      </div>
    </main>
  );
}
