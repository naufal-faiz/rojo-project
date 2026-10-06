"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import AlertModal from "@/components/main/Modal/AlertModal";
import PesertaFormModal from "@/components/main/peserta/PesertaFormModal";
import { useModal } from "@/hooks/useModal";
import {
  addPesertaPendaftaran,
  addPesertaTempel,
  previewTempelPeserta,
} from "@/lib/data/action/pesertaPelaksanaanAction";
import PesertaPilihTab from "./PesertaPilihTab";
import PesertaTempelTab from "./PesertaTempelTab";
import { CabangOption, PesertaOption, PreviewTempel } from "./pesertaBulkTypes";

type Tab = "pilih" | "baru" | "tempel";

interface PesertaBulkModalProps {
  /** Permohonan yang sedang dikelola */
  pelaksanaanId: string;
  /** Pendaftaran perusahaan tujuan, null = peserta mandiri */
  pendaftaranPerusahaanId: string | null;
  /** Nama perusahaan pendaftaran untuk catatan peringatan */
  perusahaanNama?: string | null;
  /** Opsi cabang untuk form peserta baru */
  cabangOptions: CabangOption[];
  /** Dipanggil saat modal ditutup */
  onClose: () => void;
}

const PesertaBulkModal: React.FC<PesertaBulkModalProps> = ({
  pelaksanaanId,
  pendaftaranPerusahaanId,
  perusahaanNama,
  cabangOptions,
  onClose,
}) => {
  const [tab, setTab] = useState<Tab>("pilih");
  const [selected, setSelected] = useState<PesertaOption[]>([]);
  const [pastedText, setPastedText] = useState("");
  const [preview, setPreview] = useState<PreviewTempel | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertMessage, setAlertMessage] = useState("");
  const { isOpen: isAlertOpen, openModal: openAlert, closeModal: closeAlert } = useModal();

  const totalTempel = preview
    ? preview.cocok.filter((item) => !item.sudahTerdaftar).length + preview.baru.length
    : 0;

  const handleToggle = (peserta: PesertaOption) => {
    setSelected((prev) =>
      prev.some((item) => item.id === peserta.id)
        ? prev.filter((item) => item.id !== peserta.id)
        : [...prev, peserta]
    );
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    const hasil = await previewTempelPeserta(pelaksanaanId, pastedText.split("\n"), pendaftaranPerusahaanId);
    setPreview(hasil);
    setPreviewLoading(false);
  };

  const tampilkanHasil = (sukses: boolean, pesan: string) => {
    setAlertType(sukses ? "success" : "error");
    setAlertMessage(pesan);
    openAlert();
  };

  const handleSimpan = async () => {
    setSubmitLoading(true);

    if (tab === "pilih") {
      const hasil = await addPesertaPendaftaran({
        pelaksanaanId,
        pendaftaranPerusahaanId,
        pesertaIds: selected.map((item) => item.id),
      });
      setSubmitLoading(false);

      if (!hasil.success) {
        tampilkanHasil(false, hasil.error ?? "Gagal menambah peserta.");
        return;
      }

      const catatan = hasil.peringatan?.length
        ? ` Peringatan: perusahaan peserta berbeda dengan pendaftaran (${hasil.peringatan.join(", ")}).`
        : "";
      tampilkanHasil(true, `${hasil.dibuat + hasil.direstore} peserta ditambahkan.${catatan}`);
      return;
    }

    if (!preview) {
      setSubmitLoading(false);
      return;
    }

    const hasil = await addPesertaTempel({
      pelaksanaanId,
      pendaftaranPerusahaanId,
      pesertaIds: preview.cocok.filter((item) => !item.sudahTerdaftar).map((item) => item.id),
      namaBaru: preview.baru,
    });
    setSubmitLoading(false);

    if (!hasil.success) {
      tampilkanHasil(false, hasil.error ?? "Gagal menyimpan peserta.");
      return;
    }

    tampilkanHasil(
      true,
      `${hasil.dibuat + hasil.direstore} peserta ditambahkan (${hasil.pesertaBaru} peserta baru dibuat).`
    );
  };

  // Peserta baru cepat: buat peserta lalu langsung daftarkan ke pelaksanaan ini.
  const handleCreated = async (peserta: { id: string; nama: string }) => {
    const hasil = await addPesertaPendaftaran({
      pelaksanaanId,
      pendaftaranPerusahaanId,
      pesertaIds: [peserta.id],
    });

    if (!hasil.success) {
      tampilkanHasil(false, hasil.error ?? "Gagal mendaftarkan peserta baru.");
      return;
    }

    setAlertType("success");
    setAlertMessage(`${peserta.nama} ditambahkan.`);
    openAlert();
  };

  const handleAlertClose = () => {
    closeAlert();
    if (alertType === "success") {
      onClose();
    }
  };

  return (
    <div className="p-6 max-w-xl w-full">
      {tab !== "baru" && (
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
          Tambah Peserta
        </h2>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Tujuan: {pendaftaranPerusahaanId ? perusahaanNama ?? "Pendaftaran perusahaan" : "Peserta Mandiri"}
      </p>

      <div className="flex gap-2 mb-4">
        {(
          [
            ["pilih", "Pilih dari Master"],
            ["baru", "Peserta Baru"],
            ["tempel", "Tempel Nama"],
          ] as Array<[Tab, string]>
        ).map(([nilai, label]) => (
          <button
            key={nilai}
            type="button"
            onClick={() => setTab(nilai)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === nilai
                ? "bg-brand-500 text-white dark:bg-brand-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "pilih" && (
        <PesertaPilihTab pendaftaranPerusahaanId={pendaftaranPerusahaanId} pelaksanaanId={pelaksanaanId} selectedIds={selected.map((item) => item.id)} onToggle={handleToggle} />
      )}

      {tab === "tempel" && (
        <PesertaTempelTab
          text={pastedText}
          onTextChange={(value) => {
            setPastedText(value);
            setPreview(null);
          }}
          preview={preview}
          onPreview={handlePreview}
          loading={previewLoading}
        />
      )}

      {tab === "baru" && (
        <PesertaFormModal cabangOptions={cabangOptions} onCreated={handleCreated} onClose={onClose} />
      )}

      {tab !== "baru" && (
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitLoading}>
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSimpan}
            disabled={submitLoading || (tab === "pilih" ? selected.length === 0 : totalTempel === 0)}
          >
            {submitLoading
              ? "Menyimpan..."
              : tab === "pilih"
                ? `Tambah ${selected.length} Peserta`
                : `Simpan ${totalTempel} Peserta`}
          </Button>
        </div>
      )}

      <AlertModal
        isOpen={isAlertOpen}
        onClose={handleAlertClose}
        type={alertType}
        title={alertType === "success" ? "Berhasil" : "Gagal"}
        message={alertMessage}
        okLabel="OK"
      />
    </div>
  );
};

export default PesertaBulkModal;
