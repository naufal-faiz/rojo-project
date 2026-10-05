"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ────────────────────────────────────
// TRAINING ACTIONS
// ────────────────────────────────────

export async function createTraining(nama: string) {
    const trimmed = nama?.trim()
    if (!trimmed) {
        return { success: false, error: "Nama training wajib diisi." }
    }
    try {
        await prisma.training.create({ data: { nama: trimmed } })
        revalidatePath("/master/training")
        return { success: true }
    } catch (err) {
        console.error("Gagal membuat training:", err)
        return { success: false, error: "Gagal menyimpan data training." }
    }
}

export async function updateTraining(id: string, nama: string) {
    const trimmed = nama?.trim()
    if (!trimmed) {
        return { success: false, error: "Nama training wajib diisi." }
    }
    try {
        await prisma.training.update({
            where: { id, deletedAt: null },
            data: { nama: trimmed }
        })
        revalidatePath("/master/training")
        return { success: true }
    } catch (err) {
        console.error("Gagal mengubah training:", err)
        return { success: false, error: "Gagal memperbarui data training." }
    }
}

export async function deleteTraining(id: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // Blokir jika masih ada tingkatan aktif
            const count = await tx.tingkatan.count({
                where: { trainingId: id, deletedAt: null }
            })
            if (count > 0) {
                throw new Error(`Tidak dapat menghapus: masih ada ${count} tingkatan aktif.`)
            }
            await tx.training.update({
                where: { id, deletedAt: null },
                data: { deletedAt: new Date() }
            })
        })
        revalidatePath("/master/training")
        return { success: true }
    } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal menghapus data training."
        return { success: false, error: message }
    }
}

export async function restoreTraining(id: string) {
    try {
        await prisma.training.update({
            where: { id },
            data: { deletedAt: null }
        })
        revalidatePath("/master/training")
        return { success: true }
    } catch (err) {
        console.error("Gagal merestore training:", err)
        return { success: false, error: "Gagal merestore data training." }
    }
}

// ────────────────────────────────────
// TINGKATAN ACTIONS
// ────────────────────────────────────

export async function createTingkatan(trainingId: string, kelas: string) {
    const trimmed = kelas?.trim()
    if (!trimmed) {
        return { success: false, error: "Nama kelas wajib diisi." }
    }
    try {
        // Pastikan parent training masih aktif
        const training = await prisma.training.findUnique({
            where: { id: trainingId, deletedAt: null }
        })
        if (!training) {
            return { success: false, error: "Training tidak ditemukan atau sudah dihapus." }
        }
        await prisma.tingkatan.create({ data: { trainingId, kelas: trimmed } })
        revalidatePath("/master/training")
        return { success: true }
    } catch (err) {
        console.error("Gagal membuat tingkatan:", err)
        return { success: false, error: "Gagal menyimpan data tingkatan." }
    }
}

export async function updateTingkatan(id: string, kelas: string) {
    const trimmed = kelas?.trim()
    if (!trimmed) {
        return { success: false, error: "Nama kelas wajib diisi." }
    }
    try {
        await prisma.tingkatan.update({
            where: { id, deletedAt: null },
            data: { kelas: trimmed }
        })
        revalidatePath("/master/training")
        return { success: true }
    } catch (err) {
        console.error("Gagal mengubah tingkatan:", err)
        return { success: false, error: "Gagal memperbarui data tingkatan." }
    }
}

export async function deleteTingkatan(id: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // Blokir jika masih ada pelaksanaan aktif
            const count = await tx.pelaksanaan.count({
                where: { tingkatanId: id, deletedAt: null }
            })
            if (count > 0) {
                throw new Error(`Tidak dapat menghapus: tingkatan ini dipakai oleh ${count} permohonan aktif.`)
            }
            await tx.tingkatan.update({
                where: { id, deletedAt: null },
                data: { deletedAt: new Date() }
            })
        })
        revalidatePath("/master/training")
        return { success: true }
    } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal menghapus data tingkatan."
        return { success: false, error: message }
    }
}

export async function restoreTingkatan(id: string) {
    try {
        // Pastikan parent training masih aktif
        const tingkatan = await prisma.tingkatan.findUnique({
            where: { id },
            include: { training: { select: { deletedAt: true } } }
        })
        if (!tingkatan) {
            return { success: false, error: "Tingkatan tidak ditemukan." }
        }
        if (tingkatan.training.deletedAt !== null) {
            return { success: false, error: "Tidak dapat merestore: training induk sudah dihapus." }
        }
        await prisma.tingkatan.update({
            where: { id },
            data: { deletedAt: null }
        })
        revalidatePath("/master/training")
        return { success: true }
    } catch (err) {
        console.error("Gagal merestore tingkatan:", err)
        return { success: false, error: "Gagal merestore data tingkatan." }
    }
}
