"use client";
import React, { useState } from "react";
import PendaftaranPerusahaanPanel from "./PendaftaranPerusahaanPanel";
import PesertaMandiriPanel from "./PesertaMandiriPanel";
import type { PendaftaranItemData, PesertaItemData } from "./pendaftaranTypes";

type Tab = "perusahaan" | "mandiri";

interface PendaftaranWorkProps {
  /** ID permohonan yang sedang dikelola. */
  pelaksanaanId: string;
  /** Pendaftaran perusahaan aktif. */
  pendaftaranList: PendaftaranItemData[];
  /** Peserta mandiri aktif. */
  pesertaMandiri: PesertaItemData[];
}

const PendaftaranWork: React.FC<PendaftaranWorkProps> = ({ pelaksanaanId, pendaftaranList, pesertaMandiri }) => {
  const [tab, setTab] = useState<Tab>("perusahaan");

  const tabs: Array<[Tab, string]> = [
    ["perusahaan", `Pendaftaran Perusahaan (${pendaftaranList.length})`],
    ["mandiri", `Peserta Mandiri (${pesertaMandiri.length})`],
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map(([nilai, label]) => (
          <button key={nilai} type="button" onClick={() => setTab(nilai)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === nilai
                ? "bg-brand-500 text-white dark:bg-brand-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "perusahaan" && (
        <PendaftaranPerusahaanPanel pelaksanaanId={pelaksanaanId} pendaftaranList={pendaftaranList} />
      )}
      {tab === "mandiri" && (
        <PesertaMandiriPanel pelaksanaanId={pelaksanaanId} pesertaList={pesertaMandiri} />
      )}
    </>
  );
};

export default PendaftaranWork;
