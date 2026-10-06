import { JenisKegiatan, JenisSertifikasi, Penyelenggara, TipePelaksanaan } from "@/lib/generated/prisma/enums"
import type { StatusTemanK3 } from "@/lib/generated/prisma/enums"
import type { Prisma } from "@/lib/generated/prisma/client"
import { ensureTingkatanUmum } from "./tingkatanUmum"

export interface PelaksanaanInput {
    noPermohonan?: string | null
    trainingId?: string
    tingkatanId?: string
    jenisKegiatan: JenisKegiatan
    tipePelaksanaan: TipePelaksanaan
    lokasi?: string | null
    penyelenggara: Penyelenggara
    jenisSertifikasi: JenisSertifikasi
    status?: StatusTemanK3 | null
    uploadedAt?: Date | null
    catatan?: string | null
    sesi?: string[]
}

export async function validatePelaksanaanInput(tx: Prisma.TransactionClient, input: PelaksanaanInput, id?: string) {
    if (!Object.values(JenisKegiatan).includes(input.jenisKegiatan) || !Object.values(TipePelaksanaan).includes(input.tipePelaksanaan)
        || !Object.values(Penyelenggara).includes(input.penyelenggara) || !Object.values(JenisSertifikasi).includes(input.jenisSertifikasi)) {
        throw new Error("Pilihan informasi kegiatan tidak valid.")
    }
    const noPermohonan = input.noPermohonan?.trim() || null
    if (noPermohonan && await tx.pelaksanaan.findFirst({ where: { noPermohonan, ...(id ? { id: { not: id } } : {}) } })) {
        throw new Error(`No. Permohonan "${noPermohonan}" sudah digunakan.`)
    }
    let tingkatanId = input.tingkatanId
    if (!tingkatanId) {
        if (!input.trainingId) throw new Error("Pilih training terlebih dahulu.")
        tingkatanId = (await ensureTingkatanUmum(tx, input.trainingId)).id
    }
    const tingkatan = await tx.tingkatan.findFirst({ where: { id: tingkatanId, deletedAt: null,
        training: { deletedAt: null }, ...(input.trainingId ? { trainingId: input.trainingId } : {}) } })
    if (!tingkatan) throw new Error("Tingkatan tidak ditemukan atau tidak sesuai training.")
    return { noPermohonan, tingkatanId, jenisKegiatan: input.jenisKegiatan, tipePelaksanaan: input.tipePelaksanaan,
        lokasi: input.lokasi?.trim() || null, penyelenggara: input.penyelenggara,
        jenisSertifikasi: input.jenisSertifikasi, catatan: input.catatan?.trim() || null }
}

export function validateSesi(sesi: string[] = []) {
    return [...new Set(sesi)].sort().map((tanggal) => {
        const date = new Date(`${tanggal}T00:00:00.000Z`)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== tanggal) {
            throw new Error("Tanggal sesi tidak valid.")
        }
        return { tanggal: date }
    })
}
