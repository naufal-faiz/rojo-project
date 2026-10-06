"use client";
import React, { useCallback, useId, useRef, useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import SearchableSelect, { SearchOption } from "@/components/main/common/SearchableSelect";
import { CheckLineIcon, CloseLineIcon, PlusIcon } from "@/icons/index";
import { TipePic } from "@/lib/generated/prisma/enums";
import { createPicAndLink, linkPic } from "@/lib/data/action/picAction";
import { updatePic } from "@/lib/data/action/updatePicAction";
import { searchPicOptions } from "@/lib/data/action/searchOptionsAction";
import { companySelectClass, PerusahaanPanelProps, PicData } from "./perusahaanTypes";

interface PicFormProps extends Pick<PerusahaanPanelProps, "perusahaanId" | "flash"> {
  /** PIC terhubung yang sedang diubah, atau kosong untuk tambah. */
  editData?: PicData;
  onClose: () => void;
}
const PicForm: React.FC<PicFormProps> = ({ perusahaanId, flash, editData, onClose }) => {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState("baru");
  const [nama, setNama] = useState(editData?.nama ?? "");
  const [noTelp, setNoTelp] = useState(editData?.noTelp ?? "");
  const [tipe, setTipe] = useState<TipePic>(editData?.tipe ?? TipePic.INTERNAL);
  const [selected, setSelected] = useState<SearchOption | null>(null);
  const [busy, setBusy] = useState(false);
  const search = useCallback((query: string) => searchPicOptions(query, perusahaanId, true), [perusahaanId]);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const again = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "again";
    if (mode === "master" && !selected) { flash.showError("Pilih PIC terlebih dahulu."); return; }
    setBusy(true);
    try {
      const result = editData ? await updatePic(perusahaanId, editData.id, { nama, noTelp, tipe }) :
        mode === "master" ? await linkPic(perusahaanId, selected!.id) : await createPicAndLink(perusahaanId, { nama, noTelp, tipe });
      if (!result.success) { flash.showError(result.error ?? "Gagal menyimpan PIC."); return; }
      flash.showSuccess("PIC tersimpan.");
      if (again) { setNama(""); setNoTelp(""); setSelected(null); requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>("input")?.focus()); }
      else onClose();
    } catch { flash.showError("Gagal menyimpan PIC."); }
    finally { setBusy(false); }
  };
  return (
    <form ref={form} onSubmit={save} className="space-y-3" aria-busy={busy}>
      {!editData && <label className="block">Cara tambah<select className={companySelectClass} value={mode} disabled={busy} onChange={(e) => setMode(e.target.value)}>
        <option value="baru">PIC baru</option><option value="master">Hubungkan PIC yang ada</option>
      </select></label>}
      {editData && editData._count.perusahaanPic > 1 && <p className="text-sm text-warning-600 dark:text-warning-400">PIC ini juga terhubung ke perusahaan lain. Perubahan berlaku untuk semua perusahaan terkait.</p>}
      {mode === "master" ? <SearchableSelect search={search} value={selected} disabled={busy}
        onChange={(value) => setSelected(Array.isArray(value) ? value[0] ?? null : value)} placeholder="Cari PIC..." /> : <>
        <div><Label htmlFor={id}>Nama PIC</Label><Input id={id} inputRef={input} autoFocus required value={nama} onChange={(e) => setNama(e.target.value)} /></div>
        <div><Label htmlFor={`${id}-telp`}>Telepon</Label><Input id={`${id}-telp`} type="tel" value={noTelp} onChange={(e) => setNoTelp(e.target.value)} /></div>
        <label className="block">Tipe<select className={companySelectClass} value={tipe} onChange={(e) => setTipe(e.target.value as TipePic)}>
          {Object.values(TipePic).map((value) => <option key={value} value={value}>{value === "INTERNAL" ? "Internal" : value === "DINAS" ? "Dinas" : "Mitra"}</option>)}
        </select></label>
      </>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" isLoading={busy} startIcon={<CheckLineIcon className="size-4" />}>Simpan</Button>
        {!editData && <Button type="submit" value="again" size="sm" variant="outline" disabled={busy} startIcon={<PlusIcon className="size-4" />}>Simpan &amp; tambah lagi</Button>}
        <Button size="sm" variant="outline" disabled={busy} onClick={onClose} startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>
      </div>
    </form>
  );
};
export default PicForm;
