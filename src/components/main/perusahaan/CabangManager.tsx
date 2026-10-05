"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import {
  createCabang,
  updateCabang,
  deleteCabang,
} from "@/lib/data/action/perusahaanAction";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";
import { TipeCabang } from "@/lib/generated/prisma/enums";

interface Cabang {
  id: string;
  nama: string;
  tipe: TipeCabang;
  alamat?: string | null;
}

interface CabangManagerProps {
  perusahaanId: string;
  cabang: Cabang[];
}

const CabangManager: React.FC<CabangManagerProps> = ({ perusahaanId, cabang }) => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editTipe, setEditTipe] = useState<TipeCabang>(TipeCabang.CABANG);
  const [editAlamat, setEditAlamat] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [newNama, setNewNama] = useState("");
  const [newTipe, setNewTipe] = useState<TipeCabang>(TipeCabang.CABANG);
  const [newAlamat, setNewAlamat] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const startEdit = (c: Cabang) => {
    setEditId(c.id);
    setEditNama(c.nama);
    setEditTipe(c.tipe);
    setEditAlamat(c.alamat ?? "");
    setEditError(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setEditError(null);
    setEditLoading(true);
    try {
      const result = await updateCabang(editId, {
        nama: editNama,
        tipe: editTipe,
        alamat: editAlamat,
      });
      if (!result.success) {
        setEditError(result.error ?? "Gagal mengubah cabang.");
        setAlertType("error");
        setAlertTitle("Gagal Mengubah");
        setAlertMessage(result.error ?? "Gagal mengubah cabang.");
        openAlert();
      } else {
        setEditId(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Cabang berhasil diubah.");
        openAlert();
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    try {
      const result = await createCabang(perusahaanId, {
        nama: newNama,
        tipe: newTipe,
        alamat: newAlamat,
      });
      if (!result.success) {
        setAddError(result.error ?? "Gagal menambah cabang.");
        setAlertType("error");
        setAlertTitle("Gagal Menambah");
        setAlertMessage(result.error ?? "Gagal menambah cabang.");
        openAlert();
      } else {
        setNewNama("");
        setNewTipe(TipeCabang.CABANG);
        setNewAlamat("");
        setShowForm(false);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Cabang berhasil ditambahkan.");
        openAlert();
      }
    } finally {
      setAddLoading(false);
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
      const result = await deleteCabang(deleteId);
      if (!result.success) {
        closeConfirm();
        setAlertType("error");
        setAlertTitle("Gagal Menghapus");
        setAlertMessage(result.error ?? "Gagal menghapus cabang.");
        openAlert();
      } else {
        closeConfirm();
        setDeleteId(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Cabang berhasil dihapus.");
        openAlert();
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Daftar cabang */}
      {cabang.length > 0 && (
        <div className="space-y-2">
          {cabang.map((c) =>
            editId === c.id ? (
              <form key={c.id} onSubmit={handleEdit} className="space-y-2 p-3 border border-gray-200 rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
                <Input
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  placeholder="Nama cabang"
                  className="text-sm h-8"
                  required
                />
                <select
                  value={editTipe}
                  onChange={(e) => setEditTipe(e.target.value as TipeCabang)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value={TipeCabang.HQ}>HQ (Headquarter)</option>
                  <option value={TipeCabang.CABANG}>Cabang</option>
                  <option value={TipeCabang.DEPOT}>Depot</option>
                </select>
                <TextArea
                  value={editAlamat}
                  onChange={(val) => setEditAlamat(val)}
                  placeholder="Alamat cabang"
                  className="text-sm h-16"
                  rows={2}
                />
                {editError && <span className="text-xs text-error-500">{editError}</span>}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={editLoading}>
                    {editLoading ? "..." : "Simpan"}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditId(null)}>
                    Batal
                  </Button>
                </div>
              </form>
            ) : (
              <div key={c.id} className="flex items-center justify-between gap-2 py-2 px-2 border border-gray-100 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{c.nama}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {c.tipe === TipeCabang.HQ ? "Headquarter" : c.tipe === TipeCabang.CABANG ? "Cabang" : "Depot"}
                    {c.alamat && ` • ${c.alamat}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="text-xs text-brand-500 hover:underline"
                  >
                    Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(c.id)}
                    className="text-xs text-error-500 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {cabang.length === 0 && !showForm && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">Belum ada cabang.</p>
      )}

      {/* Form tambah cabang baru */}
      {!showForm ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          + Tambah Cabang
        </Button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-2 p-3 border border-gray-300 rounded-lg dark:border-gray-600 bg-white dark:bg-gray-800">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Tambah Cabang Baru</p>
          <Input
            value={newNama}
            onChange={(e) => setNewNama(e.target.value)}
            placeholder="Nama cabang"
            className="text-sm h-8"
            required
          />
          <select
            value={newTipe}
            onChange={(e) => setNewTipe(e.target.value as TipeCabang)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
          >
            <option value={TipeCabang.CABANG}>Cabang</option>
            <option value={TipeCabang.DEPOT}>Depot</option>
          </select>
          <TextArea
            value={newAlamat}
            onChange={(val) => setNewAlamat(val)}
            placeholder="Alamat cabang (opsional)"
            className="text-sm h-16"
            rows={2}
          />
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

      {/* Confirm dialog hapus */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Hapus Cabang"
        message="Yakin ingin menghapus cabang ini? Cabang HQ tidak dapat dihapus selama perusahaan aktif."
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
    </div>
  );
};

export default CabangManager;
