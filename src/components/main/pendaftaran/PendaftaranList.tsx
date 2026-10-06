"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import FilterBar from "@/components/main/common/FilterBar";
import { jenisKegiatanLabels, jenisSertifikasiLabels } from "@/components/main/common/enumLabels";
import { JenisKegiatan, JenisSertifikasi } from "@/lib/generated/prisma/enums";
import { getPendaftaranColumns, PendaftaranRow } from "./PendaftaranColumns";

interface PendaftaranListProps {
  /** Kegiatan aktif sesuai 5.11 dan filter URL. */
  initialData: PendaftaranRow[];
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
];

const PendaftaranList: React.FC<PendaftaranListProps> = ({ initialData, pagination }) => {
  const router = useRouter();
  const params = useSearchParams();

  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    router.push(`?${next}`, { scroll: false });
  };

  return (
    <div className="text-gray-700 dark:text-gray-300">
      <PageHeader title="Pendaftaran"
        description="Kelola perusahaan dan peserta pada kegiatan aktif. Kegiatan lama ada di Riwayat Kegiatan." />
      <FilterBar filters={filters} />
      <DataTable data={initialData} columns={getPendaftaranColumns()}
        currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.totalItems}
        searchValue={params.get("search") ?? ""} searchPlaceholder="Cari no. permohonan, pelatihan, atau lokasi..."
        onSearch={(value) => change("search", value)} onPageChange={(page) => change("page", String(page))}
        emptyText="Belum ada pendaftaran pada kegiatan aktif."
        onRowClick={(row) => router.push(`/pendaftaran/${row.id}`)} />
    </div>
  );
};

export default PendaftaranList;
