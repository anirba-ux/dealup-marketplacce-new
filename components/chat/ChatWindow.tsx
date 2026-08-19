"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Circle,
  Phone,
  MoreVertical,
  SendHorizontal,
  Paperclip,
} from "lucide-react";
import AttachmentMenu from "./AttachmentMenu";
import ImagePreviewModal from "./ImagePreviewModal";
import ImageViewerModal from "./ImageViewerModal";
import DocumentPreviewModal from "./DocumentPreviewModal";
import VideoPreviewModal from "./VideoPreviewModal";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import DateSeparator from "./DateSeparator";
import { useSocket } from "@/hooks/useSocket";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import ContactDialog from "./ContactDialog";
import ChatMenu from "./ChatMenu";
import { toast } from "sonner";
import { compressMedia } from "@/lib/media/compressMedia";
import { preloadFFmpeg } from "@/lib/media/compressVideo";

interface ChatWindowProps {
  conversation: any;
  messages: any[];
  currentUserId: string;
}

export default function ChatWindow({
  conversation,
  messages: initialMessages,
  currentUserId,
}: ChatWindowProps) {
  const socket = useSocket();

  const router = useRouter();

  useEffect(() => {
    const roomId = conversation._id.toString();

    function joinRoom() {
      console.log("📥 Joining room:", roomId);

      socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, roomId);
    }

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
    }

    return () => {
      socket.off("connect", joinRoom);

      if (socket.connected) {
        socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, roomId);
      }
    };
  }, [conversation._id]);

  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  // =========================================
  // Message Selection
  // =========================================

  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);

  const isMessageSelectionMode = selectedMessageIds.length > 0;

  useEffect(() => {
    preloadFFmpeg();
  }, []);

  const [videoError, setVideoError] = useState("");

  const [viewerImage, setViewerImage] = useState<{
    url: string;
    name?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const t = useTranslations("common");

  const isSeller = conversation.sellerId === currentUserId;

  const [isMuted, setIsMuted] = useState(
    isSeller ? conversation.sellerMuted : conversation.buyerMuted,
  );

  const participant = isSeller ? conversation.buyer : conversation.seller;

  const participantName = participant?.name || (isSeller ? "Buyer" : "Seller");

  const participantLabel = isSeller ? "Buyer" : "Seller";

  console.log(conversation.product);

  console.log(participant);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    function handleReceiveMessage(newMessage: any) {
      setMessages((prev) => [...prev, newMessage]);
    }

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    };
  }, [socket]);

  async function uploadChatImage(file: File) {
    // =====================================
    // 1. Compress Image
    // =====================================

    const compressedFile = await compressMedia(file);

    console.log(
      "CHAT IMAGE ORIGINAL:",
      `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    );

    console.log(
      "CHAT IMAGE COMPRESSED:",
      `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
    );

    // =====================================
    // 2. Upload Compressed Image
    // =====================================

    const formData = new FormData();

    formData.append("file", compressedFile);
    formData.append("type", "chat");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Image upload failed.");
    }

    return data.image;
  }

  async function uploadChatVideo(file: File) {
    // =====================================
    // 1. Compress Video
    // =====================================

    const compressedFile = await compressMedia(file, {
      onProgress: (progress: number) => {
        console.log(`CHAT VIDEO COMPRESSION: ${progress}%`);
      },
    });

    console.log(
      "CHAT VIDEO ORIGINAL:",
      `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    );

    console.log(
      "CHAT VIDEO COMPRESSED:",
      `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
    );

    // =====================================
    // 2. Upload Compressed Video
    // =====================================

    const formData = new FormData();

    formData.append("file", compressedFile);

    formData.append("type", "video");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Video upload failed.");
    }

    return data.video;
  }

  async function uploadChatDocument(file: File) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("type", "document");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Document upload failed.");
    }

    return data.document;
  }

  async function handleSend() {
    if (!message.trim()) return;

    setSending(true);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: conversation._id.toString(),
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || t("failedToSend"));
        return;
      }

      setMessages((prev) => [...prev, data]);

      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
        conversationId: conversation._id.toString(),
        message: data,
      });

      setMessage("");

      toast.success(t("messageSent"));
    } catch (error) {
      console.error(error);
      toast.error(t("somethingWentWrong"));
    } finally {
      setSending(false);
    }
  }

  async function handleMute() {
    try {
      const response = await fetch(
        `/api/chat/conversations/${conversation._id}/mute`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            muted: !isMuted,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update notification settings.");
        return;
      }

      setIsMuted(!isMuted);

      toast.success(
        !isMuted
          ? "Notifications muted successfully."
          : "Notifications unmuted successfully.",
      );
    } catch (error) {
      console.error(error);

      toast.error("Something went wrong.");
    }
  }

  // =========================================
  // Message Selection
  // =========================================

  function toggleMessageSelection(messageId: string) {
    setSelectedMessageIds((prev) => {
      if (prev.includes(messageId)) {
        return prev.filter((id) => id !== messageId);
      }

      return [...prev, messageId];
    });
  }

  // =========================================
  // Delete Selected Messages
  // =========================================

  async function handleDeleteSelectedMessages() {
    if (selectedMessageIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      selectedMessageIds.length === 1
        ? "Delete this message?"
        : `Delete ${selectedMessageIds.length} messages?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("/api/chat/messages", {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          conversationId: conversation._id?.toString(),

          messageIds: selectedMessageIds,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete messages.");
      }

      // Remove deleted messages from UI
      setMessages((prev) =>
        prev.filter(
          (msg: any) => !selectedMessageIds.includes(msg._id?.toString()),
        ),
      );

      // Clear selection
      setSelectedMessageIds([]);

      toast.success(
        selectedMessageIds.length === 1
          ? "Message deleted successfully."
          : `${selectedMessageIds.length} messages deleted successfully.`,
      );
    } catch (error) {
      console.error("DELETE SELECTED MESSAGES ERROR:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to delete messages.",
      );
    }
  }

  function MessageSelectButton({
    messageId,
    selected,
  }: {
    messageId: string;
    selected: boolean;
  }) {
    return (
      <button
        type="button"
        aria-label={selected ? "Unselect message" : "Select message"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          toggleMessageSelection(messageId);
        }}
        className={`
        absolute
        right-2
        top-2
        z-30

        flex
        h-7
        w-7
        items-center
        justify-center

        rounded-full

        border-2
        border-white

        shadow-md

        transition

        ${
          selected
            ? "bg-blue-600 text-white"
            : "bg-black/50 text-white hover:bg-blue-600"
        }
      `}
      >
        {selected ? "✓" : ""}
      </button>
    );
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this chat?\n\nYou can restore it later by sending a new message.",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/chat/conversations/${conversation._id}/delete`,
        {
          method: "PATCH",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to delete conversation.");
        return;
      }

      toast.success("Conversation removed from your chat list.");

      router.push("/messages");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete conversation. Please try again.");
    }
  }

  return (
    <main className="mx-auto flex h-[90vh] max-w-4xl flex-col rounded-xl border bg-white dark:bg-slate-900 shadow">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <Link
            href="/messages"
            className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
            {conversation.product?.thumbnail ? (
              <img
                src={conversation.product.thumbnail}
                alt={conversation.product.title}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          <div>
            <h2 className="line-clamp-1 text-lg font-semibold">
              {conversation.product?.title ?? "Product"}
            </h2>

            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              ₹ {conversation.product?.price ?? 0}
            </p>

            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium">{participantLabel}:</span>{" "}
              {participantName}
            </p>

            <div className="mt-1 flex items-center gap-2 text-xs text-green-600">
              <Circle size={8} className="fill-green-500 text-green-500" />
              <span>Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isMessageSelectionMode ? (
            <>
              {/* Selected Count */}
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {selectedMessageIds.length} selected
              </span>

              {/* Delete Selected Messages */}
              <button
                type="button"
                onClick={handleDeleteSelectedMessages}
                className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-red-500
          transition
          hover:bg-red-50
          hover:text-red-600
          dark:hover:bg-red-950/30
        "
                aria-label="Delete selected messages"
                title="Delete selected messages"
              >
                🗑️
              </button>
            </>
          ) : (
            <>
              {/* Normal Chat Actions */}
              <ContactDialog
                name={participant?.name}
                phone={participant?.phone}
                image={participant?.image}
              />

              <ChatMenu
                isMuted={isMuted}
                onViewProfile={() => {
                  if (!participant?._id) {
                    toast.error("Seller profile not found.");
                    return;
                  }

                  router.push(`/profile/${participant._id}`);
                }}
                onViewProduct={() => {
                  router.push(`/products/${conversation.product.slug}`);
                }}
                onMute={handleMute}
                onShare={() => {
                  console.log("Share Product");
                }}
                onDelete={handleDelete}
              />
            </>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950">
        {messages.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">
            {t("noMessagesYet")}
          </p>
        ) : (
          messages.map((msg: any, index: number) => {
            const previous = messages[index - 1];

            const showDate =
              !previous ||
              new Date(previous.createdAt).toDateString() !==
                new Date(msg.createdAt).toDateString();

            const mine = msg.senderId === currentUserId;

            const isSelected =
              msg._id && selectedMessageIds.includes(msg._id.toString());

            return (
              <div key={msg._id.toString()}>
                {showDate && <DateSeparator date={msg.createdAt} />}

                <div
                  className={`mb-2 flex ${
                    mine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] overflow-hidden rounded-2xl shadow-sm ${
                      mine
                        ? "rounded-br-md bg-blue-600 text-white"
                        : "rounded-3xl rounded-bl-md border border-slate-300 bg-slate-200 text-slate-900 shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    } ${
                      isSelected
                        ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950"
                        : ""
                    }`}
                  >
                    {/* Image */}
                    {msg.messageType === "image" && msg.attachmentUrl && (
                      <div className="relative p-2">
                        {msg._id && (
                          <MessageSelectButton
                            messageId={msg._id.toString()}
                            selected={Boolean(isSelected)}
                          />
                        )}

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();

                            if (isMessageSelectionMode) {
                              return;
                            }

                            setViewerImage({
                              url: msg.attachmentUrl,
                              name: msg.attachmentName,
                            });
                          }}
                          className="block cursor-zoom-in"
                        >
                          <img
                            src={msg.attachmentUrl}
                            alt={msg.attachmentName || "Shared image"}
                            className="
            max-h-80
            w-full
            max-w-sm
            rounded-xl
            object-cover
            transition-transform
            duration-200
            hover:scale-[1.02]
          "
                          />
                        </button>
                      </div>
                    )}

                    {/* Video */}
                    {msg.messageType === "video" && msg.attachmentUrl && (
                      <div className="relative p-2">
                        {msg._id && (
                          <MessageSelectButton
                            messageId={msg._id.toString()}
                            selected={Boolean(isSelected)}
                          />
                        )}

                        <video
                          src={msg.attachmentUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="
          max-h-80
          w-full
          max-w-sm
          rounded-xl
          bg-black
          object-contain
        "
                        />
                      </div>
                    )}

                    {/* Document */}
                    {msg.messageType === "document" && msg.attachmentUrl && (
                      <div className="relative p-3">
                        <div
                          onClick={() => {
                            if (!msg._id) return;

                            toggleMessageSelection(msg._id.toString());
                          }}
                          className="
          relative
          flex
          min-w-[240px]
          max-w-sm
          items-center
          gap-3
          rounded-xl
          bg-white/10
          p-3
          cursor-pointer
        "
                        >
                          {/* Selection */}
                          {isSelected && msg._id && (
                            <MessageSelectButton
                              messageId={msg._id.toString()}
                              selected={true}
                            />
                          )}

                          {/* Icon */}
                          <div
                            className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-orange-100
            text-xl
          "
                          >
                            📄
                          </div>

                          {/* File Info */}
                          <div className="min-w-0 flex-1">
                            <p
                              className="
              truncate
              text-sm
              font-semibold
            "
                              title={msg.attachmentName}
                            >
                              {msg.attachmentName || "Document"}
                            </p>

                            <p className="mt-1 text-xs opacity-70">
                              {msg.attachmentSize
                                ? `${(msg.attachmentSize / 1024).toFixed(1)} KB`
                                : "Document"}
                            </p>
                          </div>

                          {/* Open */}
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                            className="
            shrink-0
            rounded-lg
            bg-white/20
            px-3
            py-2
            text-xs
            font-semibold
            transition
            hover:bg-white/30
          "
                          >
                            Open
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Text / Caption */}
                    {msg.message && (
                      <div className="relative">
                        {/* Selection button ONLY for text messages */}
                        {msg.messageType === "text" &&
                          isSelected &&
                          msg._id && (
                            <MessageSelectButton
                              messageId={msg._id.toString()}
                              selected={true}
                            />
                          )}

                        <p
                          onClick={() => {
                            // Only text messages can be selected
                            // by clicking the text itself.
                            if (msg.messageType === "text" && msg._id) {
                              toggleMessageSelection(msg._id.toString());
                            }
                          }}
                          className={`${
                            msg.messageType === "text" ? "cursor-pointer" : ""
                          } px-4 ${
                            msg.messageType === "image" ? "pb-1 pt-1" : "py-1"
                          } whitespace-pre-wrap break-words`}
                        >
                          {msg.message}
                        </p>
                      </div>
                    )}

                    {/* Time */}
                    <div
                      className={`flex items-center justify-end gap-1 px-4 pb-2 text-[11px] ${
                        mine
                          ? "text-blue-100"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>

                      {mine && <span>{msg.isRead ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative flex gap-3 border-t p-4">
        <AttachmentMenu
          open={showAttachmentMenu}
          onClose={() => setShowAttachmentMenu(false)}
          onImageSelect={(file) => {
            setSelectedImage(file);
          }}
          onDocumentSelect={(file) => {
            setSelectedDocument(file);
          }}
          onVideoSelect={(file) => {
            const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

            if (file.size > MAX_VIDEO_SIZE) {
              setVideoError("Video must be less than 50 MB.");

              setSelectedVideo(null);

              return;
            }

            setVideoError("");

            setSelectedVideo(file);

            setShowAttachmentMenu(false);
          }}
        />

        {videoError && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950/30">
            <span className="text-red-500">⚠</span>

            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              {videoError}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowAttachmentMenu((prev) => !prev)}
          className="
    flex
    h-12
    w-12
    items-center
    justify-center

    rounded-full

    border
    border-slate-300

    bg-white

    transition-all
    duration-300

    hover:bg-blue-50
    hover:border-[#1565d8]

    dark:border-slate-700
    dark:bg-slate-900
  "
        >
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("typeMessage")}
          className="
  flex-1
  rounded-full
  border
  border-slate-300
  bg-white
  px-5
  py-3
  outline-none
  transition
  focus:border-indigo-500
  focus:ring-2
  focus:ring-indigo-200
  dark:border-slate-700
  dark:bg-slate-900
  dark:focus:ring-indigo-900
"
        />

        <button
          onClick={handleSend}
          disabled={sending}
          className="
    flex
    h-12
    w-12
    items-center
    justify-center
    rounded-full
    bg-indigo-600
    text-white
    shadow-md
    transition-all
    duration-200
    hover:bg-indigo-700
    hover:scale-105
    active:scale-95
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
          aria-label="Send Message"
        >
          {sending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <SendHorizontal size={20} />
          )}
        </button>
      </div>
      {/* Image Preview */}
      <ImagePreviewModal
        file={selectedImage}
        onClose={() => setSelectedImage(null)}
        onSend={async (file, caption) => {
          try {
            setSending(true);

            // ===============================
            // 1. Upload image to Cloudinary
            // ===============================

            const image = await uploadChatImage(file);

            // ===============================
            // 2. Save image message
            // ===============================

            const response = await fetch("/api/chat/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                conversationId: conversation._id.toString(),
                message: caption,
                messageType: "image",
                attachmentUrl: image.url,
                attachmentPublicId: image.publicId,
                attachmentName: file.name,
                attachmentSize: file.size,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Failed to send image message.");
            }

            // ===============================
            // 3. Add message to current chat
            // ===============================

            setMessages((prev) => [...prev, data]);

            // ===============================
            // 4. Close preview
            // ===============================

            setSelectedImage(null);

            // ===============================
            // 5. Notify socket
            // ===============================

            socket?.emit("send-message", data);
          } catch (error) {
            console.error("IMAGE SEND ERROR:", error);

            alert(
              error instanceof Error ? error.message : "Failed to send image.",
            );
          } finally {
            setSending(false);
          }
        }}
      />

      <DocumentPreviewModal
        file={selectedDocument}
        onClose={() => {
          setSelectedDocument(null);
        }}
        onSend={async () => {
          if (!selectedDocument) {
            return;
          }

          try {
            setSending(true);

            // =====================================
            // 1. Upload document to Cloudinary
            // =====================================

            const document = await uploadChatDocument(selectedDocument);

            // =====================================
            // 2. Save document message
            // =====================================

            const response = await fetch("/api/chat/messages", {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                conversationId: conversation._id.toString(),

                message: "",

                messageType: "document",

                attachmentUrl: document.url,

                attachmentPublicId: document.publicId,

                attachmentName: document.name,

                attachmentSize: document.size,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Failed to send document message.");
            }

            // =====================================
            // 3. Add to current chat
            // =====================================

            setMessages((prev) => [...prev, data]);

            // =====================================
            // 4. Close preview
            // =====================================

            setSelectedDocument(null);

            // =====================================
            // 5. Notify socket
            // =====================================

            socket?.emit("send-message", data);

            toast.success("Document sent successfully.");
          } catch (error) {
            console.error("DOCUMENT SEND ERROR:", error);

            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to send document.",
            );
          } finally {
            setSending(false);
          }
        }}
      />

      <VideoPreviewModal
        file={selectedVideo}
        onClose={() => {
          setSelectedVideo(null);
        }}
        onSend={async () => {
          if (!selectedVideo) {
            return;
          }

          try {
            setSending(true);

            // =================================
            // 1. Upload Video to Cloudinary
            // =================================

            const video = await uploadChatVideo(selectedVideo);

            // =================================
            // 2. Save Video Message
            // =================================

            const response = await fetch("/api/chat/messages", {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                conversationId: conversation._id.toString(),

                message: "",

                messageType: "video",

                attachmentUrl: video.url,

                attachmentPublicId: video.publicId,

                attachmentName: selectedVideo.name,

                attachmentSize: selectedVideo.size,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Failed to send video message.");
            }

            // =================================
            // 3. Add to Current Chat
            // =================================

            setMessages((prev) => [...prev, data]);

            // =================================
            // 4. Close Preview
            // =================================

            setSelectedVideo(null);

            // =================================
            // 5. Socket
            // =================================

            socket?.emit("send-message", data);

            toast.success("Video sent successfully.");
          } catch (error) {
            console.error("VIDEO SEND ERROR:", error);

            toast.error(
              error instanceof Error ? error.message : "Failed to send video.",
            );
          } finally {
            setSending(false);
          }
        }}
      />

      <ImageViewerModal
        imageUrl={viewerImage?.url ?? null}
        imageName={viewerImage?.name}
        onClose={() => setViewerImage(null)}
      />
    </main>
  );
}
