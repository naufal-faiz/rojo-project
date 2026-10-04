import { prisma } from "@/lib/prisma"
import { cache } from "react"

type GetAllTrainingsOptions = {
    search?: string
    page?: number
    limit?: number
}

export const getAllTrainings = cache(async (options: GetAllTrainingsOptions = {}) => {
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
            prisma.training.findMany({
                where,
                include: {
                    tingkatan: {
                        where: { deletedAt: null },
                        orderBy: { kelas: "asc" }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: normalizedLimit
            }),
            prisma.training.count({ where })
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
        console.error("Gagal mengambil data training:", err)
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

export const getTrainingById = cache(async (id: string) => {
    try {
        return await prisma.training.findUnique({
            where: { id, deletedAt: null },
            include: {
                tingkatan: {
                    where: { deletedAt: null },
                    orderBy: { kelas: "asc" }
                }
            }
        })
    } catch (err) {
        console.error("Gagal mengambil data training by id:", err)
        return null
    }
})
