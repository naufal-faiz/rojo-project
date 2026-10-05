"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import { jenisSertifikasiLabels } from "@/components/main/common/enumLabels";
import { getPendaftaranColumns, PendaftaranRow } from "./PendaftaranColumns";
import { JenisSertifikasi } from "@/lib/generated/prisma/enums";

interface PendaftaranListProps {
  /** Data permohonan halaman aktif */
  initialData: PendaftaranRow[];
  /** Informasi paginasi dari server */
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

const PendaftaranList: React.FC<PendaftaranListProps> = ({
  initialData,
  pagination,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jenisSertifikasi = searchParams.get("jenisSertifikasi") ?? "";

  const handleKelola = (row: PendaftaranRow) => {
    router.push(`/pendaftaran/${row.id}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("jenisSertifikasi", e.target.value);
    } else {
      params.delete("jenisSertifikasi");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <PageHeader
        title="Pendaftaran"
        description="Kelola perusahaan dan peserta yang ikut dalam setiap permohonan."
      />

      <div className="mb-4 w-full max-w-xs">
        <select
          value={jenisSertifikasi}
          onChange={handleFilterChange}
          aria-label="Filter jenis sertifikasi"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300"
        >
          <option value="">Semua Jenis Sertifikasi</option>
          {Object.values(JenisSertifikasi).map((jenis) => (
            <option key={jenis} value={jenis}>
              {jenisSertifikasiLabels[jenis]}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={initialData}
        columns={getPendaftaranColumns(handleKelola)}
        totalPages={pagination.totalPages}
        currentPage={pagination.page}
        totalItems={pagination.totalItems}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchValue={searchParams.get("search") ?? ""}
        searchPlaceholder="Cari no permohonan, pelatihan, atau lokasi..."
        emptyText="Belum ada permohonan."
        onRowClick={handleKelola}
      />
    </>
  );
};

export default PendaftaranList;
