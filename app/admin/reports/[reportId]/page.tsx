import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/db/mongodb";
import ReportStatusActions from "@/components/admin/ReportStatusActions";

interface PageProps {
  params: Promise<{
    reportId: string;
  }>;
}

const reasonLabels: Record<string, string> = {
  spam: "Spam or misleading",
  fake: "Fake product",
  duplicate: "Duplicate listing",
  wrong_category: "Wrong category",
  scam: "Scam or fraud",
  sold: "Already sold",
  other: "Other",
};

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "Pending",
    className: "border-yellow-200 bg-yellow-100 text-yellow-700",
  },

  reviewing: {
    label: "Reviewing",
    className: "border-blue-200 bg-blue-100 text-blue-700",
  },

  resolved: {
    label: "Resolved",
    className: "border-green-200 bg-green-100 text-green-700",
  },

  rejected: {
    label: "Rejected",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
};

export default async function AdminReportReviewPage({ params }: PageProps) {
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

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Admin access is required to review reports.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // Params
  // =====================================================

  const { reportId } = await params;

  // =====================================================
  // Validate Report ID
  // =====================================================

  if (!ObjectId.isValid(reportId)) {
    notFound();
  }

  // =====================================================
  // Database
  // =====================================================

  const client = await clientPromise;
  const db = client.db("dealup");

  // =====================================================
  // Find Report
  // =====================================================

  const report = await db.collection("reports").findOne({
    _id: new ObjectId(reportId),
  });

  if (!report) {
    notFound();
  }

  // =====================================================
  // Product
  // =====================================================

  let product: any = null;

  if (report.productId && ObjectId.isValid(report.productId)) {
    product = await db.collection("products").findOne({
      _id: new ObjectId(report.productId),
    });
  }

  // =====================================================
  // Seller
  // =====================================================

  let seller: any = null;

  if (report.sellerId && ObjectId.isValid(report.sellerId)) {
    seller = await db.collection("users").findOne({
      _id: new ObjectId(report.sellerId),
    });
  }

  // =====================================================
  // Reporter
  // =====================================================

  let reporter: any = null;

  if (report.reportedBy && ObjectId.isValid(report.reportedBy)) {
    reporter = await db.collection("users").findOne({
      _id: new ObjectId(report.reportedBy),
    });
  }

  // =====================================================
  // Status
  // =====================================================

  const status = statusConfig[report.status] ?? {
    label: report.status,
    className: "border-slate-200 bg-slate-100 text-slate-600",
  };

  // =====================================================
  // Page
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl">
        {/* =================================================
            Back
        ================================================= */}

        <Link
          href="/admin/reports"
          className="text-sm font-semibold text-[#1565d8] hover:underline"
        >
          ← Back to Reports
        </Link>

        {/* =================================================
            Header
        ================================================= */}

        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                  🚩 Product Report
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
                {reasonLabels[report.reason] ?? report.reason}
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Report submitted on{" "}
                {new Date(report.createdAt).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <p className="font-semibold">Report ID</p>

              <p className="mt-1 break-all">{reportId}</p>
            </div>
          </div>
        </div>

        {/* =================================================
            Report Details
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Report Details
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* Reason */}

            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reason
              </p>

              <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                {reasonLabels[report.reason] ?? report.reason}
              </p>
            </div>

            {/* Status */}

            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Current Status
              </p>

              <div className="mt-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                >
                  {status.label}
                </span>
              </div>
            </div>
          </div>

          {/* Message */}

          <div className="mt-5 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Additional Details
            </p>

            {report.message ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
                {report.message}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                No additional details were provided.
              </p>
            )}
          </div>
        </section>

        {/* =================================================
            Product
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                📦 Reported Product
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Product involved in this report.
              </p>
            </div>

            {product && product.slug && (
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                View Product ↗
              </Link>
            )}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Product Title
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
              {product?.title ?? "Product not found"}
            </p>

            <p className="mt-3 break-all text-xs text-slate-400">
              Product ID: {report.productId}
            </p>
          </div>
        </section>

        {/* =================================================
            Seller
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            👤 Seller Information
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Seller Name
              </p>

              <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                {seller?.name ?? "Seller not found"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Seller Email
              </p>

              <p className="mt-2 break-all font-semibold text-slate-900 dark:text-white">
                {seller?.email ?? "Email not available"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Seller ID
            </p>

            <p className="mt-2 break-all text-xs text-slate-500">
              {report.sellerId}
            </p>
          </div>
        </section>

        {/* =================================================
            Reporter
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            👤 Reporter Information
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reporter Name
              </p>

              <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                {reporter?.name ?? "User not found"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reporter Email
              </p>

              <p className="mt-2 break-all font-semibold text-slate-900 dark:text-white">
                {reporter?.email ?? "Email not available"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Reporter ID
            </p>

            <p className="mt-2 break-all text-xs text-slate-500">
              {report.reportedBy}
            </p>
          </div>
        </section>

        {/* =================================================
            Admin Actions
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            ⚙️ Admin Actions
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Change the report status after reviewing the product and submitted
            information.
          </p>

          <div className="mt-6">
            <ReportStatusActions
              reportId={reportId}
              currentStatus={report.status}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
