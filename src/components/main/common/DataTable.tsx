"use client";
import React, { useState, useTransition } from "react";
import Input from "@/components/form/input/InputField";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Pagination from "@/components/main/tables/Pagination";

export interface Column<T> {
  /** Label kolom */
  header: string;
  /** Key dari data atau fungsi render kustom */
  accessor?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  /** Data array yang akan ditampilkan */
  data: T[];
  /** Definisi kolom */
  columns: Column<T>[];
  /** Total halaman untuk paginasi */
  totalPages: number;
  /** Halaman saat ini */
  currentPage: number;
  /** Total item */
  totalItems: number;
  /** Callback saat halaman berubah */
  onPageChange: (page: number) => void;
  /** Callback saat query pencarian berubah */
  onSearch: (query: string) => void;
  /** Nilai search awal */
  searchValue?: string;
  /** Placeholder search */
  searchPlaceholder?: string;
  /** Teks ketika data kosong */
  emptyText?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Callback saat baris diklik (opsional) */
  onRowClick?: (row: T) => void;
}

function DataTable<T extends { id: string }>({
  data,
  columns,
  totalPages,
  currentPage,
  totalItems,
  onPageChange,
  onSearch,
  searchValue = "",
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ada data.",
  isLoading = false,
  onRowClick,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [, startTransition] = useTransition();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    startTransition(() => {
      onSearch(val);
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Toolbar pencarian */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-100 dark:border-white/[0.05]">
        <div className="w-full max-w-sm">
          <Input
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={handleSearchChange}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {totalItems} data
        </p>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-white/[0.05]">
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  isHeader
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 ${col.className ?? ""}`}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-gray-100 last:border-0 hover:bg-gray-50/60 dark:border-white/[0.05] dark:hover:bg-white/[0.03] transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((col, i) => (
                    <TableCell
                      key={i}
                      className={`px-4 py-3 text-sm text-gray-700 dark:text-gray-300 ${col.className ?? ""}`}
                    >
                      {col.cell
                        ? col.cell(row)
                        : col.accessor
                        ? String(row[col.accessor] ?? "-")
                        : "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginasi */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end px-4 py-3 border-t border-gray-100 dark:border-white/[0.05]">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;
