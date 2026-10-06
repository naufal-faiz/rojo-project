"use client";
import React from "react";
import StatusBadge from "@/components/main/common/StatusBadge";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import { ChevronDownIcon, ChevronUpIcon } from "@/icons/index";
import type { PendaftaranItemData, PesertaItemData } from "./pendaftaranTypes";

interface PendaftaranPerusahaanItemProps {
  /** Data pendaftaran satu perusahaan. */
  pendaftaran: PendaftaranItemData;
  /** Baris sedang dibuka. */
  expanded: boolean;
  onToggle: () => void;
  onAddPeserta: () => void;
  onEditPic: () => void;
  onDelete: () => void;
  /** ID peserta yang konfirmasi hapusnya terbuka. */
  confirmPesertaId: string | null;
  removing: boolean;
  onRemovePeserta: (peserta: PesertaItemData) => void;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
  /** Panel inline: tambah peserta, ubah PIC, atau konfirmasi hapus pendaftaran. */
  children?: React.ReactNode;
}

const PendaftaranPerusahaanItem: React.FC<PendaftaranPerusahaanItemProps> = ({
  pendaftaran,
  expanded,
  onToggle,
  onAddPeserta,
  onEditPic,
  onDelete,
  confirmPesertaId,
  removing,
  onRemovePeserta,
  onConfirmRemove,
  onCancelRemove,
  children,
}) => (
  <div className="rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="flex flex-wrap items-center justify-between gap-3 p-3">
      <button type="button" onClick={onToggle} aria-expanded={expanded} className="flex items-center gap-2 text-left">
        {expanded
          ? <ChevronUpIcon className="size-4 text-gray-500 dark:text-gray-400" />
          : <ChevronDownIcon className="size-4 text-gray-500 dark:text-gray-400" />}
        <span>
          <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">{pendaftaran.perusahaan.nama}</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            PIC: {pendaftaran.pic?.nama ?? "Belum ditentukan"} • {pendaftaran.pesertaPelaksanaan.length} peserta
          </span>
        </span>
      </button>
      <div className="flex gap-2">
        <button type="button" onClick={onAddPeserta} className="text-xs text-brand-500 hover:underline">Tambah Peserta</button>
        <button type="button" onClick={onEditPic} className="text-xs text-brand-500 hover:underline">Ubah PIC</button>
        <button type="button" onClick={onDelete} className="text-xs text-error-500 hover:underline">Hapus</button>
      </div>
    </div>

    {expanded && (
      <div className="space-y-3 border-t border-gray-100 p-3 dark:border-gray-700">
        {children}
        {pendaftaran.pesertaPelaksanaan.length === 0 ? (
          <p className="text-xs italic text-gray-400 dark:text-gray-500">Belum ada peserta di pendaftaran ini.</p>
        ) : (
          <ul className="space-y-2">
            {pendaftaran.pesertaPelaksanaan.map((peserta) => (
              <li key={peserta.id}>
                {confirmPesertaId === peserta.id ? (
                  <InlineConfirm
                    message={peserta.noSertifikat
                      ? `Peserta ini sudah punya No. Sertifikat (${peserta.noSertifikat}). Yakin tetap dihapus dari pendaftaran?`
                      : `Hapus ${peserta.peserta.nama} dari pendaftaran ini?`}
                    confirmLabel="Ya, Hapus" onConfirm={onConfirmRemove} onCancel={onCancelRemove} loading={removing} />
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span>
                      <span className="text-gray-700 dark:text-gray-300">{peserta.peserta.nama}</span>
                      <span className="block text-xs text-gray-400 dark:text-gray-500">
                        {peserta.peserta.cabang
                          ? `${peserta.peserta.cabang.perusahaan.nama} - ${peserta.peserta.cabang.nama}`
                          : "Tanpa perusahaan"}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      {peserta.status && <StatusBadge status={peserta.status} size="sm" />}
                      <button type="button" onClick={() => onRemovePeserta(peserta)} className="text-xs text-error-500 hover:underline">
                        Hapus
                      </button>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
  </div>
);

export default PendaftaranPerusahaanItem;
