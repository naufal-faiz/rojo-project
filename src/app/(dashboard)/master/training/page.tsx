import { getAllTrainings } from "@/lib/data/get/getTraining";
import TrainingList from "@/components/main/training/TrainingList";
export const metadata = { title: "Master Pelatihan | Rojo Safety Admin" };
export default async function TrainingPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; tingkatan?: string }> }) {
  const params = await searchParams;
  const result = await getAllTrainings({ page: Number(params.page) || 1, search: params.search, tingkatan: params.tingkatan });
  return <div className="p-4 sm:p-6"><TrainingList initialData={result.data} pagination={result.pagination} /></div>;
}
