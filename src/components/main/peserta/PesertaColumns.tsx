import React from "react";
import { Column } from "@/components/main/common/DataTable";

export interface PesertaData {
  id: string;
  nama: string;
  cabang?: {
    id: string;
    nama: string;
    perusahaan: {
      id: string;
      nama: string;
    };
  } | null;
}

interface PesertaAksiHandlers {
  /** Buka halaman detail peserta */
  onDetail: (row: PesertaData) => void;
  /** Buka form ubah peserta */
  onEdit: (row: PesertaData) => void;
  /** Hapus peserta (soft delete) */
  onDelete: (id: string) => void;
}

export const getPesertaColumns = ({
  onDetail,
  onEdit,
  onDelete,
}: PesertaAksiHandlers): Column<PesertaData>[] => [
  { header: "Nama", accessor: "nama" },
  {
    header: "Perusahaan",
    cell: (row) => row.cabang?.perusahaan.nama ?? "-",
  },
  {
    header: "Cabang",
    cell: (row) => row.cabang?.nama ?? "-",
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

export const getDeletedPesertaColumns = (
  onRestore: (id: string) => void
): Column<PesertaData>[] => [
  { header: "Nama", accessor: "nama" },
  {
    header: "Perusahaan",
    cell: (row) => row.cabang?.perusahaan.nama ?? "-",
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
