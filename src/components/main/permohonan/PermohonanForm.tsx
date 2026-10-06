"use client";
import React from "react";
import Link from "next/link";
import PageHeader from "@/components/main/common/PageHeader";
import ComponentCard from "@/components/main/common/ComponentCard";
import FlashAlert from "@/components/main/common/FlashAlert";
import Button from "@/components/ui/button/Button";
import { ArrowRightIcon, CheckLineIcon, ChevronLeftIcon } from "@/icons/index";
import InformasiKegiatanFields from "./InformasiKegiatanFields";
import SesiPicker from "./SesiPicker";
import { usePermohonanForm } from "./usePermohonanForm";
import type { PermohonanUbahData } from "./permohonanTypes";

interface PermohonanFormProps {
  /** Data awal untuk mode ubah; kosong berarti buat baru. */
  initial?: PermohonanUbahData;
}

const PermohonanForm: React.FC<PermohonanFormProps> = ({ initial }) => {
  const form = usePermohonanForm(initial);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const kelola = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "kelola";
    void form.simpan(kelola ? "pendaftaran" : "detail");
  };

  return (
    <div className="text-gray-700 dark:text-gray-300">
      <PageHeader title={initial ? "Ubah Permohonan" : "Buat Permohonan"} backHref="/permohonan"
        description={initial
          ? "Perbarui informasi kegiatan dan jadwal sesinya."
          : "Isi informasi kegiatan dan seluruh tanggal sesi dalam satu halaman."} />
      <FlashAlert flash={form.flash.flash} onClose={form.flash.clear} />
      <form onSubmit={submit} className="space-y-6" aria-busy={form.busy}>
        <ComponentCard title="Informasi Kegiatan" desc="Status TemanK3 diatur dari halaman detail setelah data tersimpan.">
          <InformasiKegiatanFields form={form} />
        </ComponentCard>
        <ComponentCard title="Jadwal Sesi" desc="Satu chip per hari pelaksanaan. Boleh dikosongkan bila jadwal belum pasti.">
          <SesiPicker value={form.sesi} onChange={form.setSesi} onError={form.flash.showError} disabled={form.busy} />
        </ComponentCard>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" isLoading={form.busy} startIcon={<CheckLineIcon className="size-4" />}>Simpan</Button>
          <Button type="submit" value="kelola" size="sm" variant="outline" disabled={form.busy}
            startIcon={<ArrowRightIcon className="size-4" />}>Simpan &amp; Kelola Pendaftaran</Button>
          <Link href={initial ? `/permohonan/${initial.id}` : "/permohonan"}>
            <Button size="sm" variant="outline" disabled={form.busy} startIcon={<ChevronLeftIcon className="size-4" />}>Batal</Button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default PermohonanForm;
