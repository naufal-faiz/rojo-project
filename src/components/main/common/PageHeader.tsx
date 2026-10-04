import React from 'react';
import Button from '@/components/ui/button/Button';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, primaryAction }) => {
  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {primaryAction && (
        <div className="flex items-center gap-3">
          {primaryAction.href ? (
            <Link href={primaryAction.href}>
              <Button size="sm" startIcon={primaryAction.icon}>
                {primaryAction.label}
              </Button>
            </Link>
          ) : (
            <Button size="sm" onClick={primaryAction.onClick} startIcon={primaryAction.icon}>
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
