import { getRiwayatKegiatan, getOpsiTahunRiwayat } from "@/lib/data/get/getRiwayatKegiatan";
import RiwayatKegiatanList from "@/components/main/riwayat-kegiatan/RiwayatKegiatanList";
import { JenisKegiatan, JenisSertifikasi, Penyelenggara } from "@/lib/generated/prisma/enums";

export const metadata = {
  title: "Riwayat Kegiatan | Rojo Safety Admin",
  description: "Daftar permohonan yang seluruh sesinya sudah selesai.",
};

export default async function RiwayatKegiatanPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    tahun?: string;
    penyelenggara?: string;
    jenisSertifikasi?: string;
    jenisKegiatan?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page ?? 1);
  const search = resolvedParams?.search ?? "";
  const tahun = Number(resolvedParams?.tahun) || undefined;

  const [result, tahunOptions] = await Promise.all([
    getRiwayatKegiatan({
      page,
      limit: 10,
      search,
      tahun,
      penyelenggara: Object.values(Penyelenggara).find(
        (nilai) => nilai === resolvedParams?.penyelenggara
      ),
      jenisSertifikasi: Object.values(JenisSertifikasi).find(
        (nilai) => nilai === resolvedParams?.jenisSertifikasi
      ),
      jenisKegiatan: Object.values(JenisKegiatan).find(
        (nilai) => nilai === resolvedParams?.jenisKegiatan
      ),
    }),
    getOpsiTahunRiwayat(),
  ]);

  return (
    <div className="p-4 sm:p-6">
      <RiwayatKegiatanList
        initialData={result.data}
        pagination={result.pagination}
        tahunOptions={tahunOptions}
      />
    </div>
  );
}
