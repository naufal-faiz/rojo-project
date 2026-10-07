"use client";
import React from "react";
import FilterBar from "@/components/main/common/FilterBar";
import { jenisKegiatanLabels, jenisSertifikasiLabels, penyelenggaraLabels } from "@/components/main/common/enumLabels";
import { JenisKegiatan, JenisSertifikasi, Penyelenggara } from "@/lib/generated/prisma/enums";

interface RiwayatKegiatanFilterBarProps {
  /** Tahun yang memiliki sesi kegiatan. */
  tahunOptions: number[];
}
const RiwayatKegiatanFilterBar: React.FC<RiwayatKegiatanFilterBarProps> = ({ tahunOptions }) => (
  <FilterBar filters={[
    { key: "tahun", label: "Tahun", options: tahunOptions.map((value) => ({ value: String(value), label: String(value) })) },
    { key: "penyelenggara", label: "Penyelenggara", options: Object.values(Penyelenggara).map((value) => ({ value, label: penyelenggaraLabels[value] })) },
    { key: "jenisSertifikasi", label: "Jenis sertifikasi", options: Object.values(JenisSertifikasi).map((value) => ({ value, label: jenisSertifikasiLabels[value] })) },
    { key: "jenisKegiatan", label: "Jenis kegiatan", options: Object.values(JenisKegiatan).map((value) => ({ value, label: jenisKegiatanLabels[value] })) },
  ]} />
);
export default RiwayatKegiatanFilterBar;
