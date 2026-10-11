
import Link from "next/link";
import { ObjectId, type Document } from "mongodb";
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  MapPin,
  Store,
  Wrench,
} from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";
import RemoveSavedListingButton from "@/components/wishlist/RemoveSavedListingButton";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ListingType = "job" | "service" | "business";

interface SavedRecord {
  listingId: string;
  listingType: ListingType;
}

interface SavedListingDocument {
  userId: string;
  listingId: string;
  listingType: ListingType;
  createdAt?: Date;
}

interface ListingCardData {
  id: string;
  type: ListingType;
  title: string;
  subtitle: string;
  location: string;
  href: string;
  image?: string;
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

function getLocation(location?: ListingLocation): string {
  return (
    [location?.city, location?.district, location?.state]
      .filter(
        (part): part is string =>
          typeof part === "string" && part.trim().length > 0,
      )
      .join(", ") || "Location not specified"
  );
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

function SavedCard({ item }: { item: ListingCardData }) {
  const Icon =
    item.type === "job"
      ? BriefcaseBusiness
      : item.type === "business"
        ? Store
        : Wrench;

  const label =
    item.type === "job"
      ? "Saved Job"
      : item.type === "business"
        ? "Local Business"
        : "Service";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-[#1565d8] dark:bg-blue-950/50 dark:text-blue-400">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon size={23} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#1565d8] dark:text-blue-400">
            {label}
          </p>

          <h2 className="mt-1 line-clamp-2 font-bold text-slate-900 dark:text-white">
            {item.title}
          </h2>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {item.subtitle}
        </p>

        <div className="mt-3 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
          <MapPin size={16} className="mt-0.5 shrink-0" />
          <span>{item.location}</span>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <Link
            href={item.href}
            className="inline-flex items-center rounded-xl bg-[#1565d8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            View Details
          </Link>

          <RemoveSavedListingButton
            listingId={item.id}
            listingType={item.type}
          />
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
      <Bookmark
        size={38}
        className="mx-auto text-slate-400"
      />

      <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
        No saved listings yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Save a job, service or local business using the
        save button. Your saved listings will appear here.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/jobs"
          className="rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Explore Jobs
        </Link>

        <Link
          href="/search?listingType=service"
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Explore Services
        </Link>
      </div>
    </section>
  );
}

export default async function SavedListingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = String(session.user.id);
  const client = await clientPromise;
  const db = client.db("dealup");

  // Load the current user's saved records.
  const savedDocuments = await db
    .collection<SavedListingDocument>("savedListings")
    .find(
      { userId },
      {
        projection: {
          _id: 0,
          listingId: 1,
          listingType: 1,
        },
      },
    )
    .sort({ createdAt: -1 })
    .toArray();

  // Validate the saved records before querying the listings.
  const savedRecords: SavedRecord[] = savedDocuments
    .filter(
      (item) =>
        typeof item.listingId === "string" &&
        isListingType(item.listingType),
    )
    .map((item) => ({
      listingId: item.listingId,
      listingType: item.listingType,
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

  // Fetch active jobs and active services/businesses.
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

  const jobById = new Map(
    jobs.map((job) => [job._id.toString(), job]),
  );

  const serviceById = new Map(
    services.map((service) => [
      service._id.toString(),
      service,
    ]),
  );

  // Explicit flatMap return type prevents TypeScript
  // from incorrectly inferring only the "job" type.
  const listings = savedRecords.flatMap<ListingCardData>(
    (saved) => {
      if (!ObjectId.isValid(saved.listingId)) {
        return [];
      }

      const id = new ObjectId(saved.listingId).toString();

      if (saved.listingType === "job") {
        const job = jobById.get(id);

        if (!job) {
          return [];
        }

        const positions = Array.isArray(job.jobs)
          ? job.jobs
          : [];

        const position = positions[0];

        const title =
          getString(position?.title) || "Job Opportunity";

        const subtitle =
          getString(job.employer?.companyName) ||
          getString(job.employerName) ||
          "Company";

        const image =
          getString(job.thumbnail?.url) ||
          getString(job.infographic?.url);

        return [
          {
            id,
            type: "job",
            title,
            subtitle,
            location: getLocation(job.location),
            href: `/jobs/${id}`,
            image,
          },
        ];
      }

      const service = serviceById.get(id);

      if (
        !service ||
        service.listingType !== saved.listingType
      ) {
        return [];
      }

      const isBusiness = saved.listingType === "business";

      const title = isBusiness
        ? getString(service.businessName) ||
          getString(service.title) ||
          "Local Business"
        : getString(service.title) || "Service";

      const subtitle =
        getString(service.category) ||
        (isBusiness ? "Local Business" : "Service");

      const slug = getString(service.slug);

      const image =
        getString(service.thumbnail) ||
        (Array.isArray(service.images)
          ? service.images
              .map((entry: { url?: unknown }) =>
                getString(entry?.url),
              )
              .find(Boolean)
          : undefined);

      return [
        {
          id,
          type: saved.listingType,
          title,
          subtitle,
          location: getLocation(service.location),
          href: slug
            ? `/services/${encodeURIComponent(slug)}`
            : "/search",
          image,
        },
      ];
    },
  );

  const savedJobs = listings.filter(
    (item) => item.type === "job",
  );

  const savedServices = listings.filter(
    (item) => item.type === "service",
  );

  const savedBusinesses = listings.filter(
    (item) => item.type === "business",
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#1565d8] dark:text-slate-300 dark:hover:text-blue-400"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <header className="mt-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1565d8]/10 text-[#1565d8] dark:text-blue-400">
              <Bookmark size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Saved Listings
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your saved jobs, services and local businesses.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-blue-100 px-3 py-1.5 font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              Jobs: {savedJobs.length}
            </span>

            <span className="rounded-full bg-amber-100 px-3 py-1.5 font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Services: {savedServices.length}
            </span>

            <span className="rounded-full bg-purple-100 px-3 py-1.5 font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              Businesses: {savedBusinesses.length}
            </span>
          </div>
        </header>

        {listings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 space-y-10">
            {savedJobs.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                  <BriefcaseBusiness
                    size={21}
                    className="text-[#1565d8]"
                  />
                  Saved Jobs
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {savedJobs.map((item) => (
                    <SavedCard
                      key={`${item.type}-${item.id}`}
                      item={item}
                    />
                  ))}
                </div>
              </section>
            )}

            {savedServices.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                  <Wrench
                    size={21}
                    className="text-[#1565d8]"
                  />
                  Saved Services
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {savedServices.map((item) => (
                    <SavedCard
                      key={`${item.type}-${item.id}`}
                      item={item}
                    />
                  ))}
                </div>
              </section>
            )}

            {savedBusinesses.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                  <Store
                    size={21}
                    className="text-[#1565d8]"
                  />
                  Saved Local Businesses
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {savedBusinesses.map((item) => (
                    <SavedCard
                      key={`${item.type}-${item.id}`}
                      item={item}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
