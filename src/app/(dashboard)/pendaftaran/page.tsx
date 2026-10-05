import { getAllPendaftaran } from "@/lib/data/get/getPendaftaran";
import PendaftaranList from "@/components/main/pendaftaran/PendaftaranList";
import { JenisSertifikasi } from "@/lib/generated/prisma/enums";

export const metadata = {
  title: "Pendaftaran | Rojo Safety Admin",
  description: "Kelola perusahaan dan peserta yang ikut dalam setiap permohonan.",
};

export default async function PendaftaranPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; jenisSertifikasi?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page ?? 1);
  const search = resolvedParams?.search ?? "";

  const filterJenisSertifikasi = Object.values(JenisSertifikasi).find(
    (jenis) => jenis === resolvedParams?.jenisSertifikasi
  );

  const result = await getAllPendaftaran({
    page,
    limit: 10,
    search,
    jenisSertifikasi: filterJenisSertifikasi,
  });

  return (
    <div className="p-4 sm:p-6">
      <PendaftaranList initialData={result.data} pagination={result.pagination} />
    </div>
  );
}
