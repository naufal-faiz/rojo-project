"use client";
import React, { useId, useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import DatePickerInput from "@/components/main/common/DatePickerInput";
import { keTanggalInput } from "@/components/main/common/formatTanggal";
import { statusPesertaLabels } from "@/components/main/common/StatusBadge";
import { updateSertifikat } from "@/lib/data/action/sertifikatAction";
import { JenisSertifikasi, StatusPeserta } from "@/lib/generated/prisma/enums";
import { CheckLineIcon, CloseLineIcon } from "@/icons/index";
import type useFlash from "@/components/main/common/useFlash";
import type { SertifikatRow } from "./SertifikatColumns";

interface SertifikatFormProps {
  /** Baris yang sedang diubah dan notifikasi milik halaman. */
  data: SertifikatRow;
  flash: ReturnType<typeof useFlash>;
  onClose: () => void;
}
const SertifikatForm: React.FC<SertifikatFormProps> = ({ data, flash, onClose }) => {
  const id = useId();
  const internal = data.pelaksanaan.jenisSertifikasi === JenisSertifikasi.INTERNAL;
  const kemnaker = data.pelaksanaan.jenisSertifikasi === JenisSertifikasi.KEMNAKER;
  const [status, setStatus] = useState<StatusPeserta | "">(data.status ?? "");
  const [noRegistrasi, setNoRegistrasi] = useState(data.noRegistrasi ?? "");
  const [noSertifikat, setNoSertifikat] = useState(data.noSertifikat ?? "");
  const [masaBerlaku, setMasaBerlaku] = useState(keTanggalInput(data.masaBerlaku));
  const [noSkp, setNoSkp] = useState(data.noSkp ?? "");
  const [tanggalTerima, setTanggalTerima] = useState(keTanggalInput(data.tanggalTerimaSertifikat));
  const [catatan, setCatatan] = useState(data.catatan ?? "");
  const [loading, setLoading] = useState(false);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const result = await updateSertifikat(data.id, {
        status: status || null, noRegistrasi, noSertifikat, masaBerlaku, noSkp,
        tanggalTerimaSertifikat: tanggalTerima, catatan,
      });
      if (!result.success) { flash.showError(result.error); return; }
      if (result.peringatan) flash.showWarning(`Data sertifikat disimpan. ${result.peringatan}`);
      else flash.showSuccess("Data sertifikat disimpan.");
      onClose();
    } catch { flash.showError("Gagal menyimpan sertifikat. Coba lagi."); }
    finally { setLoading(false); }
  };
  return (
    <form onSubmit={save} className="space-y-4" aria-label={`Ubah sertifikat ${data.peserta.nama}`} aria-busy={loading}>
      <h2 className="font-semibold">Ubah Sertifikat / Hasil — {data.peserta.nama}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div><Label htmlFor={`${id}-status`}>Status Hasil</Label>
          <select id={`${id}-status`} autoFocus value={status} onChange={(e) => setStatus(e.target.value as StatusPeserta | "")}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300">
            <option value="">Belum ada hasil</option>
            {Object.values(StatusPeserta).map((value) => <option key={value} value={value}>{statusPesertaLabels[value]}</option>)}
          </select>
        </div>
        {!internal && <>
          <div><Label htmlFor={`${id}-registrasi`}>No. Registrasi</Label><Input id={`${id}-registrasi`} value={noRegistrasi} onChange={(e) => setNoRegistrasi(e.target.value)} /></div>
          <div><Label htmlFor={`${id}-sertifikat`}>No. Sertifikat</Label><Input id={`${id}-sertifikat`} value={noSertifikat} onChange={(e) => setNoSertifikat(e.target.value)} /></div>
          <div><Label>Masa Berlaku</Label><DatePickerInput value={masaBerlaku} onChange={setMasaBerlaku} placeholder="Pilih tanggal masa berlaku" /></div>
          {kemnaker && <div><Label htmlFor={`${id}-skp`}>No. SKP (KEMNAKER)</Label><Input id={`${id}-skp`} value={noSkp} onChange={(e) => setNoSkp(e.target.value)} /></div>}
        </>}
        <div><Label>Tanggal Terima Sertifikat</Label><DatePickerInput value={tanggalTerima} onChange={setTanggalTerima} placeholder="Pilih tanggal terima" /></div>
      </div>
      <div><Label>Catatan</Label><TextArea value={catatan} onChange={setCatatan} placeholder="Catatan tambahan (opsional)" rows={2} /></div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" isLoading={loading} startIcon={<CheckLineIcon className="size-4" />}>Simpan</Button>
        <Button size="sm" variant="outline" onClick={onClose} disabled={loading} startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>
      </div>
    </form>
  );
};
export default SertifikatForm;
