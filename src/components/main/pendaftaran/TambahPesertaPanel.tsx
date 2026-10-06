"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { CheckLineIcon, CloseLineIcon, PlusIcon } from "@/icons/index";
import { addPesertaPendaftaran } from "@/lib/data/action/pesertaPelaksanaanAction";
import { createPesertaPendaftaran } from "@/lib/data/action/pesertaBaruPendaftaranAction";
import { getCabangOptions } from "@/lib/data/action/searchOptionsAction";
import type useFlash from "@/components/main/common/useFlash";
import PesertaMasterList, { PesertaOption } from "./PesertaMasterList";

interface TambahPesertaPanelProps {
  /** Permohonan yang sedang dikelola. */
  pelaksanaanId: string;
  /** null = peserta mandiri. */
  pendaftaranPerusahaanId: string | null;
  /** Perusahaan pendaftar untuk pilihan cabang; null/kosong saat mandiri. */
  perusahaanId?: string | null;
  flash: ReturnType<typeof useFlash>;
  onClose: () => void;
}

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300";

const TambahPesertaPanel: React.FC<TambahPesertaPanelProps> = ({
  pelaksanaanId,
  pendaftaranPerusahaanId,
  perusahaanId,
  flash,
  onClose,
}) => {
  const id = useId();
  const namaRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"master" | "baru">("master");
  const [selected, setSelected] = useState<PesertaOption[]>([]);
  const [nama, setNama] = useState("");
  const [cabangId, setCabangId] = useState("");
  const [cabangOptions, setCabangOptions] = useState<{ id: string; nama: string; tipe: string }[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!perusahaanId) return;
    let cancelled = false;
    getCabangOptions(perusahaanId).then((rows) => {
      if (cancelled) return;
      setCabangOptions(rows);
      setCabangId(rows.find((row) => row.tipe === "HQ")?.id ?? rows[0]?.id ?? "");
    });
    return () => { cancelled = true; };
  }, [perusahaanId]);

  const toggle = (peserta: PesertaOption) =>
    setSelected((current) =>
      current.some((item) => item.id === peserta.id)
        ? current.filter((item) => item.id !== peserta.id)
        : [...current, peserta]
    );

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (mode === "master") {
      if (!selected.length) { flash.showError("Pilih minimal satu peserta."); return; }
      setBusy(true);
      try {
        const result = await addPesertaPendaftaran({
          pelaksanaanId, pendaftaranPerusahaanId, pesertaIds: selected.map((item) => item.id),
        });
        if (!result.success) { flash.showError(result.error ?? "Gagal menambah peserta."); return; }
        flash.showSuccess(result.message);
        onClose();
      } catch { flash.showError("Gagal menambah peserta."); }
      finally { setBusy(false); }
      return;
    }

    if (!nama.trim()) { flash.showError("Nama peserta wajib diisi."); return; }
    const again = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "again";
    setBusy(true);
    try {
      const result = await createPesertaPendaftaran({
        nama, pelaksanaanId, pendaftaranPerusahaanId, cabangId: perusahaanId ? cabangId : null,
      });
      if (!result.success) { flash.showError(result.error ?? "Gagal menyimpan peserta."); return; }
      flash.showSuccess(result.message);
      setNama("");
      if (again) requestAnimationFrame(() => namaRef.current?.focus());
      else onClose();
    } catch { flash.showError("Gagal menyimpan peserta."); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-3" aria-busy={busy}>
      <label className="block">
        <span className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Cara tambah</span>
        <select value={mode} disabled={busy} className={selectClass}
          onChange={(event) => { setMode(event.target.value as "master" | "baru"); setSelected([]); }}>
          <option value="master">Pilih dari master</option>
          <option value="baru">Peserta baru</option>
        </select>
      </label>

      {mode === "master" ? (
        <PesertaMasterList pelaksanaanId={pelaksanaanId} pendaftaranPerusahaanId={pendaftaranPerusahaanId}
          selectedIds={selected.map((item) => item.id)} onToggle={toggle} />
      ) : (
        <>
          <div>
            <Label htmlFor={`${id}-nama`}>Nama peserta</Label>
            <Input id={`${id}-nama`} inputRef={namaRef} autoFocus required value={nama}
              onChange={(event) => setNama(event.target.value)} />
          </div>
          {perusahaanId && (
            <label className="block">
              <span className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Cabang (default HQ)</span>
              <select value={cabangId} disabled={busy} onChange={(event) => setCabangId(event.target.value)} className={selectClass}>
                <option value="">Pilih cabang</option>
                {cabangOptions.map((cabang) => <option key={cabang.id} value={cabang.id}>{cabang.nama}</option>)}
              </select>
            </label>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-2">
        {mode === "master" ? (
          <Button type="submit" size="sm" isLoading={busy} disabled={busy || selected.length === 0}
            startIcon={<CheckLineIcon className="size-4" />}>
            Tambah{selected.length ? ` ${selected.length}` : ""} Peserta
          </Button>
        ) : (
          <>
            <Button type="submit" size="sm" isLoading={busy} startIcon={<CheckLineIcon className="size-4" />}>Simpan</Button>
            <Button type="submit" value="again" size="sm" variant="outline" disabled={busy}
              startIcon={<PlusIcon className="size-4" />}>Simpan &amp; tambah lagi</Button>
          </>
        )}
        <Button size="sm" variant="outline" disabled={busy} onClick={onClose}
          startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>
      </div>
    </form>
  );
};

export default TambahPesertaPanel;
