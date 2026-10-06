import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { whereKegiatanAktif } from "./whereKegiatanAktif"
import { JenisKegiatan, JenisSertifikasi } from "@/lib/generated/prisma/enums"

type GetPendaftaranOptions = {
    aktif?: boolean
    search?: string
    page?: number
    limit?: number
    jenisSertifikasi?: string
    jenisKegiatan?: string
}

// Daftar Permohonan dengan ringkasan jumlah perusahaan, peserta mandiri, dan total peserta.
export const getAllPendaftaran = cache(async (options: GetPendaftaranOptions = {}) => {
    try {
        const normalizedPage = Math.max(1, options.page ?? 1)
        const normalizedLimit = Math.max(1, options.limit ?? 10)
        const skip = (normalizedPage - 1) * normalizedLimit
        const search = options.search?.trim()

        const enumFilter = <T extends string>(values: readonly T[], raw?: string) =>
            raw && (values as readonly string[]).includes(raw) ? (raw as T) : undefined
        const jenisSertifikasi = enumFilter(Object.values(JenisSertifikasi), options.jenisSertifikasi)
        const jenisKegiatan = enumFilter(Object.values(JenisKegiatan), options.jenisKegiatan)

        const where = {
            deletedAt: null,
            ...(options.aktif ? { AND: [whereKegiatanAktif()] } : {}),
            ...(jenisSertifikasi ? { jenisSertifikasi } : {}),
            ...(jenisKegiatan ? { jenisKegiatan } : {}),
            ...(search ? {
                OR: [
                    { noPermohonan: { contains: search, mode: "insensitive" as const } },
                    { tingkatan: { training: { nama: { contains: search, mode: "insensitive" as const } } } },
                    { lokasi: { contains: search, mode: "insensitive" as const } },
                    { tingkatan: { kelas: { contains: search, mode: "insensitive" as const } } }
                ]
            } : {})
        }

        const [data, totalItems] = await Promise.all([
            prisma.pelaksanaan.findMany({
                where,
                include: {
                    tingkatan: { include: { training: true } },
                    sesi: { orderBy: { tanggal: "asc" } },
                    pendaftaran: {
                        where: { deletedAt: null },
                        select: { id: true }
                    },
                    pesertaPelaksanaan: {
                        where: { deletedAt: null },
                        select: { id: true, pendaftaranPerusahaanId: true }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: normalizedLimit
            }),
            prisma.pelaksanaan.count({ where })
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
        console.error("Gagal mengambil data pendaftaran:", err)
        return {
            data: [],
            totalItems: 0,
            pagination: { page: options.page ?? 1, limit: options.limit ?? 10, totalItems: 0, totalPages: 0 }
        }
    }
})

// Data halaman kerja pendaftaran: pendaftaran perusahaan aktif + peserta mandiri aktif.
export const getPendaftaranKerja = cache(async (pelaksanaanId: string) => {
    try {
        return await prisma.pelaksanaan.findUnique({
            where: { id: pelaksanaanId, deletedAt: null },
            include: {
                tingkatan: { include: { training: true } },
                sesi: { orderBy: { tanggal: "asc" } },
                pendaftaran: {
                    where: { deletedAt: null },
                    include: {
                        perusahaan: true,
                        pic: true,
                        pesertaPelaksanaan: {
                            where: { deletedAt: null },
                            include: {
                                peserta: {
                                    include: { cabang: { include: { perusahaan: true } } }
                                }
                            },
                            orderBy: { createdAt: "asc" }
                        }
                    },
                    orderBy: { createdAt: "asc" }
                },
                pesertaPelaksanaan: {
                    where: { deletedAt: null, pendaftaranPerusahaanId: null },
                    include: {
                        peserta: {
                            include: { cabang: { include: { perusahaan: true } } }
                        }
                    },
                    orderBy: { createdAt: "asc" }
                }
            }
        })
    } catch (err) {
        console.error("Gagal mengambil data kerja pendaftaran:", err)
        return null
    }
})

// Data terhapus (pendaftaran perusahaan dan peserta) untuk tab Terhapus.
export const getDeletedPendaftaran = cache(async (pelaksanaanId: string) => {
    try {
        const [pendaftaran, peserta] = await Promise.all([
            prisma.pendaftaranPerusahaan.findMany({
                where: { pelaksanaanId, deletedAt: { not: null } },
                include: { perusahaan: true, pic: true },
                orderBy: { deletedAt: "desc" }
            }),
            prisma.pesertaPelaksanaan.findMany({
                where: { pelaksanaanId, deletedAt: { not: null } },
                include: {
                    peserta: true,
                    pendaftaranPerusahaan: { include: { perusahaan: true } }
                },
                orderBy: { deletedAt: "desc" }
            })
        ])

        return { pendaftaran, peserta }
    } catch (err) {
        console.error("Gagal mengambil data pendaftaran terhapus:", err)
        return { pendaftaran: [], peserta: [] }
    }
})
