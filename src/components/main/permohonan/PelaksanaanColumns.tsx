import React from "react";
import type { Column } from "@/components/main/common/DataTable";
import RowActions from "@/components/main/common/RowActions";
import StatusTemanK3Badge from "./StatusTemanK3Badge";
import { jenisKegiatanLabels, labelTingkatan, penyelenggaraLabels } from "@/components/main/common/enumLabels";
import type { getAllPelaksanaan } from "@/lib/data/get/getPelaksanaan";

export type PelaksanaanRow = Awaited<ReturnType<typeof getAllPelaksanaan>>["data"][number];

export const getPelaksanaanColumns = (
  onDelete: (row: PelaksanaanRow) => void,
  disabled = false,
): Column<PelaksanaanRow>[] => [
  {
    header: "No. Permohonan",
    cell: (row) => row.noPermohonan ?? <span className="italic text-gray-400 dark:text-gray-500">Tanpa Nomor</span>,
  },
  { header: "Pelatihan", cell: (row) => labelTingkatan(row.tingkatan) },
  { header: "Jenis", cell: (row) => jenisKegiatanLabels[row.jenisKegiatan] },
  { header: "Penyelenggara", cell: (row) => penyelenggaraLabels[row.penyelenggara] },
  {
    header: "Status TemanK3",
    cell: (row) => <StatusTemanK3Badge status={row.status ?? null} jenisSertifikasi={row.jenisSertifikasi} />,
  },
  {
    header: "Aksi",
    cell: (row) => (
      <RowActions detailHref={`/permohonan/${row.id}`} editHref={`/permohonan/${row.id}/ubah`}
        disabled={disabled} onDelete={() => onDelete(row)} />
    ),
  },
];
