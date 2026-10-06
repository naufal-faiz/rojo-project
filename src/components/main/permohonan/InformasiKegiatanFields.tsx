"use client";
import React, { useId } from "react";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import SearchableSelect from "@/components/main/common/SearchableSelect";
import {
  jenisKegiatanLabels,
  jenisSertifikasiLabels,
  penyelenggaraLabels,
  tipePelaksanaanLabels,
} from "@/components/main/common/enumLabels";
import { searchTrainingOptions } from "@/lib/data/action/searchOptionsAction";
import {
  JenisKegiatan,
  JenisSertifikasi,
  Penyelenggara,
  TipePelaksanaan,
} from "@/lib/generated/prisma/enums";
import type { PermohonanFormState } from "./usePermohonanForm";

interface InformasiKegiatanFieldsProps {
  /** State form buat/ubah permohonan. */
  form: PermohonanFormState;
}

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300";
const fieldLabel = "mb-1 block text-sm text-gray-700 dark:text-gray-300";

const InformasiKegiatanFields: React.FC<InformasiKegiatanFieldsProps> = ({ form }) => {
  const id = useId();
  const busy = form.busy;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor={`${id}-no`}>No. Permohonan</Label>
        <Input id={`${id}-no`} value={form.noPermohonan} disabled={busy}
          onChange={(event) => form.setNoPermohonan(event.target.value)}
          placeholder="Kosongkan bila belum ada / mitra" />
      </div>
      <div>
        <span className={fieldLabel}>Training</span>
        <SearchableSelect search={searchTrainingOptions} value={form.training} disabled={busy}
          onChange={form.pilihTraining} placeholder="Cari training..." />
      </div>
      <div>
        <span className={fieldLabel}>Tingkatan</span>
        {form.tanpaTingkatan ? (
          <p className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
            Tanpa tingkatan (kelas &quot;Umum&quot; dibuat otomatis saat disimpan)
          </p>
        ) : (
          <select value={form.tingkatanId} disabled={busy || form.memuatTingkatan || !form.training}
            onChange={(event) => form.setTingkatanId(event.target.value)} className={selectClass}>
            <option value="">{form.memuatTingkatan ? "Memuat tingkatan..." : "-- Pilih Tingkatan --"}</option>
            {form.tingkatanOptions.map((tingkatan) => (
              <option key={tingkatan.id} value={tingkatan.id}>{tingkatan.kelas}</option>
            ))}
          </select>
        )}
      </div>
      <div>
        <span className={fieldLabel}>Jenis Kegiatan</span>
        <select value={form.jenisKegiatan} disabled={busy} className={selectClass}
          onChange={(event) => form.setJenisKegiatan(event.target.value as JenisKegiatan)}>
          {Object.values(JenisKegiatan).map((value) => (
            <option key={value} value={value}>{jenisKegiatanLabels[value]}</option>
          ))}
        </select>
      </div>
      <div>
        <span className={fieldLabel}>Tipe Pelaksanaan</span>
        <select value={form.tipePelaksanaan} disabled={busy} className={selectClass}
          onChange={(event) => form.setTipePelaksanaan(event.target.value as TipePelaksanaan)}>
          {Object.values(TipePelaksanaan).map((value) => (
            <option key={value} value={value}>{tipePelaksanaanLabels[value]}</option>
          ))}
        </select>
      </div>
      <div>
        <span className={fieldLabel}>Penyelenggara</span>
        <select value={form.penyelenggara} disabled={busy} className={selectClass}
          onChange={(event) => form.setPenyelenggara(event.target.value as Penyelenggara)}>
          {Object.values(Penyelenggara).map((value) => (
            <option key={value} value={value}>{penyelenggaraLabels[value]}</option>
          ))}
        </select>
      </div>
      <div>
        <span className={fieldLabel}>Jenis Sertifikasi</span>
        <select value={form.jenisSertifikasi} disabled={busy} className={selectClass}
          onChange={(event) => form.setJenisSertifikasi(event.target.value as JenisSertifikasi)}>
          {Object.values(JenisSertifikasi).map((value) => (
            <option key={value} value={value}>{jenisSertifikasiLabels[value]}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${id}-lokasi`}>Lokasi Pelaksanaan</Label>
        <Input id={`${id}-lokasi`} value={form.lokasi} disabled={busy}
          onChange={(event) => form.setLokasi(event.target.value)}
          placeholder="Contoh: Hotel Santika Bekasi / Headquarter Rojo" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${id}-catatan`}>Catatan</Label>
        <TextArea value={form.catatan} rows={2} disabled={busy}
          onChange={(value) => form.setCatatan(value)} placeholder="Catatan tambahan (opsional)" />
      </div>
    </div>
  );
};

export default InformasiKegiatanFields;
