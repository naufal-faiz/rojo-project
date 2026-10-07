import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { whereKegiatanAktif } from "./whereKegiatanAktif"
import { JenisKegiatan, JenisSertifikasi, Penyelenggara } from "@/lib/generated/prisma/enums"

type GetRiwayatOptions = {
    search?: string
    page?: number
    limit?: number
    tahun?: number
    penyelenggara?: Penyelenggara
    jenisSertifikasi?: JenisSertifikasi
    jenisKegiatan?: JenisKegiatan
}

// Komplemen daftar aktif: sesi terakhir lebih dari tujuh hari yang lalu (WIB).
export const getRiwayatKegiatan = cache(async (options: GetRiwayatOptions = {}) => {
    try {
        const normalizedPage = Number.isSafeInteger(options.page) && (options.page ?? 0) > 0 ? options.page! : 1
        const normalizedLimit = Math.max(1, options.limit ?? 10)
        const skip = (normalizedPage - 1) * normalizedLimit
        const search = options.search?.trim()

        const syarat: object[] = [
            { NOT: whereKegiatanAktif() }
        ]

        if (options.tahun) {
            syarat.push({
                sesi: {
                    some: {
                        tanggal: {
                            gte: new Date(Date.UTC(options.tahun, 0, 1)),
                            lt: new Date(Date.UTC(options.tahun + 1, 0, 1))
                        }
                    }
                }
            })
        }

        if (options.penyelenggara) syarat.push({ penyelenggara: options.penyelenggara })
        if (options.jenisSertifikasi) syarat.push({ jenisSertifikasi: options.jenisSertifikasi })
        if (options.jenisKegiatan) syarat.push({ jenisKegiatan: options.jenisKegiatan })

        if (search) {
            syarat.push({
                OR: [
                    { noPermohonan: { contains: search, mode: "insensitive" as const } },
                    { tingkatan: { training: { nama: { contains: search, mode: "insensitive" as const } } } },
                    { lokasi: { contains: search, mode: "insensitive" as const } }
                ]
            })
        }

        const where = { deletedAt: null, tingkatan: { deletedAt: null, training: { deletedAt: null } }, AND: syarat }

        const [data, totalItems] = await Promise.all([
            prisma.pelaksanaan.findMany({
                where,
                include: {
                    tingkatan: { include: { training: true } },
                    sesi: { orderBy: { tanggal: "asc" } },
                    pendaftaran: { where: { deletedAt: null }, select: { id: true } },
                    pesertaPelaksanaan: { where: { deletedAt: null }, select: { status: true } }
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
        console.error("Gagal mengambil riwayat kegiatan:", err)
        return {
            data: [],
            totalItems: 0,
            pagination: { page: options.page ?? 1, limit: options.limit ?? 10, totalItems: 0, totalPages: 0 }
        }
    }
})

// Daftar tahun yang punya sesi, untuk filter.
export const getOpsiTahunRiwayat = cache(async () => {
    try {
        const sesi = await prisma.sesiPelaksanaan.findMany({
            where: { pelaksanaan: { deletedAt: null } },
            select: { tanggal: true }
        })

        const tahun = new Set<number>()
        for (const item of sesi) {
            tahun.add(item.tanggal.getUTCFullYear())
        }

        return Array.from(tahun).sort((a, b) => b - a)
    } catch (err) {
        console.error("Gagal mengambil opsi tahun riwayat:", err)
        return []
    }
})
