"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";
import { updatePendaftaranPic, getPicPerusahaan } from "@/lib/data/action/pendaftaranPerusahaanAction";

interface PicOption {
  id: string;
  nama: string;
  tipe: string;
}

interface PendaftaranPicModalProps {
  /** ID pendaftaran yang diubah */
  pendaftaranId: string;
  /** Perusahaan pemilik pendaftaran */
  perusahaanId: string;
  /** PIC saat ini, kosong berarti belum ditentukan */
  picId: string | null;
  /** Dipanggil saat modal ditutup */
  onClose: () => void;
}

const PendaftaranPicModal: React.FC<PendaftaranPicModalProps> = ({
  pendaftaranId,
  perusahaanId,
  picId,
  onClose,
}) => {
  const [options, setOptions] = useState<PicOption[]>([]);
  const [selected, setSelected] = useState(picId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isOpen: isAlertOpen, openModal: openAlert, closeModal: closeAlert } = useModal();
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  useEffect(() => {
    let aktif = true;
    getPicPerusahaan(perusahaanId).then((hasil) => {
      if (aktif) setOptions(hasil);
    });
    return () => {
      aktif = false;
    };
  }, [perusahaanId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await updatePendaftaranPic(pendaftaranId, selected || null);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Gagal mengubah PIC.");
      setAlertType("error");
      openAlert();
      return;
    }

    setAlertType("success");
    openAlert();
  };

  const handleAlertClose = () => {
    closeAlert();
    if (alertType === "success") {
      onClose();
    }
  };

  return (
    <div className="p-6 max-w-md w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-5">
        Ubah PIC Penerima Sertifikat
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-error-600 bg-error-50 rounded-lg dark:text-error-400 dark:bg-error-900/20">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="pic">PIC</Label>
          <select
            id="pic"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- Lepas PIC / Belum ditentukan --</option>
            {options.map((pic) => (
              <option key={pic.id} value={pic.id}>
                {pic.nama} ({pic.tipe})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Pilihan hanya PIC yang terhubung ke perusahaan ini.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan PIC"}
          </Button>
        </div>
      </form>

      <AlertModal
        isOpen={isAlertOpen}
        onClose={handleAlertClose}
        type={alertType}
        title={alertType === "success" ? "Berhasil" : "Gagal"}
        message={
          alertType === "success"
            ? "PIC pendaftaran berhasil diperbarui."
            : error ?? "Gagal mengubah PIC."
        }
        okLabel="OK"
      />
    </div>
  );
};

export default PendaftaranPicModal;
