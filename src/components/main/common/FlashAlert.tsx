"use client";
import React, { useEffect, useRef } from "react";
import Alert from "@/components/ui/alert/Alert";
import { CloseLineIcon } from "@/icons/index";
import type { FlashMessage } from "./useFlash";

interface FlashAlertProps {
  /** Pesan aktif dari useFlash. */
  flash: FlashMessage | null;
  /** Menutup pesan. */
  onClose: () => void;
}

const titles = { success: "Berhasil", error: "Terjadi kesalahan", warning: "Perhatian", info: "Informasi" };
const FlashAlert: React.FC<FlashAlertProps> = ({ flash, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (flash) ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [flash]);
  if (!flash) return null;
  return (
    <div ref={ref} role="alert" aria-live={flash.variant === "error" ? "assertive" : "polite"} className="relative mb-4 pr-10">
      <Alert variant={flash.variant} title={titles[flash.variant]} message={flash.message}
        showLink={Boolean(flash.linkHref)} linkHref={flash.linkHref} linkText={flash.linkText} />
      <button type="button" title="Tutup pesan" aria-label="Tutup pesan" onClick={onClose}
        className="absolute right-1 top-3 rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
        <CloseLineIcon className="size-5" />
      </button>
    </div>
  );
};
export default FlashAlert;
