"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { createTraining, updateTraining } from "@/lib/data/action/trainingAction";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";

interface TrainingFormModalProps {
  /** Jika diisi, mode edit; jika kosong, mode tambah */
  editData?: { id: string; nama: string } | null;
  onClose: () => void;
}

const TrainingFormModal: React.FC<TrainingFormModalProps> = ({ editData, onClose }) => {
  const [nama, setNama] = useState(editData?.nama ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const { isOpen: isAlertOpen, openModal: openAlert, closeModal: closeAlert } = useModal();

  const isEdit = Boolean(editData);

  const handleAlertClose = () => {
    closeAlert();
    // Jika alert sukses, tutup modal form
    if (alertType === "success") {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = isEdit
        ? await updateTraining(editData!.id, nama)
        : await createTraining(nama);
      if (!result.success) {
        setError(result.error ?? "Terjadi kesalahan.");
        setAlertType("error");
        setAlertTitle("Gagal");
        setAlertMessage(result.error ?? "Terjadi kesalahan.");
        openAlert();
      } else {
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage(isEdit ? "Training berhasil diubah." : "Training berhasil ditambahkan.");
        openAlert();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-5">
        {isEdit ? "Ubah Training" : "Tambah Training"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-error-600 bg-error-50 rounded-lg dark:text-error-400 dark:bg-error-900/20">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="training-nama">
            Nama Training <span className="text-error-500">*</span>
          </Label>
          <Input
            id="training-nama"
            placeholder="Contoh: Operator Forklift"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Training"}
          </Button>
        </div>
      </form>

      {/* Alert untuk keberhasilan/kegagalan */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={handleAlertClose}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        okLabel="OK"
      />
    </div>
  );
};

export default TrainingFormModal;
