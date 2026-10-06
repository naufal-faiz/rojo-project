"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/main/common/ComponentCard";
import FlashAlert from "@/components/main/common/FlashAlert";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import StatusBadge from "@/components/main/common/StatusBadge";
import useFlash from "@/components/main/common/useFlash";
import { PlusIcon } from "@/icons/index";
import { removePesertaPendaftaran } from "@/lib/data/action/pesertaPelaksanaanAction";
import TambahPesertaPanel from "./TambahPesertaPanel";
import type { PesertaItemData } from "./pendaftaranTypes";

interface PesertaMandiriPanelProps {
  /** Permohonan yang sedang dikelola. */
  pelaksanaanId: string;
  /** Peserta mandiri aktif. */
  pesertaList: PesertaItemData[];
}

const PesertaMandiriPanel: React.FC<PesertaMandiriPanelProps> = ({ pelaksanaanId, pesertaList }) => {
  const flash = useFlash();
  const [adding, setAdding] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<PesertaItemData | null>(null);
  const [busy, setBusy] = useState(false);

  const hapusPeserta = async () => {
    if (!removeTarget || busy) return;
    setBusy(true);
    try {
      const result = await removePesertaPendaftaran(removeTarget.id);
      if (result.success) { setRemoveTarget(null); flash.showSuccess("Peserta dihapus dari pendaftaran."); }
      else flash.showError(result.error ?? "Gagal menghapus peserta.");
    } catch { flash.showError("Gagal menghapus peserta."); }
    finally { setBusy(false); }
  };

  return (
    <ComponentCard title="Peserta Mandiri"
      desc="Peserta yang mendaftar langsung tanpa perusahaan. Perusahaan asal peserta tidak diubah.">
      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAdding(true)} startIcon={<PlusIcon className="size-4" />}>
          Tambah Peserta Mandiri
        </Button>
      </div>
      {adding && (
        <TambahPesertaPanel pelaksanaanId={pelaksanaanId} pendaftaranPerusahaanId={null} perusahaanId={null}
          flash={flash} onClose={() => setAdding(false)} />
      )}
      {pesertaList.length === 0 ? (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">Belum ada peserta mandiri.</p>
      ) : (
        <ul className="space-y-2">
          {pesertaList.map((peserta) => (
            <li key={peserta.id} className="border-b border-gray-100 pb-2 last:border-0 dark:border-white/[0.05]">
              {removeTarget?.id === peserta.id ? (
                <InlineConfirm
                  message={peserta.noSertifikat
                    ? `Peserta ini sudah punya No. Sertifikat (${peserta.noSertifikat}). Yakin tetap dihapus dari pendaftaran?`
                    : `Hapus ${peserta.peserta.nama} dari peserta mandiri?`}
                  confirmLabel="Ya, Hapus" onConfirm={hapusPeserta} onCancel={() => setRemoveTarget(null)} loading={busy} />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <span className="block text-sm text-gray-700 dark:text-gray-300">{peserta.peserta.nama}</span>
                    <span className="block text-xs text-gray-400 dark:text-gray-500">
                      {peserta.peserta.cabang
                        ? `${peserta.peserta.cabang.perusahaan.nama} - ${peserta.peserta.cabang.nama}`
                        : "Tanpa perusahaan"}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    {peserta.status && <StatusBadge status={peserta.status} size="sm" />}
                    <button type="button" onClick={() => setRemoveTarget(peserta)} className="text-xs text-error-500 hover:underline">
                      Hapus
                    </button>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </ComponentCard>
  );
};

export default PesertaMandiriPanel;
