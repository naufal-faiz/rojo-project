"use client";
import { useCallback, useEffect, useState } from "react";

export interface FlashMessage {
  variant: "success" | "error" | "warning" | "info";
  message: string;
  linkHref?: string;
  linkText?: string;
}

export default function useFlash(initialFlash: FlashMessage | null = null) {
  const [flash, setFlash] = useState<FlashMessage | null>(initialFlash);
  const clear = useCallback(() => setFlash(null), []);
  useEffect(() => {
    if (flash?.variant !== "success") return;
    const timer = setTimeout(clear, 5000);
    return () => clearTimeout(timer);
  }, [flash, clear]);
  const showSuccess = useCallback((message: string) => setFlash({ variant: "success", message }), []);
  const showError = useCallback((message: string) => setFlash({ variant: "error", message }), []);
  const showWarning = useCallback((message: string, linkHref?: string, linkText?: string) =>
    setFlash({ variant: "warning", message, linkHref, linkText }), []);
  const showInfo = useCallback((message: string) => setFlash({ variant: "info", message }), []);
  return { flash, showSuccess, showError, showWarning, showInfo, clear };
}
