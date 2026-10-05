"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { createPeserta, updatePeserta } from "@/lib/data/action/pesertaAction";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";

interface Cabang {
  id: string;
  nama: string;
  perusahaan: {
    id: string;
    nama: string;
  };
}

interface PesertaFormModalProps {
  editData?: {
    id: string;
    nama: string;
    cabang?: {
      id: string;
    } | null;
  } | null;
  cabangOptions: Cabang[];
  onClose: () => void;
}

const PesertaFormModal: React.FC<PesertaFormModalProps> = ({
  editData,
  cabangOptions,
  onClose,
}) => {
  const [nama, setNama] = useState(editData?.nama ?? "");
  const [cabangId, setCabangId] = useState(
    editData?.cabang?.id ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const {
    isOpen: isAlertOpen,
    openModal: openAlert,
    closeModal: closeAlert,
  } = useModal();

  const isEdit = Boolean(editData);

  const handleAlertClose = () => {
    closeAlert();
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
        ? await updatePeserta(editData!.id, {
            nama,
            perusahaanCabangId: cabangId || null,
          })
        : await createPeserta({
            nama,
            perusahaanCabangId: cabangId || null,
          });

      if (!result.success) {
        setError(result.error ?? "Terjadi kesalahan.");
        setAlertType("error");
        setAlertTitle("Gagal");
        setAlertMessage(result.error ?? "Terjadi kesalahan.");
        openAlert();
      } else {
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage(
          isEdit
            ? "Peserta berhasil diubah."
            : "Peserta berhasil ditambahkan."
        );
        openAlert();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-5">
        {isEdit ? "Ubah Peserta" : "Tambah Peserta"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-error-600 bg-error-50 rounded-lg dark:text-error-400 dark:bg-error-900/20">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="nama">
            Nama Peserta <span className="text-error-500">*</span>
          </Label>
          <Input
            id="nama"
            placeholder="Nama lengkap peserta"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="cabang">Perusahaan / Cabang</Label>
          <select
            id="cabang"
            value={cabangId}
            onChange={(e) => setCabangId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- Mandiri (Tanpa Perusahaan) --</option>
            {cabangOptions.map((cabang) => (
              <option key={cabang.id} value={cabang.id}>
                {cabang.perusahaan.nama} - {cabang.nama}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Kosongkan jika peserta mandiri
          </p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan"
                : "Tambah Peserta"}
          </Button>
        </div>
      </form>

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

export default PesertaFormModal;
