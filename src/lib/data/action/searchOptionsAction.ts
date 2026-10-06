"use server"

import { prisma } from "@/lib/prisma"
import { labelTingkatan } from "@/components/main/common/enumLabels"

export async function searchPerusahaanOptions(query: string) {
    const rows = await prisma.perusahaan.findMany({
        where: { deletedAt: null, nama: { contains: query.trim(), mode: "insensitive" } },
        orderBy: { nama: "asc" }, take: 10, select: { id: true, nama: true }
    })
    return rows.map((row) => ({ id: row.id, label: row.nama }))
}

export async function searchTrainingOptions(query: string) {
    const rows = await prisma.training.findMany({
        where: { deletedAt: null, nama: { contains: query.trim(), mode: "insensitive" } },
        orderBy: { nama: "asc" }, take: 10, select: { id: true, nama: true }
    })
    return rows.map((row) => ({ id: row.id, label: row.nama }))
}

export async function searchPesertaOptions(query: string, tanpaPerusahaan = false) {
    const rows = await prisma.peserta.findMany({
        where: { deletedAt: null, nama: { contains: query.trim(), mode: "insensitive" },
            ...(tanpaPerusahaan ? { perusahaanCabangId: null } : {}) },
        orderBy: { nama: "asc" }, take: 10,
        include: { cabang: { where: { deletedAt: null, perusahaan: { deletedAt: null } }, include: { perusahaan: true } } }
    })
    return rows.map((row) => ({ id: row.id, label: row.nama, description: row.cabang?.perusahaan.nama ?? "Tanpa perusahaan" }))
}

export async function searchPicOptions(query: string, perusahaanId?: string, belumTerhubung = false) {
    const rows = await prisma.pic.findMany({
        where: { deletedAt: null, nama: { contains: query.trim(), mode: "insensitive" },
            ...(perusahaanId ? { perusahaanPic: belumTerhubung ? { none: { perusahaanId } } : { some: { perusahaanId, perusahaan: { deletedAt: null } } } } : {}) },
        orderBy: { nama: "asc" }, take: 10
    })
    return rows.map((row) => ({ id: row.id, label: row.nama, description: row.noTelp ?? undefined }))
}

export async function searchPelaksanaanOptions(query: string) {
    const rows = await prisma.pelaksanaan.findMany({
        where: { deletedAt: null, tingkatan: { deletedAt: null, training: { deletedAt: null } }, OR: [
            { noPermohonan: { contains: query.trim(), mode: "insensitive" } },
            { tingkatan: { training: { nama: { contains: query.trim(), mode: "insensitive" } } } }
        ] },
        orderBy: [{ tingkatan: { training: { nama: "asc" } } }, { createdAt: "desc" }], take: 10,
        include: { tingkatan: { include: { training: true } } }
    })
    return rows.map((row) => ({ id: row.id, label: labelTingkatan(row.tingkatan), description: row.noPermohonan ?? "Tanpa nomor" }))
}

export async function getTrainingTingkatan(trainingId: string) {
    return prisma.tingkatan.findMany({ where: { trainingId, deletedAt: null, training: { deletedAt: null } }, orderBy: { kelas: "asc" }, select: { id: true, kelas: true } })
}

export async function getCabangOptions(perusahaanId: string) {
    return prisma.cabang.findMany({ where: { perusahaanId, deletedAt: null, perusahaan: { deletedAt: null } },
        orderBy: [{ tipe: "asc" }, { nama: "asc" }], select: { id: true, nama: true, tipe: true } })
}
