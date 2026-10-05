import React from "react";
import StatusTemanK3Badge from "@/components/main/permohonan/StatusTemanK3Badge";
import { Column } from "@/components/main/common/DataTable";
import { JenisKegiatan, JenisSertifikasi, StatusTemanK3 } from "@/lib/generated/prisma/enums";
import { formatDaftarSesi } from "./pendaftaranFormat";

export interface PendaftaranRow {
  id: string;
  noPermohonan: string | null;
  jenisKegiatan: JenisKegiatan;
  jenisSertifikasi: JenisSertifikasi;
  status: StatusTemanK3 | null;
  tingkatan: {
    kelas: string;
    training: { nama: string };
  };
  sesi: Array<{ id: string; tanggal: Date }>;
  pendaftaran: Array<{ id: string }>;
  pesertaPelaksanaan: Array<{ id: string; pendaftaranPerusahaanId: string | null }>;
}

export const hitungPendaftaran = (row: PendaftaranRow) => {
  const jumlahPerusahaan = row.pendaftaran.length;
  const jumlahMandiri = row.pesertaPelaksanaan.filter(
    (peserta) => peserta.pendaftaranPerusahaanId === null
  ).length;

  return {
    jumlahPerusahaan,
    jumlahMandiri,
    totalPeserta: row.pesertaPelaksanaan.length,
  };
};

export const getPendaftaranColumns = (
  onKelola: (row: PendaftaranRow) => void
): Column<PendaftaranRow>[] => [
  {
    header: "No. Permohonan",
    cell: (row) =>
      row.noPermohonan ?? <span className="text-gray-400 italic">Tanpa Nomor</span>,
  },
  {
    header: "Pelatihan",
    cell: (row) => `${row.tingkatan.training.nama} - ${row.tingkatan.kelas}`,
  },
  {
    header: "Tanggal Sesi",
    cell: (row) => formatDaftarSesi(row.sesi),
  },
  {
    header: "Perusahaan",
    cell: (row) => hitungPendaftaran(row).jumlahPerusahaan,
    className: "text-center",
  },
  {
    header: "Mandiri",
    cell: (row) => hitungPendaftaran(row).jumlahMandiri,
    className: "text-center",
  },
  {
    header: "Total Peserta",
    cell: (row) => hitungPendaftaran(row).totalPeserta,
    className: "text-center",
  },
  {
    header: "Status TemanK3",
    cell: (row) => (
      <StatusTemanK3Badge status={row.status} jenisSertifikasi={row.jenisSertifikasi} />
    ),
  },
  {
    header: "Aksi",
    cell: (row) => (
      <button
        onClick={() => onKelola(row)}
        className="text-xs text-brand-500 hover:underline"
      >
        Kelola
      </button>
    ),
  },
];
