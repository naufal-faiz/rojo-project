"use client";
import React, { useState } from "react";
import ComponentCard from "@/components/main/common/ComponentCard";
import AlertModal from "@/components/main/Modal/AlertModal";
import { restorePendaftaran } from "@/lib/data/action/pendaftaranPerusahaanAction";
import { restorePesertaPendaftaran } from "@/lib/data/action/pesertaPelaksanaanAction";

interface DeletedPendaftaranItem {
  id: string;
  perusahaan: { nama: string };
  pic: { nama: string } | null;
}

interface DeletedPesertaItem {
  id: string;
  peserta: { nama: string };
  pendaftaranPerusahaan: { perusahaan: { nama: string } } | null;
}

export type { DeletedPendaftaranItem, DeletedPesertaItem };

interface PendaftaranTerhapusPanelProps {
  /** Pendaftaran perusahaan yang sudah dihapus */
  deletedPendaftaran: DeletedPendaftaranItem[];
  /** Peserta pendaftaran yang sudah dihapus */
  deletedPeserta: DeletedPesertaItem[];
}

const PendaftaranTerhapusPanel: React.FC<PendaftaranTerhapusPanelProps> = ({
  deletedPendaftaran,
  deletedPeserta,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  const handleRestore = async (id: string, tipe: "pendaftaran" | "peserta") => {
    setLoadingId(id);
    const result =
      tipe === "pendaftaran"
        ? await restorePendaftaran(id)
        : await restorePesertaPendaftaran(id);
    setLoadingId(null);

    if (!result.success) {
      setAlert({ type: "error", title: "Gagal", message: result.error ?? "Gagal merestore data." });
      return;
    }

    setAlert({
      type: "success",
      title: "Berhasil",
      message: tipe === "pendaftaran" ? "Pendaftaran direstore." : "Peserta dikembalikan ke pendaftaran.",
    });
  };

  return (
    <ComponentCard
      title="Terhapus"
      desc="Data yang dihapus bisa dikembalikan selama parent-nya masih aktif."
    >
      <div>
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Pendaftaran Perusahaan ({deletedPendaftaran.length})
        </p>
        {deletedPendaftaran.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">Tidak ada.</p>
        ) : (
          <ul className="space-y-2">
            {deletedPendaftaran.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2 last:border-0 dark:border-white/[0.05]"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.perusahaan.nama}
                  <span className="block text-xs text-gray-400 dark:text-gray-500">
                    PIC: {item.pic?.nama ?? "Belum ditentukan"}
                  </span>
                </span>
                <button
                  onClick={() => handleRestore(item.id, "pendaftaran")}
                  disabled={loadingId === item.id}
                  className="text-xs text-brand-500 hover:underline disabled:opacity-50"
                >
                  {loadingId === item.id ? "..." : "Restore"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
          Peserta ({deletedPeserta.length})
        </p>
        {deletedPeserta.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">Tidak ada.</p>
        ) : (
          <ul className="space-y-2">
            {deletedPeserta.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2 last:border-0 dark:border-white/[0.05]"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.peserta.nama}
                  <span className="block text-xs text-gray-400 dark:text-gray-500">
                    {item.pendaftaranPerusahaan?.perusahaan.nama ?? "Peserta mandiri"}
                  </span>
                </span>
                <button
                  onClick={() => handleRestore(item.id, "peserta")}
                  disabled={loadingId === item.id}
                  className="text-xs text-brand-500 hover:underline disabled:opacity-50"
                >
                  {loadingId === item.id ? "..." : "Restore"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertModal
        isOpen={alert !== null}
        onClose={() => setAlert(null)}
        type={alert?.type ?? "success"}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        okLabel="OK"
      />
    </ComponentCard>
  );
};

export default PendaftaranTerhapusPanel;
