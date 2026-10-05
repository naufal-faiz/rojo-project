"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jenisSertifikasiLabels } from "@/components/main/common/enumLabels";
import { statusPesertaLabels } from "@/components/main/common/StatusBadge";
import { JenisSertifikasi, StatusPeserta } from "@/lib/generated/prisma/enums";

interface OpsiKegiatan {
  id: string;
  noPermohonan: string | null;
  tingkatan: { kelas: string; training: { nama: string } };
}

interface SertifikatFilterBarProps {
  /** Semua permohonan aktif untuk filter kegiatan */
  kegiatanOptions: OpsiKegiatan[];
}

const SertifikatFilterBar: React.FC<SertifikatFilterBarProps> = ({ kegiatanOptions }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const selectClass =
    "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300";

  return (
    <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-3">
      <select
        aria-label="Filter kegiatan"
        value={searchParams.get("pelaksanaanId") ?? ""}
        onChange={(e) => handleChange("pelaksanaanId", e.target.value)}
        className={selectClass}
      >
        <option value="">Semua Kegiatan</option>
        {kegiatanOptions.map((kegiatan) => (
          <option key={kegiatan.id} value={kegiatan.id}>
            {kegiatan.tingkatan.training.nama} - {kegiatan.tingkatan.kelas} (
            {kegiatan.noPermohonan ?? "Tanpa Nomor"})
          </option>
        ))}
      </select>

      <select
        aria-label="Filter jenis sertifikasi"
        value={searchParams.get("jenisSertifikasi") ?? ""}
        onChange={(e) => handleChange("jenisSertifikasi", e.target.value)}
        className={selectClass}
      >
        <option value="">Semua Jenis Sertifikasi</option>
        {Object.values(JenisSertifikasi).map((jenis) => (
          <option key={jenis} value={jenis}>
            {jenisSertifikasiLabels[jenis]}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter status hasil"
        value={searchParams.get("status") ?? ""}
        onChange={(e) => handleChange("status", e.target.value)}
        className={selectClass}
      >
        <option value="">Semua Status Hasil</option>
        <option value="BELUM">Belum ada hasil</option>
        {Object.values(StatusPeserta).map((status) => (
          <option key={status} value={status}>
            {statusPesertaLabels[status]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SertifikatFilterBar;
