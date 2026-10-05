"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import ComponentCard from "@/components/main/common/ComponentCard";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import AlertModal from "@/components/main/Modal/AlertModal";
import StatusBadge from "@/components/main/common/StatusBadge";
import PesertaBulkModal from "./PesertaBulkModal";
import { PesertaItemData } from "./PendaftaranPerusahaanItem";
import { usePendaftaranAksi } from "./usePendaftaranAksi";
import { CabangOption } from "./pesertaBulkTypes";

interface PesertaMandiriPanelProps {
  /** Permohonan yang sedang dikelola */
  pelaksanaanId: string;
  /** Daftar peserta mandiri aktif */
  pesertaList: PesertaItemData[];
  /** Opsi cabang untuk form peserta baru */
  cabangOptions: CabangOption[];
}

const PesertaMandiriPanel: React.FC<PesertaMandiriPanelProps> = ({
  pelaksanaanId,
  pesertaList,
  cabangOptions,
}) => {
  const { loading, alert, closeAlert, hapusPeserta } = usePendaftaranAksi();
  const [isBulkOpen, setBulkOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<PesertaItemData | null>(null);

  const handleKonfirmasiHapus = async () => {
    if (!removeTarget) return;
    const berhasil = await hapusPeserta(removeTarget.id);
    if (berhasil) setRemoveTarget(null);
  };

  return (
    <ComponentCard
      title="Peserta Mandiri"
      desc="Peserta yang mendaftar langsung tanpa perusahaan."
    >
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setBulkOpen(true)}>
          Tambah Peserta Mandiri
        </Button>
      </div>

      {pesertaList.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Belum ada peserta mandiri.
        </p>
      ) : (
        <ul className="space-y-2">
          {pesertaList.map((peserta) => (
            <li
              key={peserta.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2 last:border-0 dark:border-white/[0.05]"
            >
              <span>
                <span className="block text-sm text-gray-700 dark:text-gray-300">
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
                  onClick={() => setRemoveTarget(peserta)}
                  className="text-xs text-error-500 hover:underline"
                >
                  Hapus
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {isBulkOpen && (
        <Modal isOpen onClose={() => setBulkOpen(false)} className="max-w-xl">
          <PesertaBulkModal
            pelaksanaanId={pelaksanaanId}
            pendaftaranPerusahaanId={null}
            cabangOptions={cabangOptions}
            onClose={() => setBulkOpen(false)}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleKonfirmasiHapus}
        title="Hapus Peserta"
        message={
          removeTarget?.noSertifikat
            ? `Peserta ini sudah punya No. Sertifikat (${removeTarget.noSertifikat}). Yakin tetap dihapus dari pendaftaran?`
            : "Yakin ingin menghapus peserta mandiri ini?"
        }
        confirmLabel="Ya, Hapus"
        variant={removeTarget?.noSertifikat ? "warning" : "danger"}
        isLoading={loading}
      />

      <AlertModal
        isOpen={alert !== null}
        onClose={closeAlert}
        type={alert?.type ?? "success"}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        okLabel="OK"
      />
    </ComponentCard>
  );
};

export default PesertaMandiriPanel;
