"use client";
import React, { useState, useEffect } from "react";
import { searchAvailableMasterPic, linkPic } from "@/lib/data/action/picAction";
import Button from "@/components/ui/button/Button";
import { TipePic } from "@/lib/generated/prisma/enums";

interface PicOption {
  id: string;
  nama: string;
  noTelp?: string | null;
  tipe: TipePic;
}

interface PicSelectionModalProps {
  perusahaanId: string;
  onClose: () => void;
}

const PicSelectionModal: React.FC<PicSelectionModalProps> = ({
  perusahaanId,
  onClose,
}) => {
  const [picList, setPicList] = useState<PicOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchPic = async () => {
      setLoading(true);
      try {
        const result = await searchAvailableMasterPic(search);
        setPicList(result.data);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchPic, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleSelect = (picId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(picId)) {
      newSelected.delete(picId);
    } else {
      newSelected.add(picId);
    }
    setSelectedIds(newSelected);
  };

  const handleLink = async () => {
    setLinking(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const picId of Array.from(selectedIds)) {
        const result = await linkPic(perusahaanId, picId);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        setAlertMsg({
          type: "success",
          text: `${successCount} PIC berhasil dihubungkan${errorCount > 0 ? `, ${errorCount} gagal` : ""}.`,
        });
        setSelectedIds(new Set());
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setAlertMsg({
          type: "error",
          text: "Tidak ada PIC yang berhasil dihubungkan.",
        });
      }
    } finally {
      setLinking(false);
    }
  };

  const getTipeLabel = (tipe: TipePic) => {
    switch (tipe) {
      case TipePic.INTERNAL:
        return "Internal";
      case TipePic.DINAS:
        return "Dinas";
      case TipePic.MITRA:
        return "Mitra";
      default:
        return tipe;
    }
  };

  return (
    <div className="p-6 max-w-2xl w-full max-h-96 flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
        Hubungkan PIC dari Master Data
      </h2>

      {/* Alert */}
      {alertMsg && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            alertMsg.type === "success"
              ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400"
              : "bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-400"
          }`}
        >
          {alertMsg.text}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau nomor telepon PIC..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          disabled={linking}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {loading && (
          <div className="text-xs text-gray-400 dark:text-gray-500 py-2">
            Memuat...
          </div>
        )}
        {!loading && picList.length === 0 && (
          <div className="text-xs text-gray-400 dark:text-gray-500 py-2">
            {search ? "Tidak ada PIC yang ditemukan." : "Tidak ada PIC di master data."}
          </div>
        )}
        {!loading &&
          picList.map((pic) => (
            <label
              key={pic.id}
              className="flex items-center gap-3 p-2 border border-gray-100 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(pic.id)}
                onChange={() => toggleSelect(pic.id)}
                disabled={linking}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {pic.nama}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getTipeLabel(pic.tipe)}
                  {pic.noTelp && ` • ${pic.noTelp}`}
                </p>
              </div>
            </label>
          ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={linking}
        >
          Tutup
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleLink}
          disabled={linking || selectedIds.size === 0}
        >
          {linking ? "Menghubungkan..." : `Hubungkan (${selectedIds.size})`}
        </Button>
      </div>
    </div>
  );
};

export default PicSelectionModal;
