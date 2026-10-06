"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import AlertModal from "@/components/main/Modal/AlertModal";
import PesertaFormModal from "./PesertaFormModal";
import { getPesertaColumns, PesertaData } from "./PesertaColumns";
import { deletePeserta } from "@/lib/data/action/pesertaAction";

interface Cabang {
  id: string;
  nama: string;
  perusahaan: {
    id: string;
    nama: string;
  };
}

interface PesertaListProps {
  initialData: PesertaData[];
  cabangOptions: Cabang[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

const PesertaList: React.FC<PesertaListProps> = ({
  initialData,
  cabangOptions,
  pagination,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editData, setEditData] = useState<PesertaData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
    isOpen: isAlertOpen,
    openModal: openAlert,
    closeModal: closeAlert,
  } = useModal();

  const handleOpenAdd = () => {
    setEditData(null);
    openForm();
  };

  const handleOpenDetail = (peserta: PesertaData) => {
    router.push(`/master/peserta/${peserta.id}`);
  };

  const handleOpenEdit = (peserta: PesertaData) => {
    setEditData(peserta);
    openForm();
  };

  const handleOpenDelete = (id: string) => {
    setDeleteId(id);
    openDeleteConfirm();
  };


  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      const result = await deletePeserta(deleteId);
      if (!result.success) {
        closeDeleteConfirm();
        setAlertType("error");
        setAlertTitle("Gagal Menghapus");
        setAlertMessage(result.error ?? "Gagal menghapus peserta.");
        openAlert();
      } else {
        closeDeleteConfirm();
        setDeleteId(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Peserta berhasil dihapus.");
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

  const activeColumns = getPesertaColumns({
    onDetail: handleOpenDetail,
    onEdit: handleOpenEdit,
    onDelete: handleOpenDelete,
  });


  return (
    <>
      <PageHeader
        title="Master Peserta"
        description="Kelola data peserta yang terdaftar dalam kegiatan pelatihan."
        primaryAction={{
          label: "Tambah Peserta",
          onClick: handleOpenAdd,
        }}
      />


        <DataTable
          data={initialData}
          columns={activeColumns}
          totalPages={pagination.totalPages}
          currentPage={pagination.page}
          totalItems={pagination.totalItems}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchValue={searchParams.get("search") ?? ""}
          searchPlaceholder="Cari nama peserta atau perusahaan..."
          emptyText="Belum ada data peserta."
        />


      {/* Modal form tambah/ubah */}
      <Modal isOpen={isFormOpen} onClose={closeForm} className="max-w-md">
        <PesertaFormModal
          editData={editData}
          cabangOptions={cabangOptions}
          onClose={closeForm}
        />
      </Modal>

      {/* Dialog konfirmasi hapus */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Hapus Peserta"
        message="Yakin ingin menghapus peserta ini? Peserta hanya bisa dihapus jika tidak ada pendaftaran aktif."
        confirmLabel="Ya, Hapus"
        variant="danger"
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

export default PesertaList;
