import { getAllPeserta, getDeletedPeserta } from "@/lib/data/get/getPeserta";
import { prisma } from "@/lib/prisma";
import PesertaList from "@/components/main/peserta/PesertaList";

export const metadata = {
  title: "Master Peserta | Rojo Safety Admin",
  description: "Kelola data peserta pelatihan.",
};

export default async function PesertaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page ?? 1);
  const search = resolvedParams?.search ?? "";

  const [activeResult, deletedResult, cabangOptions] = await Promise.all([
    getAllPeserta({ page, limit: 10, search }),
    getDeletedPeserta({ search }),
    prisma.cabang.findMany({
      where: { deletedAt: null },
      include: { perusahaan: true },
      orderBy: { perusahaan: { nama: "asc" } },
    }),
  ]);

  return (
    <div className="p-4 sm:p-6">
      <PesertaList
        initialData={activeResult.data}
        deletedData={deletedResult.data}
        cabangOptions={cabangOptions}
        pagination={activeResult.pagination}
      />
    </div>
  );
}
