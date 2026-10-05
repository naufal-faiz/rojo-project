"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import DatePickerInput from "@/components/main/common/DatePickerInput";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";
import { keTanggalInput } from "@/components/main/common/formatTanggal";
import { statusPesertaLabels } from "@/components/main/common/StatusBadge";
import { updateSertifikat } from "@/lib/data/action/sertifikatAction";
import { JenisSertifikasi, StatusPeserta } from "@/lib/generated/prisma/enums";
import { SertifikatRow } from "./SertifikatColumns";

interface SertifikatFormModalProps {
  /** Baris peserta pendaftaran yang diubah */
  data: SertifikatRow;
  /** Dipanggil saat modal ditutup */
  onClose: () => void;
}

const SertifikatFormModal: React.FC<SertifikatFormModalProps> = ({ data, onClose }) => {
  const jenisSertifikasi = data.pelaksanaan.jenisSertifikasi;
  const internal = jenisSertifikasi === JenisSertifikasi.INTERNAL;
  const kemnaker = jenisSertifikasi === JenisSertifikasi.KEMNAKER;

  const [status, setStatus] = useState<StatusPeserta | "">(data.status ?? "");
  const [noRegistrasi, setNoRegistrasi] = useState(data.noRegistrasi ?? "");
  const [noSertifikat, setNoSertifikat] = useState(data.noSertifikat ?? "");
  const [masaBerlaku, setMasaBerlaku] = useState(keTanggalInput(data.masaBerlaku));
  const [noSkp, setNoSkp] = useState(data.noSkp ?? "");
  const [tanggalTerima, setTanggalTerima] = useState(
    keTanggalInput(data.tanggalTerimaSertifikat)
  );
  const [catatan, setCatatan] = useState(data.catatan ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const { isOpen: isAlertOpen, openModal: openAlert, closeModal: closeAlert } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await updateSertifikat(data.id, {
      status: status ? (status as StatusPeserta) : null,
      noRegistrasi,
      noSertifikat,
      masaBerlaku,
      noSkp,
      tanggalTerimaSertifikat: tanggalTerima,
      catatan,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Gagal menyimpan sertifikat.");
      setAlertType("error");
      setAlertTitle("Gagal");
      setAlertMessage(result.error ?? "Gagal menyimpan sertifikat.");
      openAlert();
      return;
    }

    setAlertType("success");
    setAlertTitle("Berhasil");
    setAlertMessage(
      result.peringatan
        ? `Data sertifikat disimpan. Peringatan: ${result.peringatan}`
        : "Data sertifikat disimpan."
    );
    openAlert();
  };

  const handleAlertClose = () => {
    closeAlert();
    if (alertType === "success") {
      onClose();
    }
  };

  return (
    <div className="p-6 max-h-[85vh] overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
        Ubah Sertifikat / Hasil
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
        {data.peserta.nama} — {data.pelaksanaan.tingkatan.training.nama} ({jenisSertifikasi})
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-error-600 bg-error-50 rounded-lg dark:text-error-400 dark:bg-error-900/20">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="statusHasil">Status Hasil</Label>
          <select
            id="statusHasil"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusPeserta | "")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">-- Belum ada hasil --</option>
            {Object.values(StatusPeserta).map((nilai) => (
              <option key={nilai} value={nilai}>
                {statusPesertaLabels[nilai]}
              </option>
            ))}
          </select>
        </div>

        {!internal && (
          <>
            <div>
              <Label htmlFor="noRegistrasi">No. Registrasi</Label>
              <Input
                id="noRegistrasi"
                value={noRegistrasi}
                onChange={(e) => setNoRegistrasi(e.target.value)}
                placeholder="Boleh diisi sebelum hasil keluar"
              />
            </div>

            <div>
              <Label htmlFor="noSertifikat">No. Sertifikat</Label>
              <Input
                id="noSertifikat"
                value={noSertifikat}
                onChange={(e) => setNoSertifikat(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="masaBerlaku">Masa Berlaku</Label>
              <DatePickerInput
                value={masaBerlaku}
                onChange={setMasaBerlaku}
                placeholder="Pilih tanggal masa berlaku"
              />
            </div>

            {kemnaker && (
              <div>
                <Label htmlFor="noSkp">No. SKP (Khusus KEMNAKER)</Label>
                <Input id="noSkp" value={noSkp} onChange={(e) => setNoSkp(e.target.value)} />
              </div>
            )}
          </>
        )}

        <div>
          <Label htmlFor="tanggalTerima">Tanggal Terima Sertifikat</Label>
          <DatePickerInput
            value={tanggalTerima}
            onChange={setTanggalTerima}
            placeholder="Pilih tanggal terima"
          />
        </div>

        <div>
          <Label htmlFor="catatan">Catatan</Label>
          <TextArea
            value={catatan}
            onChange={setCatatan}
            placeholder="Catatan tambahan (opsional)"
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
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

export default SertifikatFormModal;
