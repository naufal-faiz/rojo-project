import React from "react";

interface PerusahaanPesertaListProps {
  /** Daftar peserta perusahaan beserta nama cabangnya */
  peserta: Array<{ id: string; nama: string; cabang: string }>;
}

const PerusahaanPesertaList: React.FC<PerusahaanPesertaListProps> = ({ peserta }) => {
  if (peserta.length === 0) {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
        Belum ada peserta terdaftar di perusahaan ini.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {peserta.map((item) => (
        <li key={item.id} className="text-sm text-gray-700 dark:text-gray-300">
          {item.nama}
          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
            {item.cabang}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default PerusahaanPesertaList;
