"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { createPelaksanaan, updatePelaksanaan } from "@/lib/data/action/pelaksanaanAction";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";
import {
  JenisKegiatan,
  TipePelaksanaan,
  Penyelenggara,
  JenisSertifikasi,
  StatusTemanK3,
} from "@/lib/generated/prisma/enums";
import { statusTemanK3Labels } from "@/components/main/common/StatusBadge";

interface Tingkatan {
  id: string;
  kelas: string;
  training: {
    id: string;
    nama: string;
  };
}

export interface PelaksanaanFormData {
  id?: string;
  noPermohonan?: string | null;
  tingkatanId: string;
  jenisKegiatan: JenisKegiatan;
  tipePelaksanaan: TipePelaksanaan;
  lokasi?: string | null;
  penyelenggara: Penyelenggara;
  jenisSertifikasi: JenisSertifikasi;
  status?: StatusTemanK3 | null;
  catatan?: string | null;
}

interface PelaksanaanFormModalProps {
  editData?: PelaksanaanFormData | null;
  tingkatanOptions: Tingkatan[];
  onClose: () => void;
}

const penyelenggaraLabels: Record<Penyelenggara, string> = {
  [Penyelenggara.WINA_KARYA_MULIA]: "PT Wina Karya Mulia (Rojo Safety)",
  [Penyelenggara.DELTA_INDONESIA]: "Delta Indonesia",
  [Penyelenggara.LIMA_PRIMA_SOLUSINDO]: "PT Lima Prima Solusindo (LPS)",
  [Penyelenggara.ARTA_KARYA_AREFAA]: "Arta Karya Arefaa",
  [Penyelenggara.LIK]: "LIK",
  [Penyelenggara.ITC]: "ITC",
};

const PelaksanaanFormModal: React.FC<PelaksanaanFormModalProps> = ({
  editData,
  tingkatanOptions,
  onClose,
}) => {
  const [noPermohonan, setNoPermohonan] = useState(editData?.noPermohonan ?? "");
  const [tingkatanId, setTingkatanId] = useState(editData?.tingkatanId ?? "");
  const [jenisKegiatan, setJenisKegiatan] = useState<JenisKegiatan>(
    editData?.jenisKegiatan ?? JenisKegiatan.PUBLIK
  );
  const [tipePelaksanaan, setTipePelaksanaan] = useState<TipePelaksanaan>(
    editData?.tipePelaksanaan ?? TipePelaksanaan.OFFLINE
  );
  const [lokasi, setLokasi] = useState(editData?.lokasi ?? "");
  const [penyelenggara, setPenyelenggara] = useState<Penyelenggara>(
    editData?.penyelenggara ?? Penyelenggara.WINA_KARYA_MULIA
  );
  const [jenisSertifikasi, setJenisSertifikasi] = useState<JenisSertifikasi>(
    editData?.jenisSertifikasi ?? JenisSertifikasi.KEMNAKER
  );
  const [status, setStatus] = useState<StatusTemanK3 | "">(
    editData?.status ?? ""
  );
  const [catatan, setCatatan] = useState(editData?.catatan ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOpen: isAlertOpen, openModal: openAlert, closeModal: closeAlert } = useModal();

  const isEdit = Boolean(editData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tingkatanId) {
      setError("Pelatihan / Tingkatan wajib dipilih.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      noPermohonan: noPermohonan.trim() || null,
      tingkatanId,
      jenisKegiatan,
      tipePelaksanaan,
      lokasi: lokasi.trim() || null,
      penyelenggara,
      jenisSertifikasi,
      status:
        status && jenisSertifikasi === JenisSertifikasi.KEMNAKER
          ? (status as StatusTemanK3)
          : null,
      catatan: catatan.trim() || null,
    };

    try {
      const result = isEdit
        ? await updatePelaksanaan(editData!.id!, payload)
        : await createPelaksanaan(payload);

      if (!result.success) {
        setError(result.error ?? "Terjadi kesalahan.");
        openAlert();
      } else {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-h-[85vh] overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-5">
        {isEdit ? "Ubah Permohonan" : "Buat Permohonan Baru"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-error-600 bg-error-50 rounded-lg dark:bg-error-900/20 dark:text-error-400">
            {error}
          </div>
        )}

        <div>
          <Label htmlFor="noPermohonan">No. Permohonan</Label>
          <Input
            id="noPermohonan"
            value={noPermohonan}
            onChange={(e) => setNoPermohonan(e.target.value)}
            placeholder="Contoh: 250312073918 (kosongkan jika belum ada / mitra)"
          />
        </div>

        <div>
          <Label htmlFor="tingkatan">
            Pelatihan / Tingkatan <span className="text-error-500">*</span>
          </Label>
          <select
            id="tingkatan"
            value={tingkatanId}
            onChange={(e) => setTingkatanId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="">-- Pilih Pelatihan --</option>
            {tingkatanOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.training.nama} - {t.kelas}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jenisKegiatan">Jenis Kegiatan</Label>
            <select
              id="jenisKegiatan"
              value={jenisKegiatan}
              onChange={(e) => setJenisKegiatan(e.target.value as JenisKegiatan)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value={JenisKegiatan.PUBLIK}>PUBLIK (Multi Perusahaan)</option>
              <option value={JenisKegiatan.INHOUSE}>INHOUSE (1 Perusahaan)</option>
            </select>
          </div>

          <div>
            <Label htmlFor="tipePelaksanaan">Tipe Pelaksanaan</Label>
            <select
              id="tipePelaksanaan"
              value={tipePelaksanaan}
              onChange={(e) => setTipePelaksanaan(e.target.value as TipePelaksanaan)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value={TipePelaksanaan.OFFLINE}>Offline</option>
              <option value={TipePelaksanaan.ONLINE}>Online</option>
              <option value={TipePelaksanaan.BLENDED}>Blended</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="penyelenggara">Penyelenggara</Label>
            <select
              id="penyelenggara"
              value={penyelenggara}
              onChange={(e) => setPenyelenggara(e.target.value as Penyelenggara)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              {Object.values(Penyelenggara).map((p) => (
                <option key={p} value={p}>
                  {penyelenggaraLabels[p]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="jenisSertifikasi">Jenis Sertifikasi</Label>
            <select
              id="jenisSertifikasi"
              value={jenisSertifikasi}
              onChange={(e) => setJenisSertifikasi(e.target.value as JenisSertifikasi)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value={JenisSertifikasi.KEMNAKER}>KEMNAKER</option>
              <option value={JenisSertifikasi.BNSP}>BNSP</option>
              <option value={JenisSertifikasi.INTERNAL}>INTERNAL (Non-resmi)</option>
            </select>
          </div>
        </div>

        {jenisSertifikasi === JenisSertifikasi.KEMNAKER && (
          <div>
            <Label htmlFor="status">Status TemanK3 (Khusus Kemnaker)</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusTemanK3 | "")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">-- Belum Diproses --</option>
              {Object.values(StatusTemanK3).map((s) => (
                <option key={s} value={s}>
                  {statusTemanK3Labels[s]}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <Label htmlFor="lokasi">Lokasi Pelaksanaan</Label>
          <Input
            id="lokasi"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            placeholder="Contoh: Hotel Santika Bekasi / Headquarter Rojo"
          />
        </div>

        <div>
          <Label htmlFor="catatan">Catatan</Label>
          <TextArea
            value={catatan}
            onChange={(val) => setCatatan(val)}
            placeholder="Catatan tambahan (opsional)"
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Permohonan"}
          </Button>
        </div>
      </form>

      <AlertModal
        isOpen={isAlertOpen}
        onClose={closeAlert}
        type="error"
        title="Gagal"
        message={error ?? ""}
        okLabel="OK"
      />
    </div>
  );
};

export default PelaksanaanFormModal;
