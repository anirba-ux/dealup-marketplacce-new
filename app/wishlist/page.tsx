import { auth } from "@/auth";
import { redirect } from "next/navigation";

import WishlistGrid from "@/components/wishlist/WishlistGrid";

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user || !(session.user as any).id) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">
        ❤️ My Wishlist
      </h1>

      <WishlistGrid />
    </div>
  );
}