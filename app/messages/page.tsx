
import Link from "next/link";
import { Home, MessageCircle } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import BackButton from "@/components/ui/BackButton";
import { getConversationList } from "@/lib/repositories/chat.repository";

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const t = await getTranslations("common");
  const userId = (session.user as any).id;
  const conversations = await getConversationList(userId);

  return (
    <main
      className="
        mx-auto min-h-screen max-w-5xl
        px-4 py-6 sm:px-6 sm:py-8
        text-slate-900 dark:text-white
      "
    >
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between">
          <BackButton />

          <Link
            href="/"
            className="
              inline-flex items-center gap-2 rounded-xl
              border border-slate-200 bg-white px-3 py-2
              text-sm font-semibold text-slate-700 shadow-sm
              transition-all duration-200
              hover:-translate-y-0.5 hover:border-[#1565d8]/30
              hover:bg-blue-50 hover:text-[#1565d8] hover:shadow-md
              active:scale-95
              dark:border-white/10 dark:bg-white/5
              dark:text-slate-200 dark:hover:bg-[#1565d8]/10
              dark:hover:text-white
            "
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>Home</span>
          </Link>
        </div>

        <h1
          className="
            mt-6 text-center text-3xl font-extrabold
            tracking-tight text-slate-900
            sm:mt-7 sm:text-4xl dark:text-white
          "
        >
          {t("myMessages")}
        </h1>
      </div>

      {/* Conversations */}
      {conversations.length === 0 ? (
        <div
          className="
            rounded-2xl border border-slate-200 bg-white
            p-8 text-center shadow-sm sm:p-10
            dark:border-white/10 dark:bg-slate-900
          "
        >
          <MessageCircle
            className="mx-auto mb-3 h-10 w-10 text-slate-400"
            aria-hidden="true"
          />
          <p className="text-slate-500 dark:text-slate-400">
            {t("noConversations")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation: any) => {
            const isSeller = conversation.sellerId === userId;

            const unreadCount = isSeller
              ? conversation.unreadCountSeller ?? 0
              : conversation.unreadCountBuyer ?? 0;

            const participantName = isSeller
              ? conversation.buyer?.name
              : conversation.seller?.name;

            const listing = conversation.product;
            const listingType = conversation.listingType ?? "product";

            const listingTitle =
              listing?.title ||
              (listingType === "business" ? "Business listing" : "Service listing");

            const listingPrice = listing?.price;
            const listingImage = listing?.thumbnail;

            const updatedAt = conversation.updatedAt
              ? new Date(conversation.updatedAt)
              : null;

            const dateLabel =
              updatedAt && !Number.isNaN(updatedAt.getTime())
                ? updatedAt.toLocaleDateString("en-IN")
                : "";

            return (
              <Link
                key={conversation._id.toString()}
                href={`/messages/${conversation._id}`}
                className="block"
              >
                <div
                  className="
                    group cursor-pointer rounded-2xl
                    border border-slate-200 bg-white p-3.5
                    shadow-sm transition-all duration-200
                    hover:-translate-y-0.5 hover:border-[#1565d8]/30
                    hover:shadow-lg sm:p-4
                    dark:border-white/10 dark:bg-slate-900
                    dark:hover:border-[#1565d8]/40
                    dark:hover:bg-slate-800
                  "
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Listing Image */}
                    <div
                      className="
                        flex h-20 w-20 shrink-0 items-center justify-center
                        overflow-hidden rounded-xl bg-slate-100
                        sm:h-24 sm:w-24 dark:bg-slate-800
                      "
                    >
                      {listingImage ? (
                        <img
                          src={listingImage}
                          alt={listingTitle}
                          className="
                            h-full w-full object-cover
                            transition-transform duration-300
                            group-hover:scale-105
                          "
                        />
                      ) : (
                        <MessageCircle
                          className="h-8 w-8 text-slate-400"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Conversation Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1">
                        <span
                          className="
                            inline-flex rounded-md bg-blue-50 px-2 py-0.5
                            text-[10px] font-semibold uppercase tracking-wide
                            text-[#1565d8] dark:bg-blue-950/40
                            dark:text-blue-300
                          "
                        >
                          {listingType === "product"
                            ? "Product"
                            : listingType === "business"
                              ? "Business"
                              : "Service"}
                        </span>
                      </div>

                      <h2
                        className="
                          line-clamp-2 text-sm font-bold leading-5
                          text-slate-900 sm:text-base dark:text-white
                        "
                      >
                        {listingTitle}
                      </h2>

                      {listingPrice != null &&
                        Number.isFinite(Number(listingPrice)) && (
                          <p className="mt-1 text-sm font-bold text-[#1565d8] sm:text-base">
                            ₹{" "}
                            {Number(listingPrice).toLocaleString("en-IN")}
                          </p>
                        )}

                      <p
                        className="
                          mt-1 line-clamp-1 text-xs text-slate-500
                          sm:text-sm dark:text-slate-400
                        "
                      >
                        <span className="font-semibold">
                          {isSeller ? "Buyer" : "Seller"}:
                        </span>{" "}
                        {participantName || "User"}
                      </p>

                      <p
                        className="
                          mt-2 line-clamp-1 text-sm text-slate-600
                          dark:text-slate-300
                        "
                      >
                        {conversation.lastMessage || t("noMessagesYet")}
                      </p>
                    </div>

                    {/* Date + Unread */}
                    <div className="flex shrink-0 flex-col items-end justify-between">
                      <p
                        className="
                          whitespace-nowrap text-[11px] text-slate-400
                          sm:text-xs dark:text-slate-500
                        "
                      >
                        {dateLabel}
                      </p>

                      {unreadCount > 0 && (
                        <span
                          className="
                            inline-flex min-h-6 min-w-6 items-center
                            justify-center rounded-full bg-[#1565d8]
                            px-1.5 text-xs font-bold text-white shadow-sm
                          "
                        >
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
