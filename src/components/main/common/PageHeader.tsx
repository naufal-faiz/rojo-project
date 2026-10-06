import React from 'react';
import Button from '@/components/ui/button/Button';
import Link from 'next/link';
import { ChevronLeftIcon } from '@/icons/index';

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, primaryAction, backHref, badges, actions }) => {
  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
      <div>
        {backHref && <Link href={backHref} className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"><ChevronLeftIcon className="size-4" />Kembali</Link>}
        <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h1>
        {badges && <div className="mt-2 flex flex-wrap gap-2">{badges}</div>}
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {(primaryAction || actions) && (
        <div className="flex items-center gap-3">
          {primaryAction && (primaryAction.href ? (
            <Link href={primaryAction.href}>
              <Button size="sm" startIcon={primaryAction.icon}>
                {primaryAction.label}
              </Button>
            </Link>
          ) : (
            <Button size="sm" onClick={primaryAction.onClick} startIcon={primaryAction.icon}>
              {primaryAction.label}
            </Button>
          ))}
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
