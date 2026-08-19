import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProductForm from "@/components/product/ProductForm";

export default async function SellPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef6ff] py-14">
      {/* Background Blur */}

      <div className="absolute left-[-180px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#1565d8]/20 blur-[140px]" />

      <div className="absolute bottom-[-150px] right-[-120px] h-[420px] w-[420px] rounded-full bg-sky-400/20 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">

        {/* Header */}

        <div className="mb-12 text-center">

          <div className="inline-flex items-center rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold text-[#1565d8]">
            🚀 DealUp Marketplace
          </div>

          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white dark:text-white">
            Sell Your Product
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Publish your product and connect with thousands of buyers across India.
          </p>

        </div>

        {/* Card */}

        <div className="rounded-[32px] border border-white/60 bg-white dark:bg-slate-900/95 p-10 shadow-[0_30px_80px_rgba(21,101,216,0.18)] backdrop-blur-xl">
          <ProductForm />
        </div>

      </div>
    </main>
  );
}