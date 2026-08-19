"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket/client";

export function useSocket() {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

   
    return () => {};
  }, []);

  return socket;
}