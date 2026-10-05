"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import { updateStatusPelaksanaan } from "@/lib/data/action/pelaksanaanAction";
import { StatusTemanK3 } from "@/lib/generated/prisma/enums";
import { statusTemanK3Labels, statusTemanK3Colors } from "./statusTemanK3";

/** Nilai sentinel untuk opsi "Belum Upload" yang dikirim sebagai null ke server */
const BELUM_UPLOAD = "__BELUM_UPLOAD__";

interface StatusTemanK3CellProps {
  /** ID pelaksanaan yang statusnya diubah */
  id: string;
  /** Status saat ini (null = belum upload) */
  status: StatusTemanK3 | null;
}

/**
 * Penanda status TemanK3 pada tabel permohonan.
 * Menampilkan Badge berwarna + dropdown kecil untuk mengubah status secara inline.
 * Opsi "Belum Upload" mengirim null, berguna mengembalikan data yang salah isi.
 */
const StatusTemanK3Cell: React.FC<StatusTemanK3CellProps> = ({ id, status }) => {
  const router = useRouter();
  const [value, setValue] = useState<StatusTemanK3 | null>(status ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    const next: StatusTemanK3 | null = selected === BELUM_UPLOAD ? null : (selected as StatusTemanK3);
    const previous = value;
    setValue(next);
    setLoading(true);
    setError(null);

    const result = await updateStatusPelaksanaan(id, next);
    setLoading(false);

    if (!result.success) {
      setValue(previous);
      setError(result.error ?? "Gagal mengubah status.");
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-36">
      <div className="flex items-center gap-2">
        <Badge
          size="sm"
          color={value ? statusTemanK3Colors[value] : "light"}
        >
          {value ? statusTemanK3Labels[value] : "Belum Upload"}
        </Badge>
        <select
          aria-label="Ubah status TemanK3"
          value={value ?? BELUM_UPLOAD}
          onChange={handleChange}
          disabled={loading}
          className={`text-xs px-1.5 py-1 rounded-md border border-gray-200 bg-white text-gray-600 cursor-pointer focus:outline-hidden focus:border-brand-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 ${
            loading ? "opacity-50" : ""
          }`}
        >
          <option value={BELUM_UPLOAD}>Belum Upload</option>
          {Object.values(StatusTemanK3).map((s) => (
            <option key={s} value={s}>
              {statusTemanK3Labels[s]}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-error-500">{error}</p>}
    </div>
  );
};

export default StatusTemanK3Cell;
