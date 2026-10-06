import type { Prisma } from "@/lib/generated/prisma/client"

// Tanggal sesi bertipe DATE; batas memakai tanggal kalender WIB dalam UTC.
export function whereKegiatanAktif(now = new Date()): Prisma.PelaksanaanWhereInput {
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000)
    const batas = new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate() - 7))
    return { OR: [{ sesi: { none: {} } }, { sesi: { some: { tanggal: { gte: batas } } } }] }
}
