"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import ComponentCard from "@/components/main/common/ComponentCard";
import FlashAlert from "@/components/main/common/FlashAlert";
import useFlash from "@/components/main/common/useFlash";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { PencilIcon, TrashBinIcon } from "@/icons/index";
import { deletePerusahaan } from "@/lib/data/action/perusahaanAction";
import PerusahaanForm from "./PerusahaanForm";
import CabangManager from "./CabangManager";
import PicManager from "./PicManager";
import PerusahaanPesertaList from "./PerusahaanPesertaList";
import { PerusahaanDetailData } from "./perusahaanTypes";

interface PerusahaanDetailProps {
  /** Informasi dan halaman data anak hasil pembacaan server. */
  data: PerusahaanDetailData;
}
const PerusahaanDetail: React.FC<PerusahaanDetailProps> = ({ data }) => {
  const router = useRouter();
  const params = useSearchParams();
  const flash = useFlash(params.get("created") === "1" ? { variant: "success", message: "Perusahaan disimpan. Cabang HQ dibuat otomatis." } : null);
  const [editing, setEditing] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const perusahaan = data.perusahaan;
  const panel = { perusahaanId: perusahaan.id, flash, confirmId, setConfirmId };
  useEffect(() => {
    if (params.has("created")) {
      const next = new URLSearchParams(params.toString());
      next.delete("created");
      router.replace(`?${next}`, { scroll: false });
    }
  }, [params, router]);
  const remove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await deletePerusahaan(perusahaan.id);
      if (result.success) router.push("/master/perusahaan?deleted=1");
      else flash.showError(result.error ?? "Gagal menghapus perusahaan.");
    } catch { flash.showError("Gagal menghapus perusahaan."); }
    finally { setBusy(false); }
  };
  return (
    <div className="p-4 text-gray-700 dark:text-gray-300 sm:p-6">
      <PageHeader title={perusahaan.nama} backHref="/master/perusahaan"
        badges={<><Badge>{perusahaan.cabang.length} cabang</Badge><Badge>{perusahaan.perusahaanPic.length} PIC</Badge><Badge>{data.totalPeserta} peserta</Badge></>}
        primaryAction={{ label: "Ubah", icon: <PencilIcon className="size-4" />, onClick: () => { setEditing(true); setConfirmId(null); } }}
        actions={<Button size="sm" variant="outline" disabled={busy} onClick={() => { setConfirmId("perusahaan"); setEditing(false); }} startIcon={<TrashBinIcon className="size-4" />}>Hapus</Button>} />
      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      {confirmId === "perusahaan" && <InlineConfirm message="Hapus perusahaan ini? Pendaftaran dan peserta aktif harus diselesaikan terlebih dahulu." onConfirm={remove} onCancel={() => setConfirmId(null)} loading={busy} />}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <ComponentCard title="Informasi Perusahaan" className="lg:col-span-3">
          {editing ? <PerusahaanForm editData={perusahaan} flash={flash} onClose={() => setEditing(false)} /> : <dl className="space-y-3">
            <div><dt className="text-sm">Nama</dt><dd className="font-medium">{perusahaan.nama}</dd></div>
            <div><dt className="text-sm">Alamat legal</dt><dd>{perusahaan.alamatLegal || "-"}</dd></div>
            <div><dt className="text-sm">Dibuat</dt><dd>{new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(perusahaan.createdAt))}</dd></div>
            <div><dt className="text-sm">Ringkasan</dt><dd>{perusahaan.cabang.length} cabang, {perusahaan.perusahaanPic.length} PIC, {data.totalPeserta} peserta aktif</dd></div>
          </dl>}
        </ComponentCard>
        <CabangManager {...panel} cabang={data.cabang} totalCabang={perusahaan.cabang.length} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        <PicManager {...panel} picList={perusahaan.perusahaanPic} />
        <PerusahaanPesertaList {...panel} cabang={perusahaan.cabang} peserta={data.peserta} />
      </div>
    </div>
  );
};
export default PerusahaanDetail;
