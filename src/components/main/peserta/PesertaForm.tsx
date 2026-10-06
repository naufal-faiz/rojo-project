"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import SearchableSelect, { SearchOption } from "@/components/main/common/SearchableSelect";
import { CheckLineIcon, CloseLineIcon, PlusIcon } from "@/icons/index";
import { getCabangOptions, searchPerusahaanOptions } from "@/lib/data/action/searchOptionsAction";
import { createPeserta, updatePeserta } from "@/lib/data/action/pesertaAction";
import type useFlash from "@/components/main/common/useFlash";

export interface PesertaEditData {
  id: string;
  nama: string;
  cabang?: {
    id: string;
    nama: string;
    perusahaan: { id: string; nama: string };
  } | null;
}

interface CabangOption {
  id: string;
  nama: string;
  tipe: string;
}

interface PesertaFormProps {
  /** Data peserta saat mode ubah, kosong saat tambah. */
  editData?: PesertaEditData;
  /** Notifikasi milik halaman daftar/detail. */
  flash: ReturnType<typeof useFlash>;
  onClose: () => void;
}

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300";

const PesertaForm: React.FC<PesertaFormProps> = ({ editData, flash, onClose }) => {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [nama, setNama] = useState(editData?.nama ?? "");
  const [perusahaan, setPerusahaan] = useState<SearchOption | null>(
    editData?.cabang ? { id: editData.cabang.perusahaan.id, label: editData.cabang.perusahaan.nama } : null,
  );
  const [cabangId, setCabangId] = useState(editData?.cabang?.id ?? "");
  const [cabangOptions, setCabangOptions] = useState<CabangOption[]>([]);
  const [busy, setBusy] = useState(false);
  const { showError, showSuccess } = flash;

  // Muat pilihan cabang setiap perusahaan berubah; default ke HQ.
  useEffect(() => {
    if (!perusahaan) return;
    let cancelled = false;
    getCabangOptions(perusahaan.id)
      .then((rows) => {
        if (cancelled) return;
        setCabangOptions(rows);
        setCabangId((current) =>
          current && rows.some((row) => row.id === current)
            ? current
            : rows.find((row) => row.tipe === "HQ")?.id ?? rows[0]?.id ?? ""
        );
      })
      .catch(() => { if (!cancelled) showError("Gagal memuat daftar cabang."); });
    return () => { cancelled = true; };
  }, [perusahaan, showError]);

  const pilihPerusahaan = (value: SearchOption | SearchOption[] | null) => {
    const option = Array.isArray(value) ? value[0] ?? null : value;
    setPerusahaan(option);
    if (!option) {
      setCabangOptions([]);
      setCabangId("");
    }
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (perusahaan && !cabangId) {
      showError("Pilih cabang peserta terlebih dahulu.");
      return;
    }
    const again = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "again";
    setBusy(true);
    try {
      const payload = { nama, perusahaanCabangId: perusahaan ? cabangId || null : null };
      const result = editData ? await updatePeserta(editData.id, payload) : await createPeserta(payload);
      if (!result.success) {
        showError(result.error ?? "Gagal menyimpan peserta.");
        return;
      }
      showSuccess(editData ? "Peserta diperbarui." : "Peserta ditambahkan.");
      if (editData) { onClose(); return; }
      setNama("");
      setPerusahaan(null);
      setCabangId("");
      setCabangOptions([]);
      if (again) requestAnimationFrame(() => input.current?.focus());
      else onClose();
    } catch {
      showError("Gagal menyimpan peserta.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-3" aria-busy={busy}>
      <div>
        <Label htmlFor={`${id}-nama`}>Nama peserta</Label>
        <Input id={`${id}-nama`} inputRef={input} autoFocus required value={nama}
          onChange={(event) => setNama(event.target.value)} />
      </div>
      <div>
        <span className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Perusahaan (opsional)</span>
        <SearchableSelect search={searchPerusahaanOptions} value={perusahaan} disabled={busy}
          onChange={pilihPerusahaan} placeholder="Cari perusahaan..." />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Kosongkan bila peserta mandiri (tanpa perusahaan).</p>
      </div>
      {perusahaan && (
        <label className="block">
          <span className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Cabang</span>
          <select required value={cabangId} disabled={busy}
            onChange={(event) => setCabangId(event.target.value)} className={selectClass}>
            <option value="">Pilih cabang</option>
            {cabangOptions.map((cabang) => <option key={cabang.id} value={cabang.id}>{cabang.nama}</option>)}
          </select>
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" isLoading={busy} startIcon={<CheckLineIcon className="size-4" />}>Simpan</Button>
        {!editData && (
          <Button type="submit" value="again" size="sm" variant="outline" disabled={busy}
            startIcon={<PlusIcon className="size-4" />}>Simpan &amp; tambah lagi</Button>
        )}
        <Button size="sm" variant="outline" onClick={onClose} disabled={busy}
          startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>
      </div>
    </form>
  );
};

export default PesertaForm;
