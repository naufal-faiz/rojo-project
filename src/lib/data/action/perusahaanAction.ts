"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { TipeCabang, TipePic } from "@/lib/generated/prisma/enums"

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
