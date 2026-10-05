import { prisma } from "@/lib/prisma"
import { RencanaImport, RencanaPelaksanaan } from "./tipe"
import { kunciNama } from "./pemetaan"
import { TipeCabang, TipePic } from "@/lib/generated/prisma/enums"

export interface StatistikCommit {
    perusahaan: number
    cabang: number
    peserta: number
    pic: number
    kegiatan: number
    pendaftaran: number
    pesertaPelaksanaan: number
    dilewati: number
}

function statistikKosong(): StatistikCommit {
    return {
        perusahaan: 0,
        cabang: 0,
        peserta: 0,
        pic: 0,
        kegiatan: 0,
        pendaftaran: 0,
        pesertaPelaksanaan: 0,
        dilewati: 0,
    }
}

async function pastikanPerusahaan(rencana: RencanaImport, statistik: StatistikCommit) {
    const peta = new Map<string, { id: string; cabangId: string }>()

    for (const [kunci, master] of rencana.perusahaan) {
        let perusahaan = await prisma.perusahaan.findFirst({
            where: { nama: { equals: master.nama, mode: "insensitive" } }
        })

        if (!perusahaan) {
            perusahaan = await prisma.perusahaan.create({ data: { nama: master.nama } })
            statistik.perusahaan += 1
        }

        let cabangHq = await prisma.cabang.findFirst({
            where: { perusahaanId: perusahaan.id, tipe: TipeCabang.HQ, deletedAt: null }
        })

        if (!cabangHq) {
            cabangHq = await prisma.cabang.create({
                data: { perusahaanId: perusahaan.id, nama: "HQ", tipe: TipeCabang.HQ }
            })
            statistik.cabang += 1
        }

        for (const namaCabang of master.cabang) {
            const ada = await prisma.cabang.findFirst({
                where: { perusahaanId: perusahaan.id, nama: namaCabang, deletedAt: null }
            })

            if (!ada) {
                await prisma.cabang.create({
                    data: { perusahaanId: perusahaan.id, nama: namaCabang, tipe: TipeCabang.CABANG }
                })
                statistik.cabang += 1
            }
        }

        peta.set(kunci, { id: perusahaan.id, cabangId: cabangHq.id })
    }

    return peta
}

async function pastikanPic(rencana: RencanaImport, statistik: StatistikCommit) {
    const peta = new Map<string, string>()

    for (const [kunci, item] of rencana.pic) {
        let pic = await prisma.pic.findFirst({
            where: { nama: { equals: item.nama, mode: "insensitive" }, deletedAt: null }
        })

        if (!pic) {
            pic = await prisma.pic.create({
                data: { nama: item.nama, tipe: item.tipe as TipePic }
            })
            statistik.pic += 1
        }

        peta.set(kunci, pic.id)
    }

    return peta
}

async function pastikanTingkatan(rencana: RencanaImport) {
    const peta = new Map<string, string>()

    for (const pelaksanaan of rencana.pelaksanaan.values()) {
        const kunci = `${pelaksanaan.training}|${pelaksanaan.kelas}`.toUpperCase()
        if (peta.has(kunci)) continue

        let training = await prisma.training.findFirst({
            where: { nama: { equals: pelaksanaan.training, mode: "insensitive" }, deletedAt: null }
        })

        if (!training) {
            training = await prisma.training.create({ data: { nama: pelaksanaan.training } })
        }

        let tingkatan = await prisma.tingkatan.findFirst({
            where: { trainingId: training.id, kelas: pelaksanaan.kelas, deletedAt: null }
        })

        if (!tingkatan) {
            tingkatan = await prisma.tingkatan.create({
                data: { trainingId: training.id, kelas: pelaksanaan.kelas }
            })
        }

        peta.set(kunci, tingkatan.id)
    }

    return peta
}

async function cariPelaksanaanAda(pelaksanaan: RencanaPelaksanaan, tingkatanId: string) {
    if (pelaksanaan.noPermohonan) {
        const ada = await prisma.pelaksanaan.findUnique({ where: { noPermohonan: pelaksanaan.noPermohonan } })
        if (ada) return ada
    }

    const kandidat = await prisma.pelaksanaan.findMany({
        where: {
            tingkatanId,
            penyelenggara: pelaksanaan.penyelenggara,
            jenisKegiatan: pelaksanaan.jenisKegiatan,
            lokasi: pelaksanaan.lokasi,
            deletedAt: null
        },
        include: { sesi: true }
    })

    const targetTanggal = pelaksanaan.tanggal.map((item) => item.toISOString().slice(0, 10)).join(",")

    return (
        kandidat.find((item) => {
            const tanggal = item.sesi
                .map((sesi) => sesi.tanggal.toISOString().slice(0, 10))
                .sort()
                .join(",")
            return tanggal === targetTanggal
        }) ?? null
    )
}

export async function commitRencana(rencana: RencanaImport): Promise<StatistikCommit> {
    const statistik = statistikKosong()

    const petaPerusahaan = await pastikanPerusahaan(rencana, statistik)
    const petaPic = await pastikanPic(rencana, statistik)
    const petaTingkatan = await pastikanTingkatan(rencana)

    for (const pelaksanaan of rencana.pelaksanaan.values()) {
        const kunciTingkatan = `${pelaksanaan.training}|${pelaksanaan.kelas}`.toUpperCase()
        const tingkatanId = petaTingkatan.get(kunciTingkatan)
        if (!tingkatanId) continue

        const ada = await cariPelaksanaanAda(pelaksanaan, tingkatanId)

        const dataPelaksanaan = await prisma.$transaction(async (tx) => {
            if (ada) {
                statistik.dilewati += 1
                return ada
            }

            const dibuat = await tx.pelaksanaan.create({
                data: {
                    noPermohonan: pelaksanaan.noPermohonan,
                    tingkatanId,
                    jenisKegiatan: pelaksanaan.jenisKegiatan,
                    tipePelaksanaan: "OFFLINE",
                    lokasi: pelaksanaan.lokasi,
                    penyelenggara: pelaksanaan.penyelenggara,
                    jenisSertifikasi: pelaksanaan.jenisSertifikasi,
                    status: pelaksanaan.status,
                    uploadedAt: pelaksanaan.uploadedAt
                }
            })

            if (pelaksanaan.tanggal.length > 0) {
                await tx.sesiPelaksanaan.createMany({
                    data: pelaksanaan.tanggal.map((tanggal) => ({
                        pelaksanaanId: dibuat.id,
                        tanggal
                    }))
                })
            }

            statistik.kegiatan += 1
            return dibuat
        })

        // Kelompokkan peserta per perusahaan.
        const perPerusahaan = new Map<string, typeof pelaksanaan.peserta>()
        const mandiri: typeof pelaksanaan.peserta = []

        for (const peserta of pelaksanaan.peserta) {
            if (!peserta.perusahaan) {
                mandiri.push(peserta)
                continue
            }

            const kunci = kunciNama(peserta.perusahaan)
            const daftar = perPerusahaan.get(kunci) ?? []
            daftar.push(peserta)
            perPerusahaan.set(kunci, daftar)
        }

        const pastikanPesertaPelaksanaan = async (
            targetPesertaId: string,
            item: (typeof pelaksanaan.peserta)[number],
            pendaftaranId: string | null
        ) => {
            const sudah = await prisma.pesertaPelaksanaan.findUnique({
                where: { pesertaId_pelaksanaanId: { pesertaId: targetPesertaId, pelaksanaanId: dataPelaksanaan.id } }
            })

            if (sudah) {
                statistik.dilewati += 1
                return
            }

            await prisma.pesertaPelaksanaan.create({
                data: {
                    pesertaId: targetPesertaId,
                    pelaksanaanId: dataPelaksanaan.id,
                    pendaftaranPerusahaanId: pendaftaranId,
                    status: item.status,
                    noRegistrasi: item.noRegistrasi,
                    noSertifikat: item.noSertifikat,
                    masaBerlaku: item.masaBerlaku,
                    noSkp: item.noSkp,
                    tanggalTerimaSertifikat: item.tanggalTerimaSertifikat
                }
            })
            statistik.pesertaPelaksanaan += 1
        }

        // Peserta per perusahaan + pendaftaran perusahaan.
        for (const [kunciPerusahaan, daftar] of perPerusahaan) {
            const perusahaan = petaPerusahaan.get(kunciPerusahaan)
            if (!perusahaan) continue

            let pendaftaran = await prisma.pendaftaranPerusahaan.findUnique({
                where: {
                    perusahaanId_pelaksanaanId: {
                        perusahaanId: perusahaan.id,
                        pelaksanaanId: dataPelaksanaan.id
                    }
                }
            })

            const picKunci = daftar.map((item) => item.pic).find((item) => item)
            const picId = picKunci ? petaPic.get(kunciNama(picKunci)) ?? null : null

            if (!pendaftaran) {
                pendaftaran = await prisma.pendaftaranPerusahaan.create({
                    data: {
                        perusahaanId: perusahaan.id,
                        pelaksanaanId: dataPelaksanaan.id,
                        picId
                    }
                })
                statistik.pendaftaran += 1
            } else if (pendaftaran.deletedAt !== null) {
                pendaftaran = await prisma.pendaftaranPerusahaan.update({
                    where: { id: pendaftaran.id },
                    data: { deletedAt: null, picId }
                })
            }

            if (picId) {
                const terhubung = await prisma.perusahaanPic.findUnique({
                    where: { perusahaanId_picId: { perusahaanId: perusahaan.id, picId } }
                })

                if (!terhubung) {
                    await prisma.perusahaanPic.create({ data: { perusahaanId: perusahaan.id, picId } })
                }
            }

            for (const item of daftar) {
                const peserta = await prisma.peserta.findFirst({
                    where: {
                        nama: { equals: item.peserta, mode: "insensitive" },
                        perusahaanCabangId: perusahaan.cabangId,
                        deletedAt: null
                    }
                })

                const record =
                    peserta ??
                    (await prisma.peserta.create({
                        data: { nama: item.peserta, perusahaanCabangId: perusahaan.cabangId }
                    }))

                if (!peserta) statistik.peserta += 1

                await pastikanPesertaPelaksanaan(record.id, item, pendaftaran.id)
            }
        }

        // Peserta mandiri.
        for (const item of mandiri) {
            const peserta = await prisma.peserta.findFirst({
                where: {
                    nama: { equals: item.peserta, mode: "insensitive" },
                    perusahaanCabangId: null,
                    deletedAt: null
                }
            })

            const record =
                peserta ??
                (await prisma.peserta.create({ data: { nama: item.peserta } }))

            if (!peserta) statistik.peserta += 1

            await pastikanPesertaPelaksanaan(record.id, item, null)
        }
    }

    return statistik
}
