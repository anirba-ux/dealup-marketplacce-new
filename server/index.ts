import { createServer } from "http";
import { Server } from "socket.io";

import { SOCKET_EVENTS } from "./events";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`🟢 Connected: ${socket.id}`);

  socket.on(
    SOCKET_EVENTS.JOIN_CONVERSATION,
    (conversationId: string) => {
      socket.join(conversationId);

      console.log(
        `📥 ${socket.id} joined room ${conversationId}`
      );
    }
  );

  socket.on(
    SOCKET_EVENTS.SEND_MESSAGE,
    ({ conversationId, message }) => {
      socket
        .to(conversationId)
        .emit(
          SOCKET_EVENTS.RECEIVE_MESSAGE,
          message
        );

      console.log(
        `📨 Message broadcast to room ${conversationId}`
      );
    }
  );

  socket.on(
    SOCKET_EVENTS.LEAVE_CONVERSATION,
    (conversationId: string) => {
      socket.leave(conversationId);

      console.log(
        `📤 ${socket.id} left room ${conversationId}`
      );
    }
  );

  socket.on("disconnect", () => {
    console.log(`🔴 Disconnected: ${socket.id}`);
  });
});

httpServer.listen(4000, () => {
  console.log("🚀 Socket Server running on port 4000");
});