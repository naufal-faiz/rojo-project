"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Checkbox from "@/components/form/input/Checkbox";
import DatePickerInput from "@/components/main/common/DatePickerInput";
import { formatTanggal } from "@/components/main/common/formatTanggal";
import { CloseLineIcon, PlusIcon } from "@/icons/index";

interface SesiPickerProps {
  /** Daftar tanggal sesi format YYYY-MM-DD. */
  value: string[];
  onChange: (next: string[]) => void;
  /** Pesan galat rentang ditampilkan lewat notifikasi halaman. */
  onError: (message: string) => void;
  disabled?: boolean;
}

const toDateStr = (date: Date): string => {
  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const hari = String(date.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
};

const urutUnik = (dates: string[]): string[] => [...new Set(dates)].sort();

const SesiPicker: React.FC<SesiPickerProps> = ({ value, onChange, onError, disabled }) => {
  const [tanggal, setTanggal] = useState("");
  const [rentangTerbuka, setRentangTerbuka] = useState(false);
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [lewatiWeekend, setLewatiWeekend] = useState(true);

  const tambahHari = () => {
    if (!tanggal) return;
    onChange(urutUnik([...value, tanggal]));
    setTanggal("");
  };

  const tambahRentang = () => {
    if (!dari || !sampai) { onError("Isi tanggal mulai dan tanggal selesai rentang."); return; }
    const mulai = new Date(`${dari}T00:00:00`);
    const akhir = new Date(`${sampai}T00:00:00`);
    if (akhir < mulai) { onError("Tanggal selesai harus setelah tanggal mulai."); return; }
    const hasil: string[] = [];
    const kursor = new Date(mulai);
    while (kursor <= akhir) {
      const hari = kursor.getDay();
      if (!lewatiWeekend || (hari !== 0 && hari !== 6)) hasil.push(toDateStr(kursor));
      if (hasil.length > 366) { onError("Rentang terlalu panjang (maksimal 366 hari)."); return; }
      kursor.setDate(kursor.getDate() + 1);
    }
    onChange(urutUnik([...value, ...hasil]));
    setDari("");
    setSampai("");
    setRentangTerbuka(false);
  };

  return (
    <div className="space-y-4">
      {value.length === 0 ? (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          Jadwal belum diisi. Permohonan boleh disimpan tanpa sesi.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
              {formatTanggal(item)}
              <button type="button" disabled={disabled} title={`Hapus ${formatTanggal(item)}`}
                aria-label={`Hapus ${formatTanggal(item)}`} onClick={() => onChange(value.filter((row) => row !== item))}
                className="text-error-500 hover:text-error-600 disabled:opacity-50 dark:text-error-400">
                <CloseLineIcon className="size-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-56 flex-1">
          <DatePickerInput value={tanggal} onChange={setTanggal} placeholder="Pilih tanggal" disabled={disabled} />
        </div>
        <Button type="button" size="sm" disabled={disabled || !tanggal} onClick={tambahHari}
          startIcon={<PlusIcon className="size-4" />}>Tambah Hari</Button>
      </div>

      {rentangTerbuka ? (
        <div className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Dari tanggal</span>
              <DatePickerInput value={dari} onChange={setDari} disabled={disabled} />
            </div>
            <div>
              <span className="mb-1 block text-sm text-gray-700 dark:text-gray-300">Sampai tanggal</span>
              <DatePickerInput value={sampai} onChange={setSampai} disabled={disabled} />
            </div>
          </div>
          <Checkbox label="Lewati Sabtu dan Minggu" checked={lewatiWeekend} onChange={setLewatiWeekend} disabled={disabled} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={disabled || !dari || !sampai} onClick={tambahRentang}>Tambah Rentang</Button>
            <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => setRentangTerbuka(false)}>Tutup</Button>
          </div>
        </div>
      ) : (
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => setRentangTerbuka(true)}
          startIcon={<PlusIcon className="size-4" />}>Tambah Rentang</Button>
      )}
    </div>
  );
};

export default SesiPicker;
