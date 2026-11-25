"use client";

import { useState, useEffect } from "react";

type DeviceSize = "sm" | "md" | "lg";

function getDeviceSize(): DeviceSize {
  if (typeof window === "undefined") return "lg";
  const width = window.innerWidth;
  if (width < 768) return "sm";
  if (width < 992) return "md";
  return "lg";
}

/**
 * Reports the current breakpoint. The first render is always "lg" so the
 * server and the initial client render agree (prevents hydration mismatches);
 * the real size is applied after mount and on resize.
 */
export function useDevice(): DeviceSize {
  const [device, setDevice] = useState<DeviceSize>("lg");

  useEffect(() => {
    const handleResize = () => setDevice(getDeviceSize());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return device;
}
