import { notFound } from "next/navigation";

import { auth } from "@/auth";

import ProductForm from "@/components/product/ProductForm";

import { findProductById } from "@/lib/repositories/product.repository";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

     console.log("✅ Edit route loaded");
  // ===============================
  // Authentication
  // ===============================

  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold text-red-600">Unauthorized</h1>

        <p className="mt-3 text-slate-600">
          Please login to edit your product.
        </p>
      </main>
    );
  }

  // ===============================
  // Params
  // ===============================

  const { id } = await params;

  // ===============================
  // Find Product
  // ===============================

  const product = await findProductById(id);

  if (!product) {
    notFound();
  }

  // ===============================
  // Owner Check
  // ===============================

  if (product.sellerId !== session.user.id) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>

        <p className="mt-3 text-slate-600">
          You are not allowed to edit this product.
        </p>
      </main>
    );
  }

  // ===============================
  // Convert Mongo Object to Plain Object
  // ===============================

  const productData = {
    ...product,
    _id: product._id?.toString(),
  };

  // ===============================
  // Page
  // ===============================

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="mb-8 text-4xl font-bold text-slate-900 dark:text-white dark:text-white">Edit Product</h1>

        <ProductForm mode="edit" initialData={productData} />
      </div>
    </main>
  );
}
