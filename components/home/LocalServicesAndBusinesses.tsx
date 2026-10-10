
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  MapPin,
  Store,
  Wrench,
} from "lucide-react";

import Container from "@/components/ui/Container";
import ViewAllLink from "@/components/ui/ViewAllLink";
import type { Service } from "@/lib/models/service";

type HomepageListing = Service;

interface Props {
  services: HomepageListing[];
  businesses: HomepageListing[];
}

// =====================================================
// Helpers
// =====================================================

function getListingTitle(
  item: HomepageListing,
  business: boolean,
) {
  return business
    ? item.businessName?.trim() || item.title
    : item.title;
}

function getListingImage(item: HomepageListing) {
  return (
    item.thumbnail ||
    item.images?.find((image) => image.url)?.url ||
    ""
  );
}

function getListingLocation(item: HomepageListing) {
  return (
    [item.location?.city, item.location?.district]
      .filter(Boolean)
      .filter(
        (value, index, array) =>
          array.indexOf(value) === index,
      )
      .join(", ") || "Location not specified"
  );
}

function getListingPrice(item: HomepageListing) {
  if (item.priceOnRequest || item.startingPrice == null) {
    return "Price on request";
  }

  const price = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(item.startingPrice);

  const unit = item.priceUnit
    ? ` / ${item.priceUnit}`
    : "";

  return `₹${price}${unit}`;
}

// =====================================================
// Listing Card
// =====================================================

function LocalListingCard({
  item,
  business = false,
}: {
  item: HomepageListing;
  business?: boolean;
}) {
  const title = getListingTitle(item, business);
  const image = getListingImage(item);
  const location = getListingLocation(item);

  const href = item.slug
    ? `/services/${encodeURIComponent(item.slug)}`
    : "/search";

  return (
    <Link
      href={href}
      className="
        group flex h-full min-w-0 flex-col
        overflow-hidden rounded-2xl border
        border-slate-200 bg-white
        shadow-sm transition-all duration-300
        hover:-translate-y-1 hover:border-blue-300
        hover:shadow-lg
        dark:border-slate-800 dark:bg-slate-900
        dark:hover:border-blue-800
      "
    >
      {/* Image */}
      <div
        className="
          relative aspect-[4/3] overflow-hidden
          bg-slate-100 dark:bg-slate-800
        "
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="
              h-full w-full object-cover
              transition-transform duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div
            className="
              flex h-full items-center justify-center
              text-blue-500 dark:text-blue-400
            "
          >
            {business ? (
              <Store size={42} strokeWidth={1.5} />
            ) : (
              <Wrench size={42} strokeWidth={1.5} />
            )}
          </div>
        )}

        {/* Listing Type */}
        <span
          className="
            absolute left-3 top-3
            rounded-lg bg-slate-950/80
            px-2.5 py-1 text-[10px]
            font-bold uppercase tracking-wide
            text-white backdrop-blur-sm
          "
        >
          {business ? "Local Business" : "Service"}
        </span>

        {/* Trusted Badge */}
        {item.trustedProvider && (
          <span
            className="
              absolute right-3 top-3
              inline-flex items-center gap-1
              rounded-full bg-blue-600
              px-2 py-1 text-[10px]
              font-semibold text-white
            "
          >
            <BadgeCheck size={12} />
            Trusted
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Category */}
        <p
          className="
            mb-1.5 line-clamp-1 text-xs
            font-semibold text-[#1565d8]
            dark:text-blue-400
          "
        >
          {item.category}
          {item.subcategory
            ? ` · ${item.subcategory}`
            : ""}
        </p>

        {/* Title */}
        <h3
          className="
            line-clamp-2 min-h-10
            text-sm font-bold leading-5
            text-slate-900 transition-colors
            group-hover:text-[#1565d8]
            dark:text-white dark:group-hover:text-blue-400
            sm:text-base
          "
        >
          {title}
        </h3>

        {/* Business Type */}
        {business && item.businessType && (
          <p
            className="
              mt-1 line-clamp-1 text-xs
              text-slate-500 dark:text-slate-400
            "
          >
            {item.businessType}
          </p>
        )}

        {/* Location */}
        <div
          className="
            mt-3 flex min-w-0 items-start gap-1.5
            text-xs text-slate-500
            dark:text-slate-400
          "
        >
          <MapPin
            size={14}
            className="mt-0.5 shrink-0 text-blue-500"
          />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Price and Views */}
        <div
          className="
            mt-auto flex flex-wrap items-end
            justify-between gap-2 border-t
            border-slate-100 pt-3
            dark:border-slate-800
          "
        >
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Starting price
            </p>

            <p
              className="
                mt-0.5 break-words text-sm
                font-bold text-[#1565d8]
                dark:text-blue-400 sm:text-base
              "
            >
              {getListingPrice(item)}
            </p>
          </div>

          <div
            className="
              inline-flex shrink-0 items-center gap-1
              text-xs text-slate-500
              dark:text-slate-400
            "
          >
            <Eye size={13} />
            {item.views ?? 0}
          </div>
        </div>

        {/* View Details */}
        <span
          className="
            mt-3 inline-flex w-full items-center
            justify-center gap-2 rounded-xl
            bg-blue-50 px-3 py-2.5
            text-xs font-semibold text-[#1565d8]
            transition-colors
            group-hover:bg-[#1565d8]
            group-hover:text-white
            dark:bg-blue-950/40
            dark:text-blue-400
            dark:group-hover:bg-[#1565d8]
            dark:group-hover:text-white
            sm:text-sm
          "
        >
          View Details
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}

// =====================================================
// Listing Group
// =====================================================

function ListingGroup({
  title,
  items,
  business = false,
}: {
  title: string;
  items: HomepageListing[];
  business?: boolean;
}) {
  const viewAllHref = business
    ? "/search?listingType=business"
    : "/search?listingType=service";

  return (
    <div className="min-w-0">
      {/* Group Header */}
      <div
        className="
          mb-4 flex items-center
          justify-between gap-3
        "
      >
        <h3
          className="
            text-lg font-bold tracking-tight
            text-slate-900 dark:text-white
            sm:text-xl
          "
        >
          {title}
        </h3>

        {/* DESKTOP VIEW ALL */}
        <div className="hidden sm:block">
          <ViewAllLink href={viewAllHref} />
        </div>
      </div>

      {/* Listing Cards */}
      {items.length > 0 ? (
        <>
          <div
            className="
              flex gap-3 overflow-x-auto
              overscroll-x-contain pb-4
              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
              sm:grid sm:grid-cols-2
              sm:gap-5 sm:overflow-visible sm:pb-0
              lg:grid-cols-4 lg:gap-6
            "
          >
            {items.map((item, index) => (
              <div
                key={
                  item._id?.toString() ||
                  `${item.slug}-${index}`
                }
                className="
                  w-[78vw] min-w-[78vw] shrink-0
                  sm:w-auto sm:min-w-0
                "
              >
                <LocalListingCard
                  item={item}
                  business={business}
                />
              </div>
            ))}
          </div>

          {/* MOBILE VIEW ALL */}
          <div className="mt-5 flex justify-center sm:hidden">
            <ViewAllLink href={viewAllHref} />
          </div>
        </>
      ) : (
        <div
          className="
            rounded-2xl border border-dashed
            border-slate-300 bg-slate-50
            px-5 py-8 text-center
            dark:border-slate-700
            dark:bg-slate-900/60
          "
        >
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            No {business ? "local businesses" : "services"} available yet.
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            New active listings will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

// =====================================================
// Main Section
// =====================================================

export default function LocalServicesAndBusinesses({
  services,
  businesses,
}: Props) {
  if (!services.length && !businesses.length) {
    return null;
  }

  return (
    <section
      className="
        bg-white py-10
        dark:bg-slate-950
        sm:py-12 lg:py-14
      "
    >
      <Container>
        {/* Main Header */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div
              className="
                flex h-8 w-8 items-center
                justify-center rounded-full
                bg-blue-50 text-[#1565d8]
                dark:bg-blue-950/40
                dark:text-blue-400
              "
            >
              <Store size={17} />
            </div>

            <span
              className="
                text-xs font-bold uppercase
                tracking-wider text-[#1565d8]
                dark:text-blue-400
              "
            >
              Discover Local
            </span>
          </div>

          <h2
            className="
              text-2xl font-bold tracking-tight
              text-slate-900 dark:text-white
              sm:text-3xl lg:text-4xl
            "
          >
            Services &amp; Local Businesses
          </h2>

          <p
            className="
              mt-1 max-w-xl text-sm leading-6
              text-slate-500 dark:text-slate-400
              sm:text-base
            "
          >
            Find trusted local service providers and businesses near you.
          </p>
        </div>

        {/* Service & Business Groups */}
        <div className="space-y-8 sm:space-y-10">
          {services.length > 0 && (
            <ListingGroup
              title="Service"
              items={services}
            />
          )}

          {businesses.length > 0 && (
            <ListingGroup
              title="Local Business"
              items={businesses}
              business
            />
          )}
        </div>
      </Container>
    </section>
  );
}
