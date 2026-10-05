import React from 'react';
import Badge from '@/components/ui/badge/Badge';
import { StatusPeserta, StatusTemanK3 } from '@/lib/generated/prisma/enums';

export type BadgeColorName =
  | 'primary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

/** Semua nilai status yang punya label dan warna di UI (sumber tunggal dari enum Prisma). */
export type StatusValue = StatusTemanK3 | StatusPeserta;

/** Label status TemanK3 (permohonan). `null` ditangani pemanggil. */
export const statusTemanK3Labels: Record<StatusTemanK3, string> = {
  [StatusTemanK3.SUDAH_UPLOAD]: 'Sudah Upload',
  [StatusTemanK3.FU_LPS]: 'FU LPS',
  [StatusTemanK3.CANCEL]: 'Cancel',
};

/** Label status hasil peserta. */
export const statusPesertaLabels: Record<StatusPeserta, string> = {
  [StatusPeserta.LULUS]: 'Lulus',
  [StatusPeserta.GAGAL]: 'Gagal',
  [StatusPeserta.REMEDIAL]: 'Remedial',
  [StatusPeserta.IKUT_BATCH_SELANJUTNYA]: 'Ikut Batch Selanjutnya',
  [StatusPeserta.TAKEOUT]: 'Takeout',
  [StatusPeserta.CANCEL]: 'Cancel',
};

const statusLabelMap: Record<StatusValue, string> = {
  ...statusTemanK3Labels,
  ...statusPesertaLabels,
};

const statusColorMap: Record<StatusValue, BadgeColorName> = {
  SUDAH_UPLOAD: 'success',
  FU_LPS: 'info',
  LULUS: 'success',
  GAGAL: 'error',
  REMEDIAL: 'warning',
  IKUT_BATCH_SELANJUTNYA: 'info',
  TAKEOUT: 'dark',
  CANCEL: 'error',
};

interface StatusBadgeProps {
  /** Nilai status dari enum Prisma */
  status: StatusValue;
  /** Ukuran badge, bawaan md */
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const color = statusColorMap[status] ?? 'light';
  const label = statusLabelMap[status] ?? status;

  return (
    <Badge color={color} size={size}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
