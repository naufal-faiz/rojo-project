import React from "react";
import { Column } from "@/components/main/common/DataTable";
import RowActions from "@/components/main/common/RowActions";
import type { getAllPerusahaan } from "@/lib/data/get/getPerusahaan";

export type PerusahaanRow = Awaited<ReturnType<typeof getAllPerusahaan>>["data"][number];
export const getPerusahaanColumns = (onDelete: (id: string) => void, busy: boolean): Column<PerusahaanRow>[] => [
  { header: "Nama", accessor: "nama" },
  { header: "Cabang", cell: (row) => row.cabang.length },
  { header: "PIC", cell: (row) => row.perusahaanPic.length },
  { header: "Peserta aktif", cell: (row) => row.cabang.reduce((total, cabang) => total + cabang._count.peserta, 0) },
  { header: "Aksi", cell: (row) => <RowActions detailHref={`/master/perusahaan/${row.id}`} onDelete={() => onDelete(row.id)} disabled={busy} /> },
];
