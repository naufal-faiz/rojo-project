"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import RiwayatKegiatanFilterBar from "./RiwayatKegiatanFilterBar";
import { getRiwayatKegiatanColumns, RiwayatRow } from "./RiwayatKegiatanColumns";

interface RiwayatKegiatanListProps {
  /** Data riwayat halaman aktif */
  initialData: RiwayatRow[];
  /** Informasi paginasi dari server */
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  /** Daftar tahun yang tersedia */
  tahunOptions: number[];
}

const RiwayatKegiatanList: React.FC<RiwayatKegiatanListProps> = ({
  initialData,
  pagination,
  tahunOptions,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  return (
    <>
      <PageHeader
        title="Riwayat Kegiatan"
        description="Daftar permohonan yang seluruh sesinya sudah selesai."
      />

      <RiwayatKegiatanFilterBar tahunOptions={tahunOptions} />

      <DataTable
        data={initialData}
        columns={getRiwayatKegiatanColumns()}
        totalPages={pagination.totalPages}
        currentPage={pagination.page}
        totalItems={pagination.totalItems}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchValue={searchParams.get("search") ?? ""}
        searchPlaceholder="Cari no permohonan, pelatihan, atau lokasi..."
        emptyText="Belum ada kegiatan selesai."
        onRowClick={(row) => router.push(`/permohonan/${row.id}`)}
      />
    </>
  );
};

export default RiwayatKegiatanList;
