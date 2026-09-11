"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket/client";

export function useSocket() {
  useEffect(() => {
    socket.connect();

    return () => {
      // Do not disconnect here.
      // The same socket instance may be used by other
      // chat components, and the client handles reconnects.
    };
  }, []);

  return socket;
}