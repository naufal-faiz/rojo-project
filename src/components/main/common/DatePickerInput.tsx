"use client";
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/button/Button";
import { CalenderIcon, ChevronLeftIcon, ArrowRightIcon } from "@/icons/index";

const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

interface DatePickerInputProps {
  /** Nilai tanggal format YYYY-MM-DD */
  value: string;
  /** Callback saat tanggal dipilih, format YYYY-MM-DD */
  onChange: (dateStr: string) => void;
  /** Placeholder input */
  placeholder?: string;
  /** Class tambahan */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

const toDateStr = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className = "",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number);
      return new Date(y, (m ?? 1) - 1, 1);
    }
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    return () => trigger?.focus();
  }, [open]);

  // Sinkronkan bulan yang ditampilkan saat nilai berubah dari luar
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      const [y, m] = value.split("-").map(Number);
      setViewDate(new Date(y, (m ?? 1) - 1, 1));
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node) && !dialogRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Senin = 0

  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstDayIndex; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const formatDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    return `${d} ${MONTH_NAMES[(m ?? 1) - 1]} ${y}`;
  };

  const handleSelect = (date: Date) => {
    onChange(toDateStr(date));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`h-9 w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:focus:border-brand-800 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className={value ? "" : "text-gray-400 dark:text-gray-500"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <CalenderIcon className="size-5 text-gray-500 dark:text-gray-400 shrink-0" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-gray-900/40 p-4" onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) setOpen(false); }} onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
          if (e.key === "Tab") {
            const elements = dialogRef.current?.querySelectorAll<HTMLElement>("button, select");
            const first = elements?.[0]; const last = elements?.[elements.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
          }
        }}>
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Pilih tanggal" className="w-80 max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {/* Header bulan */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              aria-label="Bulan sebelumnya"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeftIcon className="size-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="flex gap-1 text-sm text-gray-800 dark:text-gray-200">
              <select aria-label="Bulan" value={month} onChange={(e) => setViewDate(new Date(year, Number(e.target.value), 1))} className="h-9 rounded-lg border border-gray-300 bg-white px-1 dark:border-gray-700 dark:bg-gray-900">
                {MONTH_NAMES.map((name, index) => <option key={name} value={index}>{name}</option>)}
              </select>
              <select aria-label="Tahun" value={year} onChange={(e) => setViewDate(new Date(Number(e.target.value), month, 1))} className="h-9 rounded-lg border border-gray-300 bg-white px-1 dark:border-gray-700 dark:bg-gray-900">
                {Array.from({ length: Math.max(new Date().getFullYear() + 50, year) - Math.min(1900, year) + 1 }, (_, i) => Math.min(1900, year) + i).map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Bulan berikutnya"
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowRightIcon className="size-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Nama hari */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map((day) => (
              <span
                key={day}
                className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 py-1"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Grid tanggal */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) =>
              date === null ? (
                <span key={`empty-${i}`} />
              ) : (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => handleSelect(date)}
                  aria-label={formatDisplay(toDateStr(date))}
                  aria-pressed={value === toDateStr(date)}
                  className={`py-1.5 text-sm rounded-lg transition-colors ${
                    value === toDateStr(date)
                      ? "bg-brand-500 text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {date.getDate()}
                </button>
              )
            )}
          </div>
          <div className="mt-3 flex justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
            <Button size="sm" variant="outline" onClick={() => { onChange(""); setOpen(false); }}>Kosongkan</Button>
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Tutup</Button>
          </div>
        </div>
        </div>, document.body
      )}
    </div>
  );
};

export default DatePickerInput;
