"use client";
import { useState } from "react";
import { useModal } from "@/hooks/useModal";
import { createCabang, deleteCabang, updateCabang } from "@/lib/data/action/cabangAction";
import { TipeCabang } from "@/lib/generated/prisma/enums";

export interface CabangItem {
  id: string;
  nama: string;
  tipe: TipeCabang;
  alamat?: string | null;
}

/** State dan aksi pengelola cabang pada detail perusahaan. */
export function useCabangManager(perusahaanId: string) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNama, setEditNama] = useState("");
  const [editTipe, setEditTipe] = useState<TipeCabang>(TipeCabang.CABANG);
  const [editAlamat, setEditAlamat] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [newNama, setNewNama] = useState("");
  const [newTipe, setNewTipe] = useState<TipeCabang>(TipeCabang.CABANG);
  const [newAlamat, setNewAlamat] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

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

  const startEdit = (cabang: CabangItem) => {
    setEditId(cabang.id);
    setEditNama(cabang.nama);
    setEditTipe(cabang.tipe);
    setEditAlamat(cabang.alamat ?? "");
    setEditError(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setEditError(null);
    setEditLoading(true);
    try {
      const result = await updateCabang(editId, {
        nama: editNama,
        tipe: editTipe,
        alamat: editAlamat,
      });
      if (!result.success) {
        setEditError(result.error ?? "Gagal mengubah cabang.");
        setAlertType("error");
        setAlertTitle("Gagal Mengubah");
        setAlertMessage(result.error ?? "Gagal mengubah cabang.");
        openAlert();
      } else {
        setEditId(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Cabang berhasil diubah.");
        openAlert();
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    try {
      const result = await createCabang(perusahaanId, {
        nama: newNama,
        tipe: newTipe,
        alamat: newAlamat,
      });
      if (!result.success) {
        setAddError(result.error ?? "Gagal menambah cabang.");
        setAlertType("error");
        setAlertTitle("Gagal Menambah");
        setAlertMessage(result.error ?? "Gagal menambah cabang.");
        openAlert();
      } else {
        setNewNama("");
        setNewTipe(TipeCabang.CABANG);
        setNewAlamat("");
        setShowForm(false);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Cabang berhasil ditambahkan.");
        openAlert();
      }
    } finally {
      setAddLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    openConfirm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const result = await deleteCabang(deleteId);
      if (!result.success) {
        closeConfirm();
        setAlertType("error");
        setAlertTitle("Gagal Menghapus");
        setAlertMessage(result.error ?? "Gagal menghapus cabang.");
        openAlert();
      } else {
        closeConfirm();
        setDeleteId(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("Cabang berhasil dihapus.");
        openAlert();
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    showForm,
    setShowForm,
    editId,
    setEditId,
    editNama,
    setEditNama,
    editTipe,
    setEditTipe,
    editAlamat,
    setEditAlamat,
    editError,
    editLoading,
    newNama,
    setNewNama,
    newTipe,
    setNewTipe,
    newAlamat,
    setNewAlamat,
    addError,
    setAddError,
    addLoading,
    deleteLoading,
    alertType,
    alertTitle,
    alertMessage,
    isConfirmOpen,
    closeConfirm,
    isAlertOpen,
    closeAlert,
    startEdit,
    handleEdit,
    handleAdd,
    confirmDelete,
    handleDelete,
  };
}
