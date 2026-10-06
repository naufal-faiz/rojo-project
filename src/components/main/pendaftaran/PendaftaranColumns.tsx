import React from "react";
import type { Column } from "@/components/main/common/DataTable";
import RowActions from "@/components/main/common/RowActions";
import StatusTemanK3Badge from "@/components/main/permohonan/StatusTemanK3Badge";
import { labelTingkatan } from "@/components/main/common/enumLabels";
import { formatDaftarSesi } from "@/components/main/common/formatTanggal";
import type { getAllPendaftaran } from "@/lib/data/get/getPendaftaran";

export type PendaftaranRow = Awaited<ReturnType<typeof getAllPendaftaran>>["data"][number];

export const hitungPendaftaran = (row: PendaftaranRow) => ({
  jumlahPerusahaan: row.pendaftaran.length,
  jumlahMandiri: row.pesertaPelaksanaan.filter((peserta) => peserta.pendaftaranPerusahaanId === null).length,
  totalPeserta: row.pesertaPelaksanaan.length,
});

export const getPendaftaranColumns = (): Column<PendaftaranRow>[] => [
  {
    header: "No. Permohonan",
    cell: (row) => row.noPermohonan ?? <span className="italic text-gray-400 dark:text-gray-500">Tanpa Nomor</span>,
  },
  { header: "Pelatihan", cell: (row) => labelTingkatan(row.tingkatan) },
  { header: "Tanggal Sesi", cell: (row) => formatDaftarSesi(row.sesi) },
  { header: "Perusahaan", cell: (row) => hitungPendaftaran(row).jumlahPerusahaan, className: "text-center" },
  { header: "Mandiri", cell: (row) => hitungPendaftaran(row).jumlahMandiri, className: "text-center" },
  { header: "Total Peserta", cell: (row) => hitungPendaftaran(row).totalPeserta, className: "text-center" },
  {
    header: "Status TemanK3",
    cell: (row) => <StatusTemanK3Badge status={row.status} jenisSertifikasi={row.jenisSertifikasi} />,
  },
  {
    header: "Aksi",
    cell: (row) => <RowActions detailHref={`/pendaftaran/${row.id}`} />,
  },
];
