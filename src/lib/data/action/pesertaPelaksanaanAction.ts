"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { tambahKePelaksanaan } from "./pendaftaranPesertaTransaction"
import { StatusPeserta } from "@/lib/generated/prisma/enums"

function revalidatePesertaPelaksanaan(pelaksanaanId: string) {
    revalidatePath("/pendaftaran")
    revalidatePath(`/pendaftaran/${pelaksanaanId}`)
    revalidatePath(`/permohonan/${pelaksanaanId}`)
}

// Pencarian peserta untuk modal tambah peserta (dipanggil dari client component).
export async function searchPesertaPendaftaran(pelaksanaanId: string, search?: string, pendaftaranId?: string | null) {
    try {
        const keyword = search?.trim()
        const tujuan = pendaftaranId ? await prisma.pendaftaranPerusahaan.findFirst({ where: { id: pendaftaranId, pelaksanaanId, deletedAt: null, perusahaan: { deletedAt: null } } }) : null
        if (pendaftaranId && !tujuan) return []

        const data = await prisma.peserta.findMany({
            where: {
                deletedAt: null,
                ...(tujuan ? { AND: [{ OR: [{ perusahaanCabangId: null }, { cabang: { perusahaanId: tujuan.perusahaanId, deletedAt: null } }] }] } : {}),
                ...(keyword ? {
                    OR: [
                        { nama: { contains: keyword, mode: "insensitive" as const } },
                        { cabang: { perusahaan: { nama: { contains: keyword, mode: "insensitive" as const } } } }
                    ]
                } : {})
            },
            include: {
                cabang: { include: { perusahaan: true } },
                pesertaPelaksanaan: {
                    where: { pelaksanaanId },
                    select: { deletedAt: true }
                }
            },
            orderBy: { nama: "asc" },
            take: 10
        })

        return data.map((peserta) => ({
            id: peserta.id,
            nama: peserta.nama,
            perusahaan: tujuan ? null : peserta.cabang?.perusahaan?.nama ?? null,
            tanpaPerusahaan: peserta.perusahaanCabangId === null,
            terdaftar: peserta.pesertaPelaksanaan.some((row) => row.deletedAt === null),
            pernahDihapus: peserta.pesertaPelaksanaan.some((row) => row.deletedAt !== null)
        }))
    } catch (err) {
        console.error("Gagal mencari peserta:", err)
        return []
    }
}

// Menambah peserta ke pendaftaran perusahaan atau sebagai peserta mandiri.
export async function addPesertaPendaftaran(data: {
    pelaksanaanId: string
    pendaftaranPerusahaanId: string | null
    pesertaIds: string[]
    cabangId?: string | null
}) {
    try {
        const pesertaIds = Array.from(new Set(data.pesertaIds)).filter(Boolean)

        if (pesertaIds.length === 0) {
            return { success: false as const, error: "Pilih minimal satu peserta." }
        }

        const hasil = await prisma.$transaction((tx) =>
            tambahKePelaksanaan(tx, data.pelaksanaanId, data.pendaftaranPerusahaanId, pesertaIds, data.cabangId),
            { isolationLevel: "Serializable" }
        )
        revalidatePath("/master/perusahaan", "layout")
        revalidatePath("/master/peserta")
        revalidatePesertaPelaksanaan(data.pelaksanaanId)
        return { success: true as const, ...hasil, peringatan: [] as string[] }
    } catch (err) {
        const pesan = err instanceof Error ? err.message : "Gagal menambah peserta pendaftaran."
        console.error("Gagal menambah peserta pendaftaran:", err)
        return { success: false as const, error: pesan }
    }
}

// Ubah status kelulusan satu peserta langsung dari halaman detail permohonan.
export async function updateStatusPesertaPelaksanaan(id: string, status: StatusPeserta | null) {
    try {
        if (status !== null && !Object.values(StatusPeserta).includes(status)) {
            return { success: false as const, error: "Status kelulusan tidak valid." }
        }

        const peserta = await prisma.pesertaPelaksanaan.findFirst({
            where: { id, deletedAt: null, pelaksanaan: { deletedAt: null } }
        })

        if (!peserta) {
            return { success: false as const, error: "Peserta pendaftaran tidak ditemukan atau sudah dihapus." }
        }

        await prisma.pesertaPelaksanaan.update({
            where: { id },
            data: { status }
        })

        revalidatePath(`/permohonan/${peserta.pelaksanaanId}`)
        revalidatePath(`/pendaftaran/${peserta.pelaksanaanId}`)
        revalidatePath("/sertifikat")
        return { success: true as const }
    } catch (err) {
        console.error("Gagal mengubah status kelulusan:", err)
        return { success: false as const, error: "Gagal mengubah status kelulusan." }
    }
}

// Soft delete peserta dari pendaftaran. Peringatan noSertifikat ditangani di UI.
export async function removePesertaPendaftaran(id: string) {
    try {
        const peserta = await prisma.pesertaPelaksanaan.findUnique({
            where: { id, deletedAt: null },
            include: { peserta: true }
        })

        if (!peserta) {
            return { success: false as const, error: "Peserta pendaftaran tidak ditemukan atau sudah dihapus." }
        }

        await prisma.pesertaPelaksanaan.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        revalidatePesertaPelaksanaan(peserta.pelaksanaanId)
        return { success: true as const }
    } catch (err) {
        console.error("Gagal menghapus peserta pendaftaran:", err)
        return { success: false as const, error: "Gagal menghapus peserta pendaftaran." }
    }
}

// Restore peserta pendaftaran. Parent (permohonan dan pendaftaran) harus aktif.
export async function restorePesertaPendaftaran(id: string) {
    try {
        const peserta = await prisma.pesertaPelaksanaan.findUnique({
            where: { id, deletedAt: { not: null } },
            include: {
                pelaksanaan: true,
                pendaftaranPerusahaan: true
            }
        })

        if (!peserta) {
            return { success: false as const, error: "Peserta pendaftaran tidak ditemukan." }
        }

        if (peserta.pelaksanaan.deletedAt !== null) {
            return { success: false as const, error: "Permohonan sudah dihapus. Restore permohonannya dulu." }
        }

        if (peserta.pendaftaranPerusahaan && peserta.pendaftaranPerusahaan.deletedAt !== null) {
            return { success: false as const, error: "Pendaftaran perusahaan sudah dihapus. Restore pendaftarannya dulu." }
        }

        const aktif = await prisma.pesertaPelaksanaan.findFirst({
            where: {
                id: { not: id },
                pesertaId: peserta.pesertaId,
                pelaksanaanId: peserta.pelaksanaanId,
                deletedAt: null
            }
        })

        if (aktif) {
            return { success: false as const, error: "Peserta sudah terdaftar aktif di permohonan ini." }
        }

        await prisma.pesertaPelaksanaan.update({
            where: { id },
            data: { deletedAt: null }
        })

        revalidatePesertaPelaksanaan(peserta.pelaksanaanId)
        return { success: true as const }
    } catch (err) {
        console.error("Gagal merestore peserta pendaftaran:", err)
        return { success: false as const, error: "Gagal merestore peserta pendaftaran." }
    }
}
