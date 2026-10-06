"use client";
import React from "react";
import Alert from "@/components/ui/alert/Alert";
import Button from "@/components/ui/button/Button";
import { CloseLineIcon, TrashBinIcon } from "@/icons/index";

interface InlineConfirmProps {
  /** Penjelasan dampak penghapusan. */
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const InlineConfirm: React.FC<InlineConfirmProps> = ({ message, confirmLabel = "Ya, Hapus", onConfirm, onCancel, loading }) => (
  <div className="space-y-3" role="group" aria-label="Konfirmasi hapus">
    <Alert variant="warning" title="Konfirmasi hapus" message={message} />
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={onCancel} disabled={loading} startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>
      <Button size="sm" onClick={onConfirm} isLoading={loading} startIcon={<TrashBinIcon className="size-4" />}>{confirmLabel}</Button>
    </div>
  </div>
);
export default InlineConfirm;
