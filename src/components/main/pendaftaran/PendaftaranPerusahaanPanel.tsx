"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import ComponentCard from "@/components/main/common/ComponentCard";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import AlertModal from "@/components/main/Modal/AlertModal";
import PendaftaranFormModal from "./PendaftaranFormModal";
import PendaftaranPicModal from "./PendaftaranPicModal";
import PesertaBulkModal from "./PesertaBulkModal";
import PendaftaranPerusahaanItem, {
  PendaftaranItemData,
  PesertaItemData,
} from "./PendaftaranPerusahaanItem";
import { usePendaftaranAksi } from "./usePendaftaranAksi";
import { CabangOption } from "./pesertaBulkTypes";

interface PendaftaranPerusahaanPanelProps {
  /** Permohonan yang sedang dikelola */
  pelaksanaanId: string;
  /** Daftar pendaftaran perusahaan aktif */
  pendaftaranList: PendaftaranItemData[];
  /** Opsi cabang untuk form peserta baru */
  cabangOptions: CabangOption[];
}

const PendaftaranPerusahaanPanel: React.FC<PendaftaranPerusahaanPanelProps> = ({
  pelaksanaanId,
  pendaftaranList,
  cabangOptions,
}) => {
  const { loading, alert, closeAlert, hapusPendaftaran, hapusPeserta } = usePendaftaranAksi();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [picTarget, setPicTarget] = useState<PendaftaranItemData | null>(null);
  const [bulkTarget, setBulkTarget] = useState<PendaftaranItemData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PendaftaranItemData | null>(null);
  const [removeTarget, setRemoveTarget] = useState<PesertaItemData | null>(null);

  const handleKonfirmasiHapus = async () => {
    if (!deleteTarget) return;
    const berhasil = await hapusPendaftaran(deleteTarget.id);
    if (berhasil) setDeleteTarget(null);
  };

  const handleKonfirmasiHapusPeserta = async () => {
    if (!removeTarget) return;
    const berhasil = await hapusPeserta(removeTarget.id);
    if (berhasil) setRemoveTarget(null);
  };

  return (
    <ComponentCard
      title="Pendaftaran Perusahaan"
      desc="Satu pendaftaran per perusahaan, dengan PIC penerima sertifikat opsional."
    >
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setFormOpen(true)}>
          Tambah Pendaftaran
        </Button>
      </div>

      {pendaftaranList.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Belum ada perusahaan yang mendaftar.
        </p>
      ) : (
        <div className="space-y-3">
          {pendaftaranList.map((pendaftaran) => (
            <PendaftaranPerusahaanItem
              key={pendaftaran.id}
              pendaftaran={pendaftaran}
              expanded={expandedId === pendaftaran.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === pendaftaran.id ? null : pendaftaran.id))
              }
              onAddPeserta={() => setBulkTarget(pendaftaran)}
              onEditPic={() => setPicTarget(pendaftaran)}
              onDelete={() => setDeleteTarget(pendaftaran)}
              onRemovePeserta={(peserta) => setRemoveTarget(peserta)}
            />
          ))}
        </div>
      )}

      {/* Modal tambah pendaftaran */}
      <Modal isOpen={isFormOpen} onClose={() => setFormOpen(false)} className="max-w-lg">
        <PendaftaranFormModal pelaksanaanId={pelaksanaanId} onClose={() => setFormOpen(false)} />
      </Modal>

      {/* Modal ubah PIC */}
      {picTarget && (
        <Modal isOpen onClose={() => setPicTarget(null)} className="max-w-md">
          <PendaftaranPicModal
            pendaftaranId={picTarget.id}
            perusahaanId={picTarget.perusahaan.id}
            picId={picTarget.pic?.id ?? null}
            onClose={() => setPicTarget(null)}
          />
        </Modal>
      )}

      {/* Modal tambah peserta */}
      {bulkTarget && (
        <Modal isOpen onClose={() => setBulkTarget(null)} className="max-w-xl">
          <PesertaBulkModal
            pelaksanaanId={pelaksanaanId}
            pendaftaranPerusahaanId={bulkTarget.id}
            perusahaanNama={bulkTarget.perusahaan.nama}
            cabangOptions={cabangOptions}
            onClose={() => setBulkTarget(null)}
          />
        </Modal>
      )}

      {/* Konfirmasi hapus pendaftaran */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleKonfirmasiHapus}
        title="Hapus Pendaftaran"
        message="Yakin ingin menghapus pendaftaran perusahaan ini? Pendaftaran hanya bisa dihapus jika tidak ada peserta aktif."
        confirmLabel="Ya, Hapus"
        variant="danger"
        isLoading={loading}
      />

      {/* Konfirmasi hapus peserta */}
      <ConfirmDialog
        isOpen={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleKonfirmasiHapusPeserta}
        title="Hapus Peserta"
        message={
          removeTarget?.noSertifikat
            ? `Peserta ini sudah punya No. Sertifikat (${removeTarget.noSertifikat}). Yakin tetap dihapus dari pendaftaran?`
            : "Yakin ingin menghapus peserta ini dari pendaftaran?"
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

export default PendaftaranPerusahaanPanel;
