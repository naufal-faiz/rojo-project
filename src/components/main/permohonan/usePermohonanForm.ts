"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchOption } from "@/components/main/common/SearchableSelect";
import useFlash from "@/components/main/common/useFlash";
import { getTrainingTingkatan } from "@/lib/data/action/searchOptionsAction";
import { createPelaksanaan, updatePelaksanaan } from "@/lib/data/action/pelaksanaanAction";
import { keTanggalInput } from "@/components/main/common/formatTanggal";
import { KELAS_UMUM } from "@/lib/tingkatan";
import {
  JenisKegiatan,
  JenisSertifikasi,
  Penyelenggara,
  TipePelaksanaan,
} from "@/lib/generated/prisma/enums";
import type { PermohonanUbahData } from "./permohonanTypes";

export interface TingkatanChoice {
  id: string;
  kelas: string;
}

export type PermohonanFormState = ReturnType<typeof usePermohonanForm>;

/** State dan aksi form buat/ubah permohonan, dipakai satu halaman penuh. */
export function usePermohonanForm(initial?: PermohonanUbahData) {
  const router = useRouter();
  const flash = useFlash();
  const { showError } = flash;
  const [noPermohonan, setNoPermohonan] = useState(initial?.noPermohonan ?? "");
  const [training, setTraining] = useState<SearchOption | null>(
    initial ? { id: initial.tingkatan.training.id, label: initial.tingkatan.training.nama } : null,
  );
  const [tingkatanId, setTingkatanId] = useState(
    initial && initial.tingkatan.kelas !== KELAS_UMUM ? initial.tingkatanId : "",
  );
  const [tingkatanOptions, setTingkatanOptions] = useState<TingkatanChoice[]>([]);
  const [tanpaTingkatan, setTanpaTingkatan] = useState(Boolean(initial && initial.tingkatan.kelas === KELAS_UMUM));
  const [memuatTingkatan, setMemuatTingkatan] = useState(false);
  const [jenisKegiatan, setJenisKegiatan] = useState<JenisKegiatan>(initial?.jenisKegiatan ?? JenisKegiatan.PUBLIK);
  const [tipePelaksanaan, setTipePelaksanaan] = useState<TipePelaksanaan>(
    initial?.tipePelaksanaan ?? TipePelaksanaan.OFFLINE,
  );
  const [lokasi, setLokasi] = useState(initial?.lokasi ?? "");
  const [penyelenggara, setPenyelenggara] = useState<Penyelenggara>(
    initial?.penyelenggara ?? Penyelenggara.WINA_KARYA_MULIA,
  );
  const [jenisSertifikasi, setJenisSertifikasi] = useState<JenisSertifikasi>(
    initial?.jenisSertifikasi ?? JenisSertifikasi.KEMNAKER,
  );
  const [catatan, setCatatan] = useState(initial?.catatan ?? "");
  const [sesi, setSesi] = useState<string[]>(initial?.sesi.map((item) => keTanggalInput(item.tanggal)) ?? []);
  const [busy, setBusy] = useState(false);

  // Muat tingkatan saat training berubah; kelas internal "Umum" disembunyikan (B-03).
  useEffect(() => {
    if (!training) return;
    let cancelled = false;
    getTrainingTingkatan(training.id)
      .then((rows) => {
        if (cancelled) return;
        const pilihan = rows.filter((row) => row.kelas !== KELAS_UMUM);
        setTingkatanOptions(pilihan);
        setTanpaTingkatan(pilihan.length === 0);
        setTingkatanId((current) =>
          current && pilihan.some((row) => row.id === current) ? current
            : pilihan.length === 1 ? pilihan[0].id : ""
        );
        setMemuatTingkatan(false);
      })
      .catch(() => {
        if (cancelled) return;
        setMemuatTingkatan(false);
        showError("Gagal memuat tingkatan training.");
      });
    return () => { cancelled = true; };
  }, [training, showError]);

  const pilihTraining = (value: SearchOption | SearchOption[] | null) => {
    const option = Array.isArray(value) ? value[0] ?? null : value;
    setTraining(option);
    setTingkatanId("");
    setTingkatanOptions([]);
    setTanpaTingkatan(false);
    setMemuatTingkatan(Boolean(option));
  };

  const simpan = async (tujuan: "detail" | "pendaftaran") => {
    if (busy) return;
    if (!training) { showError("Pilih training terlebih dahulu."); return; }
    if (!tanpaTingkatan && !tingkatanId) { showError("Pilih tingkatan pelatihan."); return; }
    setBusy(true);
    try {
      const payload = {
        noPermohonan: noPermohonan.trim() || null,
        trainingId: training.id,
        tingkatanId: tanpaTingkatan ? undefined : tingkatanId,
        jenisKegiatan,
        tipePelaksanaan,
        lokasi: lokasi.trim() || null,
        penyelenggara,
        jenisSertifikasi,
        catatan: catatan.trim() || null,
        sesi,
      };
      const result = initial
        ? await updatePelaksanaan(initial.id, payload)
        : await createPelaksanaan(payload);
      if (!result.success) { showError(result.error ?? "Gagal menyimpan permohonan."); return; }
      const id = result.data.id;
      if (tujuan === "pendaftaran") router.push(`/pendaftaran/${id}`);
      else router.push(`/permohonan/${id}?${initial ? "updated" : "created"}=1`);
    } catch {
      showError("Gagal menyimpan permohonan.");
    } finally {
      setBusy(false);
    }
  };

  return {
    flash, busy, simpan, pilihTraining,
    noPermohonan, setNoPermohonan,
    training, tingkatanId, setTingkatanId, tingkatanOptions, tanpaTingkatan, memuatTingkatan,
    jenisKegiatan, setJenisKegiatan, tipePelaksanaan, setTipePelaksanaan,
    lokasi, setLokasi, penyelenggara, setPenyelenggara,
    jenisSertifikasi, setJenisSertifikasi, catatan, setCatatan,
    sesi, setSesi,
  };
}
