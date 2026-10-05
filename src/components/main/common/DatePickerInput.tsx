"use client";
import React, { useState, useEffect, useRef } from "react";
import { CalenderIcon, ChevronLeftIcon, ArrowRightIcon } from "@/icons/index";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
        className={`w-full flex items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700 dark:focus:border-brand-800 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className={value ? "" : "text-gray-400 dark:text-gray-500"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <CalenderIcon className="size-5 text-gray-500 dark:text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {/* Header bulan */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeftIcon className="size-5 text-gray-500 dark:text-gray-400" />
            </button>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {MONTH_NAMES[month]} {year}
            </p>
            <button
              type="button"
              onClick={nextMonth}
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
        </div>
      )}
    </div>
  );
};

export default DatePickerInput;
