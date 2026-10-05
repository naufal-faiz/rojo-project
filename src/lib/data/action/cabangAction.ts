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
        const cabang = await prisma.cabang.update({
            where: { id, deletedAt: null },
            data: {
                nama: trimmedNama,
                tipe: data.tipe,
                alamat: data.alamat?.trim() || null
            }
        })

        revalidatePath("/master/perusahaan")
        revalidatePath(`/master/perusahaan/${cabang.perusahaanId}`)
        return { success: true }
    } catch (err) {
        console.error("Gagal memperbarui cabang:", err)
        return { success: false, error: "Gagal memperbarui data cabang." }
    }
}

export async function deleteCabang(id: string) {
    try {
        const cabang = await prisma.cabang.findUnique({
            where: { id, deletedAt: null },
            include: { perusahaan: { select: { deletedAt: true } } }
        })

        if (!cabang) {
            return { success: false, error: "Cabang tidak ditemukan." }
        }

        // HQ tidak boleh dihapus selama perusahaan aktif
        if (cabang.tipe === TipeCabang.HQ && cabang.perusahaan.deletedAt === null) {
            return { success: false, error: "Cabang HQ (Headquarter) tidak dapat dihapus selama perusahaan aktif." }
        }

        // Cek peserta aktif di cabang ini
        const pesertaCount = await prisma.peserta.count({
            where: { perusahaanCabangId: id, deletedAt: null }
        })

        if (pesertaCount > 0) {
            return { success: false, error: `Tidak dapat menghapus: cabang ini memiliki ${pesertaCount} peserta aktif.` }
        }

        await prisma.cabang.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        revalidatePath("/master/perusahaan")
        revalidatePath(`/master/perusahaan/${cabang.perusahaanId}`)
        return { success: true }
    } catch (err) {
        console.error("Gagal menghapus cabang:", err)
        return { success: false, error: "Gagal menghapus cabang." }
    }
}
