"use client";
import React, { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";
import { searchPesertaPendaftaran } from "@/lib/data/action/pesertaPelaksanaanAction";
import { PesertaOption } from "./pesertaBulkTypes";

interface PesertaPilihTabProps {
  /** Permohonan yang sedang dikelola */
  pelaksanaanId: string;
  /** ID peserta yang sudah dicentang */
  selectedIds: string[];
  /** Dipanggil saat centang berubah */
  onToggle: (peserta: PesertaOption) => void;
}

const PesertaPilihTab: React.FC<PesertaPilihTabProps> = ({
  pelaksanaanId,
  selectedIds,
  onToggle,
}) => {
  const [keyword, setKeyword] = useState("");
  const [options, setOptions] = useState<PesertaOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let aktif = true;
    const timer = setTimeout(async () => {
      if (!aktif) return;
      setLoading(true);
      const hasil = await searchPesertaPendaftaran(pelaksanaanId, keyword);
      if (!aktif) return;
      setOptions(hasil);
      setLoading(false);
    }, 300);

    return () => {
      aktif = false;
      clearTimeout(timer);
    };
  }, [keyword, pelaksanaanId]);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Cari nama peserta atau perusahaan..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800">
        {loading ? (
          <p className="p-3 text-xs text-gray-500 dark:text-gray-400">Mencari...</p>
        ) : options.length === 0 ? (
          <p className="p-3 text-xs text-gray-500 dark:text-gray-400">Peserta tidak ditemukan.</p>
        ) : (
          options.map((peserta) => {
            const dicentang = selectedIds.includes(peserta.id);

            return (
              <label
                key={peserta.id}
                className={`flex items-center gap-3 px-3 py-2 border-b border-gray-50 last:border-0 dark:border-white/[0.03] ${
                  peserta.terdaftar
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                }`}
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600"
                  checked={dicentang}
                  disabled={peserta.terdaftar}
                  onChange={() => onToggle(peserta)}
                />
                <span className="flex-1">
                  <span className="block text-sm text-gray-700 dark:text-gray-300">
                    {peserta.nama}
                  </span>
                  <span className="block text-xs text-gray-400 dark:text-gray-500">
                    {peserta.perusahaan ?? "Mandiri"}
                  </span>
                </span>
                {peserta.terdaftar && (
                  <Badge color="warning" size="sm">
                    Sudah terdaftar
                  </Badge>
                )}
                {!peserta.terdaftar && peserta.pernahDihapus && (
                  <Badge color="light" size="sm">
                    Akan direstore
                  </Badge>
                )}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PesertaPilihTab;
