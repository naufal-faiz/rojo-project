import React from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  okLabel?: string;
  variant?: 'info' | 'warning' | 'error' | 'success';
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  okLabel = 'OK',
  variant = 'info',
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'error':
        return (
          <div className="w-12 h-12 rounded-full bg-error-50 dark:bg-error-900/20 flex items-center justify-center">
            <span className="text-2xl">✕</span>
          </div>
        );
      case 'warning':
        return (
          <div className="w-12 h-12 rounded-full bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center">
            <span className="text-2xl">!</span>
          </div>
        );
      case 'success':
        return (
          <div className="w-12 h-12 rounded-full bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
            <span className="text-2xl">✓</span>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
            <span className="text-2xl">ℹ</span>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px]">
      <div className="flex flex-col items-center gap-4 p-6">
        {getIcon()}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 text-center">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {message}
        </p>
        <div className="flex justify-center mt-2">
          <Button
            size="sm"
            onClick={onClose}
            className={
              variant === 'error'
                ? 'bg-error-500 hover:bg-error-600 text-white'
                : variant === 'warning'
                ? 'bg-warning-500 hover:bg-warning-600 text-white'
                : variant === 'success'
                ? 'bg-success-500 hover:bg-success-600 text-white'
                : ''
            }
          >
            {okLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertDialog;
