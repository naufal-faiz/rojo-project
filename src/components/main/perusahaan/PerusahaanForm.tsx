"use client";
import React, { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { CheckLineIcon, CloseLineIcon } from "@/icons/index";
import { checkDuplicatePerusahaan, createPerusahaan, updatePerusahaan } from "@/lib/data/action/perusahaanAction";
import { PerusahaanPanelProps } from "./perusahaanTypes";

interface PerusahaanFormProps extends Pick<PerusahaanPanelProps, "flash"> {
  /** Data informasi perusahaan, kosong saat membuat. */
  editData?: { id: string; nama: string; alamatLegal: string | null };
  onClose: () => void;
}
const PerusahaanForm: React.FC<PerusahaanFormProps> = ({ flash, editData, onClose }) => {
  const id = useId();
  const router = useRouter();
  const [nama, setNama] = useState(editData?.nama ?? "");
  const [alamatLegal, setAlamatLegal] = useState(editData?.alamatLegal ?? "");
  const [busy, setBusy] = useState(false);
  const { showWarning, showError } = flash;
  useEffect(() => {
    if (!nama.trim() || editData) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const result = await checkDuplicatePerusahaan(nama);
        if (!cancelled && result.exists && result.existingId) showWarning(`Nama mirip dengan ${result.existingName}. Periksa perusahaan yang sudah ada sebelum menyimpan.`, `/master/perusahaan/${result.existingId}`, "Buka perusahaan");
      } catch { if (!cancelled) showError("Pemeriksaan nama gagal. Coba lagi."); }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [nama, editData, showWarning, showError]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const result = editData ? await updatePerusahaan(editData.id, { nama, alamatLegal }) : await createPerusahaan({ nama, alamatLegal });
      if (!result.success) { flash.showError(result.error ?? "Gagal menyimpan perusahaan."); return; }
      if ("id" in result && result.id) router.push(`/master/perusahaan/${result.id}?created=1`);
      else { flash.showSuccess("Informasi perusahaan disimpan."); onClose(); }
    } catch { flash.showError("Gagal menyimpan perusahaan."); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={save} className="space-y-3" aria-busy={busy}>
      <div><Label htmlFor={id}>Nama perusahaan</Label><Input id={id} autoFocus required value={nama} onChange={(e) => setNama(e.target.value)} /></div>
      <div><Label htmlFor={`${id}-alamat`}>Alamat legal (opsional)</Label><Input id={`${id}-alamat`} value={alamatLegal} onChange={(e) => setAlamatLegal(e.target.value)} /></div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" isLoading={busy} startIcon={<CheckLineIcon className="size-4" />}>Simpan</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={onClose} startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>
      </div>
    </form>
  );
};
export default PerusahaanForm;
