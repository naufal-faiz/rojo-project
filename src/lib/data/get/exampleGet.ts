// Ini adalah contoh bagaimana sesi get digunakan dalam proyek ini
// anggaplah file ini bernama getTraining.ts

// import { CertificationType, PublishedStatus } from "@/lib/generated/prisma/enums";
// import { prisma } from "@/lib/prisma";
// import { cache } from "react";

// type GetAllTrainingsOptions = {
//     status?: PublishedStatus
//     certificationType?: CertificationType
//     categoryId?: string
//     search?: string
//     page?: number
//     limit?: number
// }

// export const getAllTrainings = cache(async (options: GetAllTrainingsOptions = {}) => {
//     try {
//         const normalizedPage = Math.max(1, options.page ?? 1)
//         const normalizedLimit = Math.max(1, options.limit ?? 10)
//         const skip = (normalizedPage - 1) * normalizedLimit
//         const search = options.search?.trim()
//         const where = {
//             deletedAt: null,
//             ...(options.status ? { status: options.status } : {}),
//             ...(options.certificationType ? { certification: options.certificationType } : {}),
//             ...(options.categoryId ? { trainingCategoryId: options.categoryId } : {}),
//             ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {})
//         }
//         const [trainings, totalItems] = await Promise.all([
//             prisma.training.findMany({
//                 where,
//                 include: { category: true },
//                 orderBy: { updatedAt: "desc" },
//                 skip, take: normalizedLimit
//             }),
//             prisma.training.count({ where })
//         ])
//         return {
//             data: trainings,
//             totalItems,
//             pagination: {
//                 page: normalizedPage,
//                 limit: normalizedLimit,
//                 totalItems,
//                 totalPages: Math.ceil(totalItems / normalizedLimit)
//             }
//         }
//     } catch (err) {
//         console.error("Failed to fetch trainings data: ", err)
//         return {
//             data: [],
//             totalItems: 0,
//             pagination: {
//                 page: options.page ?? 1,
//                 limit: options.limit ?? 10,
//                 totalItems: 0,
//                 totalPages: 0
//             }
//         }
//     }
// })

// export const getTrainingDataBySlug = cache(async (slug: string) => {
//     try {
//         return await prisma.training.findUnique({
//             where: { slug, deletedAt: null },
//             include: { category: true, seo: true },
//         })
//     } catch (err) {
//         console.error("Failed to fetching training data by slug: ", err)
//         return null
//     }
// })

// // Untuk admin: perlu bisa lihat draft & published, dicari by id
// export const getTrainingById = cache(async (id: string) => {
//     try {
//         return await prisma.training.findUnique({
//             where: { id, deletedAt: null },
//             include: { category: true },
//         })
//     } catch (err) {
//         console.error("Failed to fetch training by id: ", err)
//         return null
//     }
// })

// export const getTotalTrainings = cache(
//     async (options?: { status?: PublishedStatus }) => {
//         try {
//             return await prisma.training.count({
//                 where: {
//                     deletedAt: null,
//                     ...(options?.status ? { status: options.status } : {})
//                 }
//             })
//         } catch (err) {
//             console.error("failed to fetch total data: ", err)
//             return null
//         }
//     })