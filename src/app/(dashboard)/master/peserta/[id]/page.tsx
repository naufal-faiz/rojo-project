import { notFound } from "next/navigation";
import { getPesertaById } from "@/lib/data/get/getPeserta";
import PesertaDetail from "@/components/main/peserta/PesertaDetail";

export const metadata = { title: "Detail Peserta | Rojo Safety Admin" };

export default async function PesertaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const peserta = await getPesertaById(id);

  if (!peserta) notFound();

  return <PesertaDetail key={id} data={peserta} />;
}
