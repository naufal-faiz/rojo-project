"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import { CheckLineIcon, CloseLineIcon } from "@/icons/index";
import { getPicPerusahaan, updatePendaftaranPic } from "@/lib/data/action/pendaftaranPerusahaanAction";
import type useFlash from "@/components/main/common/useFlash";

interface PicOption {
  id: string;
  nama: string;
  tipe: string;
}

interface PendaftaranPicFormProps {
  /** Pendaftaran yang PIC-nya diubah. */
  pendaftaranId: string;
  /** Perusahaan pemilik pendaftaran, sumber pilihan PIC. */
  perusahaanId: string;
  /** PIC saat ini, null = belum ditentukan. */
  picId: string | null;
  flash: ReturnType<typeof useFlash>;
  onClose: () => void;
}

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300";

const PendaftaranPicForm: React.FC<PendaftaranPicFormProps> = ({ pendaftaranId, perusahaanId, picId, flash, onClose }) => {
  const [options, setOptions] = useState<PicOption[]>([]);
  const [selected, setSelected] = useState(picId ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPicPerusahaan(perusahaanId).then((rows) => { if (!cancelled) setOptions(rows); });
    return () => { cancelled = true; };
  }, [perusahaanId]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const result = await updatePendaftaranPic(pendaftaranId, selected || null);
      if (!result.success) { flash.showError(result.error ?? "Gagal mengubah PIC."); return; }
      flash.showSuccess("PIC pendaftaran diperbarui.");
      onClose();
    } catch { flash.showError("Gagal mengubah PIC."); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={save} className="space-y-3" aria-busy={busy}>
      <label className="block">
        <span className="mb-1 block text-sm text-gray-700 dark:text-gray-300">PIC penerima sertifikat</span>
        <select value={selected} disabled={busy} onChange={(event) => setSelected(event.target.value)} className={selectClass}>
          <option value="">Lepas PIC / Belum ditentukan</option>
          {options.map((pic) => <option key={pic.id} value={pic.id}>{pic.nama} ({pic.tipe})</option>)}
        </select>
      </label>
      <p className="text-xs text-gray-400 dark:text-gray-500">Pilihan hanya PIC yang terhubung ke perusahaan ini.</p>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" isLoading={busy} startIcon={<CheckLineIcon className="size-4" />}>Simpan PIC</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={onClose}
          startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>
      </div>
    </form>
  );
};

export default PendaftaranPicForm;
