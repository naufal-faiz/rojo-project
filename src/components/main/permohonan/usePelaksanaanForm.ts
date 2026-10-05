"use client";
import { useState } from "react";
import { useModal } from "@/hooks/useModal";
import { createPelaksanaan, updatePelaksanaan } from "@/lib/data/action/pelaksanaanAction";
import {
  JenisKegiatan,
  JenisSertifikasi,
  Penyelenggara,
  StatusTemanK3,
  TipePelaksanaan,
} from "@/lib/generated/prisma/enums";

export interface Tingkatan {
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

/** State dan submit form tambah/ubah permohonan. */
export function usePelaksanaanForm(
  editData: PelaksanaanFormData | null | undefined,
  onClose: () => void
) {
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
  const [status, setStatus] = useState<StatusTemanK3 | "">(editData?.status ?? "");
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

  return {
    noPermohonan,
    setNoPermohonan,
    tingkatanId,
    setTingkatanId,
    jenisKegiatan,
    setJenisKegiatan,
    tipePelaksanaan,
    setTipePelaksanaan,
    lokasi,
    setLokasi,
    penyelenggara,
    setPenyelenggara,
    jenisSertifikasi,
    setJenisSertifikasi,
    status,
    setStatus,
    catatan,
    setCatatan,
    loading,
    error,
    isAlertOpen,
    closeAlert,
    isEdit,
    handleSubmit,
  };
}
