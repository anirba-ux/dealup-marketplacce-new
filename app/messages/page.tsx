import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

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
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-8 text-3xl font-bold">{t("myMessages")}</h1>

      {conversations.length === 0 ? (
        <div className="rounded-xl border bg-white dark:bg-slate-900 p-10 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            {t("noConversations")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation: any) => (
            <Link
              key={conversation._id.toString()}
              href={`/messages/${conversation._id}`}
            >
              <div className="cursor-pointer rounded-xl border bg-white dark:bg-slate-900 p-4 transition hover:shadow-md">
                <div className="flex gap-4">
                  <img
                    src={conversation.product.thumbnail}
                    alt={conversation.product.title}
                    className="h-20 w-20 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <h2 className="font-bold">{conversation.product.title}</h2>

                    <p className="text-blue-600 font-semibold">
                      ₹ {conversation.product.price.toLocaleString("en-IN")}
                    </p>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-medium">
                        {conversation.sellerId === userId ? "Buyer" : "Seller"}:
                      </span>{" "}
                      {conversation.sellerId === userId
                        ? conversation.buyer?.name
                        : conversation.seller?.name}
                    </p>

                    <p className="mt-2 text-slate-600 line-clamp-1">
                      {conversation.lastMessage || t("noMessagesYet")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </p>

                    {(conversation.sellerId === userId
                      ? conversation.unreadCountSeller
                      : conversation.unreadCountBuyer) > 0 && (
                      <span className="mt-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                        {conversation.sellerId === userId
                          ? conversation.unreadCountSeller
                          : conversation.unreadCountBuyer}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
