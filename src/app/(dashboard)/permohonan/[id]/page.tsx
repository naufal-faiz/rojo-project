import { getPelaksanaanById } from "@/lib/data/get/getPelaksanaan";
import { notFound } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import ComponentCard from "@/components/main/common/ComponentCard";
import StatusBadge from "@/components/main/common/StatusBadge";
import SesiManager from "@/components/main/permohonan/SesiManager";
import StatusTemanK3Panel from "@/components/main/permohonan/StatusTemanK3Panel";
import {
  jenisKegiatanLabels,
  jenisSertifikasiLabels,
  penyelenggaraLabels,
  tipePelaksanaanLabels,
} from "@/components/main/common/enumLabels";

export default async function PermohonanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pelaksanaan = await getPelaksanaanById(id);

  if (!pelaksanaan) notFound();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title={`Permohonan: ${pelaksanaan.noPermohonan ?? "Tanpa Nomor"}`}
        description={`${pelaksanaan.tingkatan.training.nama} - ${pelaksanaan.tingkatan.kelas}`}
        primaryAction={{
          label: "Kelola Pendaftaran",
          href: `/pendaftaran/${pelaksanaan.id}`,
        }}
      />

      <ComponentCard title="Informasi Kegiatan">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Jenis Kegiatan</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{jenisKegiatanLabels[pelaksanaan.jenisKegiatan]}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Tipe</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{tipePelaksanaanLabels[pelaksanaan.tipePelaksanaan]}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Penyelenggara</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{penyelenggaraLabels[pelaksanaan.penyelenggara]}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Jenis Sertifikasi</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{jenisSertifikasiLabels[pelaksanaan.jenisSertifikasi]}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Lokasi</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{pelaksanaan.lokasi ?? "-"}</dd>
          </div>
          {pelaksanaan.catatan && (
            <div className="sm:col-span-3">
              <dt className="text-gray-500">Catatan</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-200">{pelaksanaan.catatan}</dd>
            </div>
          )}
        </dl>
      </ComponentCard>

      <ComponentCard
        title="Status TemanK3 & Unggah Berkas"
        desc="Catat status permohonan ke TemanK3 beserta tanggal unggah berkas."
      >
        <StatusTemanK3Panel
          pelaksanaanId={pelaksanaan.id}
          status={pelaksanaan.status}
          uploadedAt={pelaksanaan.uploadedAt}
          jenisSertifikasi={pelaksanaan.jenisSertifikasi}
        />
      </ComponentCard>

      <ComponentCard
        title="Jadwal Sesi"
        desc="Satu baris per hari pelaksanaan. Tanggal libur tidak perlu dicatat terpisah."
      >
        <SesiManager pelaksanaanId={pelaksanaan.id} sesiList={pelaksanaan.sesi} />
      </ComponentCard>

      <ComponentCard
        title="Pendaftaran Perusahaan"
        desc="Ringkasan read-only. Kelola pendaftaran dari halaman Pendaftaran."
      >
        {pelaksanaan.pendaftaran.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada perusahaan yang mendaftar.</p>
        ) : (
          <div className="space-y-3">
            {pelaksanaan.pendaftaran.map((p) => (
              <div key={p.id} className="p-3 border border-gray-100 rounded-lg dark:border-gray-700">
                <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{p.perusahaan.nama}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PIC: {p.pic?.nama ?? "Belum ditentukan"} • {p.pesertaPelaksanaan.length} peserta
                </p>
              </div>
            ))}
          </div>
        )}
      </ComponentCard>

      <ComponentCard title="Peserta Mandiri">
        {pelaksanaan.pesertaPelaksanaan.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada peserta mandiri.</p>
        ) : (
          <div className="space-y-2">
            {pelaksanaan.pesertaPelaksanaan.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 border border-gray-100 rounded-lg dark:border-gray-700"
              >
                <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{p.peserta.nama}</p>
                {p.status ? (
                  <StatusBadge status={p.status} size="sm" />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500 italic">Belum ada hasil</span>
                )}
              </div>
            ))}
          </div>
        )}
      </ComponentCard>
    </div>
  );
}
