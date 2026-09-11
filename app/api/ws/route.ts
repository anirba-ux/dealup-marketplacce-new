import {
  experimental_upgradeWebSocket,
  type WebSocketData,
} from "@vercel/functions";

import type WebSocket from "ws";

import { auth } from "@/auth";
import { getConversationById } from "@/lib/repositories/chat.repository";

import Redis from "ioredis";
import { randomUUID } from "crypto";

import { SOCKET_EVENTS } from "@/lib/socket/events";

export const runtime = "nodejs";

/* =========================================================
   Types
========================================================= */

type ClientState = {
  id: string;
  userId: string;
  rooms: Set<string>;
};

type RedisMessage = {
  type: "message";
  clientId: string;
  conversationId: string;
  message: any;
};

/* =========================================================
   Redis
========================================================= */

const REDIS_CHANNEL = "dealup:chat";

let redisPublisher: Redis | null = null;
let redisSubscriber: Redis | null = null;
let redisReadyPromise: Promise<void> | null = null;

/* =========================================================
   Local WebSocket rooms
========================================================= */

const localRooms = new Map<string, Set<WebSocket>>();
const clients = new WeakMap<WebSocket, ClientState>();

/* =========================================================
   Redis Publisher
========================================================= */

function getRedisPublisher() {
  if (!redisPublisher) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error("REDIS_URL is missing");
    }

    redisPublisher = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });

    redisPublisher.on("error", (error) => {
      console.error("❌ Redis Publisher Error:", error);
    });
  }

  return redisPublisher;
}

/* =========================================================
   Redis Subscriber
========================================================= */

function getRedisSubscriber() {
  if (!redisSubscriber) {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error("REDIS_URL is missing");
    }

    redisSubscriber = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });

    redisSubscriber.on("error", (error) => {
      console.error("❌ Redis Subscriber Error:", error);
    });
  }

  return redisSubscriber;
}

/* =========================================================
   Broadcast to local room
========================================================= */

function broadcastToLocalRoom(
  conversationId: string,
  message: any,
  senderClientId?: string,
) {
  const room = localRooms.get(conversationId);

  if (!room) {
    return;
  }

  const payload = JSON.stringify({
    event: SOCKET_EVENTS.RECEIVE_MESSAGE,
    data: message,
  });

  for (const client of room) {
    const state = clients.get(client);

    if (!state) {
      continue;
    }

    /*
     * The sender already added the message locally.
     * Do not send it back to that exact socket.
     */
    if (senderClientId && state.id === senderClientId) {
      continue;
    }

    if (client.readyState === 1) {
      try {
        client.send(payload);
      } catch (error) {
        console.error(
          "❌ Failed to deliver WebSocket message:",
          error,
        );
      }
    }
  }
}

/* =========================================================
   Ensure Redis subscriber
========================================================= */

async function ensureRedisSubscriber() {
  if (!redisReadyPromise) {
    redisReadyPromise = (async () => {
      const subscriber = getRedisSubscriber();

      /*
       * Register the listener BEFORE subscribing so there is
       * no small listener-registration window.
       */
      subscriber.on("message", (channel, rawMessage) => {
        if (channel !== REDIS_CHANNEL) {
          return;
        }

        try {
          const payload = JSON.parse(rawMessage) as RedisMessage;

          if (payload.type !== "message") {
            return;
          }

          broadcastToLocalRoom(
            payload.conversationId,
            payload.message,
            payload.clientId,
          );
        } catch (error) {
          console.error(
            "❌ Redis message parse error:",
            error,
          );
        }
      });

      await subscriber.subscribe(REDIS_CHANNEL);

      console.log(
        `🟢 Redis subscriber ready: ${REDIS_CHANNEL}`,
      );
    })().catch((error) => {
      redisReadyPromise = null;

      console.error(
        "❌ Redis subscriber initialization failed:",
        error,
      );

      throw error;
    });
  }

  return redisReadyPromise;
}

/* =========================================================
   Room helpers
========================================================= */

function addToRoom(
  ws: WebSocket,
  conversationId: string,
) {
  let room = localRooms.get(conversationId);

  if (!room) {
    room = new Set<WebSocket>();
    localRooms.set(conversationId, room);
  }

  room.add(ws);

  const state = clients.get(ws);

  if (state) {
    state.rooms.add(conversationId);
  }
}

function removeFromRoom(
  ws: WebSocket,
  conversationId: string,
) {
  const room = localRooms.get(conversationId);

  if (room) {
    room.delete(ws);

    if (room.size === 0) {
      localRooms.delete(conversationId);
    }
  }

  const state = clients.get(ws);

  if (state) {
    state.rooms.delete(conversationId);
  }
}

function cleanupClient(ws: WebSocket) {
  const state = clients.get(ws);

  if (!state) {
    return;
  }

  /*
   * Copy the Set because removeFromRoom mutates it.
   */
  const roomIds = Array.from(state.rooms);

  for (const roomId of roomIds) {
    removeFromRoom(ws, roomId);
  }

  console.log(
    `🔴 WebSocket disconnected: ${state.id}`,
  );
}

/* =========================================================
   Error helper
========================================================= */

function sendError(
  ws: WebSocket,
  message: string,
) {
  if (ws.readyState !== 1) {
    return;
  }

  try {
    ws.send(
      JSON.stringify({
        event: "error",
        data: {
          message,
        },
      }),
    );
  } catch (error) {
    console.error(
      "❌ Failed to send WebSocket error:",
      error,
    );
  }
}

/* =========================================================
   WebSocket GET endpoint
========================================================= */

export async function GET() {
  /*
   * Authenticate before upgrading the connection.
   */
  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const userId = (session.user as any).id;

  if (!userId) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  /*
   * Redis must be ready before accepting the socket.
   */
  await ensureRedisSubscriber();

  return experimental_upgradeWebSocket(
    (ws) => {
      const clientId = randomUUID();

      clients.set(ws, {
        id: clientId,
        userId,
        rooms: new Set(),
      });

      console.log(
        `🟢 WebSocket connected: ${clientId} | User: ${userId}`,
      );

      ws.on(
        "message",
        async (data: WebSocketData) => {
          try {
            const raw =
              typeof data === "string"
                ? data
                : data.toString();

            if (!raw) {
              return;
            }

            const packet = JSON.parse(raw);

            const event = packet?.event;
            const payload = packet?.data;

            if (!event) {
              sendError(
                ws,
                "WebSocket event is required",
              );

              return;
            }

            /* =================================================
               JOIN CONVERSATION
            ================================================= */

            if (
              event ===
              SOCKET_EVENTS.JOIN_CONVERSATION
            ) {
              const conversationId =
                typeof payload === "string"
                  ? payload
                  : payload?.conversationId;

              if (!conversationId) {
                sendError(
                  ws,
                  "conversationId is required",
                );

                return;
              }

              const conversation =
                await getConversationById(
                  conversationId,
                );

              if (!conversation) {
                sendError(
                  ws,
                  "Conversation not found",
                );

                return;
              }

              /*
               * Security:
               * Only buyer or seller may join.
               */
              if (
                conversation.buyerId !== userId &&
                conversation.sellerId !== userId
              ) {
                sendError(
                  ws,
                  "Forbidden",
                );

                return;
              }

              addToRoom(
                ws,
                conversationId,
              );

              console.log(
                `📥 ${clientId} joined room ${conversationId}`,
              );

              return;
            }

            /* =================================================
               LEAVE CONVERSATION
            ================================================= */

            if (
              event ===
              SOCKET_EVENTS.LEAVE_CONVERSATION
            ) {
              const conversationId =
                typeof payload === "string"
                  ? payload
                  : payload?.conversationId;

              if (!conversationId) {
                return;
              }

              removeFromRoom(
                ws,
                conversationId,
              );

              console.log(
                `📤 ${clientId} left room ${conversationId}`,
              );

              return;
            }

            /* =================================================
               SEND MESSAGE
            ================================================= */

            if (
              event ===
              SOCKET_EVENTS.SEND_MESSAGE
            ) {
              const conversationId =
                payload?.conversationId;

              const message =
                payload?.message;

              if (
                !conversationId ||
                !message
              ) {
                sendError(
                  ws,
                  "Invalid message payload",
                );

                return;
              }

              const state = clients.get(ws);

              if (!state) {
                return;
              }

              /*
               * The socket must have joined this room.
               */
              if (
                !state.rooms.has(
                  conversationId,
                )
              ) {
                sendError(
                  ws,
                  "You are not joined to this conversation",
                );

                return;
              }

              /*
               * Verify conversation access again before
               * publishing the message.
               */
              const conversation =
                await getConversationById(
                  conversationId,
                );

              if (!conversation) {
                sendError(
                  ws,
                  "Conversation not found",
                );

                return;
              }

              if (
                conversation.buyerId !== userId &&
                conversation.sellerId !== userId
              ) {
                sendError(
                  ws,
                  "Forbidden",
                );

                return;
              }

              const redisMessage: RedisMessage = {
                type: "message",
                clientId,
                conversationId,
                message,
              };

              /*
               * MongoDB remains the source of truth.
               * This WebSocket route only distributes the
               * already-persisted message in realtime.
               */
              const publisher =
                getRedisPublisher();

              await publisher.publish(
                REDIS_CHANNEL,
                JSON.stringify(
                  redisMessage,
                ),
              );

              console.log(
                `📨 Message published: ${conversationId}`,
              );

              return;
            }

            /*
             * Future events:
             * TYPING
             * STOP_TYPING
             * MESSAGE_READ
             * USER_ONLINE
             * USER_OFFLINE
             */
          } catch (error) {
            console.error(
              "❌ WebSocket message error:",
              error,
            );

            sendError(
              ws,
              "Invalid WebSocket message",
            );
          }
        },
      );

      ws.on("close", () => {
        cleanupClient(ws);
      });

      ws.on("error", (error) => {
        console.error(
          `❌ WebSocket error ${clientId}:`,
          error,
        );
      });
    },
  );
}
