"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import DatePickerInput from "@/components/main/common/DatePickerInput";
import { createSesi, deleteSesi } from "@/lib/data/action/pelaksanaanAction";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";
import { CloseLineIcon } from "@/icons/index";

interface Sesi {
  id: string;
  tanggal: Date;
}

interface SesiManagerProps {
  pelaksanaanId: string;
  sesiList: Sesi[];
}

const SesiManager: React.FC<SesiManagerProps> = ({ pelaksanaanId, sesiList }) => {
  const [tanggal, setTanggal] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isOpen: isConfirmOpen, openModal: openConfirm, closeModal: closeConfirm } = useModal();
  const { isOpen: isAlertOpen, openModal: openAlert, closeModal: closeAlert } = useModal();
  const [alertMessage, setAlertMessage] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal) return;
    setLoading(true);
    setError(null);
    try {
      const result = await createSesi(pelaksanaanId, new Date(tanggal));
      if (!result.success) {
        setError(result.error ?? "Gagal menambah sesi.");
      } else {
        setTanggal("");
      }
    } finally {
      setLoading(false);
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
      const result = await deleteSesi(deleteId);
      if (!result.success) {
        closeConfirm();
        setAlertMessage(result.error ?? "Gagal menghapus sesi.");
        openAlert();
      } else {
        closeConfirm();
        setDeleteId(null);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Jadwal Sesi (Tanggal Pelaksanaan)</h3>
      
      {sesiList.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">Belum ada sesi tanggal.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sesiList.map((sesi) => (
            <div
              key={sesi.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm"
            >
              <span>{new Date(sesi.tanggal).toLocaleDateString("id-ID", { dateStyle: "full" })}</span>
              <button
                type="button"
                onClick={() => confirmDelete(sesi.id)}
                className="text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300 ml-1"
                aria-label="Hapus sesi"
              >
                <CloseLineIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2 items-end pt-2">
        <div className="flex-1">
          <DatePickerInput
            value={tanggal}
            onChange={setTanggal}
            placeholder="Pilih tanggal pelaksanaan"
          />
        </div>
        <Button type="submit" size="sm" disabled={loading || !tanggal}>
          {loading ? "..." : "+ Tambah Hari Sesi"}
        </Button>
      </form>
      {error && <p className="text-xs text-error-500">{error}</p>}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Hapus Sesi"
        message="Yakin ingin menghapus sesi tanggal ini?"
        confirmLabel="Ya, Hapus"
        variant="danger"
        isLoading={deleteLoading}
      />

      <AlertModal
        isOpen={isAlertOpen}
        onClose={closeAlert}
        type="error"
        title="Gagal"
        message={alertMessage}
        okLabel="OK"
      />
    </div>
  );
};

export default SesiManager;
