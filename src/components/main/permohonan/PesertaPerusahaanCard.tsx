"use client";
import React, { useState } from "react";
import ComponentCard from "@/components/main/common/ComponentCard";
import FlashAlert from "@/components/main/common/FlashAlert";
import useFlash from "@/components/main/common/useFlash";
import { ChevronDownIcon } from "@/icons/index";
import StatusKelulusanSelect from "./StatusKelulusanSelect";
import type { PermohonanUbahData } from "./permohonanTypes";

interface PesertaPerusahaanCardProps {
  /** Pendaftaran perusahaan aktif beserta PIC dan pesertanya. */
  pendaftaran: PermohonanUbahData["pendaftaran"];
}

const PesertaPerusahaanCard: React.FC<PesertaPerusahaanCardProps> = ({ pendaftaran }) => {
  const flash = useFlash();
  const [terbuka, setTerbuka] = useState<Record<string, boolean>>({});

  return (
    <ComponentCard title="Peserta via Perusahaan"
      desc="Klik perusahaan untuk melihat pesertanya. Perubahan status kelulusan langsung tersimpan.">
      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      {pendaftaran.length === 0 ? (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">Belum ada perusahaan yang mendaftar.</p>
      ) : (
        <div className="space-y-3">
          {pendaftaran.map((pendaftaranItem) => {
            const dibuka = Boolean(terbuka[pendaftaranItem.id]);
            return (
              <div key={pendaftaranItem.id} className="rounded-xl border border-gray-100 dark:border-gray-700">
                <button type="button" aria-expanded={dibuka}
                  onClick={() => setTerbuka((current) => ({ ...current, [pendaftaranItem.id]: !current[pendaftaranItem.id] }))}
                  className="flex w-full flex-wrap items-center justify-between gap-2 p-3 text-left">
                  <span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{pendaftaranItem.perusahaan.nama}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      PIC: {pendaftaranItem.pic?.nama ?? "Belum ditentukan"} • {pendaftaranItem.pesertaPelaksanaan.length} peserta
                    </span>
                  </span>
                  <ChevronDownIcon className={`size-4 text-gray-500 dark:text-gray-400 ${dibuka ? "rotate-180" : ""}`} />
                </button>
                {dibuka && (
                  <div className="space-y-2 border-t border-gray-100 p-3 dark:border-gray-700">
                    {pendaftaranItem.pesertaPelaksanaan.length === 0 ? (
                      <p className="text-sm italic text-gray-500 dark:text-gray-400">Belum ada peserta pada pendaftaran ini.</p>
                    ) : (
                      pendaftaranItem.pesertaPelaksanaan.map((row) => (
                        <div key={row.id} className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm text-gray-800 dark:text-gray-200">{row.peserta.nama}</span>
                          <StatusKelulusanSelect id={row.id} nama={row.peserta.nama} status={row.status ?? null}
                            onSuccess={flash.showSuccess} onError={flash.showError} />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ComponentCard>
  );
};

export default PesertaPerusahaanCard;
