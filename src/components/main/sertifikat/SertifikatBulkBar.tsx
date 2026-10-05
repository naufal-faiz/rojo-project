"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";
import { statusPesertaLabels } from "@/components/main/common/StatusBadge";
import { updateStatusMassal } from "@/lib/data/action/sertifikatAction";
import { StatusPeserta } from "@/lib/generated/prisma/enums";

interface SertifikatBulkBarProps {
  /** ID baris yang dicentang */
  selectedIds: string[];
  /** Bersihkan pilihan setelah berhasil */
  onClear: () => void;
}

const SertifikatBulkBar: React.FC<SertifikatBulkBarProps> = ({ selectedIds, onClear }) => {
  const router = useRouter();
  const [status, setStatus] = useState<StatusPeserta | "">("");
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertMessage, setAlertMessage] = useState("");
  const { isOpen: isAlertOpen, openModal: openAlert, closeModal: closeAlert } = useModal();

  const handleTerapkan = async () => {
    setLoading(true);
    const result = await updateStatusMassal(selectedIds, status ? (status as StatusPeserta) : null);
    setLoading(false);

    if (!result.success) {
      setAlertType("error");
      setAlertMessage(result.error ?? "Gagal mengubah status massal.");
      openAlert();
      return;
    }

    setAlertType("success");
    setAlertMessage(`${result.jumlah} peserta diperbarui.`);
    openAlert();
    onClear();
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {selectedIds.length} peserta dipilih
      </p>
      <select
        aria-label="Status hasil massal"
        value={status}
        onChange={(e) => setStatus(e.target.value as StatusPeserta | "")}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-300"
      >
        <option value="">-- Belum ada hasil --</option>
        {Object.values(StatusPeserta).map((nilai) => (
          <option key={nilai} value={nilai}>
            {statusPesertaLabels[nilai]}
          </option>
        ))}
      </select>
      <Button size="sm" onClick={handleTerapkan} disabled={loading}>
        {loading ? "Menyimpan..." : "Terapkan Status"}
      </Button>
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-gray-500 hover:underline dark:text-gray-400"
      >
        Bersihkan pilihan
      </button>

      <AlertModal
        isOpen={isAlertOpen}
        onClose={closeAlert}
        type={alertType}
        title={alertType === "success" ? "Berhasil" : "Gagal"}
        message={alertMessage}
        okLabel="OK"
      />
    </div>
  );
};

export default SertifikatBulkBar;
