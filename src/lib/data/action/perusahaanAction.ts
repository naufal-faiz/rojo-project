"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { TipeCabang } from "@/lib/generated/prisma/enums"

// ────────────────────────────────────
// PERUSAHAAN ACTIONS
// ────────────────────────────────────

export async function checkDuplicatePerusahaan(nama: string) {
    const trimmed = nama?.trim()
    if (!trimmed) return { exists: false }
    try {
        const existing = await prisma.perusahaan.findFirst({
            where: {
                nama: { contains: trimmed, mode: "insensitive" },
                deletedAt: null
            }
        })
        return { exists: Boolean(existing), existingName: existing?.nama }
    } catch {
        return { exists: false }
    }
}

export async function createPerusahaan(data: { nama: string; alamatLegal?: string }) {
    const trimmedNama = data.nama?.trim()
    if (!trimmedNama) {
        return { success: false, error: "Nama perusahaan wajib diisi." }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Buat perusahaan
            const perusahaan = await tx.perusahaan.create({
                data: {
                    nama: trimmedNama,
                    alamatLegal: data.alamatLegal?.trim() || null
                }
            })

            // 2. Otomatis buat 1 cabang bertipe HQ
            await tx.cabang.create({
                data: {
                    perusahaanId: perusahaan.id,
                    nama: "Headquarter (HQ)",
                    tipe: TipeCabang.HQ,
                    alamat: data.alamatLegal?.trim() || null
                }
            })
        })

        revalidatePath("/master/perusahaan")
        return { success: true }
    } catch (err) {
        console.error("Gagal membuat perusahaan:", err)
        return { success: false, error: "Gagal menyimpan data perusahaan." }
    }
}

export async function updatePerusahaan(id: string, data: { nama: string; alamatLegal?: string }) {
    const trimmedNama = data.nama?.trim()
    if (!trimmedNama) {
        return { success: false, error: "Nama perusahaan wajib diisi." }
    }

    try {
        await prisma.perusahaan.update({
            where: { id, deletedAt: null },
            data: {
                nama: trimmedNama,
                alamatLegal: data.alamatLegal?.trim() || null
            }
        })

        revalidatePath("/master/perusahaan")
        revalidatePath(`/master/perusahaan/${id}`)
        return { success: true }
    } catch (err) {
        console.error("Gagal memperbarui perusahaan:", err)
        return { success: false, error: "Gagal memperbarui data perusahaan." }
    }
}

export async function deletePerusahaan(id: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // Cek turunan: pendaftaran perusahaan aktif
            const pendaftaranCount = await tx.pendaftaranPerusahaan.count({
                where: { perusahaanId: id, deletedAt: null }
            })
            if (pendaftaranCount > 0) {
                throw new Error(`Tidak dapat menghapus: perusahaan ini memiliki ${pendaftaranCount} pendaftaran permohonan aktif.`)
            }

            // Cek cabang yang memiliki peserta aktif
            const cabangWithPeserta = await tx.cabang.findMany({
                where: { perusahaanId: id, deletedAt: null },
                include: {
                    _count: {
                        select: { peserta: { where: { deletedAt: null } } }
                    }
                }
            })

            const totalPeserta = cabangWithPeserta.reduce((acc, c) => acc + c._count.peserta, 0)
            if (totalPeserta > 0) {
                throw new Error(`Tidak dapat menghapus: perusahaan ini memiliki ${totalPeserta} peserta aktif di cabangnya.`)
            }

            // Soft delete perusahaan dan cabangnya
            const now = new Date()
            await tx.perusahaan.update({
                where: { id, deletedAt: null },
                data: { deletedAt: now }
            })

            await tx.cabang.updateMany({
                where: { perusahaanId: id, deletedAt: null },
                data: { deletedAt: now }
            })
        })

        revalidatePath("/master/perusahaan")
        return { success: true }
    } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal menghapus perusahaan."
        return { success: false, error: message }
    }
}

export async function restorePerusahaan(id: string) {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.perusahaan.update({
                where: { id },
                data: { deletedAt: null }
            })

            // Restore cabang HQ saja
            await tx.cabang.updateMany({
                where: { perusahaanId: id, tipe: TipeCabang.HQ },
                data: { deletedAt: null }
            })
        })

        revalidatePath("/master/perusahaan")
        return { success: true }
    } catch (err) {
        console.error("Gagal merestore perusahaan:", err)
        return { success: false, error: "Gagal merestore data perusahaan." }
    }
}
