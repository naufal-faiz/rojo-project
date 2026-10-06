import { notFound } from "next/navigation";
import { getPendaftaranKerja } from "@/lib/data/get/getPendaftaran";
import PageHeader from "@/components/main/common/PageHeader";
import { labelTingkatan } from "@/components/main/common/enumLabels";
import PendaftaranWork from "@/components/main/pendaftaran/PendaftaranWork";

export const metadata = {
  title: "Kelola Pendaftaran | Rojo Safety Admin",
  description: "Kelola pendaftaran perusahaan dan peserta untuk satu permohonan.",
};

export default async function PendaftaranKerjaPage({
  params,
}: {
  params: Promise<{ pelaksanaanId: string }>;
}) {
  const { pelaksanaanId } = await params;
  const pelaksanaan = await getPendaftaranKerja(pelaksanaanId);

  if (!pelaksanaan) notFound();

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title={`Pendaftaran: ${pelaksanaan.noPermohonan ?? "Tanpa Nomor"}`}
        description={labelTingkatan(pelaksanaan.tingkatan)}
        primaryAction={{ label: "Lihat Permohonan", href: `/permohonan/${pelaksanaan.id}` }}
      />
      <PendaftaranWork
        pelaksanaanId={pelaksanaan.id}
        pendaftaranList={pelaksanaan.pendaftaran}
        pesertaMandiri={pelaksanaan.pesertaPelaksanaan}
      />
    </div>
  );
}
