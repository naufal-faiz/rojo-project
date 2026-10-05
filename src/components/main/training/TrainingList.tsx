"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import PageHeader from "@/components/main/common/PageHeader";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import AlertModal from "@/components/main/Modal/AlertModal";
import TrainingFormModal from "./TrainingFormModal";
import TingkatanManager from "./TingkatanManager";
import DeletedTrainingList from "./DeletedTrainingList";
import { deleteTraining } from "@/lib/data/action/trainingAction";

interface Tingkatan {
  id: string;
  kelas: string;
}

interface TrainingData {
  id: string;
  nama: string;
  tingkatan: Tingkatan[];
}

interface TrainingListProps {
  initialData: TrainingData[];
  deletedData: TrainingData[];
}

const TrainingList: React.FC<TrainingListProps> = ({ initialData, deletedData }) => {
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [editData, setEditData] = useState<{ id: string; nama: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const {
    isOpen: isFormOpen,
    openModal: openForm,
    closeModal: closeForm,
  } = useModal();
  const {
    isOpen: isConfirmOpen,
    openModal: openConfirm,
    closeModal: closeConfirm,
  } = useModal();
  const {
    isOpen: isAlertOpen,
    openModal: openAlert,
    closeModal: closeAlert,
  } = useModal();

  const handleOpenAdd = () => {
    setEditData(null);
    openForm();
  };

  const handleOpenEdit = (training: TrainingData) => {
    setEditData({ id: training.id, nama: training.nama });
    openForm();
  };

  const handleOpenDelete = (id: string) => {
    setDeleteId(id);
    openConfirm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const result = await deleteTraining(deleteId);
      if (!result.success) {
        // Error: tutup confirm, tampilkan alert error
        closeConfirm();
        setAlertType("error");
        setAlertTitle("Gagal Menghapus");
        setAlertMessage(result.error ?? "Gagal menghapus training.");
        openAlert();
      } else {
        // Sukses: tutup confirm, tampilkan alert sukses
        closeConfirm();
        setDeleteId(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Training berhasil dihapus.");
        openAlert();
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <PageHeader
        title="Master Pelatihan"
        description="Kelola data Training dan Tingkatan yang digunakan dalam permohonan."
        primaryAction={{
          label: "Tambah Training",
          onClick: handleOpenAdd,
        }}
      />

      {/* Tab switch */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "bg-brand-500 text-white dark:bg-brand-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Aktif ({initialData.length})
        </button>
        <button
          onClick={() => setActiveTab("deleted")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "deleted"
              ? "bg-brand-500 text-white dark:bg-brand-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          Terhapus ({deletedData.length})
        </button>
      </div>

      {/* Daftar training aktif */}
      {activeTab === "active" && (
        <div className="space-y-3">
        {initialData.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-white/[0.05] dark:bg-white/[0.03] dark:text-gray-400">
            Belum ada data training. Klik &quot;Tambah Training&quot; untuk mulai.
          </div>
        ) : (
          initialData.map((training) => (
            <div
              key={training.id}
              className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
            >
              {/* Baris training */}
              <div className="flex items-center justify-between gap-4 px-5 py-4">
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
                  <span className="font-medium text-gray-800 dark:text-white/90 truncate">
                    {training.nama}
                  </span>
                  <span className="ml-1 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    ({training.tingkatan.length} tingkatan)
                  </span>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(training)}
                  >
                    Ubah
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDelete(training.id)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>

              {/* Panel tingkatan (expand) */}
              {expandedId === training.id && (
                <div className="border-t border-gray-100 px-5 py-4 dark:border-white/[0.05]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                    Tingkatan
                  </p>
                  <TingkatanManager
                    trainingId={training.id}
                    tingkatan={training.tingkatan}
                  />
                </div>
              )}
            </div>
          ))
        )}
        </div>
      )}

      {/* Daftar training terhapus */}
      {activeTab === "deleted" && (
        <DeletedTrainingList initialData={deletedData} />
      )}

      {/* Modal form tambah/ubah training */}
      <Modal isOpen={isFormOpen} onClose={closeForm} className="max-w-md">
        <TrainingFormModal editData={editData} onClose={closeForm} />
      </Modal>

      {/* Dialog konfirmasi hapus */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={handleDelete}
        title="Hapus Training"
        message="Yakin ingin menghapus training ini? Training hanya bisa dihapus jika tidak ada tingkatan aktif."
        confirmLabel="Ya, Hapus"
        variant="danger"
        isLoading={deleteLoading}
      />

      {/* Alert untuk keberhasilan/kegagalan aksi */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={closeAlert}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        okLabel="OK"
      />
    </>
  );
};

export default TrainingList;
