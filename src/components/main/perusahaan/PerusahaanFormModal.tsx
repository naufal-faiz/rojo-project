"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { createPerusahaan, updatePerusahaan, checkDuplicatePerusahaan } from "@/lib/data/action/perusahaanAction";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";

interface PerusahaanFormModalProps {
  editData?: { id: string; nama: string; alamatLegal?: string | null } | null;
  onClose: () => void;
}

const PerusahaanFormModal: React.FC<PerusahaanFormModalProps> = ({ editData, onClose }) => {
  const [nama, setNama] = useState(editData?.nama ?? "");
  const [alamatLegal, setAlamatLegal] = useState(editData?.alamatLegal ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const { isOpen: isAlertOpen, openModal: openAlert, closeModal: closeAlert } = useModal();

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
      // Jika mode tambah, cek duplikat nama
      if (!isEdit) {
        const dupCheck = await checkDuplicatePerusahaan(nama);
        if (dupCheck.exists) {
          setError(`Perusahaan dengan nama "${dupCheck.existingName}" sudah ada.`);
          setAlertType("warning");
          setAlertTitle("Nama Mirip");
          setAlertMessage(`Perhatian: Perusahaan dengan nama "${dupCheck.existingName}" sudah terdaftar. Yakin ingin membuat perusahaan baru?`);
          openAlert();
          setLoading(false);
          return;
        }
      }

      const result = isEdit
        ? await updatePerusahaan(editData!.id, { nama, alamatLegal })
        : await createPerusahaan({ nama, alamatLegal });

      if (!result.success) {
        setError(result.error ?? "Terjadi kesalahan.");
        setAlertType("error");
        setAlertTitle("Gagal");
        setAlertMessage(result.error ?? "Terjadi kesalahan.");
        openAlert();
      } else {
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage(isEdit ? "Perusahaan berhasil diubah." : "Perusahaan berhasil ditambahkan.");
        openAlert();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-5">
        {isEdit ? "Ubah Perusahaan" : "Tambah Perusahaan"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-error-600 bg-error-50 rounded-lg dark:text-error-400 dark:bg-error-900/20">
            {error}
          </div>
        )}
        <div>
          <Label htmlFor="nama">
            Nama Perusahaan <span className="text-error-500">*</span>
          </Label>
          <Input
            id="nama"
            placeholder="PT Contoh Perusahaan"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="alamat">Alamat Resmi</Label>
          <TextArea
            placeholder="Jl. Raya No. 123, Jakarta"
            value={alamatLegal}
            onChange={(val) => setAlamatLegal(val)}
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Perusahaan"}
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

export default PerusahaanFormModal;
