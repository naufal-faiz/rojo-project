import { getAllPerusahaan } from "@/lib/data/get/getPerusahaan";
import PerusahaanList from "@/components/main/perusahaan/PerusahaanList";

export const metadata = {
  title: "Master Perusahaan | Rojo Safety Admin",
  description: "Kelola data Perusahaan, Cabang, dan PIC untuk pendaftaran kegiatan.",
};

export default async function PerusahaanPage() {
  const activeResult = await getAllPerusahaan({ limit: 100 });

  return (
    <div className="p-4 sm:p-6">
      <PerusahaanList 
        initialData={activeResult.data} 
      />
    </div>
  );
}
