"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  jenisKegiatanLabels,
  jenisSertifikasiLabels,
  penyelenggaraLabels,
} from "@/components/main/common/enumLabels";
import {
  JenisKegiatan,
  JenisSertifikasi,
  Penyelenggara,
} from "@/lib/generated/prisma/enums";

interface RiwayatKegiatanFilterBarProps {
  /** Daftar tahun yang tersedia */
  tahunOptions: number[];
}

const RiwayatKegiatanFilterBar: React.FC<RiwayatKegiatanFilterBarProps> = ({
  tahunOptions,
}) => {
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
    <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 lg:grid-cols-4">
      <select
        aria-label="Filter tahun"
        value={searchParams.get("tahun") ?? ""}
        onChange={(e) => handleChange("tahun", e.target.value)}
        className={selectClass}
      >
        <option value="">Semua Tahun</option>
        {tahunOptions.map((tahun) => (
          <option key={tahun} value={tahun}>
            {tahun}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter penyelenggara"
        value={searchParams.get("penyelenggara") ?? ""}
        onChange={(e) => handleChange("penyelenggara", e.target.value)}
        className={selectClass}
      >
        <option value="">Semua Penyelenggara</option>
        {Object.values(Penyelenggara).map((nilai) => (
          <option key={nilai} value={nilai}>
            {penyelenggaraLabels[nilai]}
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
        {Object.values(JenisSertifikasi).map((nilai) => (
          <option key={nilai} value={nilai}>
            {jenisSertifikasiLabels[nilai]}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter jenis kegiatan"
        value={searchParams.get("jenisKegiatan") ?? ""}
        onChange={(e) => handleChange("jenisKegiatan", e.target.value)}
        className={selectClass}
      >
        <option value="">Semua Jenis Kegiatan</option>
        {Object.values(JenisKegiatan).map((nilai) => (
          <option key={nilai} value={nilai}>
            {jenisKegiatanLabels[nilai]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RiwayatKegiatanFilterBar;
