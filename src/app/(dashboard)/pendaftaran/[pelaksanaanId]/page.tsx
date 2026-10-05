import { notFound } from "next/navigation";
import { getPendaftaranKerja, getDeletedPendaftaran } from "@/lib/data/get/getPendaftaran";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/main/common/PageHeader";
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

  const [pelaksanaan, deleted, cabangOptions] = await Promise.all([
    getPendaftaranKerja(pelaksanaanId),
    getDeletedPendaftaran(pelaksanaanId),
    prisma.cabang.findMany({
      where: { deletedAt: null },
      include: { perusahaan: true },
      orderBy: { perusahaan: { nama: "asc" } },
    }),
  ]);

  if (!pelaksanaan) notFound();

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title={`Pendaftaran: ${pelaksanaan.noPermohonan ?? "Tanpa Nomor"}`}
        description={`${pelaksanaan.tingkatan.training.nama} - ${pelaksanaan.tingkatan.kelas}`}
        primaryAction={{
          label: "Lihat Permohonan",
          href: `/permohonan/${pelaksanaan.id}`,
        }}
      />

      <PendaftaranWork
        pelaksanaanId={pelaksanaan.id}
        pendaftaranList={pelaksanaan.pendaftaran}
        pesertaMandiri={pelaksanaan.pesertaPelaksanaan}
        deletedPendaftaran={deleted.pendaftaran}
        deletedPeserta={deleted.peserta}
        cabangOptions={cabangOptions}
      />
    </div>
  );
}
