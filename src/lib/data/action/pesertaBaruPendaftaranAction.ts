"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { tambahKePelaksanaan, validateNamaPerusahaan, validateTujuan } from "./pendaftaranPesertaTransaction"

export async function createPesertaPendaftaran(data: { nama: string; pelaksanaanId: string; pendaftaranPerusahaanId: string | null; cabangId?: string | null }) {
    try {
        const nama = data.nama?.replace(/\s+/g, " ").trim()
        if (!nama || nama.length > 100) throw new Error("Nama peserta wajib diisi, maksimal 100 karakter.")
        const hasil = await prisma.$transaction(async (tx) => {
            const tujuan = await validateTujuan(tx, data.pelaksanaanId, data.pendaftaranPerusahaanId, data.cabangId)
            if (tujuan) await validateNamaPerusahaan(tx, nama, tujuan.perusahaanId)
            const peserta = await tx.peserta.create({ data: { nama, perusahaanCabangId: tujuan?.cabangId ?? null } })
            const result = await tambahKePelaksanaan(tx, data.pelaksanaanId, data.pendaftaranPerusahaanId, [peserta.id], data.cabangId)
            return { ...result, message: `Peserta ditambahkan.${tujuan ? " 1 peserta kini tercatat di perusahaan ini." : ""}` }
        }, { isolationLevel: "Serializable" })
        revalidatePath("/pendaftaran")
        revalidatePath(`/pendaftaran/${data.pelaksanaanId}`)
        revalidatePath(`/permohonan/${data.pelaksanaanId}`)
        revalidatePath("/master/perusahaan", "layout")
        revalidatePath("/master/peserta")
        return { success: true as const, ...hasil }
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : "Gagal menyimpan peserta." }
    }
}
