"use client";
import React from "react";
import ComponentCard from "@/components/main/common/ComponentCard";
import FlashAlert from "@/components/main/common/FlashAlert";
import useFlash from "@/components/main/common/useFlash";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import StatusKelulusanSelect from "./StatusKelulusanSelect";
import type { PermohonanUbahData } from "./permohonanTypes";

interface PesertaMandiriCardProps {
  /** Peserta aktif tanpa pendaftaran perusahaan. */
  peserta: PermohonanUbahData["pesertaPelaksanaan"];
}

const headClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400";
const cellClass = "px-4 py-3 text-sm text-gray-700 dark:text-gray-300";

const PesertaMandiriCard: React.FC<PesertaMandiriCardProps> = ({ peserta }) => {
  const flash = useFlash();

  return (
    <ComponentCard title="Peserta Mandiri"
      desc="Peserta yang mendaftar tanpa perusahaan. Kolom perusahaan menampilkan asal peserta bila ada.">
      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      {peserta.length === 0 ? (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">Belum ada peserta mandiri.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableCell isHeader className={headClass}>Nama</TableCell>
                <TableCell isHeader className={headClass}>Perusahaan</TableCell>
                <TableCell isHeader className={headClass}>Status Kelulusan</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {peserta.map((row) => (
                <TableRow key={row.id} className="border-b border-gray-100 last:border-0 dark:border-white/[0.05]">
                  <TableCell className={cellClass}>{row.peserta.nama}</TableCell>
                  <TableCell className={cellClass}>{row.peserta.cabang?.perusahaan.nama ?? "-"}</TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusKelulusanSelect id={row.id} nama={row.peserta.nama} status={row.status ?? null}
                      onSuccess={flash.showSuccess} onError={flash.showError} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </ComponentCard>
  );
};

export default PesertaMandiriCard;
