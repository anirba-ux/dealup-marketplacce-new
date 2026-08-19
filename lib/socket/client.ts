import { io } from "socket.io-client";

export const socket = io("http://localhost:4000", {
  autoConnect: false,

  // Try websocket first, then fallback to polling if needed
  transports: ["websocket", "polling"],

  // Auto reconnect
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

/* ==========================
   Socket Events (Debug)
========================== */

socket.on("connect", () => {
  console.log("🟢 Socket Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Socket Disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket Connection Error:", error.message);
});

socket.io.on("reconnect", (attempt) => {
  console.log(`🟢 Socket Reconnected (Attempt ${attempt})`);
});

socket.io.on("reconnect_attempt", (attempt) => {
  console.log(`🟡 Reconnecting... Attempt ${attempt}`);
});

socket.io.on("reconnect_error", (error) => {
  console.error("❌ Reconnect Error:", error.message);
});

socket.io.on("reconnect_failed", () => {
  console.error("❌ Reconnect Failed");
});