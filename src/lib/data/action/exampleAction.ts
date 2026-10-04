// Ini adalah contoh bagaimana sesi action digunakan dalam proyek ini
// anggaplah file ini bernama trainingAction.ts
"use server"

// import { CertificationType, PublishedStatus } from "@/lib/generated/prisma/client"
// import { prisma } from "@/lib/prisma"
// import { revalidatePath } from "next/cache"

// type DraftInput = {
//     id?: string
//     title: string
//     slug: string
//     image: string
//     description: string
//     trainingCategoryId: string
//     certification?: "KEMNAKER" | "BNSP" | "NONE"
//     status?: PublishedStatus
// }

// export async function saveDraft(input: DraftInput) {
//     const slugValue = input.slug?.trim() || `training-${Date.now()}`

//     if (input.id) {
//         const updated = await prisma.training.update({
//             where: { id: input.id },
//             data: {
//                 title: input.title || "Tanpa Judul",
//                 slug: slugValue,
//                 image: input.image,
//                 description: input.description,
//                 trainingCategoryId: input.trainingCategoryId,
//                 certification: (input.certification as CertificationType) || "KEMNAKER",
//                 status: (input.status as PublishedStatus) || "DRAFT"
//             }
//         })
//         revalidatePath("/admin/training")
//         revalidatePath(`/admin/training/${input.id}`)
//         return { id: updated.id, CertificationType: updated.certification }
//     }

//     const created = await prisma.training.create({
//         data: {
//             title: input.title || "Tanpa Judul",
//             slug: slugValue,
//             image: input.image || "/images/no-image.jpg",
//             description: input.description,
//             trainingCategoryId: input.trainingCategoryId,
//             certification: (input.certification as CertificationType) || "KEMNAKER",
//             status: (input.status as PublishedStatus) || "DRAFT"
//         }
//     })
//     revalidatePath("/admin/training")
//     return { id: created.id, CertificationType: created.certification }
// }

// export async function publishTraining(id: string) {
//     const updated = await prisma.training.update({
//         where: { id },
//         data: {
//             status: "PUBLISHED",
//             publishedAt: new Date(),
//         },
//     })
//     revalidatePath("/admin/training")
//     revalidatePath(`/admin/training/${id}`)
//     revalidatePath("/training")
//     return { success: true, training: updated }
// }

// export async function softDeleteTrainingData(id: string) {
//     const softDeleted = await prisma.training.update({
//         where: { id },
//         data: { deletedAt: new Date() }
//     })
//     revalidatePath("/admin/training")
//     return { success: true, training: softDeleted }
// }

// // Sistem autodelete 30 hari setelah deletadAt != null
// export async function deleteTrainingData(id: string) {
//     await prisma.training.delete({
//         where: { id }
//     })
//     revalidatePath("/admin/training")
//     return { success: true }
// }