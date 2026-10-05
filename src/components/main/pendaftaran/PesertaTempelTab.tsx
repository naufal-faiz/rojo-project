"use client";
import React from "react";
import Button from "@/components/ui/button/Button";
import TextArea from "@/components/form/input/TextArea";
import Badge from "@/components/ui/badge/Badge";
import { PreviewTempel } from "./pesertaBulkTypes";

interface PesertaTempelTabProps {
  /** Isi textarea */
  text: string;
  /** Dipanggil saat isi textarea berubah */
  onTextChange: (value: string) => void;
  /** Hasil pratinjau, null bila belum dipratinjau */
  preview: PreviewTempel | null;
  /** Dipanggil saat tombol pratinjau ditekan */
  onPreview: () => void;
  /** Sedang memproses pratinjau */
  loading: boolean;
}

const PesertaTempelTab: React.FC<PesertaTempelTabProps> = ({
  text,
  onTextChange,
  preview,
  onPreview,
  loading,
}) => {
  const jumlahBaris = text
    .split("\n")
    .map((baris) => baris.trim())
    .filter(Boolean).length;

  return (
    <div className="space-y-3">
      <TextArea
        value={text}
        onChange={onTextChange}
        placeholder={"Tempel banyak nama, satu nama per baris.\nContoh:\nBudi Santoso\nSiti Aminah (TAKEOUT)"}
        rows={5}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">{jumlahBaris} baris terisi</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPreview}
          disabled={loading || jumlahBaris === 0}
        >
          {loading ? "Memproses..." : "Pratinjau"}
        </Button>
      </div>

      {preview && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Cocok dengan master ({preview.cocok.length})
            </p>
            {preview.cocok.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500">Tidak ada.</p>
            ) : (
              <ul className="space-y-1">
                {preview.cocok.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <span>{item.nama}</span>
                    {item.sudahTerdaftar ? (
                      <Badge color="warning" size="sm">
                        Sudah terdaftar, dilewati
                      </Badge>
                    ) : (
                      <Badge color="success" size="sm">
                        Akan ditambahkan
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Peserta baru ({preview.baru.length})
            </p>
            {preview.baru.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500">Tidak ada.</p>
            ) : (
              <ul className="space-y-1">
                {preview.baru.map((nama) => (
                  <li key={nama} className="text-xs text-gray-600 dark:text-gray-300">
                    {nama}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {preview.ditolak.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-error-600 dark:text-error-400 mb-1">
                Ditolak ({preview.ditolak.length})
              </p>
              <ul className="space-y-1">
                {preview.ditolak.map((item, index) => (
                  <li key={`${item.nama}-${index}`} className="text-xs text-error-500">
                    {item.nama} — {item.alasan}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PesertaTempelTab;
