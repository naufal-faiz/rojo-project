"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import { restoreTraining, restoreTingkatan } from "@/lib/data/action/trainingAction";
import { useModal } from "@/hooks/useModal";

interface Tingkatan {
  id: string;
  kelas: string;
  deletedAt?: string | null;
}

interface TrainingData {
  id: string;
  nama: string;
  tingkatan: Tingkatan[];
  deletedAt?: string | null;
}

interface DeletedTrainingListProps {
  initialData: TrainingData[];
}

const DeletedTrainingList: React.FC<DeletedTrainingListProps> = ({ initialData }) => {
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    isOpen: isConfirmOpen,
    openModal: openConfirm,
    closeModal: closeConfirm,
  } = useModal();

  const handleOpenRestore = (id: string) => {
    setRestoreId(id);
    setRestoreError(null);
    openConfirm();
  };

  const handleRestore = async () => {
    if (!restoreId) return;
    setRestoreLoading(true);
    try {
      const result = await restoreTraining(restoreId);
      if (!result.success) {
        setRestoreError(result.error ?? "Gagal merestore training.");
      } else {
        closeConfirm();
        setRestoreId(null);
      }
    } finally {
      setRestoreLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {initialData.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-gray-400">
          Tidak ada data training yang dihapus.
        </div>
      ) : (
        <div className="space-y-3">
          {initialData.map((training) => (
            <div
              key={training.id}
              className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
            >
              {/* Baris training */}
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                {training.tingkatan.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(training.id)}
                    className="flex items-center gap-2 text-left flex-1 min-w-0"
                  >
                    <span
                      className={`text-gray-400 transition-transform duration-200 ${
                        expandedId === training.id ? "rotate-90" : ""
                      }`}
                    >
                      ▶
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white/90 truncate line-through">
                      {training.nama}
                    </span>
                    <span className="ml-1 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      ({training.tingkatan.length} tingkatan)
                    </span>
                  </button>
                )}
                {training.tingkatan.length === 0 && (
                  <span className="font-medium text-gray-800 dark:text-white/90 truncate line-through flex-1">
                    {training.nama}
                  </span>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenRestore(training.id)}
                  >
                    Restore
                  </Button>
                </div>
              </div>

              {/* Panel tingkatan (expand) */}
              {expandedId === training.id && training.tingkatan.length > 0 && (
                <div className="border-t border-gray-100 px-5 py-4 dark:border-white/[0.05]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                    Tingkatan Terhapus
                  </p>
                  <ul className="space-y-2">
                    {training.tingkatan.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between gap-2 py-1"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300 line-through">
                          • {t.kelas}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreTingkatan(t.id)}
                          className="text-xs"
                        >
                          Restore
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialog konfirmasi restore */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={handleRestore}
        title="Restore Training"
        message={
          restoreError ??
          "Yakin ingin merestore training ini? Data tingkatan terhapus akan tetap terhapus."
        }
        confirmLabel="Ya, Restore"
        variant="primary"
        isLoading={restoreLoading}
      />
    </>
  );
};

export default DeletedTrainingList;
