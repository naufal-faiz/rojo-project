"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import {
  createTingkatan,
  updateTingkatan,
  deleteTingkatan,
} from "@/lib/data/action/trainingAction";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";

interface Tingkatan {
  id: string;
  kelas: string;
}

interface TingkatanManagerProps {
  /** ID training induk */
  trainingId: string;
  /** Daftar tingkatan aktif milik training ini */
  tingkatan: Tingkatan[];
}

const TingkatanManager: React.FC<TingkatanManagerProps> = ({
  trainingId,
  tingkatan,
}) => {
  const [newKelas, setNewKelas] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editKelas, setEditKelas] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { isOpen: isConfirmOpen, openModal: openConfirm, closeModal: closeConfirm } = useModal();
  const { isOpen: isAlertOpen, openModal: openAlert, closeModal: closeAlert } = useModal();
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    try {
      const result = await createTingkatan(trainingId, newKelas);
      if (!result.success) {
        setAddError(result.error ?? "Gagal menambah tingkatan.");
        setAlertType("error");
        setAlertTitle("Gagal Menambah");
        setAlertMessage(result.error ?? "Gagal menambah tingkatan.");
        openAlert();
      } else {
        setNewKelas("");
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Tingkatan berhasil ditambahkan.");
        openAlert();
      }
    } finally {
      setAddLoading(false);
    }
  };

  const startEdit = (t: Tingkatan) => {
    setEditId(t.id);
    setEditKelas(t.kelas);
    setEditError(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setEditError(null);
    setEditLoading(true);
    try {
      const result = await updateTingkatan(editId, editKelas);
      if (!result.success) {
        setEditError(result.error ?? "Gagal mengubah tingkatan.");
        setAlertType("error");
        setAlertTitle("Gagal Mengubah");
        setAlertMessage(result.error ?? "Gagal mengubah tingkatan.");
        openAlert();
      } else {
        setEditId(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Tingkatan berhasil diubah.");
        openAlert();
      }
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    openConfirm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const result = await deleteTingkatan(deleteId);
      if (!result.success) {
        // Error: tutup confirm, tampilkan alert error
        closeConfirm();
        setAlertType("error");
        setAlertTitle("Gagal Menghapus");
        setAlertMessage(result.error ?? "Gagal menghapus tingkatan.");
        openAlert();
      } else {
        // Sukses: tutup confirm, tampilkan alert sukses
        closeConfirm();
        setDeleteId(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Tingkatan berhasil dihapus.");
        openAlert();
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {/* Daftar tingkatan yang ada */}
      {tingkatan.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">Belum ada tingkatan.</p>
      )}
      {tingkatan.map((t) =>
        editId === t.id ? (
          <form key={t.id} onSubmit={handleEdit} className="flex items-center gap-2">
            <Input
              value={editKelas}
              onChange={(e) => setEditKelas(e.target.value)}
              placeholder="Nama kelas"
              className="text-sm h-8"
              required
            />
            <Button type="submit" size="sm" disabled={editLoading}>
              {editLoading ? "..." : "Simpan"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setEditId(null)}>
              Batal
            </Button>
            {editError && <span className="text-xs text-error-500">{editError}</span>}
          </form>
        ) : (
          <div key={t.id} className="flex items-center justify-between gap-2 py-1">
            <span className="text-sm text-gray-700 dark:text-gray-300">• {t.kelas}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startEdit(t)}
                className="text-xs text-brand-500 hover:underline"
              >
                Ubah
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(t.id)}
                className="text-xs text-error-500 hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        )
      )}

      {/* Form tambah tingkatan baru */}
      <form onSubmit={handleAdd} className="flex items-center gap-2 pt-1">
        <Input
          value={newKelas}
          onChange={(e) => setNewKelas(e.target.value)}
          placeholder="Tambah tingkatan baru..."
          className="text-sm h-8"
        />
        <Button type="submit" size="sm" disabled={addLoading}>
          {addLoading ? "..." : "Tambah"}
        </Button>
        {addError && <span className="text-xs text-error-500">{addError}</span>}
      </form>

      {/* Dialog konfirmasi hapus tingkatan */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Hapus Tingkatan"
        message="Yakin ingin menghapus tingkatan ini? Tidak bisa dihapus jika masih digunakan permohonan aktif."
        confirmLabel="Ya, Hapus"
        variant="danger"
        isLoading={deleteLoading}
      />

      {/* Alert untuk keberhasilan/kegagalan aksi */}
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

export default TingkatanManager;
