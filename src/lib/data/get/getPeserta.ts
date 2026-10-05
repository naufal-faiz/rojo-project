import { prisma } from "@/lib/prisma"
import { cache } from "react"

type GetPesertaOptions = {
    search?: string
    page?: number
    limit?: number
}

export const getAllPeserta = cache(async (options: GetPesertaOptions = {}) => {
    try {
        const normalizedPage = Math.max(1, options.page ?? 1)
        const normalizedLimit = Math.max(1, options.limit ?? 10)
        const skip = (normalizedPage - 1) * normalizedLimit
        const search = options.search?.trim()

        const where = {
            deletedAt: null,
            ...(search ? {
                OR: [
                    { nama: { contains: search, mode: "insensitive" as const } },
                    { cabang: { perusahaan: { nama: { contains: search, mode: "insensitive" as const } } } }
                ]
            } : {})
        }

        const [data, totalItems] = await Promise.all([
            prisma.peserta.findMany({
                where,
                include: {
                    cabang: {
                        include: { perusahaan: true }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: normalizedLimit
            }),
            prisma.peserta.count({ where })
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
        console.error("Gagal mengambil data peserta:", err)
        return {
            data: [],
            totalItems: 0,
            pagination: {
                page: options.page ?? 1,
                limit: options.limit ?? 10,
                totalItems: 0,
                totalPages: 0
            }
        }
    }
})

export const getPesertaById = cache(async (id: string) => {
    try {
        return await prisma.peserta.findUnique({
            where: { id, deletedAt: null },
            include: {
                cabang: {
                    include: { perusahaan: true }
                },
                pesertaPelaksanaan: {
                    where: { deletedAt: null },
                    include: {
                        pelaksanaan: {
                            include: {
                                tingkatan: { include: { training: true } },
                                sesi: { orderBy: { tanggal: "asc" } }
                            }
                        },
                        pendaftaranPerusahaan: {
                            include: { perusahaan: true }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                }
            }
        })
    } catch (err) {
        console.error("Gagal mengambil detail peserta:", err)
        return null
    }
})

export const getDeletedPeserta = cache(async (options: GetPesertaOptions = {}) => {
    try {
        const normalizedPage = Math.max(1, options.page ?? 1)
        const normalizedLimit = Math.max(1, options.limit ?? 10)
        const skip = (normalizedPage - 1) * normalizedLimit
        const search = options.search?.trim()
        
        const where = {
            deletedAt: { not: null },
            ...(search ? { nama: { contains: search, mode: "insensitive" as const } } : {})
        }

        const [data, totalItems] = await Promise.all([
            prisma.peserta.findMany({
                where,
                include: { cabang: { include: { perusahaan: true } } },
                orderBy: { deletedAt: "desc" },
                skip,
                take: normalizedLimit
            }),
            prisma.peserta.count({ where })
        ])
        
        return { data, totalItems, pagination: { page: normalizedPage, limit: normalizedLimit, totalItems, totalPages: Math.ceil(totalItems / normalizedLimit) } }
    } catch (err) {
        console.error("Gagal mengambil peserta terhapus:", err)
        return { data: [], totalItems: 0, pagination: { page: options.page ?? 1, limit: options.limit ?? 10, totalItems: 0, totalPages: 0 } }
    }
})
