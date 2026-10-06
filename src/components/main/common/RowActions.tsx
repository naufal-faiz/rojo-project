"use client";
import React from "react";
import Link from "next/link";
import { EyeIcon, PencilIcon, TrashBinIcon } from "@/icons/index";

interface RowActionsProps {
  /** Aksi detail dapat berupa tautan atau callback. */
  detailHref?: string;
  onDetail?: () => void;
  editHref?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const RowActions: React.FC<RowActionsProps> = ({ detailHref, onDetail, editHref, onEdit, onDelete, disabled }) => {
  const actions = [
    { label: "Detail", href: detailHref, onClick: onDetail, Icon: EyeIcon },
    { label: "Ubah", href: editHref, onClick: onEdit, Icon: PencilIcon },
    { label: "Hapus", href: undefined, onClick: onDelete, Icon: TrashBinIcon },
  ];
  const className = "rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800";
  return (
    <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
      {actions.filter((action) => action.href || action.onClick).map(({ label, href, onClick, Icon }) => href ? (
        <Link key={label} href={href} title={label} aria-label={label} className={className}><Icon className="size-5" /></Link>
      ) : (
        <button key={label} type="button" title={label} aria-label={label} className={className} onClick={onClick} disabled={disabled}>
          <Icon className="size-5" />
        </button>
      ))}
    </div>
  );
};
export default RowActions;
