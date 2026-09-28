"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  ticketId?: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  count: number;
}

interface NotificationBellProps {
  variant?: "navbar" | "menu";
  onNavigate?: () => void;
}

export default function NotificationBell({
  variant = "navbar",
  onNavigate,
}: NotificationBellProps) {
  const router = useRouter();

  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // =========================================================
  // FETCH NOTIFICATIONS
  // =========================================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/notifications", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return;
      }

      const data: NotificationsResponse = await response.json();

      if (!data.success) {
        return;
      }

      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (error) {
      console.error(
        "[NOTIFICATIONS] Failed to fetch notifications:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD + AUTO REFRESH
  // =========================================================

  useEffect(() => {
    fetchNotifications();

    const interval = window.setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  // =========================================================
  // CLOSE OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  // =========================================================
  // MARK ONE AS READ
  // =========================================================

  const handleNotificationClick = async (
    notification: NotificationItem,
  ) => {
    try {
      if (!notification.read) {
        const response = await fetch(
          `/api/notifications/${notification.id}`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (response.ok) {
          setNotifications((previous) =>
            previous.map((item) =>
              item.id === notification.id
                ? {
                    ...item,
                    read: true,
                  }
                : item,
            ),
          );

          setUnreadCount((previous) =>
            Math.max(0, previous - 1),
          );
        }
      }

      setOpen(false);

      onNavigate?.();

      if (notification.ticketId) {
        router.push(
          `/dashboard/support/${notification.ticketId}`,
        );
      }
    } catch (error) {
      console.error(
        "[NOTIFICATIONS] Failed to process notification:",
        error,
      );
    }
  };

  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      const response = await fetch(
        "/api/notifications/read-all",
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        return;
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "[NOTIFICATIONS] Failed to mark all as read:",
        error,
      );
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatNotificationTime = (
    createdAt: string,
  ) => {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "support_ticket_reply":
        return "💬";

      case "support_ticket_created":
        return "🎫";

      case "support_ticket_status":
        return "🔔";

      case "support_ticket_assigned":
        return "👤";

      default:
        return "🔔";
    }
  };

  // =========================================================
  // MOBILE MENU VERSION
  // =========================================================

  if (variant === "menu") {
    return (
      <div
        ref={containerRef}
        className="relative w-full"
      >
        {/* Notification Row */}

        <button
          type="button"
          aria-label="Notifications"
          aria-expanded={open}
          onClick={() => setOpen((previous) => !previous)}
          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-sm
            font-medium
            text-slate-700
            transition
            duration-200
            hover:bg-blue-50
            hover:text-[#1565D8]
            dark:text-slate-200
            dark:hover:bg-[#1565D8]/10
            dark:hover:text-[#1976F3]
          "
        >
          {/* Bell Icon */}

          <span
            className="
              relative
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              text-[#1565D8]
              dark:bg-[#1565D8]/10
              dark:text-[#1976F3]
            "
          >
            <Bell
              size={19}
              strokeWidth={2}
            />

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-4
                  min-w-4
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  px-1
                  text-[9px]
                  font-bold
                  leading-none
                  text-white
                "
              >
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </span>

          <span className="flex-1 text-left">
            Notifications
          </span>

          {unreadCount > 0 && (
            <span
              className="
                rounded-full
                bg-red-50
                px-2
                py-1
                text-[10px]
                font-bold
                text-red-600
                dark:bg-red-950/30
                dark:text-red-400
              "
            >
              {unreadCount} new
            </span>
          )}
        </button>

        {/* ===================================================
            NOTIFICATION PANEL
        =================================================== */}

        {open && (
          <div
            className="
              mt-2
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-lg
              dark:border-slate-700
              dark:bg-slate-900
            "
          >
            {/* Header */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-200
                px-3
                py-3
                dark:border-slate-700
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Notifications
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "You're all caught up"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-lg
                      px-2
                      py-1.5
                      text-[10px]
                      font-semibold
                      text-blue-600
                      hover:bg-blue-50
                      dark:text-blue-400
                      dark:hover:bg-blue-950/40
                    "
                  >
                    <CheckCheck size={13} />
                    Mark all
                  </button>
                )}

                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() => setOpen(false)}
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    text-slate-500
                    hover:bg-slate-100
                    dark:hover:bg-slate-800
                  "
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* List */}

            <div className="max-h-[300px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div
                  className="
                    px-4
                    py-8
                    text-center
                    text-xs
                    text-slate-500
                  "
                >
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell
                    size={24}
                    className="
                      mx-auto
                      mb-2
                      text-slate-400
                    "
                  />

                  <p
                    className="
                      text-xs
                      font-semibold
                      text-slate-800
                      dark:text-white
                    "
                  >
                    No notifications
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-slate-500
                    "
                  >
                    New updates will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        notification,
                      )
                    }
                    className={`
                      flex
                      w-full
                      gap-2.5
                      border-b
                      border-slate-100
                      px-3
                      py-2.5
                      text-left
                      transition
                      last:border-b-0
                      dark:border-slate-800
                      ${
                        notification.read
                          ? "bg-white dark:bg-slate-900"
                          : "bg-blue-50/70 dark:bg-blue-950/20"
                      }
                      hover:bg-slate-50
                      dark:hover:bg-slate-800
                    `}
                  >
                    <span
                      className="
                        mt-0.5
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-slate-100
                        text-sm
                        dark:bg-slate-800
                      "
                    >
                      {getNotificationIcon(
                        notification.type,
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`
                          block
                          line-clamp-1
                          text-xs
                          ${
                            notification.read
                              ? "font-medium"
                              : "font-bold"
                          }
                          text-slate-900
                          dark:text-white
                        `}
                      >
                        {notification.title}
                      </span>

                      <span
                        className="
                          mt-0.5
                          block
                          line-clamp-2
                          text-[10px]
                          leading-4
                          text-slate-600
                          dark:text-slate-400
                        "
                      >
                        {notification.message}
                      </span>

                      <span
                        className="
                          mt-1
                          flex
                          items-center
                          justify-between
                          text-[9px]
                          text-slate-400
                        "
                      >
                        <span>
                          {formatNotificationTime(
                            notification.createdAt,
                          )}
                        </span>

                        {notification.ticketId && (
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-0.5
                              font-semibold
                              text-blue-600
                              dark:text-blue-400
                            "
                          >
                            View
                            <ExternalLink size={9} />
                          </span>
                        )}
                      </span>
                    </span>

                    {!notification.read && (
                      <span
                        className="
                          mt-1.5
                          h-1.5
                          w-1.5
                          shrink-0
                          rounded-full
                          bg-blue-600
                        "
                      />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // DESKTOP NAVBAR VERSION
  // =========================================================

  return (
    <div
      ref={containerRef}
      className="
        relative
        flex
        h-12
        shrink-0
        items-center
        justify-center
      "
    >
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="
          relative
          -translate-y-1
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          border
          border-slate-200
          bg-white
          transition
          hover:bg-slate-100
          active:scale-95
          dark:border-slate-700
          dark:bg-slate-900
          dark:hover:bg-slate-800
        "
      >
        <Bell
          className="h-5 w-5 text-[#1565d8]"
          strokeWidth={2}
        />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-5
              min-w-[20px]
              items-center
              justify-center
              rounded-full
              bg-red-500
              px-1
              text-[11px]
              font-bold
              leading-none
              text-white
            "
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* Desktop dropdown */}

      {open && (
        <div
          className="
            fixed
            right-3
            top-[4.25rem]
            z-[100]
            w-[calc(100vw-1.5rem)]
            max-w-[390px]
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-2xl
            dark:border-slate-700
            dark:bg-slate-900
            sm:absolute
            sm:right-0
            sm:top-full
            sm:mt-3
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-200
              px-4
              py-3
              dark:border-slate-700
            "
          >
            <div>
              <h3
                className="
                  text-sm
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Notifications
              </h3>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-lg
                    px-2
                    py-1.5
                    text-xs
                    font-semibold
                    text-blue-600
                    hover:bg-blue-50
                    dark:text-blue-400
                    dark:hover:bg-blue-950/40
                  "
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}

              <button
                type="button"
                aria-label="Close notifications"
                onClick={() => setOpen(false)}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-slate-500
                  hover:bg-slate-100
                  dark:hover:bg-slate-800
                "
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[430px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div
                className="
                  px-5
                  py-10
                  text-center
                  text-sm
                  text-slate-500
                "
              >
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Bell
                  size={28}
                  className="
                    mx-auto
                    mb-3
                    text-slate-400
                  "
                />

                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  No notifications
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  New updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    handleNotificationClick(
                      notification,
                    )
                  }
                  className={`
                    group
                    flex
                    w-full
                    gap-3
                    border-b
                    border-slate-100
                    px-4
                    py-3
                    text-left
                    transition
                    last:border-b-0
                    dark:border-slate-800
                    ${
                      notification.read
                        ? "bg-white dark:bg-slate-900"
                        : "bg-blue-50/70 dark:bg-blue-950/20"
                    }
                    hover:bg-slate-50
                    dark:hover:bg-slate-800/70
                  `}
                >
                  <div
                    className="
                      mt-0.5
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-50
                      text-base
                      dark:bg-blue-950/40
                    "
                  >
                    {getNotificationIcon(
                      notification.type,
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p
                        className={`
                          line-clamp-1
                          flex-1
                          text-sm
                          ${
                            notification.read
                              ? "font-medium"
                              : "font-bold"
                          }
                          text-slate-900
                          dark:text-white
                        `}
                      >
                        {notification.title}
                      </p>

                      {!notification.read && (
                        <span
                          className="
                            mt-1.5
                            h-2
                            w-2
                            shrink-0
                            rounded-full
                            bg-blue-600
                          "
                        />
                      )}
                    </div>

                    <p
                      className="
                        mt-1
                        line-clamp-2
                        text-xs
                        leading-5
                        text-slate-600
                        dark:text-slate-400
                      "
                    >
                      {notification.message}
                    </p>

                    <div
                      className="
                        mt-1.5
                        flex
                        items-center
                        justify-between
                        gap-2
                      "
                    >
                      <span
                        className="
                          text-[10px]
                          text-slate-400
                        "
                      >
                        {formatNotificationTime(
                          notification.createdAt,
                        )}
                      </span>

                      {notification.ticketId && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                            text-[10px]
                            font-semibold
                            text-blue-600
                            dark:text-blue-400
                          "
                        >
                          View ticket
                          <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}