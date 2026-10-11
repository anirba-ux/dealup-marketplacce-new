
import Link from "next/link";
import { ObjectId, type Document } from "mongodb";
import {
  BriefcaseBusiness,
  MapPin,
  Store,
  Wrench,
} from "lucide-react";

import clientPromise from "@/lib/db/mongodb";
import RemoveSavedListingButton from "@/components/wishlist/RemoveSavedListingButton";

type ListingType = "job" | "service" | "business";

interface SavedRecord {
  listingId: string;
  listingType: ListingType;
}

interface SavedListingCard {
  id: string;
  type: ListingType;
  title: string;
  subtitle: string;
  location: string;
  href: string;
}

interface ListingLocation {
  city?: string;
  district?: string;
  state?: string;
}

function isListingType(value: unknown): value is ListingType {
  return (
    value === "job" ||
    value === "service" ||
    value === "business"
  );
}

function getText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function getLocation(location?: ListingLocation): string {
  return (
    [
      getText(location?.city),
      getText(location?.district),
      getText(location?.state),
    ]
      .filter((part): part is string => Boolean(part))
      .join(", ") || "Location not specified"
  );
}

export default async function SavedListingsSection({
  userId,
}: {
  userId: string;
}) {
  const client = await clientPromise;
  const db = client.db("dealup");

  // Load saved job, service and business references.
  const records = await db
    .collection("savedListings")
    .find(
      { userId },
      {
        projection: {
          _id: 0,
          listingId: 1,
          listingType: 1,
          createdAt: 1,
        },
      },
    )
    .sort({ createdAt: -1 })
    .toArray();

  const savedRecords: SavedRecord[] = records
    .filter(
      (item) =>
        typeof item.listingId === "string" &&
        isListingType(item.listingType),
    )
    .map((item) => ({
      listingId: item.listingId as string,
      listingType: item.listingType as ListingType,
    }));

  const jobIds = savedRecords
    .filter(
      (item) =>
        item.listingType === "job" &&
        ObjectId.isValid(item.listingId),
    )
    .map((item) => new ObjectId(item.listingId));

  const serviceIds = savedRecords
    .filter(
      (item) =>
        (item.listingType === "service" ||
          item.listingType === "business") &&
        ObjectId.isValid(item.listingId),
    )
    .map((item) => new ObjectId(item.listingId));

  // Fetch only active listings.
  const [jobs, services] = await Promise.all([
    jobIds.length > 0
      ? db
          .collection("jobs")
          .find({
            _id: { $in: jobIds },
            status: "active",
          })
          .toArray()
      : Promise.resolve([] as Document[]),

    serviceIds.length > 0
      ? db
          .collection("services")
          .find({
            _id: { $in: serviceIds },
            status: "active",
            listingType: {
              $in: ["service", "business"],
            },
          })
          .toArray()
      : Promise.resolve([] as Document[]),
  ]);

  const jobMap = new Map<string, Document>(
    jobs.map((job) => [job._id.toString(), job]),
  );

  const serviceMap = new Map<string, Document>(
    services.map((service) => [service._id.toString(), service]),
  );

  // Explicit return type prevents flatMap inference errors.
  const listings: SavedListingCard[] = [];

  for (const saved of savedRecords) {
    if (!ObjectId.isValid(saved.listingId)) {
      continue;
    }

    const id = new ObjectId(saved.listingId).toString();

    if (saved.listingType === "job") {
      const job = jobMap.get(id);

      if (!job) {
        continue;
      }

      const position = Array.isArray(job.jobs)
        ? job.jobs[0]
        : undefined;

      const title =
        getText(position?.title) || "Job Opportunity";

      const subtitle =
        getText(job.employer?.companyName) ||
        getText(job.employerName) ||
        "Company";

      listings.push({
        id,
        type: "job",
        title,
        subtitle,
        location: getLocation(job.location),
        href: `/jobs/${id}`,
      });

      continue;
    }

    const service = serviceMap.get(id);

    if (!service || service.listingType !== saved.listingType) {
      continue;
    }

    const isBusiness = saved.listingType === "business";
    const slug = getText(service.slug);

    const title = isBusiness
      ? getText(service.businessName) ||
        getText(service.title) ||
        "Local Business"
      : getText(service.title) || "Service";

    const subtitle =
      getText(service.category) ||
      (isBusiness ? "Local Business" : "Service");

    listings.push({
      id,
      type: saved.listingType,
      title,
      subtitle,
      location: getLocation(service.location),
      href: slug
        ? `/services/${encodeURIComponent(slug)}`
        : "/search",
    });
  }

  const savedJobs = listings.filter(
    (item) => item.type === "job",
  );

  const savedServices = listings.filter(
    (item) => item.type === "service",
  );

  const savedBusinesses = listings.filter(
    (item) => item.type === "business",
  );

  const sections = [
    {
      type: "job" as const,
      title: "Saved Jobs",
      Icon: BriefcaseBusiness,
      items: savedJobs,
    },
    {
      type: "service" as const,
      title: "Saved Services",
      Icon: Wrench,
      items: savedServices,
    },
    {
      type: "business" as const,
      title: "Saved Local Businesses",
      Icon: Store,
      items: savedBusinesses,
    },
  ];

  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <BriefcaseBusiness
          size={32}
          className="mx-auto text-slate-400"
        />

        <h2 className="mt-3 font-bold text-slate-900 dark:text-white">
          No saved jobs or services yet
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Save jobs, services or local businesses to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {sections.map((section) => {
        if (section.items.length === 0) {
          return null;
        }

        const Icon = section.Icon;

        return (
          <section key={section.type}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <Icon
                size={21}
                className="text-[#1565d8]"
              />

              {section.title}

              <span className="text-sm font-medium text-slate-500">
                ({section.items.length})
              </span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <article
                  key={`${item.type}-${item.id}`}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#1565d8] dark:text-blue-400">
                    {item.type === "job"
                      ? "Job"
                      : item.type === "service"
                        ? "Service"
                        : "Local Business"}
                  </p>

                  <h3 className="mt-2 font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {item.subtitle}
                  </p>

                  <p className="mt-3 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0"
                    />
                    <span>{item.location}</span>
                  </p>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                    <Link
                      href={item.href}
                      className="rounded-xl bg-[#1565d8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Details
                    </Link>

                    <RemoveSavedListingButton
                      listingId={item.id}
                      listingType={item.type}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
