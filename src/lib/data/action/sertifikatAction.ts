"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { JenisSertifikasi, StatusPeserta } from "@/lib/generated/prisma/enums"

export type SertifikatFormData = {
    status: StatusPeserta | null
    noRegistrasi?: string | null
    noSertifikat?: string | null
    /** Format YYYY-MM-DD */
    masaBerlaku?: string | null
    noSkp?: string | null
    /** Format YYYY-MM-DD */
    tanggalTerimaSertifikat?: string | null
    catatan?: string | null
}

function keTanggal(nilai?: string | null): Date | null {
    if (!nilai) return null
    const tanggal = new Date(nilai)
    return Number.isNaN(tanggal.getTime()) ? null : tanggal
}

function keTeks(nilai?: string | null): string | null {
    const teks = nilai?.trim()
    return teks ? teks : null
}

// Mengubah hasil dan data sertifikat satu peserta. Semua field opsional.
export async function updateSertifikat(id: string, data: SertifikatFormData) {
    try {
        if (data.status != null && !Object.values(StatusPeserta).includes(data.status)) {
            return { success: false as const, error: "Status hasil tidak valid." }
        }
        const peserta = await prisma.pesertaPelaksanaan.findUnique({
            where: { id, deletedAt: null, peserta: { deletedAt: null }, pelaksanaan: { deletedAt: null } },
            include: { pelaksanaan: true }
        })

        if (!peserta) {
            return { success: false as const, error: "Peserta pendaftaran tidak ditemukan atau sudah dihapus." }
        }

        const jenisSertifikasi = peserta.pelaksanaan.jenisSertifikasi
        const internal = jenisSertifikasi === JenisSertifikasi.INTERNAL
        const kemnaker = jenisSertifikasi === JenisSertifikasi.KEMNAKER

        const noSertifikat = internal ? null : keTeks(data.noSertifikat)

        // Peringatan (bukan blokir) bila nomor sertifikat sudah dipakai peserta lain
        // pada jenis sertifikasi yang sama.
        let peringatan: string | null = null
        if (noSertifikat) {
            const duplikat = await prisma.pesertaPelaksanaan.findFirst({
                where: {
                    id: { not: id },
                    deletedAt: null,
                    noSertifikat,
                    peserta: { deletedAt: null },
                    pelaksanaan: { jenisSertifikasi, deletedAt: null }
                },
                include: { peserta: true, pelaksanaan: { include: { tingkatan: { include: { training: true } } } } }
            })

            if (duplikat) {
                peringatan = `No. Sertifikat ${noSertifikat} sudah dipakai ${duplikat.peserta.nama} (${duplikat.pelaksanaan.tingkatan.training.nama}).`
            }
        }

        const result = await prisma.pesertaPelaksanaan.update({
            where: { id, deletedAt: null, peserta: { deletedAt: null }, pelaksanaan: { deletedAt: null } },
            data: {
                status: data.status ?? null,
                noRegistrasi: internal ? null : keTeks(data.noRegistrasi),
                noSertifikat,
                masaBerlaku: internal ? null : keTanggal(data.masaBerlaku),
                noSkp: kemnaker ? keTeks(data.noSkp) : null,
                tanggalTerimaSertifikat: keTanggal(data.tanggalTerimaSertifikat),
                catatan: keTeks(data.catatan)
            }
        })

        revalidatePath("/sertifikat")
        revalidatePath(`/master/peserta/${peserta.pesertaId}`)
        revalidatePath(`/pendaftaran/${peserta.pelaksanaanId}`)
        revalidatePath(`/permohonan/${peserta.pelaksanaanId}`)
        return { success: true as const, data: result, peringatan }
    } catch (err) {
        console.error("Gagal mengubah sertifikat:", err)
        return { success: false as const, error: "Gagal mengubah sertifikat." }
    }
}

// Ubah status hasil peserta secara massal dalam satu transaksi.
export async function updateStatusMassal(ids: string[], status: StatusPeserta | null) {
    try {
        if (status != null && !Object.values(StatusPeserta).includes(status)) {
            return { success: false as const, error: "Status hasil tidak valid." }
        }
        if (ids.length === 0) {
            return { success: false as const, error: "Pilih minimal satu peserta." }
        }

        const hasil = await prisma.$transaction(async (tx) => {
            const result = await tx.pesertaPelaksanaan.updateMany({
                where: { id: { in: ids }, deletedAt: null, peserta: { deletedAt: null }, pelaksanaan: { deletedAt: null } },
                data: { status: status ?? null }
            })

            return result.count
        })

        revalidatePath("/sertifikat")
        revalidatePath("/permohonan/[id]", "page")
        revalidatePath("/pendaftaran/[pelaksanaanId]", "page")
        revalidatePath("/master/peserta/[id]", "page")
        return { success: true as const, jumlah: hasil }
    } catch (err) {
        console.error("Gagal mengubah status massal:", err)
        return { success: false as const, error: "Gagal mengubah status massal." }
    }
}
