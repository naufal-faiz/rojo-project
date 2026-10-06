"use client";
import React, { useState } from "react";
import { StatusPeserta } from "@/lib/generated/prisma/enums";
import { statusPesertaLabels } from "@/components/main/common/StatusBadge";
import { updateStatusPesertaPelaksanaan } from "@/lib/data/action/pesertaPelaksanaanAction";

interface StatusKelulusanSelectProps {
  /** ID baris PesertaPelaksanaan. */
  id: string;
  /** Nama peserta untuk label aksesibilitas. */
  nama: string;
  /** Status saat ini, null = belum ada hasil. */
  status: StatusPeserta | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

/** Dropdown status kelulusan yang tersimpan langsung saat dipilih. */
const StatusKelulusanSelect: React.FC<StatusKelulusanSelectProps> = ({ id, nama, status, onSuccess, onError }) => {
  const [value, setValue] = useState(status ?? "");
  const [busy, setBusy] = useState(false);

  const change = async (next: string) => {
    const previous = value;
    setValue(next);
    setBusy(true);
    try {
      const result = await updateStatusPesertaPelaksanaan(id, (next || null) as StatusPeserta | null);
      if (!result.success) {
        setValue(previous);
        onError(result.error ?? "Gagal mengubah status kelulusan.");
      } else {
        onSuccess("Status kelulusan diperbarui.");
      }
    } catch {
      setValue(previous);
      onError("Gagal mengubah status kelulusan.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <select value={value} disabled={busy} aria-label={`Status kelulusan ${nama}`}
      onChange={(event) => void change(event.target.value)}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300">
      <option value="">Belum ada hasil</option>
      {Object.values(StatusPeserta).map((item) => (
        <option key={item} value={item}>{statusPesertaLabels[item]}</option>
      ))}
    </select>
  );
};

export default StatusKelulusanSelect;
