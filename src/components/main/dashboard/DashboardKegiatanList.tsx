import React from "react";
import Link from "next/link";
import ComponentCard from "@/components/main/common/ComponentCard";
import { formatTanggal } from "@/components/main/common/formatTanggal";

interface KegiatanRingkas {
  id: string;
  noPermohonan: string | null;
  label: string;
  tanggal: Date;
}

interface DashboardKegiatanListProps {
  /** Judul kartu */
  title: string;
  /** Teks saat tidak ada data */
  emptyText: string;
  /** Daftar kegiatan ringkas */
  items: KegiatanRingkas[];
}

const DashboardKegiatanList: React.FC<DashboardKegiatanListProps> = ({
  title,
  emptyText,
  items,
}) => {
  return (
    <ComponentCard title={title}>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/permohonan/${item.id}`}
                className="block p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 dark:border-gray-800/60 dark:bg-gray-800/40 dark:hover:bg-gray-800/60"
              >
                <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                  {item.label}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.noPermohonan ?? "Tanpa Nomor"} • {formatTanggal(item.tanggal)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ComponentCard>
  );
};

export default DashboardKegiatanList;
