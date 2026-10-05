import React from "react";
import { CalenderIcon, FileIcon, GroupIcon, TaskIcon } from "@/icons/index";

interface DashboardStatGridProps {
  /** Angka ringkasan dashboard */
  stats: {
    kegiatanTahunIni: number;
    kemnakerBelumUpload: number;
    pesertaTerdaftar: number;
    hasilBelumDiisi: number;
  };
}

const DashboardStatGrid: React.FC<DashboardStatGridProps> = ({ stats }) => {
  const kartu = [
    {
      label: "Kegiatan Tahun Ini",
      value: stats.kegiatanTahunIni,
      icon: <CalenderIcon className="size-5" />,
    },
    {
      label: "KEMNAKER Belum Upload",
      value: stats.kemnakerBelumUpload,
      icon: <FileIcon className="size-5" />,
    },
    {
      label: "Peserta Terdaftar",
      value: stats.pesertaTerdaftar,
      icon: <GroupIcon className="size-5" />,
    },
    {
      label: "Hasil Belum Diisi",
      value: stats.hasilBelumDiisi,
      icon: <TaskIcon className="size-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kartu.map((item) => (
        <div
          key={item.label}
          className="p-5 bg-white border border-gray-200 rounded-2xl shadow-theme-xs dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {item.label}
            </span>
            <span className="text-gray-400 dark:text-gray-500">{item.icon}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStatGrid;
