"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import {
    JenisKegiatan,
    TipePelaksanaan,
    Penyelenggara,
    JenisSertifikasi,
    StatusTemanK3
} from "@/lib/generated/prisma/enums"

export async function createPelaksanaan(data: {
    noPermohonan?: string | null
    tingkatanId: string
    jenisKegiatan: JenisKegiatan
    tipePelaksanaan: TipePelaksanaan
    lokasi?: string | null
    penyelenggara: Penyelenggara
    jenisSertifikasi: JenisSertifikasi
    status?: StatusTemanK3 | null
    uploadedAt?: Date | null
    catatan?: string | null
}) {
    try {
        if (data.noPermohonan) {
            const existing = await prisma.pelaksanaan.findUnique({
                where: { noPermohonan: data.noPermohonan }
            })
            if (existing) {
                return { success: false, error: `No. Permohonan "${data.noPermohonan}" sudah digunakan.` }
            }
        }

        const tingkatan = await prisma.tingkatan.findUnique({
            where: { id: data.tingkatanId, deletedAt: null }
        })

        if (!tingkatan) {
            return { success: false, error: "Tingkatan tidak ditemukan atau sudah dihapus." }
        }

        const result = await prisma.pelaksanaan.create({
            data: {
                noPermohonan: data.noPermohonan || null,
                tingkatanId: data.tingkatanId,
                jenisKegiatan: data.jenisKegiatan,
                tipePelaksanaan: data.tipePelaksanaan,
                lokasi: data.lokasi || null,
                penyelenggara: data.penyelenggara,
                jenisSertifikasi: data.jenisSertifikasi,
                status: data.status ?? null,
                uploadedAt: data.uploadedAt || null,
                catatan: data.catatan || null
            }
        })

        revalidatePath("/permohonan")
        return { success: true, data: result }
    } catch (err) {
        console.error("Gagal membuat pelaksanaan:", err)
        return { success: false, error: "Gagal membuat pelaksanaan." }
    }
}

export async function updatePelaksanaan(id: string, data: {
    noPermohonan?: string | null
    tingkatanId: string
    jenisKegiatan: JenisKegiatan
    tipePelaksanaan: TipePelaksanaan
    lokasi?: string | null
    penyelenggara: Penyelenggara
    jenisSertifikasi: JenisSertifikasi
    status?: StatusTemanK3 | null
    uploadedAt?: Date | null
    catatan?: string | null
}) {
    try {
        if (data.noPermohonan) {
            const existing = await prisma.pelaksanaan.findFirst({
                where: {
                    noPermohonan: data.noPermohonan,
                    NOT: { id }
                }
            })
            if (existing) {
                return { success: false, error: `No. Permohonan "${data.noPermohonan}" sudah digunakan.` }
            }
        }

        const result = await prisma.pelaksanaan.update({
            where: { id, deletedAt: null },
            data: {
                noPermohonan: data.noPermohonan || null,
                tingkatanId: data.tingkatanId,
                jenisKegiatan: data.jenisKegiatan,
                tipePelaksanaan: data.tipePelaksanaan,
                lokasi: data.lokasi || null,
                penyelenggara: data.penyelenggara,
                jenisSertifikasi: data.jenisSertifikasi,
                status: data.status ?? null,
                uploadedAt: data.uploadedAt || null,
                catatan: data.catatan || null
            }
        })

        revalidatePath("/permohonan")
        revalidatePath(`/permohonan/${id}`)
        return { success: true, data: result }
    } catch (err) {
        console.error("Gagal mengubah pelaksanaan:", err)
        return { success: false, error: "Gagal mengubah pelaksanaan." }
    }
}

export async function deletePelaksanaan(id: string) {
    try {
        const pelaksanaan = await prisma.pelaksanaan.findUnique({
            where: { id, deletedAt: null },
            include: {
                pendaftaran: { where: { deletedAt: null } },
                pesertaPelaksanaan: { where: { deletedAt: null } }
            }
        })

        if (!pelaksanaan) {
            return { success: false, error: "Pelaksanaan tidak ditemukan." }
        }

        if (pelaksanaan.pendaftaran.length > 0 || pelaksanaan.pesertaPelaksanaan.length > 0) {
            return { success: false, error: "Pelaksanaan tidak dapat dihapus karena masih memiliki pendaftaran atau peserta aktif." }
        }

        await prisma.pelaksanaan.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        revalidatePath("/permohonan")
        return { success: true }
    } catch (err) {
        console.error("Gagal menghapus pelaksanaan:", err)
        return { success: false, error: "Gagal menghapus pelaksanaan." }
    }
}

export async function restorePelaksanaan(id: string) {
    try {
        const pelaksanaan = await prisma.pelaksanaan.findUnique({
            where: { id, deletedAt: { not: null } },
            include: { tingkatan: true }
        })

        if (!pelaksanaan) {
            return { success: false, error: "Pelaksanaan tidak ditemukan." }
        }

        if (pelaksanaan.tingkatan.deletedAt) {
            return { success: false, error: "Tidak dapat merestore pelaksanaan karena tingkatan sudah dihapus." }
        }

        await prisma.pelaksanaan.update({
            where: { id },
            data: { deletedAt: null }
        })

        revalidatePath("/permohonan")
        return { success: true }
    } catch (err) {
        console.error("Gagal merestore pelaksanaan:", err)
        return { success: false, error: "Gagal merestore pelaksanaan." }
    }
}

export async function updateStatusPelaksanaan(id: string, status: StatusTemanK3 | null) {
    try {
        const pelaksanaan = await prisma.pelaksanaan.findUnique({
            where: { id, deletedAt: null }
        })

        if (!pelaksanaan) {
            return { success: false, error: "Permohonan tidak ditemukan atau sudah dihapus." }
        }

        if (status !== null && pelaksanaan.jenisSertifikasi !== JenisSertifikasi.KEMNAKER) {
            return { success: false, error: "Status TemanK3 hanya berlaku untuk kegiatan KEMNAKER." }
        }

        // Semantik uploadedAt: SUDAH_UPLOAD mencatat waktu sekarang,
        // FU_LPS/CANCEL membiarkan tanggal sebelumnya, null mengosongkan.
        let uploadedAt: Date | null | undefined
        if (status === StatusTemanK3.SUDAH_UPLOAD) {
            uploadedAt = new Date()
        } else if (status === null) {
            uploadedAt = null
        }

        const result = await prisma.pelaksanaan.update({
            where: { id, deletedAt: null },
            data: {
                status,
                uploadedAt
            }
        })

        revalidatePath("/permohonan")
        revalidatePath(`/permohonan/${id}`)
        return { success: true, data: result }
    } catch (err) {
        console.error("Gagal mengubah status pelaksanaan:", err)
        return { success: false, error: "Gagal mengubah status pelaksanaan." }
    }
}

export async function createSesi(pelaksanaanId: string, tanggal: Date) {
    try {
        const pelaksanaan = await prisma.pelaksanaan.findUnique({
            where: { id: pelaksanaanId, deletedAt: null }
        })

        if (!pelaksanaan) {
            return { success: false, error: "Pelaksanaan tidak ditemukan." }
        }

        const result = await prisma.sesiPelaksanaan.create({
            data: { pelaksanaanId, tanggal }
        })

        revalidatePath("/permohonan")
        revalidatePath(`/permohonan/${pelaksanaanId}`)
        return { success: true, data: result }
    } catch (err) {
        console.error("Gagal menambah sesi:", err)
        return { success: false, error: "Gagal menambah sesi." }
    }
}

export async function deleteSesi(id: string) {
    try {
        const sesi = await prisma.sesiPelaksanaan.findUnique({
            where: { id }
        })

        if (!sesi) {
            return { success: false, error: "Sesi tidak ditemukan." }
        }

        await prisma.sesiPelaksanaan.delete({ where: { id } })

        revalidatePath("/permohonan")
        revalidatePath(`/permohonan/${sesi.pelaksanaanId}`)
        return { success: true }
    } catch (err) {
        console.error("Gagal menghapus sesi:", err)
        return { success: false, error: "Gagal menghapus sesi." }
    }
}
