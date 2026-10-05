import { getAllPerusahaan, getDeletedPerusahaan } from "@/lib/data/get/getPerusahaan";
import PerusahaanList from "@/components/main/perusahaan/PerusahaanList";

export const metadata = {
  title: "Master Perusahaan | Rojo Safety Admin",
  description: "Kelola data Perusahaan, Cabang, dan PIC untuk pendaftaran kegiatan.",
};

export default async function PerusahaanPage() {
  const [activeResult, deletedResult] = await Promise.all([
    getAllPerusahaan({ limit: 100 }),
    getDeletedPerusahaan({ limit: 100 })
  ]);

  return (
    <div className="p-4 sm:p-6">
      <PerusahaanList 
        initialData={activeResult.data} 
        deletedData={deletedResult.data}
      />
    </div>
  );
}
