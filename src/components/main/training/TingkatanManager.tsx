"use client";
import React, { useState } from "react";
import RowActions from "@/components/main/common/RowActions";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import { deleteTingkatan } from "@/lib/data/action/trainingAction";
import { KELAS_UMUM } from "@/lib/tingkatan";
import TingkatanForm from "./TingkatanForm";

interface TingkatanManagerProps {
  /** Parent dan daftar tingkatan aktif. */
  trainingId: string;
  tingkatan: { id: string; kelas: string }[];
  /** Konfirmasi dibagi dengan halaman agar hanya satu yang terbuka. */
  confirmId: string | null;
  setConfirmId: (id: string | null) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const TingkatanManager: React.FC<TingkatanManagerProps> = ({ trainingId, tingkatan, confirmId, setConfirmId, onSuccess, onError }) => {
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const remove = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await deleteTingkatan(id);
      if (result.success) {
        setConfirmId(null);
        onSuccess("Tingkatan dihapus.");
      } else onError(result.error ?? "Gagal menghapus.");
    } catch {
      onError("Gagal menghapus tingkatan.");
    } finally {
      setBusy(false);
    }
  };
  const formProps = { trainingId, onSuccess, onError, onClose: () => setEditId(null) };
  return (
    <div className="space-y-3">
      {tingkatan.map((item) => (
        <div key={item.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          {confirmId === item.id ? (
            <InlineConfirm message="Hapus tingkatan ini? Tingkatan yang dipakai permohonan aktif tidak dapat dihapus."
              onConfirm={() => remove(item.id)} onCancel={() => setConfirmId(null)} loading={busy} />
          ) : editId === item.id ? (
            <TingkatanForm key={item.id} {...formProps} editData={item} />
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span>{item.kelas === KELAS_UMUM ? "Tanpa tingkatan" : item.kelas}</span>
              <RowActions disabled={busy} onEdit={() => { setEditId(item.id); setConfirmId(null); }}
                onDelete={() => { setEditId(null); setConfirmId(item.id); }} />
            </div>
          )}
        </div>
      ))}
      {!editId && !confirmId && <TingkatanForm {...formProps} />}
    </div>
  );
};
export default TingkatanManager;
