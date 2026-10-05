"use client";
import React from "react";
import StatusBadge from "@/components/main/common/StatusBadge";
import { ChevronDownIcon, ChevronUpIcon } from "@/icons/index";
import { StatusPeserta } from "@/lib/generated/prisma/enums";

export interface PesertaItemData {
  id: string;
  noSertifikat: string | null;
  status: StatusPeserta | null;
  peserta: {
    id: string;
    nama: string;
    cabang: { nama: string; perusahaan: { nama: string } } | null;
  };
}

export interface PendaftaranItemData {
  id: string;
  perusahaan: { id: string; nama: string };
  pic: { id: string; nama: string } | null;
  pesertaPelaksanaan: PesertaItemData[];
}

interface PendaftaranPerusahaanItemProps {
  /** Data pendaftaran satu perusahaan */
  pendaftaran: PendaftaranItemData;
  /** Baris sedang dibuka */
  expanded: boolean;
  /** Buka/tutup daftar peserta */
  onToggle: () => void;
  /** Tambah peserta ke pendaftaran ini */
  onAddPeserta: () => void;
  /** Ubah PIC penerima sertifikat */
  onEditPic: () => void;
  /** Hapus pendaftaran */
  onDelete: () => void;
  /** Hapus peserta dari pendaftaran */
  onRemovePeserta: (peserta: PesertaItemData) => void;
}

const PendaftaranPerusahaanItem: React.FC<PendaftaranPerusahaanItemProps> = ({
  pendaftaran,
  expanded,
  onToggle,
  onAddPeserta,
  onEditPic,
  onDelete,
  onRemovePeserta,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 text-left"
        >
          {expanded ? (
            <ChevronUpIcon className="size-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDownIcon className="size-4 text-gray-500 dark:text-gray-400" />
          )}
          <span>
            <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">
              {pendaftaran.perusahaan.nama}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">
              PIC: {pendaftaran.pic?.nama ?? "Belum ditentukan"} •{" "}
              {pendaftaran.pesertaPelaksanaan.length} peserta
            </span>
          </span>
        </button>

        <div className="flex gap-2">
          <button onClick={onAddPeserta} className="text-xs text-brand-500 hover:underline">
            Tambah Peserta
          </button>
          <button onClick={onEditPic} className="text-xs text-brand-500 hover:underline">
            Ubah PIC
          </button>
          <button onClick={onDelete} className="text-xs text-error-500 hover:underline">
            Hapus
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-3 dark:border-gray-700">
          {pendaftaran.pesertaPelaksanaan.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
              Belum ada peserta di pendaftaran ini.
            </p>
          ) : (
            <ul className="space-y-2">
              {pendaftaran.pesertaPelaksanaan.map((peserta) => (
                <li
                  key={peserta.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {peserta.peserta.nama}
                    </span>
                    <span className="block text-xs text-gray-400 dark:text-gray-500">
                      {peserta.peserta.cabang
                        ? `${peserta.peserta.cabang.perusahaan.nama} - ${peserta.peserta.cabang.nama}`
                        : "Mandiri"}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    {peserta.status && <StatusBadge status={peserta.status} size="sm" />}
                    <button
                      onClick={() => onRemovePeserta(peserta)}
                      className="text-xs text-error-500 hover:underline"
                    >
                      Hapus
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default PendaftaranPerusahaanItem;
