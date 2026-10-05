"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { TipePic } from "@/lib/generated/prisma/enums"

// ────────────────────────────────────
// PIC ACTIONS
// ────────────────────────────────────

export async function createPicAndLink(perusahaanId: string, data: { nama: string; noTelp?: string; tipe: TipePic }) {
    const trimmedNama = data.nama?.trim()
    if (!trimmedNama) {
        return { success: false, error: "Nama PIC wajib diisi." }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Buat PIC
            const pic = await tx.pic.create({
                data: {
                    nama: trimmedNama,
                    noTelp: data.noTelp?.trim() || null,
                    tipe: data.tipe
                }
            })

            // 2. Hubungkan ke perusahaan (PerusahaanPic)
            await tx.perusahaanPic.create({
                data: {
                    perusahaanId,
                    picId: pic.id
                }
            })
        })

        revalidatePath("/master/perusahaan")
        revalidatePath(`/master/perusahaan/${perusahaanId}`)
        return { success: true }
    } catch (err) {
        console.error("Gagal membuat PIC:", err)
        return { success: false, error: "Gagal menyimpan data PIC." }
    }
}

export async function deletePic(id: string) {
    try {
        // Cek turunan: PIC masih dipakai pendaftaran perusahaan aktif.
        const pendaftaranCount = await prisma.pendaftaranPerusahaan.count({
            where: { picId: id, deletedAt: null }
        })

        if (pendaftaranCount > 0) {
            return {
                success: false,
                error: `Tidak dapat menghapus: PIC ini dipakai di ${pendaftaranCount} pendaftaran aktif.`
            }
        }

        await prisma.pic.update({
            where: { id, deletedAt: null },
            data: { deletedAt: new Date() }
        })

        revalidatePath("/master/perusahaan")
        return { success: true }
    } catch (err) {
        console.error("Gagal menghapus PIC:", err)
        return { success: false, error: "Gagal menghapus PIC." }
    }
}

export async function unlinkPic(perusahaanId: string, picId: string) {
    try {
        await prisma.perusahaanPic.deleteMany({
            where: { perusahaanId, picId }
        })

        revalidatePath("/master/perusahaan")
        revalidatePath(`/master/perusahaan/${perusahaanId}`)
        return { success: true }
    } catch (err) {
        console.error("Gagal melepas PIC:", err)
        return { success: false, error: "Gagal melepas kontak PIC." }
    }
}

export async function searchAvailableMasterPic(search: string) {
    try {
        const where = {
            deletedAt: null,
            ...(search ? {
                OR: [
                    { nama: { contains: search, mode: "insensitive" as const } },
                    { noTelp: { contains: search, mode: "insensitive" as const } }
                ]
            } : {})
        }

        const data = await prisma.pic.findMany({
            where,
            orderBy: { nama: "asc" },
            take: 20
        })

        return { data }
    } catch (err) {
        console.error("Gagal mencari PIC di master:", err)
        return { data: [] }
    }
}

export async function linkPic(perusahaanId: string, picId: string) {
    try {
        const existing = await prisma.perusahaanPic.findFirst({
            where: { perusahaanId, picId }
        })

        if (existing) {
            return { success: false, error: "PIC ini sudah terhubung ke perusahaan." }
        }

        await prisma.perusahaanPic.create({
            data: { perusahaanId, picId }
        })

        revalidatePath("/master/perusahaan")
        revalidatePath(`/master/perusahaan/${perusahaanId}`)
        return { success: true }
    } catch (err) {
        console.error("Gagal menghubungkan PIC:", err)
        return { success: false, error: "Gagal menghubungkan PIC ke perusahaan." }
    }
}

export async function searchPic(search: string, perusahaanId: string) {
    try {
        // Logika lama: cari yang BELUM terhubung
        const linkedPicIds = await prisma.perusahaanPic.findMany({
            where: { perusahaanId },
            select: { picId: true }
        }).then(items => items.map(i => i.picId))

        const where = {
            deletedAt: null,
            NOT: {
                id: { in: linkedPicIds }
            },
            ...(search ? {
                OR: [
                    { nama: { contains: search, mode: "insensitive" as const } },
                    { noTelp: { contains: search, mode: "insensitive" as const } }
                ]
            } : {})
        }

        const data = await prisma.pic.findMany({
            where,
            orderBy: { nama: "asc" },
            take: 10
        })

        return { data, hasMore: data.length >= 10 }
    } catch (err) {
        console.error("Gagal mencari PIC:", err)
        return { data: [], hasMore: false }
    }
}
