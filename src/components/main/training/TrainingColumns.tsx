import React from "react";
import type { Column } from "@/components/main/common/DataTable";
import Badge from "@/components/ui/badge/Badge";
import RowActions from "@/components/main/common/RowActions";
import { ChevronDownIcon } from "@/icons/index";
import { KELAS_UMUM } from "@/lib/tingkatan";
export interface TrainingData { id: string; nama: string; tingkatan: { id: string; kelas: string }[] }
export function getTrainingColumns(onExpand: (row: TrainingData) => void, onEdit: (row: TrainingData) => void, onDelete: (id: string) => void): Column<TrainingData>[] {
  return [{ header: "Pelatihan", accessor: "nama" }, { header: "Tingkatan", cell: (row) => <button type="button" onClick={() => onExpand(row)} className="inline-flex items-center gap-2" aria-label={`Kelola tingkatan ${row.nama}`}>{row.tingkatan.some((item) => item.kelas !== KELAS_UMUM) ? `${row.tingkatan.filter((item) => item.kelas !== KELAS_UMUM).length} tingkatan` : <Badge color="light">Tanpa tingkatan</Badge>}<ChevronDownIcon className="size-4" /></button> }, { header: "Aksi", cell: (row) => <RowActions onEdit={() => onEdit(row)} onDelete={() => onDelete(row.id)} /> }];
}
