import type { Prisma } from "@/lib/generated/prisma/client"
import { TipeCabang } from "@/lib/generated/prisma/enums"
import { normalisasiNama } from "@/lib/normalisasi"

export async function validateTujuan(tx: Prisma.TransactionClient, pelaksanaanId: string, pendaftaranId: string | null, cabangId?: string | null) {
    const pelaksanaan = await tx.pelaksanaan.findUnique({ where: { id: pelaksanaanId, deletedAt: null } })
    if (!pelaksanaan) throw new Error("Permohonan tidak ditemukan atau sudah dihapus.")
    if (!pendaftaranId) return null
    const pendaftaran = await tx.pendaftaranPerusahaan.findFirst({
        where: { id: pendaftaranId, pelaksanaanId, deletedAt: null, perusahaan: { deletedAt: null } }
    })
    if (!pendaftaran) throw new Error("Pendaftaran perusahaan tidak ditemukan atau sudah dihapus.")
    const cabang = await tx.cabang.findFirst({ where: {
        perusahaanId: pendaftaran.perusahaanId, deletedAt: null,
        ...(cabangId ? { id: cabangId } : { tipe: TipeCabang.HQ })
    } })
    if (!cabang) throw new Error("Cabang tujuan tidak ditemukan atau bukan milik perusahaan pendaftar.")
    return { perusahaanId: pendaftaran.perusahaanId, cabangId: cabang.id }
}

export async function validateNamaPerusahaan(tx: Prisma.TransactionClient, nama: string, perusahaanId: string, excludeId?: string) {
    const candidates = await tx.peserta.findMany({ where: {
        deletedAt: null, cabang: { perusahaanId, deletedAt: null }, ...(excludeId ? { id: { not: excludeId } } : {})
    }, select: { id: true, nama: true } })
    const duplicate = candidates.find((item) => normalisasiNama(item.nama) === normalisasiNama(nama))
    if (duplicate) throw new Error(`Nama peserta sudah tercatat di perusahaan ini. Lihat /master/peserta/${duplicate.id}. Tambahkan keterangan pada nama untuk orang berbeda.`)
}

export async function tambahKePelaksanaan(tx: Prisma.TransactionClient, pelaksanaanId: string, pendaftaranPerusahaanId: string | null, pesertaIds: string[], cabangId?: string | null) {
    const tujuan = await validateTujuan(tx, pelaksanaanId, pendaftaranPerusahaanId, cabangId)
    const peserta = await tx.peserta.findMany({ where: { id: { in: pesertaIds }, deletedAt: null }, include: { cabang: true } })
    if (peserta.length !== pesertaIds.length) throw new Error("Ada peserta yang tidak ditemukan atau sudah dihapus.")
    if (tujuan && peserta.some((item) => item.perusahaanCabangId && (!item.cabang || item.cabang.deletedAt || item.cabang.perusahaanId !== tujuan.perusahaanId))) {
        throw new Error("Peserta tidak dapat didaftarkan oleh perusahaan ini. Pilih peserta perusahaan ini atau peserta tanpa perusahaan.")
    }
    const rows = await tx.pesertaPelaksanaan.findMany({
        where: { pelaksanaanId, pesertaId: { in: pesertaIds } },
        include: { peserta: true, pendaftaranPerusahaan: { include: { perusahaan: true } } }
    })
    const aktif = rows.filter((row) => row.deletedAt === null)
    if (aktif.length) throw new Error(`Peserta sudah terdaftar: ${aktif.map((row) => `${row.peserta.nama} (${row.pendaftaranPerusahaan?.perusahaan.nama ?? "mandiri"})`).join(", ")}.`)
    let ditautkan = 0
    if (tujuan) for (const item of peserta.filter((item) => !item.perusahaanCabangId)) {
        await validateNamaPerusahaan(tx, item.nama, tujuan.perusahaanId, item.id)
        await tx.peserta.update({ where: { id: item.id }, data: { perusahaanCabangId: tujuan.cabangId } })
        ditautkan++
    }
    const existing = new Map(rows.map((row) => [row.pesertaId, row]))
    let dibuat = 0
    let direstore = 0
    for (const pesertaId of pesertaIds) {
        const row = existing.get(pesertaId)
        if (row) {
            await tx.pesertaPelaksanaan.update({ where: { id: row.id }, data: { deletedAt: null, pendaftaranPerusahaanId } })
            direstore++
        } else {
            await tx.pesertaPelaksanaan.create({ data: { pesertaId, pelaksanaanId, pendaftaranPerusahaanId } })
            dibuat++
        }
    }
    const message = `${dibuat} peserta ditambahkan, ${direstore} dipulihkan.${tujuan ? ` ${ditautkan} peserta kini tercatat di perusahaan ini.` : ""}`
    return { dibuat, direstore, ditautkan, message }
}
