"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { TipeCabang } from "@/lib/generated/prisma/enums"

// ────────────────────────────────────
// CABANG ACTIONS
// ────────────────────────────────────

export async function createCabang(perusahaanId: string, data: { nama: string; tipe: TipeCabang; alamat?: string }) {
    const trimmedNama = data.nama?.trim()
    if (!trimmedNama) {
        return { success: false, error: "Nama cabang wajib diisi." }
    }

    try {
        if (data.tipe === TipeCabang.HQ || !Object.values(TipeCabang).includes(data.tipe)) {
            return { success: false, error: "Cabang tambahan hanya boleh bertipe Cabang atau Depot." }
        }
        // Cek parent perusahaan aktif
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { id: perusahaanId, deletedAt: null }
        })
        if (!perusahaan) {
            return { success: false, error: "Perusahaan induk tidak ditemukan atau sudah dihapus." }
        }

        await prisma.cabang.create({
            data: {
                perusahaanId,
                nama: trimmedNama,
                tipe: data.tipe,
                alamat: data.alamat?.trim() || null
            }
        })

        revalidatePath("/master/perusahaan")
        revalidatePath(`/master/perusahaan/${perusahaanId}`)
        return { success: true }
    } catch (err) {
        console.error("Gagal membuat cabang:", err)
        return { success: false, error: "Gagal menyimpan data cabang." }
    }
}

export async function updateCabang(id: string, data: { nama: string; tipe: TipeCabang; alamat?: string }) {
    const trimmedNama = data.nama?.trim()
    if (!trimmedNama) {
        return { success: false, error: "Nama cabang wajib diisi." }
    }

    try {
        const cabang = await prisma.$transaction(async (tx) => {
        const existing = await tx.cabang.findFirst({ where: { id, deletedAt: null, perusahaan: { deletedAt: null } } })
        if (!existing) throw new Error("Cabang aktif tidak ditemukan.")
        if (!Object.values(TipeCabang).includes(data.tipe) ||
            (existing.tipe === TipeCabang.HQ) !== (data.tipe === TipeCabang.HQ)) {
            throw new Error("Tipe cabang HQ tidak dapat diubah atau ditetapkan pada cabang lain.")
        }
        return tx.cabang.update({
            where: { id, deletedAt: null },
            data: {
                nama: trimmedNama,
                tipe: data.tipe,
                alamat: data.alamat?.trim() || null
            }
        })
        })

        revalidatePath("/master/perusahaan")
        revalidatePath(`/master/perusahaan/${cabang.perusahaanId}`)
        return { success: true }
    } catch (err) {
        console.error("Gagal memperbarui cabang:", err)
        return { success: false, error: err instanceof Error ? err.message : "Gagal memperbarui data cabang." }
    }
}

export async function deleteCabang(id: string) {
    try {
        const perusahaanId = await prisma.$transaction(async (tx) => {
        const cabang = await tx.cabang.findUnique({
            where: { id, deletedAt: null },
            include: { perusahaan: { select: { deletedAt: true } } }
        })

        if (!cabang) {
            throw new Error("Cabang tidak ditemukan.")
        }

        // HQ tidak boleh dihapus selama perusahaan aktif
        if (cabang.tipe === TipeCabang.HQ && cabang.perusahaan.deletedAt === null) {
            throw new Error("Cabang HQ (Headquarter) tidak dapat dihapus selama perusahaan aktif.")
        }

        // Cek peserta aktif di cabang ini
        const pesertaCount = await tx.peserta.count({
            where: { perusahaanCabangId: id, deletedAt: null }
        })

        if (pesertaCount > 0) {
            throw new Error(`Tidak dapat menghapus: cabang ini memiliki ${pesertaCount} peserta aktif.`)
        }

        await tx.cabang.update({
            where: { id },
            data: { deletedAt: new Date() }
        })
        return cabang.perusahaanId
        }, { isolationLevel: "Serializable" })

        revalidatePath("/master/perusahaan")
        revalidatePath(`/master/perusahaan/${perusahaanId}`)
        return { success: true }
    } catch (err) {
        console.error("Gagal menghapus cabang:", err)
        return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus cabang." }
    }
}
