export const SOCKET_EVENTS = {
  CONNECTION: "connection",

  JOIN_CONVERSATION: "join-conversation",

  LEAVE_CONVERSATION: "leave-conversation",

  SEND_MESSAGE: "send-message",

  RECEIVE_MESSAGE: "receive-message",

  TYPING: "typing",

  STOP_TYPING: "stop-typing",

  MESSAGE_READ: "message-read",

  USER_ONLINE: "user-online",

  USER_OFFLINE: "user-offline",
} as const;