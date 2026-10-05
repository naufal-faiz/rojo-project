"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createPeserta(data: {
    nama: string
    perusahaanCabangId?: string | null
}) {
    try {
        if (!data.nama?.trim()) {
            return { success: false, error: "Nama peserta wajib diisi." }
        }

        const result = await prisma.peserta.create({
            data: {
                nama: data.nama.trim(),
                perusahaanCabangId: data.perusahaanCabangId || null
            }
        })

        revalidatePath("/master/peserta")
        return { success: true, data: result }
    } catch (err) {
        console.error("Gagal membuat peserta:", err)
        return { success: false, error: "Gagal membuat peserta." }
    }
}

export async function updatePeserta(id: string, data: {
    nama: string
    perusahaanCabangId?: string | null
}) {
    try {
        if (!data.nama?.trim()) {
            return { success: false, error: "Nama peserta wajib diisi." }
        }

        const result = await prisma.peserta.update({
            where: { id, deletedAt: null },
            data: {
                nama: data.nama.trim(),
                perusahaanCabangId: data.perusahaanCabangId || null
            }
        })

        revalidatePath("/master/peserta")
        revalidatePath(`/master/peserta/${id}`)
        return { success: true, data: result }
    } catch (err) {
        console.error("Gagal mengubah peserta:", err)
        return { success: false, error: "Gagal mengubah peserta." }
    }
}

export async function deletePeserta(id: string) {
    try {
        const peserta = await prisma.peserta.findUnique({
            where: { id, deletedAt: null },
            include: {
                pesertaPelaksanaan: {
                    where: { deletedAt: null }
                }
            }
        })

        if (!peserta) {
            return { success: false, error: "Peserta tidak ditemukan." }
        }

        if (peserta.pesertaPelaksanaan.length > 0) {
            return { success: false, error: "Peserta tidak dapat dihapus karena masih memiliki pendaftaran aktif." }
        }

        await prisma.peserta.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        revalidatePath("/master/peserta")
        return { success: true }
    } catch (err) {
        console.error("Gagal menghapus peserta:", err)
        return { success: false, error: "Gagal menghapus peserta." }
    }
}

export async function restorePeserta(id: string) {
    try {
        const peserta = await prisma.peserta.findUnique({
            where: { id, deletedAt: { not: null } }
        })

        if (!peserta) {
            return { success: false, error: "Peserta tidak ditemukan." }
        }

        await prisma.peserta.update({
            where: { id },
            data: { deletedAt: null }
        })

        revalidatePath("/master/peserta")
        return { success: true }
    } catch (err) {
        console.error("Gagal merestore peserta:", err)
        return { success: false, error: "Gagal merestore peserta." }
    }
}
