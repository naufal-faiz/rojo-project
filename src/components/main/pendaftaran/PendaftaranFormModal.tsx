"use client";
import React, { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";
import {
  createPendaftaran,
  searchPerusahaanPendaftaran,
  getPicPerusahaan,
} from "@/lib/data/action/pendaftaranPerusahaanAction";

interface PerusahaanOption {
  id: string;
  nama: string;
}

interface PicOption {
  id: string;
  nama: string;
  tipe: string;
}

interface PendaftaranFormModalProps {
  /** Permohonan tujuan pendaftaran */
  pelaksanaanId: string;
  /** Dipanggil saat modal ditutup */
  onClose: () => void;
}

const PendaftaranFormModal: React.FC<PendaftaranFormModalProps> = ({
  pelaksanaanId,
  onClose,
}) => {
  const [keyword, setKeyword] = useState("");
  const [options, setOptions] = useState<PerusahaanOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<PerusahaanOption | null>(null);
  const [picOptions, setPicOptions] = useState<PicOption[]>([]);
  const [picId, setPicId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isOpen: isAlertOpen, openModal: openAlert, closeModal: closeAlert } = useModal();
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (selected) return;

    let aktif = true;
    const timer = setTimeout(async () => {
      if (!aktif) return;
      setSearching(true);
      const hasil = await searchPerusahaanPendaftaran(keyword);
      if (!aktif) return;
      setOptions(hasil);
      setSearching(false);
    }, 300);

    return () => {
      aktif = false;
      clearTimeout(timer);
    };
  }, [keyword, selected]);

  const handleSelect = async (perusahaan: PerusahaanOption) => {
    setSelected(perusahaan);
    setPicId("");
    const pics = await getPicPerusahaan(perusahaan.id);
    setPicOptions(pics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      setError("Pilih perusahaan terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createPendaftaran({
      pelaksanaanId,
      perusahaanId: selected.id,
      picId: picId || null,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Gagal menambah pendaftaran.");
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
    <div className="p-6 max-w-lg w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-5">
        Tambah Pendaftaran Perusahaan
      </h2>

      {error && (
        <div className="mb-4 p-3 text-sm text-error-600 bg-error-50 rounded-lg dark:text-error-400 dark:bg-error-900/20">
          {error}
        </div>
      )}

      {selected ? (
        <div className="mb-4 flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selected.nama}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Perusahaan dipilih</p>
          </div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-xs text-brand-500 hover:underline"
          >
            Ganti
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <Label htmlFor="cariPerusahaan">Cari Perusahaan</Label>
          <Input
            id="cariPerusahaan"
            placeholder="Ketik nama perusahaan..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-800">
            {searching ? (
              <p className="p-3 text-xs text-gray-500 dark:text-gray-400">Mencari...</p>
            ) : options.length === 0 ? (
              <p className="p-3 text-xs text-gray-500 dark:text-gray-400">Tidak ada perusahaan.</p>
            ) : (
              options.map((perusahaan) => (
                <button
                  key={perusahaan.id}
                  type="button"
                  onClick={() => handleSelect(perusahaan)}
                  className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  {perusahaan.nama}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {selected && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pic">PIC Penerima Sertifikat (opsional)</Label>
            <select
              id="pic"
              value={picId}
              onChange={(e) => setPicId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">-- Belum ditentukan --</option>
              {picOptions.map((pic) => (
                <option key={pic.id} value={pic.id}>
                  {pic.nama} ({pic.tipe})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Menyimpan..." : "Tambah Pendaftaran"}
            </Button>
          </div>
        </form>
      )}

      <AlertModal
        isOpen={isAlertOpen}
        onClose={handleAlertClose}
        type={alertType}
        title={alertType === "success" ? "Berhasil" : "Gagal"}
        message={
          alertType === "success"
            ? "Pendaftaran perusahaan berhasil disimpan."
            : error ?? "Gagal menambah pendaftaran."
        }
        okLabel="OK"
      />
    </div>
  );
};

export default PendaftaranFormModal;
