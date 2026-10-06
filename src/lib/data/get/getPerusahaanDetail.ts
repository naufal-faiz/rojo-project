import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { TipeCabang } from "@/lib/generated/prisma/enums"

export type PerusahaanDetailQuery = Record<string, string | string[] | undefined>
const value = (query: PerusahaanDetailQuery, key: string) => typeof query[key] === "string" ? query[key] as string : ""
const pageNumber = (value: string) => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : 1

const CABANG_PER_HALAMAN = 5
const PIC_PER_HALAMAN = 5
const PESERTA_PER_HALAMAN = 10

export const getPerusahaanDetail = cache(async (id: string, query: PerusahaanDetailQuery = {}) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { id, deletedAt: null },
            include: {
                cabang: { where: { deletedAt: null }, orderBy: [{ tipe: "asc" }, { nama: "asc" }], select: { id: true, nama: true, tipe: true } }
            }
        })
        if (!perusahaan) return null

        const tipe = value(query, "tipeCabang")
        const cabangWhere = {
            perusahaanId: id, deletedAt: null,
            ...(Object.values(TipeCabang).includes(tipe as TipeCabang) ? { tipe: tipe as TipeCabang } : {}),
            nama: { contains: value(query, "cabangSearch").trim(), mode: "insensitive" as const }
        }
        const picWhere = {
            perusahaanId: id,
            pic: { deletedAt: null, nama: { contains: value(query, "picSearch").trim(), mode: "insensitive" as const } }
        }
        const pesertaScope = { deletedAt: null, cabang: { perusahaanId: id, deletedAt: null } }
        const pesertaWhere = { ...pesertaScope,
            nama: { contains: value(query, "pesertaSearch").trim(), mode: "insensitive" as const },
            ...(value(query, "cabangId") ? { perusahaanCabangId: value(query, "cabangId") } : {})
        }

        const [cabangCount, picCount, pesertaCount, totalPeserta] = await Promise.all([
            prisma.cabang.count({ where: cabangWhere }),
            prisma.perusahaanPic.count({ where: picWhere }),
            prisma.peserta.count({ where: pesertaWhere }),
            prisma.peserta.count({ where: pesertaScope })
        ])
        const cabangPage = Math.min(pageNumber(value(query, "cabangPage")), Math.max(1, Math.ceil(cabangCount / CABANG_PER_HALAMAN)))
        const picPage = Math.min(pageNumber(value(query, "picPage")), Math.max(1, Math.ceil(picCount / PIC_PER_HALAMAN)))
        const pesertaPage = Math.min(pageNumber(value(query, "pesertaPage")), Math.max(1, Math.ceil(pesertaCount / PESERTA_PER_HALAMAN)))

        const [cabang, pic, peserta] = await Promise.all([
            prisma.cabang.findMany({ where: cabangWhere, orderBy: [{ tipe: "asc" }, { nama: "asc" }], skip: (cabangPage - 1) * CABANG_PER_HALAMAN, take: CABANG_PER_HALAMAN }),
            prisma.perusahaanPic.findMany({ where: picWhere, orderBy: { pic: { nama: "asc" } }, skip: (picPage - 1) * PIC_PER_HALAMAN, take: PIC_PER_HALAMAN,
                include: { pic: { include: { _count: { select: { perusahaanPic: { where: { perusahaan: { deletedAt: null } } } } } } } } }),
            prisma.peserta.findMany({ where: pesertaWhere, orderBy: { nama: "asc" }, skip: (pesertaPage - 1) * PESERTA_PER_HALAMAN, take: PESERTA_PER_HALAMAN,
                include: { cabang: { select: { id: true, nama: true } }, _count: { select: { pesertaPelaksanaan: { where: { deletedAt: null, pelaksanaan: { deletedAt: null } } } } } } })
        ])

        return {
            perusahaan,
            totalPeserta,
            totalPic: picCount,
            cabang: { data: cabang, page: cabangPage, totalItems: cabangCount, totalPages: Math.ceil(cabangCount / CABANG_PER_HALAMAN) },
            pic: { data: pic, page: picPage, totalItems: picCount, totalPages: Math.ceil(picCount / PIC_PER_HALAMAN) },
            peserta: { data: peserta, page: pesertaPage, totalItems: pesertaCount, totalPages: Math.ceil(pesertaCount / PESERTA_PER_HALAMAN) }
        }
    } catch (err) {
        console.error("Gagal mengambil detail perusahaan:", err)
        return null
    }
})
