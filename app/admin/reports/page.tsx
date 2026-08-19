import Link from "next/link";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";

import { findAllReports } from "@/lib/repositories/report.repository";

interface PageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

const statusOptions = [
  "all",
  "pending",
  "reviewing",
  "resolved",
  "rejected",
] as const;

type StatusFilter =
  (typeof statusOptions)[number];

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-700 border-yellow-200",
  },

  reviewing: {
    label: "Reviewing",
    className:
      "bg-blue-100 text-blue-700 border-blue-200",
  },

  resolved: {
    label: "Resolved",
    className:
      "bg-green-100 text-green-700 border-green-200",
  },

  rejected: {
    label: "Rejected",
    className:
      "bg-slate-100 text-slate-600 border-slate-200",
  },
};

const reasonLabels: Record<
  string,
  string
> = {
  spam: "Spam or misleading",
  fake: "Fake product",
  duplicate: "Duplicate listing",
  wrong_category: "Wrong category",
  scam: "Scam or fraud",
  sold: "Already sold",
  other: "Other",
};

export default async function AdminReportsPage({
  searchParams,
}: PageProps) {
  // =====================================================
  // Authentication
  // =====================================================

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // =====================================================
  // Admin Authorization
  // =====================================================

  if (session.user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl dark:border-red-900 dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl dark:bg-red-950">
            🚫
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
            Access Denied
          </h1>

          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Admin access is required.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // Status Filter
  // =====================================================

  const params = await searchParams;

  const requestedStatus =
    params?.status ?? "all";

  const status: StatusFilter =
    statusOptions.includes(
      requestedStatus as StatusFilter,
    )
      ? (requestedStatus as StatusFilter)
      : "all";

  // =====================================================
  // Get Reports
  // =====================================================

  const rawReports =
    await findAllReports();

  // =====================================================
  // Filter Reports
  // =====================================================

  const reports =
    status === "all"
      ? rawReports
      : rawReports.filter(
          (report) =>
            report.status ===
            status,
        );

  // =====================================================
  // Statistics
  // =====================================================

  const totalReports =
    rawReports.length;

  const pendingReports =
    rawReports.filter(
      (report) =>
        report.status ===
        "pending",
    ).length;

  const reviewingReports =
    rawReports.filter(
      (report) =>
        report.status ===
        "reviewing",
    ).length;

  const resolvedReports =
    rawReports.filter(
      (report) =>
        report.status ===
        "resolved",
    ).length;

  const rejectedReports =
    rawReports.filter(
      (report) =>
        report.status ===
        "rejected",
    ).length;

  // =====================================================
  // Load Product + User Information
  // =====================================================

  const client =
    await clientPromise;

  const db =
    client.db("dealup");

  const enrichedReports =
    await Promise.all(
      reports.map(
        async (report) => {
          let productTitle =
            "Unknown Product";

          let sellerName =
            "Unknown Seller";

          let reporterName =
            "Unknown User";

          // =============================================
          // Product
          // =============================================

          if (
            ObjectId.isValid(
              report.productId,
            )
          ) {
            const product =
              await db
                .collection(
                  "products",
                )
                .findOne({
                  _id:
                    new ObjectId(
                      report.productId,
                    ),
                });

            if (product) {
              productTitle =
                product.title ??
                "Unknown Product";
            }
          }

          // =============================================
          // Seller
          // =============================================

          if (
            ObjectId.isValid(
              report.sellerId,
            )
          ) {
            const seller =
              await db
                .collection(
                  "users",
                )
                .findOne({
                  _id:
                    new ObjectId(
                      report.sellerId,
                    ),
                });

            if (seller) {
              sellerName =
                seller.name ??
                "Unknown Seller";
            }
          }

          // =============================================
          // Reporter
          // =============================================

          if (
            ObjectId.isValid(
              report.reportedBy,
            )
          ) {
            const reporter =
              await db
                .collection(
                  "users",
                )
                .findOne({
                  _id:
                    new ObjectId(
                      report.reportedBy,
                    ),
                });

            if (reporter) {
              reporterName =
                reporter.name ??
                "Unknown User";
            }
          }

          return {
            ...report,

            productTitle,

            sellerName,

            reporterName,

            reportId:
              report._id?.toString() ??
              "",
          };
        },
      ),
    );

  // =====================================================
  // Page
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        {/* =================================================
            Header
        ================================================= */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-semibold text-[#1565d8] hover:underline"
            >
              ← Admin Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              Product Reports
            </h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Review and manage reports submitted by
              DealUp users.
            </p>
          </div>
        </div>

        {/* =================================================
            Statistics
        ================================================= */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Total */}

          <Link
            href="/admin/reports"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-sm font-medium text-slate-500">
              Total Reports
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {totalReports}
            </p>
          </Link>

          {/* Pending */}

          <Link
            href="/admin/reports?status=pending"
            className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-yellow-900 dark:bg-yellow-950/30"
          >
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-800 dark:text-yellow-300">
              {pendingReports}
            </p>
          </Link>

          {/* Reviewing */}

          <Link
            href="/admin/reports?status=reviewing"
            className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-blue-900 dark:bg-blue-950/30"
          >
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Reviewing
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-800 dark:text-blue-300">
              {reviewingReports}
            </p>
          </Link>

          {/* Resolved */}

          <Link
            href="/admin/reports?status=resolved"
            className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-green-900 dark:bg-green-950/30"
          >
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-800 dark:text-green-300">
              {resolvedReports}
            </p>
          </Link>

          {/* Rejected */}

          <Link
            href="/admin/reports?status=rejected"
            className="rounded-2xl border border-slate-200 bg-slate-100 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Rejected
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
              {rejectedReports}
            </p>
          </Link>
        </div>

        {/* =================================================
            Filter
        ================================================= */}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(
              (filter) => {
                const active =
                  status === filter;

                const href =
                  filter === "all"
                    ? "/admin/reports"
                    : `/admin/reports?status=${filter}`;

                return (
                  <Link
                    key={filter}
                    href={href}
                    className={`
                      rounded-full
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      transition

                      ${
                        active
                          ? "bg-[#1565d8] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }
                    `}
                  >
                    {filter === "all"
                      ? "All"
                      : filter
                          .charAt(0)
                          .toUpperCase() +
                        filter.slice(1)}
                  </Link>
                );
              },
            )}
          </div>
        </div>

        {/* =================================================
            Reports
        ================================================= */}

        <div className="mt-8">
          {enrichedReports.length ===
          0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="text-5xl">
                ✅
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                No Reports Found
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                There are no reports matching this
                filter.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {enrichedReports.map(
                (report) => {
                  const config =
                    statusConfig[
                      report.status
                    ];

                  return (
                    <div
                      key={
                        report.reportId
                      }
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                    >
                      {/* Top */}

                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                              🚩 Report
                            </span>

                            <span
                              className={`
                                rounded-full
                                border
                                px-3
                                py-1
                                text-xs
                                font-bold
                                ${config?.className ?? ""}
                              `}
                            >
                              {config?.label ??
                                report.status}
                            </span>
                          </div>

                          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                            {reasonLabels[
                              report.reason
                            ] ??
                              report.reason}
                          </h2>
                        </div>

                        <p className="text-xs text-slate-400">
                          {new Date(
                            report.createdAt,
                          ).toLocaleString(
                            "en-IN",
                          )}
                        </p>
                      </div>

                      {/* Information */}

                      <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {/* Product */}

                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Product
                          </p>

                          <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                            {report.productTitle}
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-400">
                            ID:{" "}
                            {
                              report.productId
                            }
                          </p>
                        </div>

                        {/* Seller */}

                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Seller
                          </p>

                          <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                            {report.sellerName}
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-400">
                            ID:{" "}
                            {
                              report.sellerId
                            }
                          </p>
                        </div>

                        {/* Reporter */}

                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Reported By
                          </p>

                          <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                            {
                              report.reporterName
                            }
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-400">
                            ID:{" "}
                            {
                              report.reportedBy
                            }
                          </p>
                        </div>
                      </div>

                      {/* Message */}

                      {report.message && (
                        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Additional Details
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                            {report.message}
                          </p>
                        </div>
                      )}

                      {/* Action */}

                      <div className="mt-6 flex justify-end">
                        <Link
                          href={`/admin/reports/${report.reportId}`}
                          className="rounded-xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f52ba]"
                        >
                          Review Report →
                        </Link>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}