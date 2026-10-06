"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import FlashAlert from "@/components/main/common/FlashAlert";
import useFlash from "@/components/main/common/useFlash";
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
}) => {
  const [loading, setLoading] = useState(false);
  const flash = useFlash();

  const handleUpdate = async (next: StatusTemanK3 | null) => {
    setLoading(true);
    const result = await updateStatusPelaksanaan(pelaksanaanId, next);
    setLoading(false);

    if (!result.success) {
      flash.showError(result.error ?? "Gagal mengubah status TemanK3.");
    } else {
      flash.showSuccess(
        next === null
          ? "Status dikembalikan ke Belum Upload."
          : "Status TemanK3 diperbarui."
      );
    }
  };

  return (
    <div className="space-y-4">
      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      <div className="flex flex-wrap items-center gap-3">
        <StatusTemanK3Badge status={status} jenisSertifikasi={JenisSertifikasi.KEMNAKER} />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {uploadedAt
            ? `Berkas diunggah ${formatWaktu(uploadedAt)} WIB.`
            : "Belum ada tanggal unggah berkas."}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => handleUpdate(StatusTemanK3.SUDAH_UPLOAD)}
          disabled={loading} startIcon={<CheckLineIcon className="size-4" />}>
          Nyatakan file sudah diupload
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleUpdate(StatusTemanK3.FU_LPS)}
          disabled={loading}>
          Tandai FU LPS
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleUpdate(StatusTemanK3.CANCEL)}
          disabled={loading}>
          Tandai Cancel
        </Button>
        {status !== null && (
          <Button size="sm" variant="outline" onClick={() => handleUpdate(null)} disabled={loading}>
            Kembalikan ke Belum Upload
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        &quot;Nyatakan file sudah diupload&quot; mencatat tanggal unggah saat ini.
        FU LPS dan Cancel tidak mengubah tanggal unggah.
      </p>
    </div>
  );
};

export default StatusTemanK3Panel;
