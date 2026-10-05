"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { JenisKegiatan } from "@/lib/generated/prisma/enums"

function revalidatePendaftaran(pelaksanaanId: string) {
    revalidatePath("/pendaftaran")
    revalidatePath(`/pendaftaran/${pelaksanaanId}`)
    revalidatePath(`/permohonan/${pelaksanaanId}`)
}

// Membuat pendaftaran perusahaan. Bila baris lama sudah soft delete, restore baris itu
// (unique constraint perusahaan + pelaksanaan tidak bisa dilepas).
export async function createPendaftaran(data: {
    pelaksanaanId: string
    perusahaanId: string
    picId?: string | null
}) {
    try {
        const pelaksanaan = await prisma.pelaksanaan.findUnique({
            where: { id: data.pelaksanaanId, deletedAt: null }
        })

        if (!pelaksanaan) {
            return { success: false as const, error: "Permohonan tidak ditemukan atau sudah dihapus." }
        }

        const perusahaan = await prisma.perusahaan.findUnique({
            where: { id: data.perusahaanId, deletedAt: null }
        })

        if (!perusahaan) {
            return { success: false as const, error: "Perusahaan tidak ditemukan atau sudah dihapus." }
        }

        if (data.picId) {
            const link = await prisma.perusahaanPic.findFirst({
                where: {
                    perusahaanId: data.perusahaanId,
                    picId: data.picId,
                    pic: { deletedAt: null }
                }
            })

            if (!link) {
                return { success: false as const, error: "PIC yang dipilih tidak terhubung dengan perusahaan ini." }
            }
        }

        const existing = await prisma.pendaftaranPerusahaan.findUnique({
            where: {
                perusahaanId_pelaksanaanId: {
                    perusahaanId: data.perusahaanId,
                    pelaksanaanId: data.pelaksanaanId
                }
            }
        })

        if (existing && existing.deletedAt === null) {
            return { success: false as const, error: `${perusahaan.nama} sudah terdaftar di permohonan ini.` }
        }

        if (pelaksanaan.jenisKegiatan === JenisKegiatan.INHOUSE) {
            const jumlahAktif = await prisma.pendaftaranPerusahaan.count({
                where: { pelaksanaanId: data.pelaksanaanId, deletedAt: null }
            })

            if (jumlahAktif >= 1) {
                return { success: false as const, error: "Kegiatan INHOUSE hanya boleh memiliki satu pendaftaran perusahaan." }
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            if (existing) {
                return tx.pendaftaranPerusahaan.update({
                    where: { id: existing.id },
                    data: { deletedAt: null, picId: data.picId || null }
                })
            }

            return tx.pendaftaranPerusahaan.create({
                data: {
                    pelaksanaanId: data.pelaksanaanId,
                    perusahaanId: data.perusahaanId,
                    picId: data.picId || null
                }
            })
        })

        revalidatePendaftaran(data.pelaksanaanId)
        return { success: true as const, data: result, restored: Boolean(existing) }
    } catch (err) {
        console.error("Gagal membuat pendaftaran perusahaan:", err)
        return { success: false as const, error: "Gagal membuat pendaftaran perusahaan." }
    }
}

// Mengubah PIC penerima sertifikat. picId null = lepas PIC.
export async function updatePendaftaranPic(id: string, picId: string | null) {
    try {
        const pendaftaran = await prisma.pendaftaranPerusahaan.findUnique({
            where: { id, deletedAt: null }
        })

        if (!pendaftaran) {
            return { success: false as const, error: "Pendaftaran tidak ditemukan atau sudah dihapus." }
        }

        if (picId) {
            const link = await prisma.perusahaanPic.findFirst({
                where: {
                    perusahaanId: pendaftaran.perusahaanId,
                    picId,
                    pic: { deletedAt: null }
                }
            })

            if (!link) {
                return { success: false as const, error: "PIC yang dipilih tidak terhubung dengan perusahaan ini." }
            }
        }

        const result = await prisma.pendaftaranPerusahaan.update({
            where: { id },
            data: { picId: picId || null }
        })

        revalidatePendaftaran(pendaftaran.pelaksanaanId)
        return { success: true as const, data: result }
    } catch (err) {
        console.error("Gagal mengubah PIC pendaftaran:", err)
        return { success: false as const, error: "Gagal mengubah PIC pendaftaran." }
    }
}

// Soft delete pendaftaran. Diblokir selama masih ada peserta aktif di dalamnya.
export async function deletePendaftaran(id: string) {
    try {
        const pendaftaran = await prisma.pendaftaranPerusahaan.findUnique({
            where: { id, deletedAt: null }
        })

        if (!pendaftaran) {
            return { success: false as const, error: "Pendaftaran tidak ditemukan atau sudah dihapus." }
        }

        const terpakai = await prisma.$transaction(async (tx) => {
            const jumlahPeserta = await tx.pesertaPelaksanaan.count({
                where: { pendaftaranPerusahaanId: id, deletedAt: null }
            })

            if (jumlahPeserta > 0) {
                return false
            }

            await tx.pendaftaranPerusahaan.update({
                where: { id },
                data: { deletedAt: new Date() }
            })

            return true
        })

        if (!terpakai) {
            return {
                success: false as const,
                error: "Pendaftaran tidak dapat dihapus karena masih memiliki peserta aktif. Pindahkan atau hapus pesertanya dulu."
            }
        }

        revalidatePendaftaran(pendaftaran.pelaksanaanId)
        return { success: true as const }
    } catch (err) {
        console.error("Gagal menghapus pendaftaran perusahaan:", err)
        return { success: false as const, error: "Gagal menghapus pendaftaran perusahaan." }
    }
}

// Restore pendaftaran. Hanya bila permohonan dan perusahaan masih aktif.
export async function restorePendaftaran(id: string) {
    try {
        const pendaftaran = await prisma.pendaftaranPerusahaan.findUnique({
            where: { id, deletedAt: { not: null } },
            include: {
                pelaksanaan: true,
                perusahaan: true
            }
        })

        if (!pendaftaran) {
            return { success: false as const, error: "Pendaftaran tidak ditemukan." }
        }

        if (pendaftaran.pelaksanaan.deletedAt !== null) {
            return { success: false as const, error: "Permohonan sudah dihapus. Restore permohonannya dulu." }
        }

        if (pendaftaran.perusahaan.deletedAt !== null) {
            return { success: false as const, error: "Perusahaan sudah dihapus. Restore perusahaannya dulu." }
        }

        const aktif = await prisma.pendaftaranPerusahaan.findFirst({
            where: {
                id: { not: id },
                perusahaanId: pendaftaran.perusahaanId,
                pelaksanaanId: pendaftaran.pelaksanaanId,
                deletedAt: null
            }
        })

        if (aktif) {
            return { success: false as const, error: "Sudah ada pendaftaran aktif untuk perusahaan ini di permohonan tersebut." }
        }

        await prisma.pendaftaranPerusahaan.update({
            where: { id },
            data: { deletedAt: null }
        })

        revalidatePendaftaran(pendaftaran.pelaksanaanId)
        return { success: true as const }
    } catch (err) {
        console.error("Gagal merestore pendaftaran perusahaan:", err)
        return { success: false as const, error: "Gagal merestore pendaftaran perusahaan." }
    }
}

// Pencarian perusahaan untuk modal tambah pendaftaran (dipanggil dari client).
export async function searchPerusahaanPendaftaran(keyword?: string) {
    try {
        const search = keyword?.trim()

        const data = await prisma.perusahaan.findMany({
            where: {
                deletedAt: null,
                ...(search ? { nama: { contains: search, mode: "insensitive" as const } } : {})
            },
            orderBy: { nama: "asc" },
            take: 10,
            select: { id: true, nama: true }
        })

        return data
    } catch (err) {
        console.error("Gagal mencari perusahaan:", err)
        return []
    }
}

// Daftar PIC yang terhubung ke sebuah perusahaan (untuk select PIC pendaftaran).
export async function getPicPerusahaan(perusahaanId: string) {
    try {
        const links = await prisma.perusahaanPic.findMany({
            where: {
                perusahaanId,
                pic: { deletedAt: null }
            },
            include: { pic: true },
            orderBy: { pic: { nama: "asc" } }
        })

        return links.map((link) => ({
            id: link.pic.id,
            nama: link.pic.nama,
            tipe: link.pic.tipe
        }))
    } catch (err) {
        console.error("Gagal mengambil PIC perusahaan:", err)
        return []
    }
}
