import { notFound } from "next/navigation";
import { getPerusahaanDetail, PerusahaanDetailQuery } from "@/lib/data/get/getPerusahaanDetail";
import PerusahaanDetail from "@/components/main/perusahaan/PerusahaanDetail";

export const metadata = { title: "Detail Perusahaan | Rojo Safety Admin" };

export default async function PerusahaanDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<PerusahaanDetailQuery>;
}) {
  const { id } = await params;
  const data = await getPerusahaanDetail(id, await searchParams);
  if (!data) notFound();
  return <PerusahaanDetail key={id} data={data} />;
}
