import React from 'react';
import Badge from '@/components/ui/badge/Badge';

export type StatusValue = 
  | 'BELUM_UPLOAD'
  | 'SUDAH_UPLOAD'
  | 'FU_LPS'
  | 'LULUS'
  | 'GAGAL'
  | 'REMEDIAL'
  | 'IKUT_BATCH_SELANJUTNYA'
  | 'TAKEOUT'
  | 'CANCEL';

interface StatusBadgeProps {
  status: StatusValue;
}

const statusColorMap: Record<StatusValue, "primary" | "success" | "error" | "warning" | "info" | "light" | "dark"> = {
  BELUM_UPLOAD: 'warning',
  SUDAH_UPLOAD: 'success',
  FU_LPS: 'info',
  LULUS: 'success',
  GAGAL: 'error',
  REMEDIAL: 'warning',
  IKUT_BATCH_SELANJUTNYA: 'info',
  TAKEOUT: 'dark',
  CANCEL: 'error',
};

const statusLabelMap: Record<StatusValue, string> = {
  BELUM_UPLOAD: 'Belum Upload',
  SUDAH_UPLOAD: 'Sudah Upload',
  FU_LPS: 'FU LPS',
  LULUS: 'Lulus',
  GAGAL: 'Gagal',
  REMEDIAL: 'Remedial',
  IKUT_BATCH_SELANJUTNYA: 'Ikut Batch Selanjutnya',
  TAKEOUT: 'Takeout',
  CANCEL: 'Cancel',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = statusColorMap[status] || 'light';
  const label = statusLabelMap[status] || status;
  
  return (
    <Badge color={color}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
