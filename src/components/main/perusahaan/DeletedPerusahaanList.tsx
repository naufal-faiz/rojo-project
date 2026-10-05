"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import AlertModal from "@/components/main/Modal/AlertModal";
import { restorePerusahaan } from "@/lib/data/action/perusahaanAction";
import { useModal } from "@/hooks/useModal";

interface PerusahaanData {
  id: string;
  nama: string;
  alamatLegal?: string | null;
  cabang: Array<{
    id: string;
    nama: string;
  }>;
  perusahaanPic: Array<{
    pic: {
      id: string;
      nama: string;
    };
  }>;
}

interface DeletedPerusahaanListProps {
  initialData: PerusahaanData[];
}

const DeletedPerusahaanList: React.FC<DeletedPerusahaanListProps> = ({ initialData }) => {
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

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

  const handleOpenRestore = (id: string) => {
    setRestoreId(id);
    openConfirm();
  };

  const handleRestore = async () => {
    if (!restoreId) return;
    setRestoreLoading(true);
    try {
      const result = await restorePerusahaan(restoreId);
      if (!result.success) {
        closeConfirm();
        setAlertType("error");
        setAlertTitle("Gagal Restore");
        setAlertMessage(result.error ?? "Gagal merestore perusahaan.");
        openAlert();
      } else {
        closeConfirm();
        setRestoreId(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Perusahaan berhasil direstore.");
        openAlert();
      }
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <>
      {initialData.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-gray-400">
          Tidak ada data perusahaan yang dihapus.
        </div>
      ) : (
        <div className="space-y-3">
          {initialData.map((perusahaan) => (
            <div
              key={perusahaan.id}
              className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
            >
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-800 dark:text-white/90 truncate line-through block">
                    {perusahaan.nama}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {perusahaan.cabang.length} cabang • {perusahaan.perusahaanPic.length} PIC
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenRestore(perusahaan.id)}
                  >
                    Restore
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog konfirmasi restore */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={handleRestore}
        title="Restore Perusahaan"
        message="Yakin ingin merestore perusahaan ini? Cabang HQ akan ikut direstore."
        confirmLabel="Ya, Restore"
        variant="primary"
        isLoading={restoreLoading}
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

export default DeletedPerusahaanList;
