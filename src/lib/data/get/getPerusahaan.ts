import { prisma } from "@/lib/prisma"
import { cache } from "react"

type GetPerusahaanOptions = {
    search?: string
    page?: number
    limit?: number
}

export const getAllPerusahaan = cache(async (options: GetPerusahaanOptions = {}) => {
    try {
        const normalizedPage = Math.max(1, options.page ?? 1)
        const normalizedLimit = Math.max(1, options.limit ?? 10)
        const skip = (normalizedPage - 1) * normalizedLimit
        const search = options.search?.trim()
        const where = {
            deletedAt: null,
            ...(search ? { nama: { contains: search, mode: "insensitive" as const } } : {})
        }
        const [data, totalItems] = await Promise.all([
            prisma.perusahaan.findMany({
                where,
                include: {
                    cabang: {
                        where: { deletedAt: null },
                        orderBy: { createdAt: "asc" }
                    },
                    perusahaanPic: {
                        include: {
                            pic: true
                        },
                        where: { pic: { deletedAt: null } }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: normalizedLimit
            }),
            prisma.perusahaan.count({ where })
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
        console.error("Gagal mengambil data perusahaan:", err)
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

export const getPerusahaanById = cache(async (id: string) => {
    try {
        return await prisma.perusahaan.findUnique({
            where: { id, deletedAt: null },
            include: {
                cabang: {
                    where: { deletedAt: null },
                    include: {
                        peserta: {
                            where: { deletedAt: null }
                        }
                    },
                    orderBy: { createdAt: "asc" }
                },
                perusahaanPic: {
                    include: {
                        pic: true
                    }
                }
            }
        })
    } catch (err) {
        console.error("Gagal mengambil detail perusahaan:", err)
        return null
    }
})

export const getDeletedPerusahaan = cache(async (options: GetPerusahaanOptions = {}) => {
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
            prisma.perusahaan.findMany({
                where,
                include: {
                    cabang: true,
                    perusahaanPic: {
                        include: { pic: true }
                    }
                },
                orderBy: { deletedAt: "desc" },
                skip,
                take: normalizedLimit
            }),
            prisma.perusahaan.count({ where })
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
        console.error("Gagal mengambil perusahaan terhapus:", err)
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

type SearchPicOptions = {
    search?: string
    perusahaanId?: string
    limit?: number
}

export const searchAvailablePic = cache(async (options: SearchPicOptions = {}) => {
    try {
        const search = options.search?.trim()
        const limit = Math.min(Math.max(1, options.limit ?? 10), 10)
        
        const linkedPicIds = options.perusahaanId
            ? await prisma.perusahaanPic.findMany({
                where: { perusahaanId: options.perusahaanId },
                select: { picId: true }
            }).then(items => items.map(i => i.picId))
            : []

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
            take: limit
        })

        return { data, hasMore: data.length >= limit }
    } catch (err) {
        console.error("Gagal mencari PIC:", err)
        return { data: [], hasMore: false }
    }
})
