import { getPesertaById } from "@/lib/data/get/getPeserta";
import { notFound } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import Badge from "@/components/ui/badge/Badge";

export default async function PesertaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const peserta = await getPesertaById(id);

  if (!peserta) notFound();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title={peserta.nama}
        description="Detail data peserta dan riwayat kegiatan."
      />

      {/* Info Utama */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Informasi Dasar</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Perusahaan</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">
              {peserta.cabang?.perusahaan.nama ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Cabang</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">
              {peserta.cabang?.nama ?? "-"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Riwayat Kegiatan */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Riwayat Kegiatan</h3>
        {peserta.pesertaPelaksanaan.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada riwayat kegiatan.</p>
        ) : (
          <div className="space-y-3">
            {peserta.pesertaPelaksanaan.map((item) => (
              <div key={item.id} className="p-3 border border-gray-100 rounded-lg dark:border-gray-700 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                    Kegiatan Pelatihan
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.pendaftaranPerusahaan?.pelaksanaan?.sesi?.[0]?.tanggal
                      ? new Date(item.pendaftaranPerusahaan.pelaksanaan.sesi[0].tanggal).toLocaleDateString("id-ID")
                      : "-"}
                  </p>
                </div>
                <Badge color={item.status === "LULUS" ? "success" : "light"}>
                  {item.status ?? "Proses"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
