import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { TipeCabang } from "@/lib/generated/prisma/enums"

export type PerusahaanDetailQuery = Record<string, string | string[] | undefined>
const value = (query: PerusahaanDetailQuery, key: string) => typeof query[key] === "string" ? query[key] as string : ""
const pageNumber = (value: string) => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : 1

export const getPerusahaanDetail = cache(async (id: string, query: PerusahaanDetailQuery = {}) => {
    try {
        const perusahaan = await prisma.perusahaan.findUnique({
            where: { id, deletedAt: null },
            include: {
                cabang: { where: { deletedAt: null }, orderBy: [{ tipe: "asc" }, { nama: "asc" }], select: { id: true, nama: true, tipe: true } },
                perusahaanPic: {
                    where: { pic: { deletedAt: null } },
                    include: { pic: { include: { _count: { select: { perusahaanPic: { where: { perusahaan: { deletedAt: null } } } } } } } },
                    orderBy: { pic: { nama: "asc" } }
                }
            }
        })
        if (!perusahaan) return null
        const tipe = value(query, "tipeCabang")
        const cabangWhere = { perusahaanId: id, deletedAt: null,
            ...(Object.values(TipeCabang).includes(tipe as TipeCabang) ? { tipe: tipe as TipeCabang } : {}),
            nama: { contains: value(query, "cabangSearch").trim(), mode: "insensitive" as const }
        }
        const pesertaScope = { deletedAt: null, cabang: { perusahaanId: id, deletedAt: null } }
        const pesertaWhere = { ...pesertaScope,
            nama: { contains: value(query, "pesertaSearch").trim(), mode: "insensitive" as const },
            ...(value(query, "cabangId") ? { perusahaanCabangId: value(query, "cabangId") } : {})
        }
        const [cabangCount, pesertaCount, totalPeserta] = await Promise.all([
            prisma.cabang.count({ where: cabangWhere }), prisma.peserta.count({ where: pesertaWhere }),
            prisma.peserta.count({ where: pesertaScope })
        ])
        const cabangPage = Math.min(pageNumber(value(query, "cabangPage")), Math.max(1, Math.ceil(cabangCount / 5)))
        const pesertaPage = Math.min(pageNumber(value(query, "pesertaPage")), Math.max(1, Math.ceil(pesertaCount / 10)))
        const [cabang, peserta] = await Promise.all([
            prisma.cabang.findMany({ where: cabangWhere, orderBy: [{ tipe: "asc" }, { nama: "asc" }], skip: (cabangPage - 1) * 5, take: 5 }),
            prisma.peserta.findMany({ where: pesertaWhere, orderBy: { nama: "asc" }, skip: (pesertaPage - 1) * 10, take: 10,
                include: { cabang: { select: { id: true, nama: true } }, _count: { select: { pesertaPelaksanaan: { where: { deletedAt: null, pelaksanaan: { deletedAt: null } } } } } } })
        ])
        return { perusahaan, totalPeserta, cabang: { data: cabang, page: cabangPage, totalItems: cabangCount, totalPages: Math.ceil(cabangCount / 5) },
            peserta: { data: peserta, page: pesertaPage, totalItems: pesertaCount, totalPages: Math.ceil(pesertaCount / 10) } }
    } catch (err) {
        console.error("Gagal mengambil detail perusahaan:", err)
        return null
    }
})
