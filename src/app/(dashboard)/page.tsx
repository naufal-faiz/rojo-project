import { getDashboardData } from "@/lib/data/get/getDashboard";
import PageHeader from "@/components/main/common/PageHeader";
import DashboardStatGrid from "@/components/main/dashboard/DashboardStatGrid";
import DashboardKegiatanList from "@/components/main/dashboard/DashboardKegiatanList";

export const metadata = {
  title: "Dashboard | Rojo Safety Admin",
  description: "Ringkasan kegiatan pembinaan dan sertifikasi K3.",
};

// Dashboard selalu menampilkan data terbaru dari database.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan kegiatan pembinaan dan sertifikasi K3 Rojo Safety."
      />

      <DashboardStatGrid stats={data.stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardKegiatanList
          title="5 Kegiatan Terdekat"
          emptyText="Belum ada sesi mendatang."
          items={data.kegiatanTerdekat}
        />
        <DashboardKegiatanList
          title="5 Kegiatan Terakhir"
          emptyText="Belum ada kegiatan yang selesai."
          items={data.kegiatanTerakhir}
        />
      </div>
    </div>
  );
}
