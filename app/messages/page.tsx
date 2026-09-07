import Link from "next/link";
import { Home } from "lucide-react";
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
        px-4 py-6
        text-slate-900
        sm:px-6 sm:py-8
        dark:text-white
      "
    >
      {/* =================================================
    Header
================================================= */}

      <div className="mb-8 sm:mb-10">
        {/* Back + Home */}
        <div className="flex items-center justify-between">
          <BackButton />

          <Link
            href="/"
            className="
        inline-flex items-center gap-2
        rounded-xl
        border border-slate-200
        bg-white
        px-3 py-2
        text-sm font-semibold
        text-slate-700
        shadow-sm
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-[#1565d8]/30
        hover:bg-blue-50
        hover:text-[#1565d8]
        hover:shadow-md
        active:scale-95
        dark:border-white/10
        dark:bg-white/5
        dark:text-slate-200
        dark:hover:border-[#1565d8]/40
        dark:hover:bg-[#1565d8]/10
        dark:hover:text-white
      "
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>Home</span>
          </Link>
        </div>

        {/* Center Heading */}
        <h1
          className="
      mt-6
      text-center
      text-3xl font-extrabold
      tracking-tight
      text-slate-900
      sm:mt-7 sm:text-4xl
      dark:text-white
    "
        >
          {t("myMessages")}
        </h1>
      </div>

      {/* =================================================
          Conversations
      ================================================= */}

      {conversations.length === 0 ? (
        <div
          className="
            rounded-2xl
            border border-slate-200
            bg-white
            p-8 text-center
            shadow-sm
            sm:p-10
            dark:border-white/10
            dark:bg-slate-900
          "
        >
          <p className="text-slate-500 dark:text-slate-400">
            {t("noConversations")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation: any) => {
            const unreadCount =
              conversation.sellerId === userId
                ? conversation.unreadCountSeller
                : conversation.unreadCountBuyer;

            const participantName =
              conversation.sellerId === userId
                ? conversation.buyer?.name
                : conversation.seller?.name;

            return (
              <Link
                key={conversation._id.toString()}
                href={`/messages/${conversation._id}`}
                className="block"
              >
                <div
                  className="
                    group
                    cursor-pointer
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    p-3.5
                    shadow-sm
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:border-[#1565d8]/30
                    hover:shadow-lg
                    sm:p-4
                    dark:border-white/10
                    dark:bg-slate-900
                    dark:hover:border-[#1565d8]/40
                    dark:hover:bg-slate-800
                  "
                >
                  <div className="flex gap-3 sm:gap-4">
                    {/* Product Image */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24 dark:bg-slate-800">
                      <img
                        src={conversation.product.thumbnail}
                        alt={conversation.product.title}
                        className="
                          h-full w-full
                          object-cover
                          transition-transform duration-300
                          group-hover:scale-105
                        "
                      />
                    </div>

                    {/* Conversation Content */}
                    <div className="min-w-0 flex-1">
                      <h2
                        className="
                          line-clamp-2
                          text-sm font-bold
                          leading-5
                          text-slate-900
                          sm:text-base
                          dark:text-white
                        "
                      >
                        {conversation.product.title}
                      </h2>

                      <p className="mt-1 text-sm font-bold text-[#1565d8] sm:text-base">
                        ₹ {conversation.product.price.toLocaleString("en-IN")}
                      </p>

                      <p className="mt-1 line-clamp-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                        <span className="font-semibold">
                          {conversation.sellerId === userId
                            ? "Buyer"
                            : "Seller"}
                          :
                        </span>{" "}
                        {participantName || "User"}
                      </p>

                      <p
                        className="
                          mt-2
                          line-clamp-1
                          text-sm
                          text-slate-600
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
                          whitespace-nowrap
                          text-[11px]
                          text-slate-400
                          sm:text-xs
                          dark:text-slate-500
                        "
                      >
                        {new Date(conversation.updatedAt).toLocaleDateString(
                          "en-IN",
                        )}
                      </p>

                      {unreadCount > 0 && (
                        <span
                          className="
                            inline-flex
                            min-h-6 min-w-6
                            items-center justify-center
                            rounded-full
                            bg-[#1565d8]
                            px-1.5
                            text-xs font-bold
                            text-white
                            shadow-sm
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
