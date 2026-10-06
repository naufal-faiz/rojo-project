import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { whereKegiatanAktif } from "./whereKegiatanAktif"

type GetPelaksanaanOptions = {
    aktif?: boolean
    search?: string
    page?: number
    limit?: number
}

export const getAllPelaksanaan = cache(async (options: GetPelaksanaanOptions = {}) => {
    try {
        const normalizedPage = Math.max(1, options.page ?? 1)
        const normalizedLimit = Math.max(1, options.limit ?? 10)
        const skip = (normalizedPage - 1) * normalizedLimit
        const search = options.search?.trim()

        const where = {
            deletedAt: null,
            ...(options.aktif ? { AND: [whereKegiatanAktif()] } : {}),
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
                    tingkatan: {
                        include: { training: true }
                    },
                    sesi: {
                        orderBy: { tanggal: "asc" }
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
        console.error("Gagal mengambil data pelaksanaan:", err)
        return {
            data: [],
            totalItems: 0,
            pagination: { page: options.page ?? 1, limit: options.limit ?? 10, totalItems: 0, totalPages: 0 }
        }
    }
})

export const getPelaksanaanById = cache(async (id: string) => {
    try {
        return await prisma.pelaksanaan.findUnique({
            where: { id, deletedAt: null },
            include: {
                tingkatan: {
                    include: { training: true }
                },
                sesi: {
                    orderBy: { tanggal: "asc" }
                },
                pendaftaran: {
                    where: { deletedAt: null },
                    include: {
                        perusahaan: true,
                        pic: true,
                        pesertaPelaksanaan: {
                            where: { deletedAt: null },
                            include: { peserta: true }
                        }
                    }
                },
                pesertaPelaksanaan: {
                    where: {
                        deletedAt: null,
                        pendaftaranPerusahaanId: null
                    },
                    include: { peserta: true }
                }
            }
        })
    } catch (err) {
        console.error("Gagal mengambil detail pelaksanaan:", err)
        return null
    }
})

export const getDeletedPelaksanaan = cache(async (options: GetPelaksanaanOptions = {}) => {
    try {
        const normalizedPage = Math.max(1, options.page ?? 1)
        const normalizedLimit = Math.max(1, options.limit ?? 10)
        const skip = (normalizedPage - 1) * normalizedLimit
        const search = options.search?.trim()

        const where = {
            deletedAt: { not: null },
            ...(search ? { noPermohonan: { contains: search, mode: "insensitive" as const } } : {})
        }

        const [data, totalItems] = await Promise.all([
            prisma.pelaksanaan.findMany({
                where,
                include: {
                    tingkatan: { include: { training: true } },
                    sesi: true
                },
                orderBy: { deletedAt: "desc" },
                skip,
                take: normalizedLimit
            }),
            prisma.pelaksanaan.count({ where })
        ])

        return { data, totalItems, pagination: { page: normalizedPage, limit: normalizedLimit, totalItems, totalPages: Math.ceil(totalItems / normalizedLimit) } }
    } catch (err) {
        console.error("Gagal mengambil pelaksanaan terhapus:", err)
        return { data: [], totalItems: 0, pagination: { page: options.page ?? 1, limit: options.limit ?? 10, totalItems: 0, totalPages: 0 } }
    }
})
