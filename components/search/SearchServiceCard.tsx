import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Eye,
  Heart,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  Wrench,
  Zap,
} from "lucide-react";

export interface SearchServiceCardProps {
  service: {
    _id?: unknown;
    title: string;
    slug?: string;

    listingType?: "service" | "business";

    description?: string;

    category?: string;
    subcategory?: string;

    sellerId?: string;
    sellerName?: string;

    businessName?: string;
    businessType?: string;

    yearsOfExperience?: number;

    serviceMode?: string;

    servicesOffered?: string[];
    serviceAreas?: string[];

    startingPrice?: number;
    priceUnit?:
      | "hour"
      | "visit"
      | "day"
      | "service"
      | "project"
      | "month";

    priceOnRequest?: boolean;
    currency?: string;

    images?: {
      publicId?: string;
      url: string;
    }[];

    thumbnail?: string;

    location?: {
      country?: string;
      state?: string;
      district?: string;
      city?: string;
      pincode?: string;
      address?: string;

      coordinates?: {
        lat?: number;
        lng?: number;
      };
    };

    contact?: {
      phone?: string;
      alternativePhone?: string;
      whatsapp?: string;
      email?: string;
      website?: string;
    };

    openingHours?: unknown[];

    phoneVerified?: boolean;
    identityVerified?: boolean;
    businessVerified?: boolean;
    trustedProvider?: boolean;

    isFeatured?: boolean;
    isBoosted?: boolean;

    featuredAt?: Date | string;
    featuredUntil?: Date | string;

    boostedAt?: Date | string;
    boostedUntil?: Date | string;

    views?: number;
    enquiries?: number;
    favorites?: number;

    status?: string;

    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
}

function getServiceImage(
  service: SearchServiceCardProps["service"],
) {
  return (
    service.thumbnail ||
    service.images?.find((image) => image?.url)?.url ||
    "/images/service-placeholder.png"
  );
}

function getServiceModeLabel(
  serviceMode?: string,
) {
  switch (serviceMode) {
    case "at_business":
      return "At Business";

    case "home_visit":
      return "Home Visit";

    case "both":
      return "At Business + Home Visit";

    case "remote":
      return "Remote";

    default:
      return "Service";
  }
}

function getPriceLabel(
  service: SearchServiceCardProps["service"],
) {
  if (service.priceOnRequest) {
    return "Price on request";
  }

  if (
    typeof service.startingPrice !== "number" ||
    !Number.isFinite(service.startingPrice)
  ) {
    return "Contact for price";
  }

  const unitMap: Record<string, string> = {
    hour: "/ hour",
    visit: "/ visit",
    day: "/ day",
    service: "/ service",
    project: "/ project",
    month: "/ month",
  };

  return `₹${service.startingPrice.toLocaleString(
    "en-IN",
  )} ${
    unitMap[service.priceUnit || ""] || ""
  }`.trim();
}

function getLocationLabel(
  service: SearchServiceCardProps["service"],
) {
  const location = service.location;

  if (!location) {
    return "Location not specified";
  }

  const parts = [
    location.city,
    location.district,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return (
    location.state ||
    location.country ||
    "Location not specified"
  );
}

function getProviderName(
  service: SearchServiceCardProps["service"],
) {
  return (
    service.businessName ||
    service.sellerName ||
    "Service Provider"
  );
}

export default function SearchServiceCard({
  service,
}: SearchServiceCardProps) {
  const image = getServiceImage(service);

  const serviceUrl = service.slug
    ? `/services/${service.slug}`
    : service._id
      ? `/services/${String(service._id)}`
      : "/services";

  const providerName = getProviderName(service);

  const locationLabel = getLocationLabel(service);

  const modeLabel = getServiceModeLabel(
    service.serviceMode,
  );

  const priceLabel = getPriceLabel(service);

  const services =
    service.servicesOffered?.filter(Boolean) || [];

  const areas =
    service.serviceAreas?.filter(Boolean) || [];

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300

        hover:-translate-y-1
        hover:border-[#1565d8]/40
        hover:shadow-xl

        dark:border-slate-700
        dark:bg-slate-900
      "
    >
      <Link
        href={serviceUrl}
        className="
          grid
          grid-cols-1

          md:grid-cols-[220px_1fr]
        "
      >
        {/* =====================================================
            IMAGE
        ===================================================== */}
        <div
          className="
            relative
            h-56
            w-full
            overflow-hidden

            md:h-full
            md:min-h-[250px]
          "
        >
          <Image
            src={image}
            alt={service.title}
            fill
            sizes="
              (max-width: 768px) 100vw,
              220px
            "
            className="
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />

          {/* IMAGE OVERLAY */}
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/40
              via-transparent
              to-transparent
            "
          />

          {/* FEATURED */}
          {service.isFeatured && (
            <span
              className="
                absolute
                left-3
                top-3
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-amber-400
                px-3
                py-1.5
                text-xs
                font-bold
                text-white
                shadow-lg
              "
            >
              ⭐ Featured
            </span>
          )}

          {/* BOOSTED */}
          {service.isBoosted && (
            <span
              className="
                absolute
                right-3
                top-3
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-[#1565d8]
                text-white
                shadow-lg
              "
              title="Boosted Service"
            >
              <Zap className="h-4 w-4" />
            </span>
          )}

          {/* TRUSTED PROVIDER */}
          {service.trustedProvider && (
            <span
              className="
                absolute
                bottom-3
                left-3
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-white/95
                px-3
                py-1.5
                text-xs
                font-bold
                text-emerald-700
                shadow-md
                backdrop-blur-sm
              "
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Trusted Provider
            </span>
          )}
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <div
          className="
            flex
            min-w-0
            flex-col
            justify-between
            p-5
            sm:p-6
          "
        >
          <div>
            {/* CATEGORY */}
            <div className="flex flex-wrap items-center gap-2">
              {service.category && (
                <span
                  className="
                    rounded-full
                    bg-blue-50
                    px-3
                    py-1
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-blue-700

                    dark:bg-blue-950/50
                    dark:text-blue-300
                  "
                >
                  {service.category}
                </span>
              )}

              {service.subcategory && (
                <span
                  className="
                    rounded-full
                    bg-violet-50
                    px-3
                    py-1
                    text-[11px]
                    font-bold
                    text-violet-700

                    dark:bg-violet-950/40
                    dark:text-violet-300
                  "
                >
                  {service.subcategory}
                </span>
              )}
            </div>

            {/* TITLE */}
            <div
              className="
                mt-3
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <h2
                className="
                  line-clamp-2
                  text-xl
                  font-bold
                  leading-tight
                  text-slate-900
                  transition-colors
                  group-hover:text-[#1565d8]

                  dark:text-white

                  sm:text-2xl
                "
              >
                {service.title}
              </h2>

              <ArrowUpRight
                className="
                  mt-1
                  h-5
                  w-5
                  shrink-0
                  text-slate-400
                  transition-all
                  duration-300

                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                  group-hover:text-[#1565d8]
                "
              />
            </div>

            {/* PROVIDER */}
            <div
              className="
                mt-3
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <Building2
                className="
                  h-4
                  w-4
                  text-slate-400
                "
              />

              <span
                className="
                  text-sm
                  font-semibold
                  text-slate-700

                  dark:text-slate-300
                "
              >
                {providerName}
              </span>

              {service.businessVerified && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-full
                    bg-emerald-50
                    px-2.5
                    py-1
                    text-[11px]
                    font-bold
                    text-emerald-700

                    dark:bg-emerald-950/40
                    dark:text-emerald-300
                  "
                >
                  <BadgeCheck className="h-3 w-3" />
                  Business Verified
                </span>
              )}

              {service.phoneVerified && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-full
                    bg-sky-50
                    px-2.5
                    py-1
                    text-[11px]
                    font-bold
                    text-sky-700

                    dark:bg-sky-950/40
                    dark:text-sky-300
                  "
                >
                  <Phone className="h-3 w-3" />
                  Phone Verified
                </span>
              )}
            </div>

            {/* DESCRIPTION */}
            {service.description && (
              <p
                className="
                  mt-3
                  line-clamp-2
                  text-sm
                  leading-6
                  text-slate-600

                  dark:text-slate-400
                "
              >
                {service.description}
              </p>
            )}

            {/* SERVICE INFORMATION */}
            <div
              className="
                mt-4
                grid
                grid-cols-1
                gap-2

                sm:grid-cols-2
              "
            >
              {/* MODE */}
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2
                  rounded-2xl
                  bg-slate-50
                  px-3
                  py-2.5

                  dark:bg-slate-800
                "
              >
                <Wrench
                  className="
                    h-4
                    w-4
                    shrink-0
                    text-[#1565d8]
                  "
                />

                <span
                  className="
                    truncate
                    text-xs
                    font-semibold
                    text-slate-700

                    dark:text-slate-300
                  "
                >
                  {modeLabel}
                </span>
              </div>

              {/* LOCATION */}
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2
                  rounded-2xl
                  bg-slate-50
                  px-3
                  py-2.5

                  dark:bg-slate-800
                "
              >
                <MapPin
                  className="
                    h-4
                    w-4
                    shrink-0
                    text-pink-500
                  "
                />

                <span
                  className="
                    truncate
                    text-xs
                    font-semibold
                    text-slate-700

                    dark:text-slate-300
                  "
                >
                  {locationLabel}
                </span>
              </div>
            </div>

            {/* SERVICES OFFERED */}
            {services.length > 0 && (
              <div className="mt-4">
                <div
                  className="
                    mb-2
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-bold
                    text-slate-500

                    dark:text-slate-400
                  "
                >
                  <Wrench className="h-3.5 w-3.5" />
                  Services Offered
                </div>

                <div className="flex flex-wrap gap-2">
                  {services
                    .slice(0, 4)
                    .map((item) => (
                      <span
                        key={item}
                        className="
                          rounded-full
                          bg-blue-50
                          px-3
                          py-1
                          text-xs
                          font-medium
                          text-blue-700

                          dark:bg-blue-950/40
                          dark:text-blue-300
                        "
                      >
                        {item}
                      </span>
                    ))}

                  {services.length > 4 && (
                    <span
                      className="
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        text-slate-600

                        dark:bg-slate-800
                        dark:text-slate-400
                      "
                    >
                      +{services.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* SERVICE AREAS */}
            {areas.length > 0 && (
              <div
                className="
                  mt-3
                  flex
                  items-start
                  gap-2
                "
              >
                <Navigation
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-emerald-500
                  "
                />

                <p
                  className="
                    line-clamp-1
                    text-xs
                    text-slate-500

                    dark:text-slate-400
                  "
                >
                  <span className="font-semibold">
                    Service Areas:
                  </span>{" "}
                  {areas.slice(0, 4).join(", ")}
                  {areas.length > 4 &&
                    ` +${areas.length - 4} more`}
                </p>
              </div>
            )}

            {/* PRICE */}
            <div className="mt-4">
              <span
                className="
                  text-2xl
                  font-extrabold
                  tracking-tight
                  text-[#1565d8]
                "
              >
                {priceLabel}
              </span>
            </div>

            {/* EXPERIENCE */}
            {typeof service.yearsOfExperience ===
              "number" && (
              <div
                className="
                  mt-2
                  text-xs
                  font-medium
                  text-slate-500

                  dark:text-slate-400
                "
              >
                {service.yearsOfExperience}{" "}
                {service.yearsOfExperience === 1
                  ? "year"
                  : "years"}{" "}
                of experience
              </div>
            )}
          </div>

          {/* ===================================================
              FOOTER
          =================================================== */}
          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
              justify-between
              gap-4
              border-t
              border-slate-100
              pt-4

              dark:border-slate-800
            "
          >
            {/* STATS */}
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-4
                text-sm
                text-slate-500

                dark:text-slate-400
              "
            >
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {service.views ?? 0}
              </span>

              <span className="flex items-center gap-1.5">
                <Heart
                  className="
                    h-4
                    w-4
                    text-pink-500
                  "
                />
                {service.favorites ?? 0}
              </span>

              {service.enquiries !== undefined && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {service.enquiries}
                </span>
              )}
            </div>

            {/* CTA */}
            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-[#1565d8]
                px-4
                py-2
                text-xs
                font-bold
                text-white
                shadow-sm
                transition-all
                duration-300

                group-hover:bg-[#0f56bd]
                group-hover:shadow-md
              "
            >
              View Service
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}