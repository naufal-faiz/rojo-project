import { notFound } from "next/navigation";
import { getPelaksanaanById } from "@/lib/data/get/getPelaksanaan";
import PermohonanDetail from "@/components/main/permohonan/PermohonanDetail";

export const metadata = { title: "Detail Permohonan | Rojo Safety Admin" };

export default async function PermohonanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pelaksanaan = await getPelaksanaanById(id);

  if (!pelaksanaan) notFound();

  return <PermohonanDetail key={id} data={pelaksanaan} />;
}
