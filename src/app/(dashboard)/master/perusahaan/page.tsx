import { getAllPerusahaan } from "@/lib/data/get/getPerusahaan";
import PerusahaanList from "@/components/main/perusahaan/PerusahaanList";

export const metadata = {
  title: "Master Perusahaan | Rojo Safety Admin",
  description: "Kelola data Perusahaan, Cabang, dan PIC untuk pendaftaran kegiatan.",
};

export default async function PerusahaanPage({ searchParams }: {
  searchParams: Promise<{ search?: string; filter?: string; page?: string }>;
}) {
  const query = await searchParams;
  const page = Number(query.page);
  const activeResult = await getAllPerusahaan({ search: query.search, filter: query.filter,
    page: Number.isSafeInteger(page) && page > 0 ? page : 1 });

  return (
    <div className="p-4 sm:p-6">
      <PerusahaanList 
        initialData={activeResult.data} 
        pagination={activeResult.pagination}
      />
    </div>
  );
}
