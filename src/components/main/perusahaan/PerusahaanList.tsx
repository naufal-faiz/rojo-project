"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import PageHeader from "@/components/main/common/PageHeader";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import AlertModal from "@/components/main/Modal/AlertModal";
import PerusahaanFormModal from "./PerusahaanFormModal";
import CabangManager from "./CabangManager";
import PicManager from "./PicManager";
import PerusahaanPesertaList from "./PerusahaanPesertaList";
import { deletePerusahaan } from "@/lib/data/action/perusahaanAction";
import { TipeCabang, TipePic } from "@/lib/generated/prisma/enums";

interface Cabang {
  id: string;
  nama: string;
  tipe: TipeCabang;
  alamat?: string | null;
  peserta?: Array<{ id: string; nama: string }>;
}

interface PerusahaanPic {
  pic: {
    id: string;
    nama: string;
    noTelp?: string | null;
    tipe: TipePic;
  };
}

interface PerusahaanData {
  id: string;
  nama: string;
  alamatLegal?: string | null;
  cabang: Cabang[];
  perusahaanPic: PerusahaanPic[];
}

interface PerusahaanListProps {
  initialData: PerusahaanData[];
}

const PerusahaanList: React.FC<PerusahaanListProps> = ({ initialData }) => {
  const [editData, setEditData] = useState<{ id: string; nama: string; alamatLegal?: string | null } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const {
    isOpen: isFormOpen,
    openModal: openForm,
    closeModal: closeForm,
  } = useModal();
  const {
    isOpen: isConfirmOpen,
    openModal: openConfirm,
    closeModal: closeConfirm,
  } = useModal();
  const {
    isOpen: isAlertOpen,
    openModal: openAlert,
    closeModal: closeAlert,
  } = useModal();

  const handleOpenAdd = () => {
    setEditData(null);
    openForm();
  };

  const handleOpenEdit = (perusahaan: PerusahaanData) => {
    setEditData({ id: perusahaan.id, nama: perusahaan.nama, alamatLegal: perusahaan.alamatLegal });
    openForm();
  };

  const handleOpenDelete = (id: string) => {
    setDeleteId(id);
    openConfirm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const result = await deletePerusahaan(deleteId);
      if (!result.success) {
        closeConfirm();
        setAlertType("error");
        setAlertTitle("Gagal Menghapus");
        setAlertMessage(result.error ?? "Gagal menghapus perusahaan.");
        openAlert();
      } else {
        closeConfirm();
        setDeleteId(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Perusahaan berhasil dihapus.");
        openAlert();
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <PageHeader
        title="Master Perusahaan"
        description="Kelola data Perusahaan, Cabang, dan PIC untuk pendaftaran kegiatan."
        primaryAction={{
          label: "Tambah Perusahaan",
          onClick: handleOpenAdd,
        }}
      />

      {/* Daftar perusahaan aktif */}
        <div className="space-y-3">
          {initialData.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-gray-400">
              Belum ada data perusahaan. Klik &quot;Tambah Perusahaan&quot; untuk mulai.
            </div>
          ) : (
            initialData.map((perusahaan) => {
              const daftarPeserta = perusahaan.cabang.flatMap((cabang) =>
                (cabang.peserta ?? []).map((peserta) => ({
                  id: peserta.id,
                  nama: peserta.nama,
                  cabang: cabang.nama,
                }))
              );

              return (
              <div
                key={perusahaan.id}
                className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
              >
                {/* Baris perusahaan */}
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleExpand(perusahaan.id)}
                    className="flex items-center gap-2 text-left flex-1 min-w-0"
                  >
                    <span
                      className={`text-gray-400 transition-transform duration-200 ${
                        expandedId === perusahaan.id ? "rotate-90" : ""
                      }`}
                    >
                      ▶
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-800 dark:text-white/90 truncate block">
                        {perusahaan.nama}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {perusahaan.cabang.length} cabang • {perusahaan.perusahaanPic.length} PIC
                      </span>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(perusahaan)}
                    >
                      Ubah
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDelete(perusahaan.id)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>

                {/* Panel expand (cabang + PIC) */}
                {expandedId === perusahaan.id && (
                  <div className="border-t border-gray-100 px-5 py-4 dark:border-white/[0.05] space-y-4">
                    {/* Cabang */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                        Cabang
                      </p>
                      <CabangManager
                        perusahaanId={perusahaan.id}
                        cabang={perusahaan.cabang}
                      />
                    </div>

                    {/* PIC */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                        PIC (Person In Charge)
                      </p>
                      <PicManager
                        perusahaanId={perusahaan.id}
                        picList={perusahaan.perusahaanPic}
                      />
                    </div>

                    {/* Peserta */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                        Peserta
                      </p>
                      <PerusahaanPesertaList peserta={daftarPeserta} />
                    </div>
                  </div>
                )}
              </div>
              );
            })
          )}
        </div>
      {/* Modal form tambah/ubah perusahaan */}
      <Modal isOpen={isFormOpen} onClose={closeForm} className="max-w-md">
        <PerusahaanFormModal editData={editData} onClose={closeForm} />
      </Modal>

      {/* Dialog konfirmasi hapus */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Hapus Perusahaan"
        message="Yakin ingin menghapus perusahaan ini? Perusahaan hanya bisa dihapus jika tidak ada pendaftaran atau peserta aktif."
        confirmLabel="Ya, Hapus"
        variant="danger"
        isLoading={deleteLoading}
      />

      {/* Alert */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={closeAlert}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        okLabel="OK"
      />
    </>
  );
};

export default PerusahaanList;
