"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { Modal } from "@/components/ui/modal";
import {
  createPicAndLink,
  unlinkPic,
  deletePic,
  linkPic,
} from "@/lib/data/action/perusahaanAction";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";
import { TipePic } from "@/lib/generated/prisma/enums";
import PicSelectionModal from "./PicSelectionModal";

interface PicManagerProps {
  perusahaanId: string;
  picList: Array<{
    pic: {
      id: string;
      nama: string;
      noTelp?: string | null;
      tipe: TipePic;
    };
  }>;
}

const PicManager: React.FC<PicManagerProps> = ({ perusahaanId, picList }) => {
  const [showForm, setShowForm] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [newNoTelp, setNewNoTelp] = useState("");
  const [newTipe, setNewTipe] = useState<TipePic>(TipePic.INTERNAL);
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  const [actionType, setActionType] = useState<"unlink" | "delete" | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [linkLoading, setLinkLoading] = useState(false);

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
  const {
    isOpen: isSelectionOpen,
    openModal: openSelection,
    closeModal: closeSelection,
  } = useModal();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    try {
      const result = await createPicAndLink(perusahaanId, {
        nama: newNama,
        noTelp: newNoTelp,
        tipe: newTipe,
      });
      if (!result.success) {
        setAddError(result.error ?? "Gagal menambah PIC.");
        setAlertType("error");
        setAlertTitle("Gagal Menambah");
        setAlertMessage(result.error ?? "Gagal menambah PIC.");
        openAlert();
      } else {
        setNewNama("");
        setNewNoTelp("");
        setNewTipe(TipePic.INTERNAL);
        setShowForm(false);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("PIC berhasil ditambahkan.");
        openAlert();
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleLinkMultiple = async (picIds: string[]) => {
    setLinkLoading(true);
    try {
      // Logic sudah di PicSelectionModal, tinggal close
      closeSelection();
    } finally {
      setLinkLoading(false);
    }
  };

  const confirmAction = (picId: string, type: "unlink" | "delete") => {
    setActionId(picId);
    setActionType(type);
    openConfirm();
  };

  const handleConfirm = async () => {
    if (!actionId || !actionType) return;
    setActionLoading(true);
    try {
      let result;
      if (actionType === "unlink") {
        result = await unlinkPic(perusahaanId, actionId);
      } else {
        result = await deletePic(actionId);
      }

      if (!result.success) {
        closeConfirm();
        setAlertType("error");
        setAlertTitle(actionType === "unlink" ? "Gagal Melepas" : "Gagal Menghapus");
        setAlertMessage(result.error ?? "Gagal melakukan aksi.");
        openAlert();
      } else {
        closeConfirm();
        setActionId(null);
        setActionType(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage(
          actionType === "unlink"
            ? "PIC berhasil dilepas dari perusahaan."
            : "PIC berhasil dihapus."
        );
        openAlert();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getTipeLabel = (tipe: TipePic) => {
    switch (tipe) {
      case TipePic.INTERNAL:
        return "Internal";
      case TipePic.DINAS:
        return "Dinas";
      case TipePic.MITRA:
        return "Mitra";
      default:
        return tipe;
    }
  };

  return (
    <div className="space-y-2">
      {/* Daftar PIC */}
      {picList.length > 0 && (
        <div className="space-y-2">
          {picList.map(({ pic }) => (
            <div
              key={pic.id}
              className="flex items-center justify-between gap-2 py-2 px-2 border border-gray-100 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{pic.nama}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getTipeLabel(pic.tipe)}
                  {pic.noTelp && ` • ${pic.noTelp}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => confirmAction(pic.id, "unlink")}
                  className="text-xs text-warning-500 hover:underline"
                >
                  Lepas
                </button>
                <button
                  type="button"
                  onClick={() => confirmAction(pic.id, "delete")}
                  className="text-xs text-error-500 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {picList.length === 0 && !showForm && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">Belum ada PIC yang terhubung.</p>
      )}

      {/* Tombol aksi */}
      {!showForm && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openSelection}
            className="flex-1"
          >
            Hubungkan PIC
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="flex-1"
          >
            + Tambah PIC Baru
          </Button>
        </div>
      )}

      {/* Form tambah PIC baru */}
      {showForm && (
        <form onSubmit={handleAdd} className="space-y-2 p-3 border border-gray-300 rounded-lg dark:border-gray-600 bg-white dark:bg-gray-800">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Tambah PIC Baru</p>
          <Input
            value={newNama}
            onChange={(e) => setNewNama(e.target.value)}
            placeholder="Nama PIC"
            className="text-sm h-8"
            required
          />
          <Input
            value={newNoTelp}
            onChange={(e) => setNewNoTelp(e.target.value)}
            placeholder="No. Telepon (opsional)"
            className="text-sm h-8"
          />
          <select
            value={newTipe}
            onChange={(e) => setNewTipe(e.target.value as TipePic)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
          >
            <option value={TipePic.INTERNAL}>Internal (Karyawan)</option>
            <option value={TipePic.DINAS}>Dinas (Pemerintah)</option>
            <option value={TipePic.MITRA}>Mitra (PJK3)</option>
          </select>
          {addError && <span className="text-xs text-error-500">{addError}</span>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={addLoading} className="flex-1">
              {addLoading ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setAddError(null);
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      )}

      {/* Modal pilih PIC dari master */}
      <Modal isOpen={isSelectionOpen} onClose={closeSelection} className="max-w-2xl">
        <PicSelectionModal
          perusahaanId={perusahaanId}
          onClose={closeSelection}
          isLoading={linkLoading}
        />
      </Modal>

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={actionType === "unlink" ? "Lepas PIC" : "Hapus PIC"}
        message={
          actionType === "unlink"
            ? "Yakin ingin melepas PIC dari perusahaan ini?"
            : "Yakin ingin menghapus PIC ini? Data ini akan terhapus permanen."
        }
        confirmLabel={actionType === "unlink" ? "Ya, Lepas" : "Ya, Hapus"}
        variant={actionType === "unlink" ? "warning" : "danger"}
        isLoading={actionLoading}
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
    </div>
  );
};

export default PicManager;
