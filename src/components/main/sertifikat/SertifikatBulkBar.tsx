"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { CheckLineIcon, CloseLineIcon } from "@/icons/index";
import { statusPesertaLabels } from "@/components/main/common/StatusBadge";
import { updateStatusMassal } from "@/lib/data/action/sertifikatAction";
import { StatusPeserta } from "@/lib/generated/prisma/enums";
import type useFlash from "@/components/main/common/useFlash";

interface SertifikatBulkBarProps {
  /** Pilihan pada halaman aktif serta notifikasi milik halaman. */
  selectedIds: string[];
  flash: ReturnType<typeof useFlash>;
  onClear: () => void;
}
const SertifikatBulkBar: React.FC<SertifikatBulkBarProps> = ({ selectedIds, flash, onClear }) => {
  const [status, setStatus] = useState<StatusPeserta | "">("");
  const [loading, setLoading] = useState(false);
  const apply = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await updateStatusMassal(selectedIds, status || null);
      if (!result.success) { flash.showError(result.error); return; }
      flash.showSuccess(`${result.jumlah} peserta diperbarui.`);
      onClear();
    } catch { flash.showError("Gagal mengubah status massal."); }
    finally { setLoading(false); }
  };
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedIds.length} peserta dipilih</p>
      <select aria-label="Status hasil massal" disabled={loading} value={status} onChange={(e) => setStatus(e.target.value as StatusPeserta | "")}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300">
        <option value="">Belum ada hasil</option>
        {Object.values(StatusPeserta).map((value) => <option key={value} value={value}>{statusPesertaLabels[value]}</option>)}
      </select>
      <Button size="sm" onClick={apply} isLoading={loading} startIcon={<CheckLineIcon className="size-4" />}>Terapkan Status</Button>
      <Button size="sm" variant="outline" onClick={onClear} disabled={loading} startIcon={<CloseLineIcon className="size-4" />}>Bersihkan pilihan</Button>
    </div>
  );
};
export default SertifikatBulkBar;
