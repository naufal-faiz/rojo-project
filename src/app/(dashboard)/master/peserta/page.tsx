import { getAllPeserta, getPerusahaanFilterOption } from "@/lib/data/get/getPeserta";
import PesertaList from "@/components/main/peserta/PesertaList";

export const metadata = {
  title: "Master Peserta | Rojo Safety Admin",
  description: "Kelola data peserta pelatihan.",
};

export default async function PesertaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; perusahaan?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page);
  const perusahaanId = params.perusahaan;
  const [result, filterPerusahaan] = await Promise.all([
    getAllPeserta({
      page: Number.isSafeInteger(page) && page > 0 ? page : 1,
      limit: 10,
      search: params.search,
      perusahaanId,
      tanpaPerusahaan: params.filter === "tanpaPerusahaan",
    }),
    perusahaanId ? getPerusahaanFilterOption(perusahaanId) : Promise.resolve(null),
  ]);

  return (
    <div className="p-4 sm:p-6">
      <PesertaList
        initialData={result.data}
        pagination={result.pagination}
        filterPerusahaan={filterPerusahaan}
      />
    </div>
  );
}
