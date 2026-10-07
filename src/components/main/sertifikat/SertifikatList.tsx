"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import FlashAlert from "@/components/main/common/FlashAlert";
import useFlash from "@/components/main/common/useFlash";
import type { SearchOption } from "@/components/main/common/SearchableSelect";
import SertifikatFilterBar from "./SertifikatFilterBar";
import SertifikatBulkBar from "./SertifikatBulkBar";
import SertifikatForm from "./SertifikatForm";
import { getSertifikatColumns, SertifikatRow } from "./SertifikatColumns";

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
  selectedKegiatan: SearchOption | null;
}

const SertifikatList: React.FC<SertifikatListProps> = ({
  initialData,
  pagination,
  selectedKegiatan,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editTarget, setEditTarget] = useState<SertifikatRow | null>(null);
  const flash = useFlash();
  const scope = searchParams.toString();
  const [previousScope, setPreviousScope] = useState(scope);
  if (scope !== previousScope) {
    setPreviousScope(scope);
    setSelectedIds([]);
    setEditTarget(null);
  }
  const visibleIds = selectedIds.filter((id) => initialData.some((row) => row.id === id));

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

      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      <SertifikatFilterBar selectedKegiatan={selectedKegiatan} />

      {visibleIds.length > 0 && (
        <SertifikatBulkBar selectedIds={visibleIds} flash={flash} onClear={() => setSelectedIds([])} />
      )}

      <DataTable
        data={initialData}
        columns={getSertifikatColumns({
          selectedIds: visibleIds,
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
        renderExpandedRow={(row) => editTarget?.id === row.id ? (
          <SertifikatForm key={row.id} data={row} flash={flash} onClose={() => setEditTarget(null)} />
        ) : null}
      />

    </>
  );
};

export default SertifikatList;
