import {
  Package,
  Heart,
  MessageCircle,
  PlusCircle,
} from "lucide-react";

import ActionCard from "./ActionCard";

export default function QuickActions() {
  return (
    <section className="mt-0">
      {/* Header */}

      <div
        className="
          mb-4
          flex
          items-end
          justify-between
          gap-3
          sm:mb-5
        "
      >
        <div>
          <h2
            className="
              text-xl
              font-bold
              tracking-tight
              text-slate-900
              sm:text-2xl
              lg:text-3xl
              dark:text-white
            "
          >
            Quick Actions
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-slate-500
              sm:text-sm
              dark:text-slate-400
            "
          >
            Quickly access your marketplace activities.
          </p>
        </div>
      </div>

      {/* Action Cards */}

      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          sm:gap-4
          xl:grid-cols-4
          xl:gap-5
        "
      >
        <ActionCard
          title="My Ads"
          description="Manage your posted products."
          href="/dashboard/my-ads"
          icon={<Package size={22} />}
        />

        <ActionCard
          title="Wishlist"
          description="View saved products."
          href="/wishlist"
          icon={<Heart size={22} />}
        />

        <ActionCard
          title="Messages"
          description="Chat with buyers and sellers."
          href="/messages"
          icon={<MessageCircle size={22} />}
        />

        <ActionCard
          title="Sell Product"
          description="Post a new product instantly."
          href="/sell"
          icon={<PlusCircle size={22} />}
        />
      </div>
    </section>
  );
}