import { getAllPelaksanaan } from "@/lib/data/get/getPelaksanaan";
import PelaksanaanList from "@/components/main/permohonan/PelaksanaanList";

export const metadata = {
  title: "Permohonan Pelatihan | Rojo Safety Admin",
  description: "Kelola daftar permohonan pelatihan.",
};

export default async function PermohonanPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    jenisSertifikasi?: string;
    jenisKegiatan?: string;
    penyelenggara?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page);

  const result = await getAllPelaksanaan({
    aktif: true,
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    limit: 10,
    search: params.search,
    jenisSertifikasi: params.jenisSertifikasi,
    jenisKegiatan: params.jenisKegiatan,
    penyelenggara: params.penyelenggara,
    status: params.status,
  });

  return (
    <div className="p-4 sm:p-6">
      <PelaksanaanList initialData={result.data} pagination={result.pagination} />
    </div>
  );
}
