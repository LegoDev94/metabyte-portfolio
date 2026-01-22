"use client";

import { useEffect } from "react";

// Keep Render service alive by pinging every 10 minutes
// This prevents the free tier from sleeping after 15 minutes of inactivity

export function KeepAlive() {
  useEffect(() => {
    const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

    const ping = async () => {
      try {
        await fetch("/api/keep-alive");
      } catch {
        // Silently ignore errors
      }
    };

    // Initial ping
    ping();

    // Set up interval
    const interval = setInterval(ping, PING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return null;
}
