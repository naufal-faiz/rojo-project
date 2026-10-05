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
import StatusTemanK3Cell from "./StatusTemanK3Cell";
import { deletePelaksanaan, restorePelaksanaan } from "@/lib/data/action/pelaksanaanAction";
import { JenisKegiatan, Penyelenggara, StatusTemanK3, TipePelaksanaan, JenisSertifikasi } from "@/lib/generated/prisma/enums";

const penyelenggaraLabels: Record<Penyelenggara, string> = {
  [Penyelenggara.WINA_KARYA_MULIA]: "Wina Karya Mulia",
  [Penyelenggara.DELTA_INDONESIA]: "Delta Indonesia",
  [Penyelenggara.LIMA_PRIMA_SOLUSINDO]: "Lima Prima (LPS)",
  [Penyelenggara.ARTA_KARYA_AREFAA]: "Arta Karya Arefaa",
  [Penyelenggara.LIK]: "LIK",
  [Penyelenggara.ITC]: "ITC",
};

const jenisLabels: Record<JenisKegiatan, string> = {
  [JenisKegiatan.PUBLIK]: "PUBLIK",
  [JenisKegiatan.INHOUSE]: "INHOUSE",
};

interface Tingkatan {
  id: string;
  kelas: string;
  training: {
    id: string;
    nama: string;
  };
}

interface PelaksanaanData {
  id: string;
  noPermohonan?: string | null;
  tingkatanId: string;
  tingkatan: Tingkatan;
  jenisKegiatan: JenisKegiatan;
  tipePelaksanaan: TipePelaksanaan;
  lokasi?: string | null;
  penyelenggara: Penyelenggara;
  jenisSertifikasi: JenisSertifikasi;
  status?: StatusTemanK3 | null;
  catatan?: string | null;
  sesi: Array<{ id: string; tanggal: Date }>;
}

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

  const activeColumns = [
    {
      header: "No. Permohonan",
      cell: (row: PelaksanaanData) => row.noPermohonan ?? <span className="text-gray-400 italic">Tanpa Nomor</span>,
    },
    {
      header: "Pelatihan",
      cell: (row: PelaksanaanData) => `${row.tingkatan.training.nama} - ${row.tingkatan.kelas}`,
    },
    {
      header: "Jenis",
      cell: (row: PelaksanaanData) => jenisLabels[row.jenisKegiatan],
    },
    {
      header: "Penyelenggara",
      cell: (row: PelaksanaanData) => penyelenggaraLabels[row.penyelenggara],
    },
    {
      header: "Status TemanK3",
      cell: (row: PelaksanaanData) =>
        row.jenisSertifikasi === JenisSertifikasi.KEMNAKER ? (
          <StatusTemanK3Cell id={row.id} status={row.status ?? null} />
        ) : (
          <span className="text-gray-400 italic">-</span>
        ),
    },
    {
      header: "Aksi",
      cell: (row: PelaksanaanData) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/permohonan/${row.id}`)}
            className="text-xs text-brand-500 hover:underline"
          >
            Detail
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="text-xs text-brand-500 hover:underline"
          >
            Ubah
          </button>
          <button
            onClick={() => handleOpenDelete(row.id)}
            className="text-xs text-error-500 hover:underline"
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

  const deletedColumns = [
    {
      header: "No. Permohonan",
      cell: (row: PelaksanaanData) => row.noPermohonan ?? "-",
    },
    {
      header: "Pelatihan",
      cell: (row: PelaksanaanData) => `${row.tingkatan.training.nama} - ${row.tingkatan.kelas}`,
    },
    {
      header: "Aksi",
      cell: (row: PelaksanaanData) => (
        <button
          onClick={() => handleOpenRestore(row.id)}
          className="text-xs text-brand-500 hover:underline"
        >
          Restore
        </button>
      ),
    },
  ];

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
