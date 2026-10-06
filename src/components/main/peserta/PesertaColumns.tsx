import React from "react";
import type { Column } from "@/components/main/common/DataTable";
import RowActions from "@/components/main/common/RowActions";
import type { getAllPeserta } from "@/lib/data/get/getPeserta";

export type PesertaRow = Awaited<ReturnType<typeof getAllPeserta>>["data"][number];

export const getPesertaColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  disabled = false,
): Column<PesertaRow>[] => [
  { header: "Nama", accessor: "nama" },
  { header: "Perusahaan", cell: (row) => row.cabang?.perusahaan.nama ?? "-" },
  { header: "Cabang", cell: (row) => row.cabang?.nama ?? "-" },
  {
    header: "Aksi",
    cell: (row) => (
      <RowActions detailHref={`/master/peserta/${row.id}`} disabled={disabled}
        onEdit={() => onEdit(row.id)} onDelete={() => onDelete(row.id)} />
    ),
  },
];
