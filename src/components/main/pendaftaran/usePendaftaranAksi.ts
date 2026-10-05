"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePendaftaran } from "@/lib/data/action/pendaftaranPerusahaanAction";
import { removePesertaPendaftaran } from "@/lib/data/action/pesertaPelaksanaanAction";

export interface AksiAlert {
  type: "success" | "error";
  title: string;
  message: string;
}

/** State bersama aksi hapus pendaftaran dan peserta di halaman kerja pendaftaran. */
export function usePendaftaranAksi() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AksiAlert | null>(null);

  const sukses = (pesan: string) => {
    setAlert({ type: "success", title: "Berhasil", message: pesan });
    router.refresh();
  };

  const gagal = (pesan: string) => {
    setAlert({ type: "error", title: "Gagal", message: pesan });
  };

  const hapusPendaftaran = async (id: string) => {
    setLoading(true);
    const result = await deletePendaftaran(id);
    setLoading(false);

    if (!result.success) {
      gagal(result.error ?? "Gagal menghapus pendaftaran.");
      return false;
    }

    sukses("Pendaftaran perusahaan dihapus.");
    return true;
  };

  const hapusPeserta = async (id: string) => {
    setLoading(true);
    const result = await removePesertaPendaftaran(id);
    setLoading(false);

    if (!result.success) {
      gagal(result.error ?? "Gagal menghapus peserta.");
      return false;
    }

    sukses("Peserta dihapus dari pendaftaran.");
    return true;
  };

  return {
    loading,
    alert,
    closeAlert: () => setAlert(null),
    sukses,
    gagal,
    hapusPendaftaran,
    hapusPeserta,
  };
}
