"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import SearchableSelect, { SearchOption } from "@/components/main/common/SearchableSelect";
import { CheckLineIcon, CloseLineIcon } from "@/icons/index";
import { searchPerusahaanOptions } from "@/lib/data/action/searchOptionsAction";
import { createPendaftaran, getPicPerusahaan } from "@/lib/data/action/pendaftaranPerusahaanAction";
import type useFlash from "@/components/main/common/useFlash";

interface PicOption {
  id: string;
  nama: string;
  tipe: string;
}

interface PendaftaranFormProps {
  /** Permohonan tujuan pendaftaran. */
  pelaksanaanId: string;
  /** Notifikasi panel. */
  flash: ReturnType<typeof useFlash>;
  onClose: () => void;
}

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300";

const PendaftaranForm: React.FC<PendaftaranFormProps> = ({ pelaksanaanId, flash, onClose }) => {
  const [perusahaan, setPerusahaan] = useState<SearchOption | null>(null);
  const [picOptions, setPicOptions] = useState<PicOption[]>([]);
  const [picId, setPicId] = useState("");
  const [busy, setBusy] = useState(false);
  const { showError, showSuccess } = flash;

  useEffect(() => {
    if (!perusahaan) return;
    let cancelled = false;
    getPicPerusahaan(perusahaan.id).then((rows) => {
      if (!cancelled) { setPicOptions(rows); setPicId(""); }
    });
    return () => { cancelled = true; };
  }, [perusahaan]);

  const pilihPerusahaan = (value: SearchOption | SearchOption[] | null) => {
    const option = Array.isArray(value) ? value[0] ?? null : value;
    setPerusahaan(option);
    if (!option) { setPicOptions([]); setPicId(""); }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!perusahaan) { showError("Pilih perusahaan terlebih dahulu."); return; }
    if (busy) return;
    setBusy(true);
    try {
      const result = await createPendaftaran({ pelaksanaanId, perusahaanId: perusahaan.id, picId: picId || null });
      if (!result.success) { showError(result.error ?? "Gagal menambah pendaftaran."); return; }
      showSuccess(result.message);
      onClose();
    } catch { showError("Gagal menambah pendaftaran."); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={save} className="space-y-3" aria-busy={busy}>
      <div>
        <span className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Perusahaan</span>
        <SearchableSelect search={searchPerusahaanOptions} value={perusahaan} disabled={busy}
          onChange={pilihPerusahaan} placeholder="Cari perusahaan..." />
      </div>
      {perusahaan && (
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700 dark:text-gray-300">PIC penerima sertifikat (opsional)</span>
          <select value={picId} disabled={busy} onChange={(event) => setPicId(event.target.value)} className={selectClass}>
            <option value="">Belum ditentukan</option>
            {picOptions.map((pic) => <option key={pic.id} value={pic.id}>{pic.nama} ({pic.tipe})</option>)}
          </select>
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" isLoading={busy} startIcon={<CheckLineIcon className="size-4" />}>Simpan</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={onClose}
          startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>
      </div>
    </form>
  );
};

export default PendaftaranForm;
