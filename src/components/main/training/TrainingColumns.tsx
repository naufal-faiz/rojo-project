import React from "react";
import type { Column } from "@/components/main/common/DataTable";
import Badge from "@/components/ui/badge/Badge";
import RowActions from "@/components/main/common/RowActions";
import { ChevronDownIcon } from "@/icons/index";
import { KELAS_UMUM } from "@/lib/tingkatan";

export interface TrainingData {
  id: string;
  nama: string;
  tingkatan: { id: string; kelas: string }[];
}

export function getTrainingColumns(
  onExpand: (row: TrainingData) => void,
  onEdit: (row: TrainingData) => void,
  onDelete: (id: string) => void,
  expandedId: string | null,
  disabled = false,
): Column<TrainingData>[] {
  return [
    { header: "Pelatihan", accessor: "nama" },
    {
      header: "Tingkatan",
      cell: (row) => {
        const count = row.tingkatan.filter((item) => item.kelas !== KELAS_UMUM).length;
        return (
          <button type="button" onClick={() => onExpand(row)} disabled={disabled}
            className="inline-flex items-center gap-2" aria-expanded={expandedId === row.id}
            aria-label={`Kelola tingkatan ${row.nama}`}>
            {count ? `${count} tingkatan` : <Badge color="light">Tanpa tingkatan</Badge>}
            <ChevronDownIcon className={`size-4 ${expandedId === row.id ? "rotate-180" : ""}`} />
          </button>
        );
      },
    },
    { header: "Aksi", cell: (row) => <RowActions disabled={disabled} onEdit={() => onEdit(row)} onDelete={() => onDelete(row.id)} /> },
  ];
}
