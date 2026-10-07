import React from "react";
import RowActions from "@/components/main/common/RowActions";
import { labelTingkatan } from "@/components/main/common/enumLabels";
import { Column } from "@/components/main/common/DataTable";
import { formatTanggal } from "@/components/main/common/formatTanggal";
import { JenisSertifikasi, StatusPeserta } from "@/lib/generated/prisma/enums";

export interface RiwayatRow {
  id: string;
  noPermohonan: string | null;
  jenisSertifikasi: JenisSertifikasi;
  tingkatan: { kelas: string; training: { nama: string } };
  sesi: Array<{ id: string; tanggal: Date }>;
  pendaftaran: Array<{ id: string }>;
  pesertaPelaksanaan: Array<{ status: StatusPeserta | null }>;
}

const formatRentangSesi = (sesi: Array<{ tanggal: Date }>): string => {
  if (sesi.length === 0) return "-";
  if (sesi.length === 1) return formatTanggal(sesi[0].tanggal);

  return `${formatTanggal(sesi[0].tanggal)} - ${formatTanggal(sesi[sesi.length - 1].tanggal)}`;
};

export const getRiwayatKegiatanColumns = (): Column<RiwayatRow>[] => [
  {
    header: "No. Permohonan",
    cell: (row) =>
      row.noPermohonan ?? <span className="text-gray-400 dark:text-gray-500 italic">Tanpa Nomor</span>,
  },
  {
    header: "Pelatihan",
    cell: (row) => labelTingkatan(row.tingkatan),
  },
  {
    header: "Rentang Tanggal",
    cell: (row) => formatRentangSesi(row.sesi),
  },
  {
    header: "Perusahaan",
    cell: (row) => row.pendaftaran.length,
    className: "text-center",
  },
  {
    header: "Peserta",
    cell: (row) => row.pesertaPelaksanaan.length,
    className: "text-center",
  },
  {
    header: "Ringkasan Hasil",
    cell: (row) => {
      const lulus = row.pesertaPelaksanaan.filter(
        (peserta) => peserta.status === StatusPeserta.LULUS
      ).length;
      const gagal = row.pesertaPelaksanaan.filter(
        (peserta) => peserta.status === StatusPeserta.GAGAL
      ).length;
      const lainnya = row.pesertaPelaksanaan.length - lulus - gagal;

      return (
        <span className="text-xs text-gray-600 dark:text-gray-300">
          Lulus: {lulus} • Gagal: {gagal} • Lainnya: {lainnya}
        </span>
      );
    },
  },
  {
    header: "Aksi",
    cell: (row) => <RowActions detailHref={`/permohonan/${row.id}`} />,
  },
];
