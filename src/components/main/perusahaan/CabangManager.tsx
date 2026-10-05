"use client";
import React from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useCabangManager, CabangItem } from "./useCabangManager";
import { TipeCabang } from "@/lib/generated/prisma/enums";

interface CabangManagerProps {
  /** Perusahaan pemilik cabang */
  perusahaanId: string;
  /** Daftar cabang aktif */
  cabang: CabangItem[];
}

const labelTipe = (tipe: TipeCabang): string =>
  tipe === TipeCabang.HQ ? "Headquarter" : tipe === TipeCabang.CABANG ? "Cabang" : "Depot";

const CabangManager: React.FC<CabangManagerProps> = ({ perusahaanId, cabang }) => {
  const {
    showForm,
    setShowForm,
    editId,
    setEditId,
    editNama,
    setEditNama,
    editTipe,
    setEditTipe,
    editAlamat,
    setEditAlamat,
    editError,
    editLoading,
    newNama,
    setNewNama,
    newTipe,
    setNewTipe,
    newAlamat,
    setNewAlamat,
    addError,
    setAddError,
    addLoading,
    deleteLoading,
    alertType,
    alertTitle,
    alertMessage,
    isConfirmOpen,
    closeConfirm,
    isAlertOpen,
    closeAlert,
    startEdit,
    handleEdit,
    handleAdd,
    confirmDelete,
    handleDelete,
  } = useCabangManager(perusahaanId);

  return (
    <div className="space-y-2">
      {/* Daftar cabang */}
      {cabang.length > 0 && (
        <div className="space-y-2">
          {cabang.map((c) =>
            editId === c.id ? (
              <form
                key={c.id}
                onSubmit={handleEdit}
                className="space-y-2 p-3 border border-gray-200 rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800"
              >
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
              <div
                key={c.id}
                className="flex items-center justify-between gap-2 py-2 px-2 border border-gray-100 rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{c.nama}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {labelTipe(c.tipe)}
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
        <form
          onSubmit={handleAdd}
          className="space-y-2 p-3 border border-gray-300 rounded-lg dark:border-gray-600 bg-white dark:bg-gray-800"
        >
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
