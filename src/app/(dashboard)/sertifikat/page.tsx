import {
  getAllSertifikat,
  getOpsiKegiatanSertifikat,
  FilterStatusHasil,
} from "@/lib/data/get/getSertifikat";
import SertifikatList from "@/components/main/sertifikat/SertifikatList";
import { JenisSertifikasi, StatusPeserta } from "@/lib/generated/prisma/enums";

export const metadata = {
  title: "Sertifikat | Rojo Safety Admin",
  description: "Isi hasil peserta dan data sertifikat per kegiatan.",
};

export default async function SertifikatPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    pelaksanaanId?: string;
    jenisSertifikasi?: string;
    status?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page ?? 1);
  const search = resolvedParams?.search ?? "";
  const pelaksanaanId = resolvedParams?.pelaksanaanId || undefined;

  const filterJenisSertifikasi = Object.values(JenisSertifikasi).find(
    (jenis) => jenis === resolvedParams?.jenisSertifikasi
  );

  const filterStatus: FilterStatusHasil | undefined =
    resolvedParams?.status === "BELUM"
      ? "BELUM"
      : Object.values(StatusPeserta).find((status) => status === resolvedParams?.status);

  const [result, kegiatanOptions] = await Promise.all([
    getAllSertifikat({
      page,
      limit: 10,
      search,
      pelaksanaanId,
      jenisSertifikasi: filterJenisSertifikasi,
      status: filterStatus,
    }),
    getOpsiKegiatanSertifikat(),
  ]);

  return (
    <div className="p-4 sm:p-6">
      <SertifikatList
        initialData={result.data}
        pagination={result.pagination}
        kegiatanOptions={kegiatanOptions}
      />
    </div>
  );
}
