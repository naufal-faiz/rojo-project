"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import ComponentCard from "@/components/main/common/ComponentCard";
import FlashAlert from "@/components/main/common/FlashAlert";
import useFlash from "@/components/main/common/useFlash";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { ArrowRightIcon, PencilIcon, TrashBinIcon } from "@/icons/index";
import { jenisKegiatanLabels, jenisSertifikasiLabels, labelTingkatan } from "@/components/main/common/enumLabels";
import { deletePelaksanaan } from "@/lib/data/action/pelaksanaanAction";
import { JenisSertifikasi } from "@/lib/generated/prisma/enums";
import InformasiKegiatanCard from "./InformasiKegiatanCard";
import StatusTemanK3Panel from "./StatusTemanK3Panel";
import PesertaPerusahaanCard from "./PesertaPerusahaanCard";
import PesertaMandiriCard from "./PesertaMandiriCard";
import type { PermohonanUbahData } from "./permohonanTypes";

interface PermohonanDetailProps {
  /** Detail permohonan beserta pendaftaran dan pesertanya. */
  data: PermohonanUbahData;
}

const PermohonanDetail: React.FC<PermohonanDetailProps> = ({ data }) => {
  const router = useRouter();
  const params = useSearchParams();
  const flash = useFlash(
    params.get("created") === "1"
      ? { variant: "success", message: "Permohonan disimpan. Status TemanK3 dapat diisi dari halaman ini." }
      : params.get("updated") === "1"
        ? { variant: "success", message: "Perubahan permohonan disimpan." }
        : null,
  );
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.has("created") || params.has("updated")) {
      const next = new URLSearchParams(params.toString());
      next.delete("created");
      next.delete("updated");
      router.replace(`?${next}`, { scroll: false });
    }
  }, [params, router]);

  const remove = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await deletePelaksanaan(data.id);
      if (result.success) router.push("/permohonan?deleted=1");
      else flash.showError(result.error ?? "Gagal menghapus permohonan.");
    } catch { flash.showError("Gagal menghapus permohonan."); }
    finally { setBusy(false); }
  };

  // Kartu status hanya untuk KEMNAKER; BNSP/INTERNAL menyembunyikannya (A-01..A-03).
  const tampilkanStatus = data.jenisSertifikasi === JenisSertifikasi.KEMNAKER;

  return (
    <div className="p-4 text-gray-700 dark:text-gray-300 sm:p-6">
      <PageHeader title={labelTingkatan(data.tingkatan)} backHref="/permohonan"
        description={data.noPermohonan ? `No. Permohonan ${data.noPermohonan}` : "Tanpa nomor permohonan"}
        badges={<>
          <Badge>{jenisSertifikasiLabels[data.jenisSertifikasi]}</Badge>
          <Badge>{jenisKegiatanLabels[data.jenisKegiatan]}</Badge>
        </>}
        primaryAction={{ label: "Kelola Pendaftaran", href: `/pendaftaran/${data.id}`, icon: <ArrowRightIcon className="size-4" /> }}
        actions={<>
          <Link href={`/permohonan/${data.id}/ubah`}>
            <Button size="sm" variant="outline" startIcon={<PencilIcon className="size-4" />}>Ubah</Button>
          </Link>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => setConfirm(true)}
            startIcon={<TrashBinIcon className="size-4" />}>Hapus</Button>
        </>} />
      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      {confirm && (
        <div className="mb-4">
          <InlineConfirm message="Hapus permohonan ini? Pendaftaran dan peserta aktif harus diselesaikan terlebih dahulu."
            onConfirm={remove} onCancel={() => setConfirm(false)} loading={busy} />
        </div>
      )}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <InformasiKegiatanCard data={data} full={!tampilkanStatus} />
        {tampilkanStatus && (
          <ComponentCard title="Status TemanK3 & Unggah Berkas" className="lg:col-span-2"
            desc="Catat status permohonan ke TemanK3 beserta tanggal unggah berkas.">
            <StatusTemanK3Panel pelaksanaanId={data.id} status={data.status} uploadedAt={data.uploadedAt} />
          </ComponentCard>
        )}
      </div>
      <div className="space-y-6">
        <PesertaPerusahaanCard pendaftaran={data.pendaftaran} />
        <PesertaMandiriCard peserta={data.pesertaPelaksanaan} />
      </div>
    </div>
  );
};

export default PermohonanDetail;
