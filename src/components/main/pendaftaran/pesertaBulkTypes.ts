/** Pilihan peserta hasil pencarian master. */
export interface PesertaOption {
  id: string;
  nama: string;
  perusahaan: string | null;
  terdaftar: boolean;
  pernahDihapus: boolean;
}

/** Hasil pratinjau tempel banyak nama. */
export interface PreviewTempel {
  cocok: Array<{
    id: string;
    nama: string;
    perusahaan: string | null;
    sudahTerdaftar: boolean;
  }>;
  baru: string[];
  ditolak: Array<{ nama: string; alasan: string }>;
}

/** Opsi cabang untuk form peserta baru. */
export interface CabangOption {
  id: string;
  nama: string;
  perusahaan: { id: string; nama: string };
}
