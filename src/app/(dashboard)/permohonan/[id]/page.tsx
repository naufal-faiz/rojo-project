import { getPelaksanaanById } from "@/lib/data/get/getPelaksanaan";
import { notFound } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import ComponentCard from "@/components/main/common/ComponentCard";
import SesiManager from "@/components/main/permohonan/SesiManager";
import StatusTemanK3Panel from "@/components/main/permohonan/StatusTemanK3Panel";
import { Penyelenggara } from "@/lib/generated/prisma/enums";

const penyelenggaraLabels: Record<Penyelenggara, string> = {
  [Penyelenggara.WINA_KARYA_MULIA]: "Wina Karya Mulia",
  [Penyelenggara.DELTA_INDONESIA]: "Delta Indonesia",
  [Penyelenggara.LIMA_PRIMA_SOLUSINDO]: "Lima Prima (LPS)",
  [Penyelenggara.ARTA_KARYA_AREFAA]: "Arta Karya Arefaa",
  [Penyelenggara.LIK]: "LIK",
  [Penyelenggara.ITC]: "ITC",
};

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
      />

      {/* Info Utama */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Informasi Kegiatan</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Jenis Kegiatan</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{pelaksanaan.jenisKegiatan}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Tipe</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{pelaksanaan.tipePelaksanaan}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Penyelenggara</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{penyelenggaraLabels[pelaksanaan.penyelenggara]}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Jenis Sertifikasi</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{pelaksanaan.jenisSertifikasi}</dd>
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
      </div>

      {/* Status TemanK3 & Unggah Berkas */}
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

      {/* Sesi Pelaksanaan */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <SesiManager pelaksanaanId={pelaksanaan.id} sesiList={pelaksanaan.sesi} />
      </div>

      {/* Pendaftaran Perusahaan */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Pendaftaran Perusahaan</h3>
        {pelaksanaan.pendaftaran.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Belum ada perusahaan yang mendaftar.</p>
        ) : (
          <div className="space-y-3">
            {pelaksanaan.pendaftaran.map((p) => (
              <div key={p.id} className="p-3 border border-gray-100 rounded-lg flex justify-between items-center dark:border-gray-700">
                <div>
                  <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{p.perusahaan.nama}</p>
                  <p className="text-xs text-gray-500">PIC: {p.pic?.nama ?? "Belum ditentukan"} • {p.pesertaPelaksanaan.length} peserta</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Peserta Mandiri */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Peserta Mandiri</h3>
        {pelaksanaan.pesertaPelaksanaan.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Belum ada peserta mandiri.</p>
        ) : (
          <div className="space-y-2">
            {pelaksanaan.pesertaPelaksanaan.map((p) => (
              <div key={p.id} className="p-3 border border-gray-100 rounded-lg dark:border-gray-700">
                <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{p.peserta.nama}</p>
                <p className="text-xs text-gray-500">{p.status ?? "Belum ada hasil"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
