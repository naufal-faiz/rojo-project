import type { Prisma } from "@/lib/generated/prisma/client"
import { KELAS_UMUM } from "@/lib/tingkatan"

// Dipanggil dalam transaksi serializable agar dua permohonan tidak membuat kelas ganda.
export async function ensureTingkatanUmum(tx: Prisma.TransactionClient, trainingId: string) {
    const training = await tx.training.findUnique({ where: { id: trainingId, deletedAt: null } })
    if (!training) throw new Error("Training tidak ditemukan atau sudah dihapus.")
    const tingkatan = await tx.tingkatan.findMany({ where: { trainingId, deletedAt: null } })
    const umum = tingkatan.find((item) => item.kelas === KELAS_UMUM)
    if (tingkatan.some((item) => item.kelas !== KELAS_UMUM)) throw new Error("Pilih tingkatan untuk training ini.")
    return umum ?? tx.tingkatan.create({ data: { trainingId, kelas: KELAS_UMUM } })
}
