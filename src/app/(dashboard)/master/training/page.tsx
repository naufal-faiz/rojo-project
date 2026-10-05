import { getAllTrainings, getDeletedTrainings } from "@/lib/data/get/getTraining";
import TrainingList from "@/components/main/training/TrainingList";

export const metadata = {
  title: "Master Pelatihan | Rojo Safety Admin",
  description: "Kelola data Training dan Tingkatan untuk permohonan sertifikasi.",
};

export default async function TrainingPage() {
  const [activeResult, deletedResult] = await Promise.all([
    getAllTrainings({ limit: 100 }),
    getDeletedTrainings({ limit: 100 })
  ]);

  return (
    <div className="p-4 sm:p-6">
      <TrainingList 
        initialData={activeResult.data} 
        deletedData={deletedResult.data}
      />
    </div>
  );
}
