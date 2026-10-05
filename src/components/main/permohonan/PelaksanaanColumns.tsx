import React from "react";
import { Column } from "@/components/main/common/DataTable";
import StatusTemanK3Badge from "./StatusTemanK3Badge";
import { jenisKegiatanLabels, penyelenggaraLabels } from "@/components/main/common/enumLabels";
import {
  JenisKegiatan,
  JenisSertifikasi,
  Penyelenggara,
  StatusTemanK3,
  TipePelaksanaan,
} from "@/lib/generated/prisma/enums";

export interface Tingkatan {
  id: string;
  kelas: string;
  training: {
    id: string;
    nama: string;
  };
}

export interface PelaksanaanData {
  id: string;
  noPermohonan?: string | null;
  tingkatanId: string;
  tingkatan: Tingkatan;
  jenisKegiatan: JenisKegiatan;
  tipePelaksanaan: TipePelaksanaan;
  lokasi?: string | null;
  penyelenggara: Penyelenggara;
  jenisSertifikasi: JenisSertifikasi;
  status?: StatusTemanK3 | null;
  catatan?: string | null;
  sesi: Array<{ id: string; tanggal: Date }>;
}

interface PelaksanaanAksiHandlers {
  /** Buka halaman detail permohonan */
  onDetail: (row: PelaksanaanData) => void;
  /** Buka form ubah permohonan */
  onEdit: (row: PelaksanaanData) => void;
  /** Hapus permohonan (soft delete) */
  onDelete: (id: string) => void;
}

export const getPelaksanaanColumns = ({
  onDetail,
  onEdit,
  onDelete,
}: PelaksanaanAksiHandlers): Column<PelaksanaanData>[] => [
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
    header: "Jenis",
    cell: (row) => jenisKegiatanLabels[row.jenisKegiatan],
  },
  {
    header: "Penyelenggara",
    cell: (row) => penyelenggaraLabels[row.penyelenggara],
  },
  {
    header: "Status TemanK3",
    cell: (row) => (
      <StatusTemanK3Badge status={row.status ?? null} jenisSertifikasi={row.jenisSertifikasi} />
    ),
  },
  {
    header: "Aksi",
    cell: (row) => (
      <div className="flex gap-2">
        <button
          onClick={() => onDetail(row)}
          className="text-xs text-brand-500 hover:underline"
        >
          Detail
        </button>
        <button
          onClick={() => onEdit(row)}
          className="text-xs text-brand-500 hover:underline"
        >
          Ubah
        </button>
        <button
          onClick={() => onDelete(row.id)}
          className="text-xs text-error-500 hover:underline"
        >
          Hapus
        </button>
      </div>
    ),
  },
];

export const getDeletedPelaksanaanColumns = (
  onRestore: (id: string) => void
): Column<PelaksanaanData>[] => [
  {
    header: "No. Permohonan",
    cell: (row) => row.noPermohonan ?? "-",
  },
  {
    header: "Pelatihan",
    cell: (row) => `${row.tingkatan.training.nama} - ${row.tingkatan.kelas}`,
  },
  {
    header: "Aksi",
    cell: (row) => (
      <button
        onClick={() => onRestore(row.id)}
        className="text-xs text-brand-500 hover:underline"
      >
        Restore
      </button>
    ),
  },
];
