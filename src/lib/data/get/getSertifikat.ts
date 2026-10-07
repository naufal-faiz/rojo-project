import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { labelTingkatan } from "@/components/main/common/enumLabels"
import { JenisSertifikasi, StatusPeserta } from "@/lib/generated/prisma/enums"

export type FilterStatusHasil = StatusPeserta | "BELUM"

type GetSertifikatOptions = {
    search?: string
    page?: number
    limit?: number
    pelaksanaanId?: string
    jenisSertifikasi?: JenisSertifikasi
    status?: FilterStatusHasil
}

// Daftar peserta pelaksanaan aktif beserta data sertifikatnya.
export const getAllSertifikat = cache(async (options: GetSertifikatOptions = {}) => {
    try {
        const normalizedPage = Number.isSafeInteger(options.page) && (options.page ?? 0) > 0 ? options.page! : 1
        const normalizedLimit = Math.max(1, options.limit ?? 10)
        const skip = (normalizedPage - 1) * normalizedLimit
        const search = options.search?.trim()

        const where = {
            deletedAt: null,
            peserta: { deletedAt: null },
            ...(options.status === "BELUM" ? { status: null } : options.status ? { status: options.status } : {}),
            pelaksanaan: {
                deletedAt: null,
                tingkatan: { deletedAt: null, training: { deletedAt: null } },
                ...(options.pelaksanaanId ? { id: options.pelaksanaanId } : {}),
                ...(options.jenisSertifikasi ? { jenisSertifikasi: options.jenisSertifikasi } : {})
            },
            ...(search ? {
                OR: [
                    { peserta: { nama: { contains: search, mode: "insensitive" as const } } },
                    { noSertifikat: { contains: search, mode: "insensitive" as const } },
                    { noRegistrasi: { contains: search, mode: "insensitive" as const } },
                    { peserta: { cabang: { perusahaan: { nama: { contains: search, mode: "insensitive" as const } } } } },
                    { pendaftaranPerusahaan: { perusahaan: { nama: { contains: search, mode: "insensitive" as const } } } }
                ]
            } : {})
        }

        const [data, totalItems] = await Promise.all([
            prisma.pesertaPelaksanaan.findMany({
                where,
                include: {
                    peserta: {
                        include: { cabang: { where: { deletedAt: null, perusahaan: { deletedAt: null } }, include: { perusahaan: true } } }
                    },
                    pelaksanaan: {
                        include: {
                            tingkatan: { include: { training: true } },
                            sesi: { orderBy: { tanggal: "asc" } }
                        }
                    },
                    pendaftaranPerusahaan: {
                        where: { deletedAt: null, perusahaan: { deletedAt: null } },
                        include: { perusahaan: true, pic: { where: { deletedAt: null } } }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: normalizedLimit
            }),
            prisma.pesertaPelaksanaan.count({ where })
        ])

        return {
            data,
            totalItems,
            pagination: {
                page: normalizedPage,
                limit: normalizedLimit,
                totalItems,
                totalPages: Math.ceil(totalItems / normalizedLimit)
            }
        }
    } catch (err) {
        console.error("Gagal mengambil data sertifikat:", err)
        return {
            data: [],
            totalItems: 0,
            pagination: { page: options.page ?? 1, limit: options.limit ?? 10, totalItems: 0, totalPages: 0 }
        }
    }
})

// Pulihkan label satu kegiatan terpilih tanpa memuat seluruh tabel.
export const getKegiatanSertifikatOption = cache(async (id: string) => {
    try {
        const row = await prisma.pelaksanaan.findUnique({
            where: { id, deletedAt: null, tingkatan: { deletedAt: null, training: { deletedAt: null } } },
            include: { tingkatan: { include: { training: true } } },
        })
        return row ? { id: row.id, label: labelTingkatan(row.tingkatan), description: row.noPermohonan ?? "Tanpa nomor" } : null
    } catch (err) {
        console.error("Gagal mengambil opsi kegiatan sertifikat:", err)
        return null
    }
})
