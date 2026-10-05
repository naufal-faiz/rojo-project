"use client";
import React, { useState } from "react";
import PendaftaranPerusahaanPanel from "./PendaftaranPerusahaanPanel";
import PesertaMandiriPanel from "./PesertaMandiriPanel";
import PendaftaranTerhapusPanel, {
  DeletedPendaftaranItem,
  DeletedPesertaItem,
} from "./PendaftaranTerhapusPanel";
import { PendaftaranItemData, PesertaItemData } from "./PendaftaranPerusahaanItem";
import { CabangOption } from "./pesertaBulkTypes";

type Tab = "perusahaan" | "mandiri" | "terhapus";

interface PendaftaranWorkProps {
  /** ID permohonan yang sedang dikelola */
  pelaksanaanId: string;
  /** Pendaftaran perusahaan aktif */
  pendaftaranList: PendaftaranItemData[];
  /** Peserta mandiri aktif */
  pesertaMandiri: PesertaItemData[];
  /** Pendaftaran perusahaan terhapus */
  deletedPendaftaran: DeletedPendaftaranItem[];
  /** Peserta terhapus */
  deletedPeserta: DeletedPesertaItem[];
  /** Opsi cabang untuk form peserta baru */
  cabangOptions: CabangOption[];
}

const PendaftaranWork: React.FC<PendaftaranWorkProps> = ({
  pelaksanaanId,
  pendaftaranList,
  pesertaMandiri,
  deletedPendaftaran,
  deletedPeserta,
  cabangOptions,
}) => {
  const [tab, setTab] = useState<Tab>("perusahaan");

  const tabs: Array<[Tab, string]> = [
    ["perusahaan", `Pendaftaran Perusahaan (${pendaftaranList.length})`],
    ["mandiri", `Peserta Mandiri (${pesertaMandiri.length})`],
    ["terhapus", `Terhapus (${deletedPendaftaran.length + deletedPeserta.length})`],
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(([nilai, label]) => (
          <button
            key={nilai}
            type="button"
            onClick={() => setTab(nilai)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === nilai
                ? "bg-brand-500 text-white dark:bg-brand-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "perusahaan" && (
        <PendaftaranPerusahaanPanel
          pelaksanaanId={pelaksanaanId}
          pendaftaranList={pendaftaranList}
          cabangOptions={cabangOptions}
        />
      )}

      {tab === "mandiri" && (
        <PesertaMandiriPanel
          pelaksanaanId={pelaksanaanId}
          pesertaList={pesertaMandiri}
          cabangOptions={cabangOptions}
        />
      )}

      {tab === "terhapus" && (
        <PendaftaranTerhapusPanel
          deletedPendaftaran={deletedPendaftaran}
          deletedPeserta={deletedPeserta}
        />
      )}
    </>
  );
};

export default PendaftaranWork;
