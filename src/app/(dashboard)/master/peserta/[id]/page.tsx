import { getPesertaById } from "@/lib/data/get/getPeserta";
import { notFound } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import ComponentCard from "@/components/main/common/ComponentCard";
import StatusBadge from "@/components/main/common/StatusBadge";
import { formatDaftarSesi } from "@/components/main/common/formatTanggal";

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

      <ComponentCard title="Informasi Dasar">
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
      </ComponentCard>

      <ComponentCard
        title="Riwayat Kegiatan"
        desc="Kegiatan yang pernah diikuti peserta, termasuk sebagai peserta mandiri."
      >
        {peserta.pesertaPelaksanaan.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">Belum ada riwayat kegiatan.</p>
        ) : (
          <div className="space-y-3">
            {peserta.pesertaPelaksanaan.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 border border-gray-100 rounded-lg dark:border-gray-700"
              >
                <div>
                  <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                    {item.pelaksanaan.tingkatan.training.nama} - {item.pelaksanaan.tingkatan.kelas}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDaftarSesi(item.pelaksanaan.sesi)} •{" "}
                    {item.pendaftaranPerusahaan?.perusahaan.nama ?? "Peserta mandiri"}
                  </p>
                </div>
                {item.status ? (
                  <StatusBadge status={item.status} size="sm" />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500 italic">Belum ada hasil</span>
                )}
              </div>
            ))}
          </div>
        )}
      </ComponentCard>
    </div>
  );
}
