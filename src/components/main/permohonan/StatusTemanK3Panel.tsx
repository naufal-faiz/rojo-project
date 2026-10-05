"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import AlertModal from "@/components/main/Modal/AlertModal";
import { useModal } from "@/hooks/useModal";
import StatusTemanK3Badge from "./StatusTemanK3Badge";
import { updateStatusPelaksanaan } from "@/lib/data/action/pelaksanaanAction";
import { JenisSertifikasi, StatusTemanK3 } from "@/lib/generated/prisma/enums";
import { CheckLineIcon } from "@/icons/index";

interface StatusTemanK3PanelProps {
  /** ID pelaksanaan yang statusnya dikelola */
  pelaksanaanId: string;
  /** Status TemanK3 saat ini, null = belum upload */
  status: StatusTemanK3 | null;
  /** Tanggal berkas diunggah, null = belum ada */
  uploadedAt: Date | null;
  /** Jenis sertifikasi kegiatan */
  jenisSertifikasi: JenisSertifikasi;
}

const formatWaktu = (value: Date): string =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

const StatusTemanK3Panel: React.FC<StatusTemanK3PanelProps> = ({
  pelaksanaanId,
  status,
  uploadedAt,
  jenisSertifikasi,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const { isOpen: isAlertOpen, openModal: openAlert, closeModal: closeAlert } = useModal();

  const handleUpdate = async (next: StatusTemanK3 | null) => {
    setLoading(true);
    const result = await updateStatusPelaksanaan(pelaksanaanId, next);
    setLoading(false);

    if (!result.success) {
      setAlertType("error");
      setAlertTitle("Gagal");
      setAlertMessage(result.error ?? "Gagal mengubah status TemanK3.");
    } else {
      setAlertType("success");
      setAlertTitle("Berhasil");
      setAlertMessage(
        next === null
          ? "Status dikembalikan ke Belum Upload."
          : "Status TemanK3 diperbarui."
      );
      router.refresh();
    }
    openAlert();
  };

  if (jenisSertifikasi !== JenisSertifikasi.KEMNAKER) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Status TemanK3 hanya berlaku untuk kegiatan berjenis sertifikasi KEMNAKER.
        Kegiatan ini berjenis {jenisSertifikasi}.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <StatusTemanK3Badge status={status} jenisSertifikasi={jenisSertifikasi} />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {uploadedAt
            ? `Berkas diunggah ${formatWaktu(uploadedAt)} WIB.`
            : "Belum ada tanggal unggah berkas."}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => handleUpdate(StatusTemanK3.SUDAH_UPLOAD)}
          disabled={loading}
          startIcon={<CheckLineIcon className="size-4" />}
        >
          Nyatakan file sudah diupload
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleUpdate(StatusTemanK3.FU_LPS)}
          disabled={loading}
        >
          Tandai FU LPS
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleUpdate(StatusTemanK3.CANCEL)}
          disabled={loading}
        >
          Tandai Cancel
        </Button>
        {status !== null && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdate(null)}
            disabled={loading}
          >
            Kembalikan ke Belum Upload
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        &quot;Nyatakan file sudah diupload&quot; mencatat tanggal unggah saat ini.
        FU LPS dan Cancel tidak mengubah tanggal unggah.
      </p>

      <AlertModal
        isOpen={isAlertOpen}
        onClose={closeAlert}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        okLabel="OK"
      />
    </div>
  );
};

export default StatusTemanK3Panel;
