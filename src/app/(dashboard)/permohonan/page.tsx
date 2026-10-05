import { getAllPelaksanaan, getDeletedPelaksanaan } from "@/lib/data/get/getPelaksanaan";
import { prisma } from "@/lib/prisma";
import PelaksanaanList from "@/components/main/permohonan/PelaksanaanList";

export const metadata = {
  title: "Permohonan Pelatihan | Rojo Safety Admin",
  description: "Kelola daftar permohonan pelatihan.",
};

export default async function PermohonanPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page ?? 1);
  const search = resolvedParams?.search ?? "";

  const [activeResult, deletedResult, tingkatanOptions] = await Promise.all([
    getAllPelaksanaan({ page, limit: 10, search }),
    getDeletedPelaksanaan({ search }),
    prisma.tingkatan.findMany({
      where: { deletedAt: null },
      include: { training: true },
    }),
  ]);

  return (
    <div className="p-4 sm:p-6">
      <PelaksanaanList
        initialData={activeResult.data}
        deletedData={deletedResult.data}
        tingkatanOptions={tingkatanOptions}
        pagination={activeResult.pagination}
      />
    </div>
  );
}
