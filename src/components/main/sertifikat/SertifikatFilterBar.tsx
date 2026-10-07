"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FilterBar from "@/components/main/common/FilterBar";
import SearchableSelect, { SearchOption } from "@/components/main/common/SearchableSelect";
import { jenisSertifikasiLabels } from "@/components/main/common/enumLabels";
import { statusPesertaLabels } from "@/components/main/common/StatusBadge";
import { JenisSertifikasi, StatusPeserta } from "@/lib/generated/prisma/enums";
import { searchPelaksanaanOptions } from "@/lib/data/action/searchOptionsAction";

interface SertifikatFilterBarProps {
  /** Label kegiatan terpilih dipulihkan server dari URL. */
  selectedKegiatan: SearchOption | null;
}
const SertifikatFilterBar: React.FC<SertifikatFilterBarProps> = ({ selectedKegiatan }) => {
  const router = useRouter();
  const params = useSearchParams();
  const change = (value: SearchOption | SearchOption[] | null) => {
    const option = Array.isArray(value) ? value[0] : value;
    const next = new URLSearchParams(params.toString());
    if (option) next.set("pelaksanaanId", option.id); else next.delete("pelaksanaanId");
    next.set("page", "1");
    router.push(`?${next}`, { scroll: false });
  };
  return (
    <FilterBar filters={[
      { key: "jenisSertifikasi", label: "Jenis sertifikasi", options: Object.values(JenisSertifikasi).map((value) => ({ value, label: jenisSertifikasiLabels[value] })) },
      { key: "status", label: "Status hasil", options: [{ value: "BELUM", label: "Belum ada hasil" }, ...Object.values(StatusPeserta).map((value) => ({ value, label: statusPesertaLabels[value] }))] },
    ]}>
      <div><p className="mb-1 text-sm text-gray-700 dark:text-gray-300">Kegiatan</p>
        <SearchableSelect search={searchPelaksanaanOptions} value={selectedKegiatan} onChange={change} placeholder="Cari kegiatan dari semua tahun..." />
      </div>
    </FilterBar>
  );
};
export default SertifikatFilterBar;
