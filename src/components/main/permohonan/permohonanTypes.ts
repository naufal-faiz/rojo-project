import type { getPelaksanaanById } from "@/lib/data/get/getPelaksanaan";

/** Data permohonan lengkap untuk mode ubah (hasil getPelaksanaanById). */
export type PermohonanUbahData = NonNullable<Awaited<ReturnType<typeof getPelaksanaanById>>>;
