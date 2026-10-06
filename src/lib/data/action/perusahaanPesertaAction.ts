"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { normalisasiNama } from "@/lib/normalisasi"

// Semua perubahan dari detail perusahaan dibatasi ke perusahaan yang sedang dibuka.
export async function savePerusahaanPeserta(perusahaanId: string, data: {
    nama?: string; cabangId: string; editId?: string; masterId?: string
}) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const cabang = await tx.cabang.findFirst({
                where: { id: data.cabangId, perusahaanId, deletedAt: null, perusahaan: { deletedAt: null } }
            })
            if (!cabang) throw new Error("Cabang aktif perusahaan ini wajib dipilih.")
            if (data.editId && data.masterId) throw new Error("Pilih satu cara menyimpan peserta.")
            const id = data.editId || data.masterId
            const existing = id ? await tx.peserta.findFirst({
                where: { id, deletedAt: null, ...(data.masterId ? { perusahaanCabangId: null } : {
                    cabang: { perusahaanId, deletedAt: null, perusahaan: { deletedAt: null } }
                }) }
            }) : null
            if (id && !existing) throw new Error("Peserta tidak tersedia untuk perusahaan ini.")
            const nama = (data.masterId ? existing?.nama : data.nama)?.trim()
            if (!nama || !normalisasiNama(nama)) throw new Error("Nama peserta wajib diisi.")
            const rows = await tx.peserta.findMany({
                where: { deletedAt: null, cabang: { perusahaanId, deletedAt: null }, ...(id ? { id: { not: id } } : {}) },
                select: { id: true, nama: true }
            })
            const duplicate = rows.find((row) => normalisasiNama(row.nama) === normalisasiNama(nama))
            if (duplicate) return { success: false, error: "Peserta dengan nama yang sama sudah ada di perusahaan ini.", existingId: duplicate.id }
            if (id) await tx.peserta.update({
                where: { id, deletedAt: null, ...(data.masterId ? { perusahaanCabangId: null } : { cabang: { perusahaanId } }) },
                data: { nama, perusahaanCabangId: cabang.id }
            })
            else await tx.peserta.create({ data: { nama, perusahaanCabangId: cabang.id } })
            return { success: true }
        }, { isolationLevel: "Serializable" })
        if (result.success) {
            revalidatePath("/master/perusahaan")
            revalidatePath(`/master/perusahaan/${perusahaanId}`)
            revalidatePath("/master/peserta")
            if (data.editId || data.masterId) revalidatePath(`/master/peserta/${data.editId || data.masterId}`)
        }
        return result
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal menyimpan peserta." }
    }
}

export async function deletePerusahaanPeserta(perusahaanId: string, id: string) {
    try {
        await prisma.$transaction(async (tx) => {
            const peserta = await tx.peserta.findFirst({
                where: { id, deletedAt: null, cabang: { perusahaanId, deletedAt: null, perusahaan: { deletedAt: null } } }
            })
            if (!peserta) throw new Error("Peserta tidak ditemukan di perusahaan ini.")
            if (await tx.pesertaPelaksanaan.count({ where: { pesertaId: id, deletedAt: null } })) {
                throw new Error("Peserta tidak dapat dihapus karena masih memiliki pendaftaran aktif.")
            }
            await tx.peserta.update({ where: { id, deletedAt: null }, data: { deletedAt: new Date() } })
        }, { isolationLevel: "Serializable" })
        revalidatePath(`/master/perusahaan/${perusahaanId}`)
        revalidatePath("/master/perusahaan")
        revalidatePath("/master/peserta")
        revalidatePath(`/master/peserta/${id}`)
        return { success: true }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus peserta." }
    }
}
