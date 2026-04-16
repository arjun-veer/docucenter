"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Returns true when the viewport is below the mobile breakpoint (768px).
 * Uses matchMedia for efficient detection without resize listeners.
 */
export function useMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }

    // Set initial value
    setIsMobile(mql.matches);

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}
