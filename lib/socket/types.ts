export interface SocketMessage {
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface JoinConversationPayload {
  conversationId: string;
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
}