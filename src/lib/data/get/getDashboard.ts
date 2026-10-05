import { prisma } from "@/lib/prisma"
import { cache } from "react"
import { JenisSertifikasi } from "@/lib/generated/prisma/enums"

// Awal hari ini menurut WIB, dikembalikan sebagai UTC (tanggal @db.Date).
function awalHariIniWib(): Date {
    const sekarang = new Date()
    const wib = new Date(sekarang.getTime() + 7 * 60 * 60 * 1000)
    return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()))
}

export const getDashboardData = cache(async () => {
    const hariIni = awalHariIniWib()
    const tahunIni = hariIni.getUTCFullYear()
    const awalTahun = new Date(Date.UTC(tahunIni, 0, 1))
    const awalTahunDepan = new Date(Date.UTC(tahunIni + 1, 0, 1))

    try {
        const [
            kegiatanTahunIni,
            kemnakerBelumUpload,
            pesertaTerdaftar,
            hasilBelumDiisi,
            sesiMendatang,
            sesiLewat
        ] = await Promise.all([
            prisma.pelaksanaan.count({
                where: {
                    deletedAt: null,
                    sesi: { some: { tanggal: { gte: awalTahun, lt: awalTahunDepan } } }
                }
            }),
            prisma.pelaksanaan.count({
                where: {
                    deletedAt: null,
                    jenisSertifikasi: JenisSertifikasi.KEMNAKER,
                    status: null
                }
            }),
            prisma.pesertaPelaksanaan.groupBy({
                by: ["pesertaId"],
                where: { deletedAt: null }
            }),
            prisma.pesertaPelaksanaan.count({
                where: { deletedAt: null, status: null }
            }),
            prisma.sesiPelaksanaan.findMany({
                where: {
                    tanggal: { gte: hariIni },
                    pelaksanaan: { deletedAt: null }
                },
                include: {
                    pelaksanaan: {
                        include: { tingkatan: { include: { training: true } } }
                    }
                },
                orderBy: { tanggal: "asc" }
            }),
            prisma.sesiPelaksanaan.findMany({
                where: {
                    tanggal: { lt: hariIni },
                    pelaksanaan: { deletedAt: null }
                },
                include: {
                    pelaksanaan: {
                        include: { tingkatan: { include: { training: true } } }
                    }
                },
                orderBy: { tanggal: "desc" }
            })
        ])

        // Ambil satu baris pertama (tanggal terdekat/terbaru) per kegiatan.
        const ambilUnik = (rows: typeof sesiMendatang, jumlah: number) => {
            const peta = new Map<string, { id: string; noPermohonan: string | null; label: string; tanggal: Date }>()

            for (const sesi of rows) {
                if (peta.has(sesi.pelaksanaanId)) continue

                peta.set(sesi.pelaksanaanId, {
                    id: sesi.pelaksanaanId,
                    noPermohonan: sesi.pelaksanaan.noPermohonan,
                    label: `${sesi.pelaksanaan.tingkatan.training.nama} - ${sesi.pelaksanaan.tingkatan.kelas}`,
                    tanggal: sesi.tanggal
                })

                if (peta.size >= jumlah) break
            }

            return Array.from(peta.values())
        }

        return {
            stats: {
                kegiatanTahunIni,
                kemnakerBelumUpload,
                pesertaTerdaftar: pesertaTerdaftar.length,
                hasilBelumDiisi
            },
            kegiatanTerdekat: ambilUnik(sesiMendatang, 5),
            kegiatanTerakhir: ambilUnik(sesiLewat, 5)
        }
    } catch (err) {
        console.error("Gagal mengambil data dashboard:", err)
        return {
            stats: { kegiatanTahunIni: 0, kemnakerBelumUpload: 0, pesertaTerdaftar: 0, hasilBelumDiisi: 0 },
            kegiatanTerdekat: [],
            kegiatanTerakhir: []
        }
    }
})
