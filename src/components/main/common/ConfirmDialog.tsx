import React from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} className="max-w-[400px] p-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {message}
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === 'danger'
                ? 'bg-error-500 hover:bg-error-600 text-white'
                : variant === 'warning'
                ? 'bg-warning-500 hover:bg-warning-600 text-white'
                : ''
            }
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
