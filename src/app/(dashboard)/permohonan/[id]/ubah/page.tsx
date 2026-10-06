import { notFound } from "next/navigation";
import { getPelaksanaanById } from "@/lib/data/get/getPelaksanaan";
import PermohonanForm from "@/components/main/permohonan/PermohonanForm";

export const metadata = { title: "Ubah Permohonan | Rojo Safety Admin" };

export default async function PermohonanUbahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pelaksanaan = await getPelaksanaanById(id);

  if (!pelaksanaan) notFound();

  return (
    <div className="p-4 sm:p-6">
      <PermohonanForm key={id} initial={pelaksanaan} />
    </div>
  );
}
