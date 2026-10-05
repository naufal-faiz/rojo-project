import React from "react";
import Badge from "@/components/ui/badge/Badge";
import StatusBadge from "@/components/main/common/StatusBadge";
import { JenisSertifikasi, StatusTemanK3 } from "@/lib/generated/prisma/enums";

interface StatusTemanK3BadgeProps {
  /** Status TemanK3 saat ini, `null` = belum upload */
  status: StatusTemanK3 | null;
  /** Jenis sertifikasi kegiatan, menentukan tampilan saat status kosong */
  jenisSertifikasi: JenisSertifikasi;
}

/**
 * Menampilkan status TemanK3 dengan semantik null (PRD bagian 8):
 * KEMNAKER + null = "Belum Upload", BNSP/INTERNAL + null = "-".
 */
const StatusTemanK3Badge: React.FC<StatusTemanK3BadgeProps> = ({
  status,
  jenisSertifikasi,
}) => {
  if (status) {
    return <StatusBadge status={status} size="sm" />;
  }

  if (jenisSertifikasi === JenisSertifikasi.KEMNAKER) {
    return (
      <Badge color="light" size="sm">
        Belum Upload
      </Badge>
    );
  }

  return <span className="text-gray-400 italic">-</span>;
};

export default StatusTemanK3Badge;
