"use client";
import React, { useCallback, useId, useRef, useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import SearchableSelect, { SearchOption } from "@/components/main/common/SearchableSelect";
import { CheckLineIcon, CloseLineIcon, PlusIcon } from "@/icons/index";
import { searchPesertaOptions } from "@/lib/data/action/searchOptionsAction";
import { savePerusahaanPeserta } from "@/lib/data/action/perusahaanPesertaAction";
import { CabangOption, companySelectClass, PerusahaanPanelProps, PesertaData } from "./perusahaanTypes";

interface PerusahaanPesertaFormProps extends Pick<PerusahaanPanelProps, "perusahaanId" | "flash"> {
  /** Pilihan cabang aktif dan peserta yang sedang diubah. */
  cabang: CabangOption[];
  editData?: PesertaData;
  onClose: () => void;
}
const PerusahaanPesertaForm: React.FC<PerusahaanPesertaFormProps> = ({ perusahaanId, flash, cabang, editData, onClose }) => {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState("baru");
  const [nama, setNama] = useState(editData?.nama ?? "");
  const [cabangId, setCabangId] = useState(editData?.perusahaanCabangId ?? cabang.find((row) => row.tipe === "HQ")?.id ?? "");
  const [selected, setSelected] = useState<SearchOption | null>(null);
  const [busy, setBusy] = useState(false);
  const search = useCallback((query: string) => searchPesertaOptions(query, true), []);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const again = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "again";
    if (mode === "master" && !selected) { flash.showError("Pilih peserta dari master terlebih dahulu."); return; }
    setBusy(true);
    try {
      const result = await savePerusahaanPeserta(perusahaanId, {
        nama, cabangId, editId: editData?.id, masterId: mode === "master" ? selected?.id : undefined,
      });
      if (!result.success) {
        if ("existingId" in result && result.existingId) flash.showWarning(result.error ?? "Nama sudah ada.", `/master/peserta/${result.existingId}`, "Buka peserta");
        else flash.showError(result.error ?? "Gagal menyimpan peserta.");
        return;
      }
      flash.showSuccess("Peserta tersimpan sebagai peserta perusahaan ini.");
      if (again) { setNama(""); setSelected(null); requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>("input")?.focus()); }
      else onClose();
    } catch { flash.showError("Gagal menyimpan peserta."); }
    finally { setBusy(false); }
  };
  return (
    <form ref={form} onSubmit={save} className="space-y-3" aria-busy={busy}>
      {!editData && <label className="block">Cara tambah
        <select value={mode} disabled={busy} onChange={(e) => setMode(e.target.value)} className={companySelectClass}>
          <option value="baru">Peserta baru</option><option value="master">Hubungkan dari master</option>
        </select>
      </label>}
      {mode === "baru" ? <div><Label htmlFor={id}>Nama peserta</Label>
        <Input id={id} autoFocus inputRef={input} required value={nama} onChange={(e) => setNama(e.target.value)} /></div> :
        <SearchableSelect search={search} value={selected} onChange={(value) => setSelected(Array.isArray(value) ? value[0] ?? null : value)} disabled={busy} placeholder="Cari peserta tanpa perusahaan..." />}
      <label className="block">Cabang
        <select required value={cabangId} onChange={(e) => setCabangId(e.target.value)} className={companySelectClass}>
          <option value="">Pilih cabang</option>{cabang.map((row) => <option key={row.id} value={row.id}>{row.nama}</option>)}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" isLoading={busy} startIcon={<CheckLineIcon className="size-4" />}>Simpan</Button>
        {!editData && <Button type="submit" value="again" size="sm" variant="outline" disabled={busy} startIcon={<PlusIcon className="size-4" />}>Simpan &amp; tambah lagi</Button>}
        <Button size="sm" variant="outline" onClick={onClose} disabled={busy} startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>
      </div>
    </form>
  );
};
export default PerusahaanPesertaForm;
