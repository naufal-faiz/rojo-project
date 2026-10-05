"use client";
import { useState } from "react";
import { useModal } from "@/hooks/useModal";
import { createPicAndLink, deletePic, unlinkPic } from "@/lib/data/action/picAction";
import { TipePic } from "@/lib/generated/prisma/enums";

export type AksiPic = "unlink" | "delete";

export interface PicItem {
  pic: {
    id: string;
    nama: string;
    noTelp?: string | null;
    tipe: TipePic;
  };
}

/** State dan aksi pengelola PIC pada detail perusahaan. */
export function usePicManager(perusahaanId: string) {
  const [showForm, setShowForm] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [newNoTelp, setNewNoTelp] = useState("");
  const [newTipe, setNewTipe] = useState<TipePic>(TipePic.INTERNAL);
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  const [actionType, setActionType] = useState<AksiPic | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
  const {
    isOpen: isSelectionOpen,
    openModal: openSelection,
    closeModal: closeSelection,
  } = useModal();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    try {
      const result = await createPicAndLink(perusahaanId, {
        nama: newNama,
        noTelp: newNoTelp,
        tipe: newTipe,
      });
      if (!result.success) {
        setAddError(result.error ?? "Gagal menambah PIC.");
        setAlertType("error");
        setAlertTitle("Gagal Menambah");
        setAlertMessage(result.error ?? "Gagal menambah PIC.");
        openAlert();
      } else {
        setNewNama("");
        setNewNoTelp("");
        setNewTipe(TipePic.INTERNAL);
        setShowForm(false);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage("PIC berhasil ditambahkan.");
        openAlert();
      }
    } finally {
      setAddLoading(false);
    }
  };

  const confirmAction = (picId: string, type: AksiPic) => {
    setActionId(picId);
    setActionType(type);
    openConfirm();
  };

  const handleConfirm = async () => {
    if (!actionId || !actionType) return;
    setActionLoading(true);
    try {
      const result =
        actionType === "unlink"
          ? await unlinkPic(perusahaanId, actionId)
          : await deletePic(actionId);

      if (!result.success) {
        closeConfirm();
        setAlertType("error");
        setAlertTitle(actionType === "unlink" ? "Gagal Melepas" : "Gagal Menghapus");
        setAlertMessage(result.error ?? "Gagal melakukan aksi.");
        openAlert();
      } else {
        closeConfirm();
        setActionId(null);
        setActionType(null);
        setAlertType("success");
        setAlertTitle("Berhasil");
        setAlertMessage(
          actionType === "unlink"
            ? "PIC berhasil dilepas dari perusahaan."
            : "PIC berhasil dihapus."
        );
        openAlert();
      }
    } finally {
      setActionLoading(false);
    }
  };

  return {
    showForm,
    setShowForm,
    newNama,
    setNewNama,
    newNoTelp,
    setNewNoTelp,
    newTipe,
    setNewTipe,
    addError,
    setAddError,
    addLoading,
    actionType,
    actionLoading,
    alertType,
    alertTitle,
    alertMessage,
    isConfirmOpen,
    closeConfirm,
    isAlertOpen,
    closeAlert,
    isSelectionOpen,
    openSelection,
    closeSelection,
    handleAdd,
    confirmAction,
    handleConfirm,
  };
}
