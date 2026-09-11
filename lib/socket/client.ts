"use client";

import { SOCKET_EVENTS } from "./events";

type EventHandler = (...args: any[]) => void;

type Packet = {
  event: string;
  data?: any;
};

class DealUpSocket {
  private ws: WebSocket | null = null;

  private listeners = new Map<string, Set<EventHandler>>();

  private onceListeners = new Map<string, Set<EventHandler>>();

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private reconnectAttempt = 0;

  private manuallyDisconnected = false;

  private pendingPackets: Packet[] = [];

  private lastJoinPacket: Packet | null = null;

  public connected = false;

  public id: string | undefined;

  constructor() {
    if (typeof window !== "undefined") {
      this.id = crypto.randomUUID();
    }
  }

  /* ==========================
     WebSocket URL
  ========================== */

  private getWebSocketUrl() {
    if (typeof window === "undefined") {
      return "";
    }

    const protocol =
      window.location.protocol === "https:" ? "wss:" : "ws:";

    return `${protocol}//${window.location.host}/api/ws`;
  }

  /* ==========================
     Event helpers
  ========================== */

  private trigger(event: string, ...args: any[]) {
    const handlers = this.listeners.get(event);

    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(...args);
        } catch (error) {
          console.error(
            `❌ Socket listener error for "${event}":`,
            error
          );
        }
      }
    }

    const onceHandlers = this.onceListeners.get(event);

    if (onceHandlers && onceHandlers.size > 0) {
      this.onceListeners.delete(event);

      for (const handler of onceHandlers) {
        try {
          handler(...args);
        } catch (error) {
          console.error(
            `❌ Socket once-listener error for "${event}":`,
            error
          );
        }
      }
    }
  }

  public on(event: string, handler: EventHandler) {
    let handlers = this.listeners.get(event);

    if (!handlers) {
      handlers = new Set<EventHandler>();
      this.listeners.set(event, handlers);
    }

    handlers.add(handler);

    return this;
  }

  public off(event: string, handler?: EventHandler) {
    if (!handler) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
      return this;
    }

    const handlers = this.listeners.get(event);

    if (handlers) {
      handlers.delete(handler);

      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }

    const onceHandlers = this.onceListeners.get(event);

    if (onceHandlers) {
      onceHandlers.delete(handler);

      if (onceHandlers.size === 0) {
        this.onceListeners.delete(event);
      }
    }

    return this;
  }

  public once(event: string, handler: EventHandler) {
    let handlers = this.onceListeners.get(event);

    if (!handlers) {
      handlers = new Set<EventHandler>();
      this.onceListeners.set(event, handlers);
    }

    handlers.add(handler);

    return this;
  }

  /* ==========================
     Connect
  ========================== */

  public connect() {
    if (typeof window === "undefined") {
      return this;
    }

    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return this;
    }

    this.manuallyDisconnected = false;

    const url = this.getWebSocketUrl();

    if (!url) {
      return this;
    }

    console.log("🔌 Connecting WebSocket:", url);

    try {
      this.ws = new WebSocket(url);
    } catch (error) {
      console.error("❌ WebSocket creation failed:", error);

      this.scheduleReconnect();

      return this;
    }

    this.ws.onopen = () => {
      this.connected = true;
      this.reconnectAttempt = 0;

      console.log("🟢 WebSocket Connected:", this.id);

      this.trigger("connect");

      /*
       * Rejoin the last conversation after reconnect.
       */
      if (this.lastJoinPacket) {
        console.log(
          "📥 Rejoining conversation after reconnect:",
          this.lastJoinPacket.data
        );

        this.sendPacket(this.lastJoinPacket);
      }

      /*
       * Send messages that were queued while disconnected.
       */
      if (this.pendingPackets.length > 0) {
        const packets = [...this.pendingPackets];

        this.pendingPackets = [];

        for (const packet of packets) {
          this.sendPacket(packet);
        }
      }
    };

    this.ws.onmessage = (event) => {
      this.handleIncomingMessage(event.data);
    };

    this.ws.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);

      this.trigger("connect_error", {
        message: "WebSocket connection error",
        error,
      });
    };

    this.ws.onclose = (event) => {
      const wasConnected = this.connected;

      this.connected = false;

      console.log(
        "🔴 WebSocket Disconnected:",
        event.reason || `Code ${event.code}`
      );

      this.trigger(
        "disconnect",
        event.reason || `Code ${event.code}`
      );

      /*
       * Reconnect automatically unless the user
       * explicitly disconnected.
       */
      if (!this.manuallyDisconnected) {
        if (wasConnected) {
          console.log("🟡 WebSocket connection lost.");
        }

        this.scheduleReconnect();
      }
    };

    return this;
  }

  /* ==========================
     Disconnect
  ========================== */

  public disconnect() {
    this.manuallyDisconnected = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (error) {
        console.error(
          "❌ WebSocket disconnect error:",
          error
        );
      }
    }

    this.ws = null;
    this.connected = false;

    return this;
  }

  /* ==========================
     Reconnect
  ========================== */

  private scheduleReconnect() {
    if (this.manuallyDisconnected) {
      return;
    }

    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempt += 1;

    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempt - 1),
      10000
    );

    console.log(
      `🟡 Reconnecting... Attempt ${this.reconnectAttempt} in ${delay}ms`
    );

    this.trigger(
      "reconnect_attempt",
      this.reconnectAttempt
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      if (!this.manuallyDisconnected) {
        this.connect();
      }
    }, delay);
  }

  /* ==========================
     Send packet
  ========================== */

  private sendPacket(packet: Packet) {
    if (
      !this.ws ||
      this.ws.readyState !== WebSocket.OPEN
    ) {
      this.pendingPackets.push(packet);

      return;
    }

    try {
      this.ws.send(JSON.stringify(packet));
    } catch (error) {
      console.error(
        "❌ WebSocket send failed:",
        error
      );

      this.pendingPackets.push(packet);
    }
  }

  /* ==========================
     Emit
  ========================== */

  public emit(event: string, data?: any) {
    /*
     * Keep track of the currently joined room.
     * This allows automatic rejoin after reconnect.
     */
    if (event === SOCKET_EVENTS.JOIN_CONVERSATION) {
      this.lastJoinPacket = {
        event,
        data,
      };
    }

    if (event === SOCKET_EVENTS.LEAVE_CONVERSATION) {
      this.lastJoinPacket = null;
    }

    /*
     * Existing ChatWindow attachment code sometimes
     * sends the message object directly instead of:
     *
     * {
     *   conversationId,
     *   message
     * }
     *
     * Normalize that here so text/image/document/video
     * realtime delivery continues to work.
     */
    let packetData = data;

    if (
      event === SOCKET_EVENTS.SEND_MESSAGE &&
      data &&
      typeof data === "object" &&
      data.conversationId &&
      !data.message
    ) {
      packetData = {
        conversationId: data.conversationId,
        message: data,
      };
    }

    const packet: Packet = {
      event,
      data: packetData,
    };

    /*
     * Connection may not be ready immediately after
     * page load. Queue the packet instead of losing it.
     */
    if (
      !this.ws ||
      this.ws.readyState !== WebSocket.OPEN
    ) {
      /*
       * Do not queue LEAVE events.
       */
      if (event !== SOCKET_EVENTS.LEAVE_CONVERSATION) {
        this.pendingPackets.push(packet);
      }

      return this;
    }

    this.sendPacket(packet);

    return this;
  }

  /* ==========================
     Incoming messages
  ========================== */

  private handleIncomingMessage(rawData: any) {
    try {
      const raw =
        typeof rawData === "string"
          ? rawData
          : rawData?.toString?.() ?? "";

      if (!raw) {
        return;
      }

      const packet = JSON.parse(raw) as Packet;

      if (!packet?.event) {
        return;
      }

      console.log(
        "📨 WebSocket Event:",
        packet.event
      );

      this.trigger(
        packet.event,
        packet.data
      );

      /*
       * Server-side error event.
       */
      if (packet.event === "error") {
        console.error(
          "❌ WebSocket Server Error:",
          packet.data?.message
        );
      }
    } catch (error) {
      console.error(
        "❌ Invalid WebSocket message:",
        error
      );
    }
  }
}

/*
 * Single client instance.
 *
 * This preserves the same usage style as the
 * previous Socket.IO client:
 *
 * import { socket } from "@/lib/socket/client";
 */
export const socket = new DealUpSocket();

/* ==========================
   Debug Events
========================== */

socket.on("connect", () => {
  console.log("🟢 DealUp WebSocket Connected");
});

socket.on("disconnect", (reason) => {
  console.log(
    "🔴 DealUp WebSocket Disconnected:",
    reason
  );
});

socket.on("connect_error", (error) => {
  console.error(
    "❌ DealUp WebSocket Connection Error:",
    error
  );
});

socket.on("reconnect_attempt", (attempt) => {
  console.log(
    `🟡 DealUp WebSocket Reconnect Attempt ${attempt}`
  );
});