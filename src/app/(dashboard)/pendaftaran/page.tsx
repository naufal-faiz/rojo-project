import { getAllPendaftaran } from "@/lib/data/get/getPendaftaran";
import PendaftaranList from "@/components/main/pendaftaran/PendaftaranList";

export const metadata = {
  title: "Pendaftaran | Rojo Safety Admin",
  description: "Kelola perusahaan dan peserta yang ikut dalam setiap permohonan.",
};

export default async function PendaftaranPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    jenisSertifikasi?: string;
    jenisKegiatan?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page);

  const result = await getAllPendaftaran({
    aktif: true,
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    limit: 10,
    search: params.search,
    jenisSertifikasi: params.jenisSertifikasi,
    jenisKegiatan: params.jenisKegiatan,
  });

  return (
    <div className="p-4 sm:p-6">
      <PendaftaranList initialData={result.data} pagination={result.pagination} />
    </div>
  );
}
