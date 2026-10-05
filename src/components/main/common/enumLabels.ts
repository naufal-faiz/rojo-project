import {
  JenisKegiatan,
  JenisSertifikasi,
  Penyelenggara,
  TipePelaksanaan,
} from "@/lib/generated/prisma/enums";

/** Label Bahasa Indonesia untuk enum JenisKegiatan. */
export const jenisKegiatanLabels: Record<JenisKegiatan, string> = {
  [JenisKegiatan.PUBLIK]: "PUBLIK (Multi Perusahaan)",
  [JenisKegiatan.INHOUSE]: "INHOUSE (Satu Perusahaan)",
};

/** Label Bahasa Indonesia untuk enum TipePelaksanaan. */
export const tipePelaksanaanLabels: Record<TipePelaksanaan, string> = {
  [TipePelaksanaan.ONLINE]: "Online",
  [TipePelaksanaan.OFFLINE]: "Offline",
  [TipePelaksanaan.BLENDED]: "Blended",
};

/** Label Bahasa Indonesia untuk enum JenisSertifikasi. */
export const jenisSertifikasiLabels: Record<JenisSertifikasi, string> = {
  [JenisSertifikasi.KEMNAKER]: "KEMNAKER",
  [JenisSertifikasi.BNSP]: "BNSP",
  [JenisSertifikasi.INTERNAL]: "INTERNAL (Non-resmi)",
};

/** Label singkat penyelenggara untuk kolom tabel dan filter. */
export const penyelenggaraLabels: Record<Penyelenggara, string> = {
  [Penyelenggara.WINA_KARYA_MULIA]: "Wina Karya Mulia",
  [Penyelenggara.DELTA_INDONESIA]: "Delta Indonesia",
  [Penyelenggara.LIMA_PRIMA_SOLUSINDO]: "Lima Prima (LPS)",
  [Penyelenggara.ARTA_KARYA_AREFAA]: "Arta Karya Arefaa",
  [Penyelenggara.LIK]: "LIK",
  [Penyelenggara.ITC]: "ITC",
};
