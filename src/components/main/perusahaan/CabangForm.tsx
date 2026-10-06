"use client";
import React, { useId, useRef, useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { CheckLineIcon, CloseLineIcon, PlusIcon } from "@/icons/index";
import { TipeCabang } from "@/lib/generated/prisma/enums";
import { createCabang, updateCabang } from "@/lib/data/action/cabangAction";
import { CabangData, companySelectClass, PerusahaanPanelProps } from "./perusahaanTypes";

interface CabangFormProps extends Pick<PerusahaanPanelProps, "perusahaanId" | "flash"> {
  /** Cabang yang diubah; HQ tetap memiliki tipe yang sama. */
  editData?: CabangData;
  onClose: () => void;
}
const CabangForm: React.FC<CabangFormProps> = ({ perusahaanId, flash, editData, onClose }) => {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [nama, setNama] = useState(editData?.nama ?? "");
  const [alamat, setAlamat] = useState(editData?.alamat ?? "");
  const [tipe, setTipe] = useState<TipeCabang>(editData?.tipe ?? TipeCabang.CABANG);
  const [busy, setBusy] = useState(false);
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const again = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "again";
    setBusy(true);
    try {
      const result = editData ? await updateCabang(editData.id, { nama, alamat, tipe }) : await createCabang(perusahaanId, { nama, alamat, tipe });
      if (!result.success) { flash.showError(result.error ?? "Gagal menyimpan cabang."); return; }
      flash.showSuccess("Cabang disimpan.");
      if (again) { setNama(""); setAlamat(""); input.current?.focus(); }
      else onClose();
    } catch { flash.showError("Gagal menyimpan cabang."); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="space-y-3" aria-busy={busy}>
      <div><Label htmlFor={id}>Nama cabang</Label><Input id={id} inputRef={input} autoFocus required value={nama} onChange={(e) => setNama(e.target.value)} /></div>
      <div><Label htmlFor={`${id}-alamat`}>Alamat</Label><Input id={`${id}-alamat`} value={alamat} onChange={(e) => setAlamat(e.target.value)} /></div>
      <label className="block">Tipe
        <select className={companySelectClass} value={tipe} disabled={editData?.tipe === TipeCabang.HQ} onChange={(e) => setTipe(e.target.value as TipeCabang)}>
          {editData?.tipe === TipeCabang.HQ && <option value={TipeCabang.HQ}>HQ</option>}
          <option value={TipeCabang.CABANG}>Cabang</option><option value={TipeCabang.DEPOT}>Depot</option>
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" isLoading={busy} startIcon={<CheckLineIcon className="size-4" />}>Simpan</Button>
        {!editData && <Button type="submit" value="again" size="sm" variant="outline" disabled={busy} startIcon={<PlusIcon className="size-4" />}>Simpan &amp; tambah lagi</Button>}
        <Button size="sm" variant="outline" disabled={busy} onClick={onClose} startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>
      </div>
    </form>
  );
};
export default CabangForm;
