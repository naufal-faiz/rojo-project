"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { tambahKePelaksanaan } from "./pendaftaranPesertaTransaction"
import { normalisasiNama } from "@/lib/normalisasi"

function revalidatePesertaPelaksanaan(pelaksanaanId: string) {
    revalidatePath("/pendaftaran")
    revalidatePath(`/pendaftaran/${pelaksanaanId}`)
    revalidatePath(`/permohonan/${pelaksanaanId}`)
}

// Pencarian peserta untuk modal tambah peserta (dipanggil dari client component).
export async function searchPesertaPendaftaran(pelaksanaanId: string, search?: string, pendaftaranId?: string | null) {
    try {
        const keyword = search?.trim()
        const tujuan = pendaftaranId ? await prisma.pendaftaranPerusahaan.findFirst({ where: { id: pendaftaranId, pelaksanaanId, deletedAt: null, perusahaan: { deletedAt: null } } }) : null
        if (pendaftaranId && !tujuan) return []

        const data = await prisma.peserta.findMany({
            where: {
                deletedAt: null,
                ...(tujuan ? { AND: [{ OR: [{ perusahaanCabangId: null }, { cabang: { perusahaanId: tujuan.perusahaanId, deletedAt: null } }] }] } : {}),
                ...(keyword ? {
                    OR: [
                        { nama: { contains: keyword, mode: "insensitive" as const } },
                        { cabang: { perusahaan: { nama: { contains: keyword, mode: "insensitive" as const } } } }
                    ]
                } : {})
            },
            include: {
                cabang: { include: { perusahaan: true } },
                pesertaPelaksanaan: {
                    where: { pelaksanaanId },
                    select: { deletedAt: true }
                }
            },
            orderBy: { nama: "asc" },
            take: 10
        })

        return data.map((peserta) => ({
            id: peserta.id,
            nama: peserta.nama,
            perusahaan: tujuan ? null : peserta.cabang?.perusahaan?.nama ?? null,
            tanpaPerusahaan: peserta.perusahaanCabangId === null,
            terdaftar: peserta.pesertaPelaksanaan.some((row) => row.deletedAt === null),
            pernahDihapus: peserta.pesertaPelaksanaan.some((row) => row.deletedAt !== null)
        }))
    } catch (err) {
        console.error("Gagal mencari peserta:", err)
        return []
    }
}

// Pratinjau tempel banyak nama: cocok dengan master, baru, atau ditolak.
export async function previewTempelPeserta(pelaksanaanId: string, namaList: string[], pendaftaranId?: string | null) {
    try {
        const tujuan = pendaftaranId ? await prisma.pendaftaranPerusahaan.findFirst({ where: { id: pendaftaranId, pelaksanaanId, deletedAt: null, perusahaan: { deletedAt: null } } }) : null
        if (pendaftaranId && !tujuan) return { cocok: [], baru: [], ditolak: [] }
        const semuaPeserta = await prisma.peserta.findMany({
            where: { deletedAt: null, ...(tujuan ? { OR: [{ perusahaanCabangId: null }, { cabang: { perusahaanId: tujuan.perusahaanId, deletedAt: null } }] } : {}) },
            include: {
                cabang: { include: { perusahaan: true } },
                pesertaPelaksanaan: {
                    where: { pelaksanaanId },
                    select: { deletedAt: true }
                }
            }
        })

        const petaPeserta = new Map<string, (typeof semuaPeserta)[number]>()
        for (const peserta of semuaPeserta) {
            const kunci = normalisasiNama(peserta.nama)
            if (kunci && !petaPeserta.has(kunci)) {
                petaPeserta.set(kunci, peserta)
            }
        }

        const cocok: Array<{ id: string; nama: string; perusahaan: string | null; sudahTerdaftar: boolean }> = []
        const baru: string[] = []
        const ditolak: Array<{ nama: string; alasan: string }> = []
        const sudahDiproses = new Set<string>()

        for (const baris of namaList) {
            const nama = baris.replace(/\s+/g, " ").trim()
            if (!nama) {
                continue
            }

            if (nama.length > 100) {
                ditolak.push({ nama, alasan: "Nama terlalu panjang" })
                continue
            }

            const kunci = normalisasiNama(nama)
            if (!kunci) {
                ditolak.push({ nama, alasan: "Nama kosong setelah dibersihkan" })
                continue
            }

            if (sudahDiproses.has(kunci)) {
                ditolak.push({ nama, alasan: "Duplikat di daftar tempel" })
                continue
            }
            sudahDiproses.add(kunci)

            const peserta = petaPeserta.get(kunci)
            if (peserta) {
                cocok.push({
                    id: peserta.id,
                    nama: peserta.nama,
                    perusahaan: peserta.cabang?.perusahaan?.nama ?? null,
                    sudahTerdaftar: peserta.pesertaPelaksanaan.some((row) => row.deletedAt === null)
                })
            } else {
                baru.push(nama)
            }
        }

        return { cocok, baru, ditolak }
    } catch (err) {
        console.error("Gagal mempratinjau tempel peserta:", err)
        return { cocok: [], baru: [], ditolak: [] }
    }
}

// Menambah peserta ke pendaftaran perusahaan atau sebagai peserta mandiri.
export async function addPesertaPendaftaran(data: {
    pelaksanaanId: string
    pendaftaranPerusahaanId: string | null
    pesertaIds: string[]
    cabangId?: string | null
}) {
    try {
        const pesertaIds = Array.from(new Set(data.pesertaIds)).filter(Boolean)

        if (pesertaIds.length === 0) {
            return { success: false as const, error: "Pilih minimal satu peserta." }
        }

        const hasil = await prisma.$transaction((tx) =>
            tambahKePelaksanaan(tx, data.pelaksanaanId, data.pendaftaranPerusahaanId, pesertaIds, data.cabangId),
            { isolationLevel: "Serializable" }
        )
        revalidatePath("/master/perusahaan", "layout")
        revalidatePath("/master/peserta")
        revalidatePesertaPelaksanaan(data.pelaksanaanId)
        return { success: true as const, ...hasil, peringatan: [] as string[] }
    } catch (err) {
        const pesan = err instanceof Error ? err.message : "Gagal menambah peserta pendaftaran."
        console.error("Gagal menambah peserta pendaftaran:", err)
        return { success: false as const, error: pesan }
    }
}

// Menambah peserta massal dari tempel nama: nama baru dibuat dulu, lalu semuanya didaftarkan.
export async function addPesertaTempel(data: {
    pelaksanaanId: string
    pendaftaranPerusahaanId: string | null
    pesertaIds: string[]
    namaBaru: string[]
}) {
    try {
        const pelaksanaan = await prisma.pelaksanaan.findUnique({
            where: { id: data.pelaksanaanId, deletedAt: null }
        })

        if (!pelaksanaan) {
            return { success: false as const, error: "Permohonan tidak ditemukan atau sudah dihapus." }
        }

        if (data.pendaftaranPerusahaanId) {
            const pendaftaran = await prisma.pendaftaranPerusahaan.findUnique({
                where: { id: data.pendaftaranPerusahaanId, deletedAt: null }
            })

            if (!pendaftaran || pendaftaran.pelaksanaanId !== data.pelaksanaanId) {
                return { success: false as const, error: "Pendaftaran perusahaan tidak ditemukan atau sudah dihapus." }
            }
        }

        const namaBersih = Array.from(
            new Map(
                data.namaBaru
                    .map((nama) => nama.replace(/\s+/g, " ").trim())
                    .filter(Boolean)
                    .map((nama) => [normalisasiNama(nama), nama])
            ).values()
        )

        const pesertaIds = Array.from(new Set(data.pesertaIds)).filter(Boolean)

        if (pesertaIds.length === 0 && namaBersih.length === 0) {
            return { success: false as const, error: "Tidak ada peserta yang bisa disimpan." }
        }

        const hasil = await prisma.$transaction(async (tx) => {
            const idBaru: string[] = []

            for (const nama of namaBersih) {
                const sudahAda = await tx.peserta.findFirst({
                    where: { nama: { equals: nama, mode: "insensitive" }, deletedAt: null }
                })

                if (sudahAda) {
                    idBaru.push(sudahAda.id)
                    continue
                }

                const peserta = await tx.peserta.create({ data: { nama } })
                idBaru.push(peserta.id)
            }

            const semuaId = Array.from(new Set([...pesertaIds, ...idBaru]))
            const tambah = await tambahKePelaksanaan(
                tx,
                data.pelaksanaanId,
                data.pendaftaranPerusahaanId,
                semuaId
            )

            return { ...tambah, pesertaBaru: idBaru.length }
        })

        revalidatePesertaPelaksanaan(data.pelaksanaanId)
        revalidatePath("/master/peserta")
        return { success: true as const, ...hasil }
    } catch (err) {
        const pesan = err instanceof Error ? err.message : "Gagal menambah peserta dari tempel nama."
        console.error("Gagal menambah peserta dari tempel nama:", err)
        return { success: false as const, error: pesan }
    }
}

// Soft delete peserta dari pendaftaran. Peringatan noSertifikat ditangani di UI.
export async function removePesertaPendaftaran(id: string) {
    try {
        const peserta = await prisma.pesertaPelaksanaan.findUnique({
            where: { id, deletedAt: null },
            include: { peserta: true }
        })

        if (!peserta) {
            return { success: false as const, error: "Peserta pendaftaran tidak ditemukan atau sudah dihapus." }
        }

        await prisma.pesertaPelaksanaan.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        revalidatePesertaPelaksanaan(peserta.pelaksanaanId)
        return { success: true as const }
    } catch (err) {
        console.error("Gagal menghapus peserta pendaftaran:", err)
        return { success: false as const, error: "Gagal menghapus peserta pendaftaran." }
    }
}

// Restore peserta pendaftaran. Parent (permohonan dan pendaftaran) harus aktif.
export async function restorePesertaPendaftaran(id: string) {
    try {
        const peserta = await prisma.pesertaPelaksanaan.findUnique({
            where: { id, deletedAt: { not: null } },
            include: {
                pelaksanaan: true,
                pendaftaranPerusahaan: true
            }
        })

        if (!peserta) {
            return { success: false as const, error: "Peserta pendaftaran tidak ditemukan." }
        }

        if (peserta.pelaksanaan.deletedAt !== null) {
            return { success: false as const, error: "Permohonan sudah dihapus. Restore permohonannya dulu." }
        }

        if (peserta.pendaftaranPerusahaan && peserta.pendaftaranPerusahaan.deletedAt !== null) {
            return { success: false as const, error: "Pendaftaran perusahaan sudah dihapus. Restore pendaftarannya dulu." }
        }

        const aktif = await prisma.pesertaPelaksanaan.findFirst({
            where: {
                id: { not: id },
                pesertaId: peserta.pesertaId,
                pelaksanaanId: peserta.pelaksanaanId,
                deletedAt: null
            }
        })

        if (aktif) {
            return { success: false as const, error: "Peserta sudah terdaftar aktif di permohonan ini." }
        }

        await prisma.pesertaPelaksanaan.update({
            where: { id },
            data: { deletedAt: null }
        })

        revalidatePesertaPelaksanaan(peserta.pelaksanaanId)
        return { success: true as const }
    } catch (err) {
        console.error("Gagal merestore peserta pendaftaran:", err)
        return { success: false as const, error: "Gagal merestore peserta pendaftaran." }
    }
}
