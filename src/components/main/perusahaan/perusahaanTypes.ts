import type { getPerusahaanDetail } from "@/lib/data/get/getPerusahaanDetail";
import type useFlash from "@/components/main/common/useFlash";

export type PerusahaanDetailData = NonNullable<Awaited<ReturnType<typeof getPerusahaanDetail>>>;
export type CabangOption = PerusahaanDetailData["perusahaan"]["cabang"][number];
export type CabangData = PerusahaanDetailData["cabang"]["data"][number];
export type PicData = PerusahaanDetailData["perusahaan"]["perusahaanPic"][number]["pic"];
export type PesertaData = PerusahaanDetailData["peserta"]["data"][number];
export interface PerusahaanPanelProps {
  /** Semua panel memakai notifikasi dan satu konfirmasi milik halaman detail. */
  perusahaanId: string;
  flash: ReturnType<typeof useFlash>;
  confirmId: string | null;
  setConfirmId: (id: string | null) => void;
}
export const companySelectClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300";
