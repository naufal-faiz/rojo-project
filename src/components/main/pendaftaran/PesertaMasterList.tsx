"use client";
import React, { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";
import { searchPesertaPendaftaran } from "@/lib/data/action/pesertaPelaksanaanAction";

export type PesertaOption = Awaited<ReturnType<typeof searchPesertaPendaftaran>>[number];

interface PesertaMasterListProps {
  /** Permohonan yang sedang dikelola. */
  pelaksanaanId: string;
  /** null = mode mandiri, subjudul perusahaan ditampilkan. */
  pendaftaranPerusahaanId: string | null;
  /** ID peserta yang sudah dicentang. */
  selectedIds: string[];
  onToggle: (peserta: PesertaOption) => void;
}

const PesertaMasterList: React.FC<PesertaMasterListProps> = ({
  pelaksanaanId,
  pendaftaranPerusahaanId,
  selectedIds,
  onToggle,
}) => {
  const [keyword, setKeyword] = useState("");
  const [options, setOptions] = useState<PesertaOption[]>([]);
  const [memuat, setMemuat] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      setMemuat(true);
      try {
        const rows = await searchPesertaPendaftaran(pelaksanaanId, keyword, pendaftaranPerusahaanId);
        if (!cancelled) setOptions(rows);
      } finally {
        if (!cancelled) setMemuat(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [keyword, pelaksanaanId, pendaftaranPerusahaanId]);

  return (
    <div className="space-y-2">
      <Input autoFocus placeholder="Cari nama peserta..." value={keyword}
        onChange={(event) => setKeyword(event.target.value)} />
      <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800">
        {memuat ? (
          <p className="p-3 text-xs text-gray-500 dark:text-gray-400">Mencari...</p>
        ) : options.length === 0 ? (
          <p className="p-3 text-xs text-gray-500 dark:text-gray-400">Peserta tidak ditemukan.</p>
        ) : (
          options.map((peserta) => {
            const dicentang = selectedIds.includes(peserta.id);
            return (
              <label key={peserta.id}
                className={`flex items-center gap-3 border-b border-gray-50 px-3 py-2 last:border-0 dark:border-white/[0.03] ${
                  peserta.terdaftar ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                }`}>
                <input type="checkbox" className="size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600"
                  checked={dicentang} disabled={peserta.terdaftar} onChange={() => onToggle(peserta)} />
                <span className="flex-1">
                  <span className="block text-sm text-gray-700 dark:text-gray-300">{peserta.nama}</span>
                  {!pendaftaranPerusahaanId && (
                    <span className="block text-xs text-gray-400 dark:text-gray-500">
                      {peserta.perusahaan ?? "Tanpa perusahaan"}
                    </span>
                  )}
                </span>
                {peserta.terdaftar && <Badge color="warning" size="sm">Sudah terdaftar</Badge>}
                {!peserta.terdaftar && Boolean(pendaftaranPerusahaanId) && peserta.tanpaPerusahaan && (
                  <Badge color="light" size="sm">Belum punya perusahaan</Badge>
                )}
                {!peserta.terdaftar && peserta.pernahDihapus && <Badge color="light" size="sm">Akan direstore</Badge>}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PesertaMasterList;
