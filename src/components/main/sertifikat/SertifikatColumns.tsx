import React from "react";
import RowActions from "@/components/main/common/RowActions";
import { labelTingkatan } from "@/components/main/common/enumLabels";
import StatusBadge from "@/components/main/common/StatusBadge";
import { Column } from "@/components/main/common/DataTable";
import { formatTanggal } from "@/components/main/common/formatTanggal";
import { JenisSertifikasi, StatusPeserta } from "@/lib/generated/prisma/enums";

export interface SertifikatRow {
  id: string;
  status: StatusPeserta | null;
  noRegistrasi: string | null;
  noSertifikat: string | null;
  masaBerlaku: Date | null;
  noSkp: string | null;
  tanggalTerimaSertifikat: Date | null;
  catatan: string | null;
  peserta: {
    id: string;
    nama: string;
    cabang: { nama: string; perusahaan: { nama: string } } | null;
  };
  pelaksanaan: {
    id: string;
    noPermohonan: string | null;
    jenisSertifikasi: JenisSertifikasi;
    tingkatan: { kelas: string; training: { nama: string } };
    sesi: Array<{ id: string; tanggal: Date }>;
  };
  pendaftaranPerusahaan: {
    id: string;
    perusahaan: { id: string; nama: string };
    pic: { id: string; nama: string } | null;
  } | null;
}

interface SertifikatColumnsOptions {
  /** ID baris yang dicentang */
  selectedIds: string[];
  /** Centang/lepas satu baris */
  onToggle: (id: string) => void;
  /** Buka form ubah sertifikat */
  onEdit: (row: SertifikatRow) => void;
}

export const getSertifikatColumns = ({
  selectedIds,
  onToggle,
  onEdit,
}: SertifikatColumnsOptions): Column<SertifikatRow>[] => [
  {
    header: "",
    className: "w-10",
    cell: (row) => (
      <input
        type="checkbox"
        aria-label={`Pilih ${row.peserta.nama}`}
        className="size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:text-brand-400 dark:focus:ring-brand-400"
        checked={selectedIds.includes(row.id)}
        onChange={() => onToggle(row.id)}
      />
    ),
  },
  {
    header: "Peserta",
    cell: (row) => (
      <span>
        <span className="block text-gray-800 dark:text-gray-200">{row.peserta.nama}</span>
        <span className="block text-xs text-gray-400 dark:text-gray-500">
          {row.peserta.cabang
            ? `${row.peserta.cabang.perusahaan.nama} - ${row.peserta.cabang.nama}`
            : "Mandiri"}
        </span>
      </span>
    ),
  },
  {
    header: "Perusahaan Pendaftar",
    cell: (row) => row.pendaftaranPerusahaan?.perusahaan.nama ?? "-",
  },
  {
    header: "Kegiatan",
    cell: (row) => (
      <span>
        <span className="block">{labelTingkatan(row.pelaksanaan.tingkatan)}</span>
        <span className="block text-xs text-gray-400 dark:text-gray-500">
          {row.pelaksanaan.noPermohonan ?? "Tanpa Nomor"}
        </span>
      </span>
    ),
  },
  {
    header: "PIC Penerima",
    cell: (row) => row.pendaftaranPerusahaan?.pic?.nama ?? "-",
  },
  {
    header: "Status Hasil",
    cell: (row) =>
      row.status ? (
        <StatusBadge status={row.status} size="sm" />
      ) : (
        <span className="text-xs text-gray-400 dark:text-gray-500 italic">Belum ada hasil</span>
      ),
  },
  {
    header: "No. Sertifikat",
    cell: (row) => row.noSertifikat ?? "-",
  },
  {
    header: "Tgl. Terima",
    cell: (row) => formatTanggal(row.tanggalTerimaSertifikat),
  },
  {
    header: "Aksi",
    cell: (row) => <RowActions onEdit={() => onEdit(row)} />,
  },
];
