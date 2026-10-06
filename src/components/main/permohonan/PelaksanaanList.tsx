"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import FilterBar from "@/components/main/common/FilterBar";
import FlashAlert from "@/components/main/common/FlashAlert";
import useFlash from "@/components/main/common/useFlash";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import Button from "@/components/ui/button/Button";
import { PlusIcon, TimeIcon } from "@/icons/index";
import { deletePelaksanaan } from "@/lib/data/action/pelaksanaanAction";
import {
  jenisKegiatanLabels,
  jenisSertifikasiLabels,
  penyelenggaraLabels,
} from "@/components/main/common/enumLabels";
import { statusTemanK3Labels } from "@/components/main/common/StatusBadge";
import {
  JenisKegiatan,
  JenisSertifikasi,
  Penyelenggara,
  StatusTemanK3,
} from "@/lib/generated/prisma/enums";
import { getPelaksanaanColumns, PelaksanaanRow } from "./PelaksanaanColumns";

interface PelaksanaanListProps {
  /** Kegiatan aktif sesuai 5.11 dan filter URL. */
  initialData: PelaksanaanRow[];
  pagination: { page: number; totalItems: number; totalPages: number };
}

const filters = [
  {
    key: "jenisSertifikasi", label: "Jenis Sertifikasi",
    options: Object.values(JenisSertifikasi).map((value) => ({ value, label: jenisSertifikasiLabels[value] })),
  },
  {
    key: "jenisKegiatan", label: "Jenis Kegiatan",
    options: Object.values(JenisKegiatan).map((value) => ({ value, label: jenisKegiatanLabels[value] })),
  },
  {
    key: "penyelenggara", label: "Penyelenggara",
    options: Object.values(Penyelenggara).map((value) => ({ value, label: penyelenggaraLabels[value] })),
  },
  {
    key: "status", label: "Status TemanK3",
    options: [
      { value: "BELUM_UPLOAD", label: "Belum Upload" },
      ...Object.values(StatusTemanK3).map((value) => ({ value, label: statusTemanK3Labels[value] })),
    ],
  },
];

const PelaksanaanList: React.FC<PelaksanaanListProps> = ({ initialData, pagination }) => {
  const router = useRouter();
  const params = useSearchParams();
  const flash = useFlash(params.get("deleted") === "1" ? { variant: "success", message: "Permohonan dihapus." } : null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.has("deleted")) {
      const next = new URLSearchParams(params.toString());
      next.delete("deleted");
      router.replace(`?${next}`, { scroll: false });
    }
  }, [params, router]);

  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    next.delete("deleted");
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setConfirmId(null);
    router.push(`?${next}`, { scroll: false });
  };

  const remove = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await deletePelaksanaan(id);
      if (result.success) { setConfirmId(null); flash.showSuccess("Permohonan dihapus."); }
      else flash.showError(result.error ?? "Gagal menghapus permohonan.");
    } catch { flash.showError("Gagal menghapus permohonan."); }
    finally { setBusy(false); }
  };

  return (
    <div className="text-gray-700 dark:text-gray-300">
      <PageHeader title="Permohonan Pelatihan" description="Kegiatan yang berjalan dan baru selesai. Kegiatan lama ada di Riwayat Kegiatan."
        primaryAction={{ label: "Buat Permohonan", href: "/permohonan/baru", icon: <PlusIcon className="size-4" /> }}
        actions={<Link href="/master/riwayat-kegiatan">
          <Button size="sm" variant="outline" startIcon={<TimeIcon className="size-4" />}>Lihat riwayat</Button>
        </Link>} />
      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      <FilterBar filters={filters} />
      <DataTable data={initialData} columns={getPelaksanaanColumns((row) => setConfirmId(row.id), busy)}
        currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.totalItems}
        searchValue={params.get("search") ?? ""} searchPlaceholder="Cari no. permohonan, pelatihan, kelas, atau lokasi..."
        emptyText="Belum ada permohonan aktif. Kegiatan lama dapat dilihat di Riwayat Kegiatan."
        onSearch={(value) => change("search", value)} onPageChange={(page) => change("page", String(page))}
        renderExpandedRow={(row) => confirmId === row.id
          ? <InlineConfirm message={`Hapus permohonan ${row.noPermohonan ?? row.tingkatan.training.nama}? Pendaftaran dan peserta aktif harus diselesaikan terlebih dahulu.`}
              onConfirm={() => remove(row.id)} onCancel={() => setConfirmId(null)} loading={busy} />
          : null} />
    </div>
  );
};

export default PelaksanaanList;
