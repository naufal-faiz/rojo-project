import React from "react";
import Link from "next/link";
import ComponentCard from "@/components/main/common/ComponentCard";
import {
  jenisKegiatanLabels,
  jenisSertifikasiLabels,
  labelTingkatan,
  penyelenggaraLabels,
  tipePelaksanaanLabels,
} from "@/components/main/common/enumLabels";
import { formatTanggal } from "@/components/main/common/formatTanggal";
import type { PermohonanUbahData } from "./permohonanTypes";

interface InformasiKegiatanCardProps {
  /** Detail permohonan yang ditampilkan. */
  data: PermohonanUbahData;
  /** Benar saat kartu status tidak dirender (BNSP/INTERNAL) sehingga kartu ini melebar. */
  full?: boolean;
}

const dtClass = "text-gray-500 dark:text-gray-400";
const ddClass = "font-medium text-gray-800 dark:text-gray-200";

const InformasiKegiatanCard: React.FC<InformasiKegiatanCardProps> = ({ data, full }) => (
  <ComponentCard title="Informasi Kegiatan" className={full ? "lg:col-span-5" : "lg:col-span-3"}>
    <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
      <div>
        <dt className={dtClass}>No. Permohonan</dt>
        <dd className={ddClass}>{data.noPermohonan ?? "Tanpa Nomor"}</dd>
      </div>
      <div>
        <dt className={dtClass}>Pelatihan</dt>
        <dd className={ddClass}>{labelTingkatan(data.tingkatan)}</dd>
      </div>
      <div>
        <dt className={dtClass}>Jenis Kegiatan</dt>
        <dd className={ddClass}>{jenisKegiatanLabels[data.jenisKegiatan]}</dd>
      </div>
      <div>
        <dt className={dtClass}>Tipe</dt>
        <dd className={ddClass}>{tipePelaksanaanLabels[data.tipePelaksanaan]}</dd>
      </div>
      <div>
        <dt className={dtClass}>Penyelenggara</dt>
        <dd className={ddClass}>{penyelenggaraLabels[data.penyelenggara]}</dd>
      </div>
      <div>
        <dt className={dtClass}>Jenis Sertifikasi</dt>
        <dd className={ddClass}>{jenisSertifikasiLabels[data.jenisSertifikasi]}</dd>
      </div>
      <div>
        <dt className={dtClass}>Lokasi</dt>
        <dd className={ddClass}>{data.lokasi ?? "-"}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className={dtClass}>Catatan</dt>
        <dd className={ddClass}>{data.catatan ?? "-"}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className={dtClass}>Jadwal Sesi</dt>
        <dd className="mt-1 flex flex-wrap items-center gap-2">
          {data.sesi.length === 0 ? (
            <span className="italic text-gray-500 dark:text-gray-400">Belum ada sesi tanggal.</span>
          ) : (
            data.sesi.map((sesi) => (
              <span key={sesi.id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {formatTanggal(sesi.tanggal)}
              </span>
            ))
          )}
          <Link href={`/permohonan/${data.id}/ubah`} className="text-sm text-brand-500 hover:underline dark:text-brand-400">
            Ubah jadwal
          </Link>
        </dd>
      </div>
    </dl>
  </ComponentCard>
);

export default InformasiKegiatanCard;
