import type { getPendaftaranKerja } from "@/lib/data/get/getPendaftaran";

export type PendaftaranKerjaData = NonNullable<Awaited<ReturnType<typeof getPendaftaranKerja>>>;
/** Satu pendaftaran perusahaan beserta PIC dan pesertanya. */
export type PendaftaranItemData = PendaftaranKerjaData["pendaftaran"][number];
/** Satu baris peserta (perusahaan maupun mandiri). */
export type PesertaItemData = PendaftaranKerjaData["pesertaPelaksanaan"][number];
