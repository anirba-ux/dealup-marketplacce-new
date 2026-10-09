
import Link from "next/link";
import { notFound } from "next/navigation";

import { findServiceBySlug } from "@/lib/repositories/service.repository";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ServiceDetailsPage({
  params,
}: Props) {
  const { slug } = await params;

  const service = await findServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const image =
    service.thumbnail ||
    service.images?.find((item) => item.url)?.url;

  const location = [
    service.location?.city,
    service.location?.district,
  ]
    .filter(Boolean)
    .filter(
      (value, index, array) =>
        array.indexOf(value) === index,
    )
    .join(", ");

  const price =
    service.priceOnRequest ||
    service.startingPrice == null
      ? "Price on request"
      : `₹${new Intl.NumberFormat("en-IN").format(
          service.startingPrice,
        )}${
          service.priceUnit
            ? ` / ${service.priceUnit}`
            : ""
        }`;

  return (
    <main className="min-h-screen bg-white px-4 py-8 dark:bg-slate-950 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Home
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={service.title}
              className="max-h-[460px] w-full object-cover"
            />
          )}

          <div className="p-5 sm:p-8">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {service.category}
              {service.subcategory
                ? ` · ${service.subcategory}`
                : ""}
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {service.listingType === "business"
                ? service.businessName || service.title
                : service.title}
            </h1>

            <p className="mt-3 text-xl font-bold text-blue-600 dark:text-blue-400">
              {price}
            </p>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              📍 {location || "Location not specified"}
            </p>

            <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                About this listing
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                {service.description}
              </p>
            </div>

            {service.servicesOffered?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Services Offered
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  {service.servicesOffered.map(
                    (item, index) => (
                      <span
                        key={`${item}-${index}`}
                        className="rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-slate-200 pt-6 dark:border-slate-800">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Provider Information
              </h2>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {service.businessName || service.sellerName}
              </p>

              {service.yearsOfExperience != null && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Experience: {service.yearsOfExperience} years
                </p>
              )}

              {service.contact?.phone && (
                <a
                  href={`tel:${service.contact.phone}`}
                  className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Contact Provider
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
