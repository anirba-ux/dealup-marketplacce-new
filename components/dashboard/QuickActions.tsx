import {
  Package,
  Heart,
  MessageCircle,
  PlusCircle,
} from "lucide-react";

import ActionCard from "./ActionCard";

export default function QuickActions() {
  return (
    <section className="mt-12">
      <h2 className="mb-6 text-3xl font-bold">
        Quick Actions
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard
          title="My Ads"
          description="Manage your posted products."
          href="/dashboard/my-ads"
          icon={<Package size={28} />}
        />

        <ActionCard
          title="Wishlist"
          description="View saved products."
          href="/wishlist"
          icon={<Heart size={28} />}
        />

        <ActionCard
          title="Messages"
          description="Chat with buyers and sellers."
          href="/messages"
          icon={<MessageCircle size={28} />}
        />

        <ActionCard
          title="Sell Product"
          description="Post a new product instantly."
          href="/sell"
          icon={<PlusCircle size={28} />}
        />
      </div>
    </section>
  );
}