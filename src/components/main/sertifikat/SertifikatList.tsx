"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import { Modal } from "@/components/ui/modal";
import SertifikatFilterBar from "./SertifikatFilterBar";
import SertifikatBulkBar from "./SertifikatBulkBar";
import SertifikatFormModal from "./SertifikatFormModal";
import { getSertifikatColumns, SertifikatRow } from "./SertifikatColumns";

interface OpsiKegiatan {
  id: string;
  noPermohonan: string | null;
  tingkatan: { kelas: string; training: { nama: string } };
}

interface SertifikatListProps {
  /** Data peserta pendaftaran halaman aktif */
  initialData: SertifikatRow[];
  /** Informasi paginasi dari server */
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  /** Opsi filter kegiatan */
  kegiatanOptions: OpsiKegiatan[];
}

const SertifikatList: React.FC<SertifikatListProps> = ({
  initialData,
  pagination,
  kegiatanOptions,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editTarget, setEditTarget] = useState<SertifikatRow | null>(null);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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

  return (
    <>
      <PageHeader
        title="Sertifikat"
        description="Isi hasil peserta dan data sertifikat per kegiatan."
      />

      <SertifikatFilterBar kegiatanOptions={kegiatanOptions} />

      {selectedIds.length > 0 && (
        <SertifikatBulkBar selectedIds={selectedIds} onClear={() => setSelectedIds([])} />
      )}

      <DataTable
        data={initialData}
        columns={getSertifikatColumns({
          selectedIds,
          onToggle: handleToggle,
          onEdit: setEditTarget,
        })}
        totalPages={pagination.totalPages}
        currentPage={pagination.page}
        totalItems={pagination.totalItems}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchValue={searchParams.get("search") ?? ""}
        searchPlaceholder="Cari nama peserta, perusahaan, atau no. sertifikat..."
        emptyText="Belum ada peserta terdaftar."
      />

      {editTarget && (
        <Modal isOpen onClose={() => setEditTarget(null)} className="max-w-lg">
          <SertifikatFormModal data={editTarget} onClose={() => setEditTarget(null)} />
        </Modal>
      )}
    </>
  );
};

export default SertifikatList;
