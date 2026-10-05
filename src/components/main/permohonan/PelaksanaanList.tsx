"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import AlertModal from "@/components/main/Modal/AlertModal";
import PelaksanaanFormModal, { PelaksanaanFormData } from "./PelaksanaanFormModal";
import {
  getDeletedPelaksanaanColumns,
  getPelaksanaanColumns,
  PelaksanaanData,
  Tingkatan,
} from "./PelaksanaanColumns";
import { deletePelaksanaan, restorePelaksanaan } from "@/lib/data/action/pelaksanaanAction";

interface PelaksanaanListProps {
  initialData: PelaksanaanData[];
  deletedData: PelaksanaanData[];
  tingkatanOptions: Tingkatan[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

const PelaksanaanList: React.FC<PelaksanaanListProps> = ({
  initialData,
  deletedData,
  tingkatanOptions,
  pagination,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [editData, setEditData] = useState<PelaksanaanFormData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const {
    isOpen: isFormOpen,
    openModal: openForm,
    closeModal: closeForm,
  } = useModal();
  const {
    isOpen: isDeleteConfirmOpen,
    openModal: openDeleteConfirm,
    closeModal: closeDeleteConfirm,
  } = useModal();
  const {
    isOpen: isRestoreConfirmOpen,
    openModal: openRestoreConfirm,
    closeModal: closeRestoreConfirm,
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

  const handleOpenDetail = (pelaksanaan: PelaksanaanData) => {
    router.push(`/permohonan/${pelaksanaan.id}`);
  };

  const handleOpenEdit = (pelaksanaan: PelaksanaanData) => {
    setEditData({
      id: pelaksanaan.id,
      noPermohonan: pelaksanaan.noPermohonan,
      tingkatanId: pelaksanaan.tingkatanId,
      jenisKegiatan: pelaksanaan.jenisKegiatan,
      tipePelaksanaan: pelaksanaan.tipePelaksanaan,
      lokasi: pelaksanaan.lokasi,
      penyelenggara: pelaksanaan.penyelenggara,
      jenisSertifikasi: pelaksanaan.jenisSertifikasi,
      status: pelaksanaan.status,
      catatan: pelaksanaan.catatan,
    });
    openForm();
  };

  const handleOpenDelete = (id: string) => {
    setDeleteId(id);
    openDeleteConfirm();
  };

  const handleOpenRestore = (id: string) => {
    setRestoreId(id);
    openRestoreConfirm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      const result = await deletePelaksanaan(deleteId);
      if (!result.success) {
        closeDeleteConfirm();
        setAlertType("error");
        setAlertTitle("Gagal Menghapus");
        setAlertMessage(result.error ?? "Gagal menghapus permohonan.");
        openAlert();
      } else {
        closeDeleteConfirm();
        setDeleteId(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Permohonan berhasil dihapus.");
        openAlert();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreId) return;
    setActionLoading(true);
    try {
      const result = await restorePelaksanaan(restoreId);
      if (!result.success) {
        closeRestoreConfirm();
        setAlertType("error");
        setAlertTitle("Gagal Restore");
        setAlertMessage(result.error ?? "Gagal merestore permohonan.");
        openAlert();
      } else {
        closeRestoreConfirm();
        setRestoreId(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Permohonan berhasil direstore.");
        openAlert();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const activeColumns = getPelaksanaanColumns({
    onDetail: handleOpenDetail,
    onEdit: handleOpenEdit,
    onDelete: handleOpenDelete,
  });

  const deletedColumns = getDeletedPelaksanaanColumns(handleOpenRestore);

  return (
    <>
      <PageHeader
        title="Permohonan Pelatihan"
        description="Kelola daftar permohonan dan jadwal kegiatan pembinaan K3."
        primaryAction={{
          label: "Buat Permohonan",
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
          Aktif ({pagination.totalItems})
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

      {activeTab === "active" ? (
        <DataTable
          data={initialData}
          columns={activeColumns}
          totalPages={pagination.totalPages}
          currentPage={pagination.page}
          totalItems={pagination.totalItems}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchValue={searchParams.get("search") ?? ""}
          searchPlaceholder="Cari no permohonan atau nama pelatihan..."
          emptyText="Belum ada data permohonan."
        />
      ) : (
        <DataTable
          data={deletedData}
          columns={deletedColumns}
          totalPages={1}
          currentPage={1}
          totalItems={deletedData.length}
          onPageChange={() => {}}
          onSearch={() => {}}
          searchPlaceholder="Cari..."
          emptyText="Tidak ada permohonan yang dihapus."
        />
      )}

      {/* Modal form tambah/ubah */}
      <Modal isOpen={isFormOpen} onClose={closeForm} className="max-w-lg">
        <PelaksanaanFormModal
          editData={editData}
          tingkatanOptions={tingkatanOptions}
          onClose={closeForm}
        />
      </Modal>

      {/* Dialog konfirmasi hapus */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Hapus Permohonan"
        message="Yakin ingin menghapus permohonan ini? Permohonan hanya bisa dihapus jika tidak ada pendaftaran atau peserta aktif."
        confirmLabel="Ya, Hapus"
        variant="danger"
        isLoading={actionLoading}
      />

      {/* Dialog konfirmasi restore */}
      <ConfirmDialog
        isOpen={isRestoreConfirmOpen}
        onClose={closeRestoreConfirm}
        onConfirm={handleRestore}
        title="Restore Permohonan"
        message="Yakin ingin merestore permohonan ini?"
        confirmLabel="Ya, Restore"
        variant="primary"
        isLoading={actionLoading}
      />

      {/* Alert */}
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

export default PelaksanaanList;
