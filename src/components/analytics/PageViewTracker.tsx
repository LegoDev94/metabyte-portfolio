"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_ID_KEY = "metabyte_visitor_id";

// Generate a random ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export function PageViewTracker() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get or create visitor ID
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = generateId();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }

    // Reset tracking for new page
    startTimeRef.current = Date.now();
    maxScrollRef.current = 0;

    // Track scroll depth
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Track page view on mount
    const trackPageView = () => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          path: pathname,
          referrer: document.referrer || undefined,
        }),
      }).catch(() => {
        // Ignore tracking errors
      });
    };

    trackPageView();

    // Track duration and scroll depth on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);

      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

      // Only track if user spent more than 1 second on page
      if (duration > 1) {
        // Use sendBeacon for reliable tracking on page leave
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/track",
            JSON.stringify({
              visitorId,
              path: pathname,
              duration,
              scrollDepth: maxScrollRef.current,
            })
          );
        }
      }
    };
  }, [pathname]);

  return null;
}
