import {
    JenisKegiatan,
    JenisSertifikasi,
    Penyelenggara,
    StatusPeserta,
    StatusTemanK3,
} from "@/lib/generated/prisma/enums"
import { ambil } from "./kolom"
import { parseTanggal, cariSatuTanggal } from "./tanggal"
import {
    bersihkanNamaPic,
    ekstrakStatusPeserta,
    ekstrakStatusTemanK3,
    kunciNama,
    namaPerusahaanBersih,
    petakanJenisKegiatan,
    petakanPenyelenggara,
    pisahAlatKelas,
    pisahAnotasi,
    rapiTeks,
    tipePicDefault,
    jenisSertifikasiDariSheet,
} from "./pemetaan"
import {
    BarisMentah,
    RencanaImport,
    RencanaPelaksanaan,
    RencanaPesertaPelaksanaan,
    rencanaKosong,
} from "./tipe"

export interface PemetaanAlat {
    training: string
    kelas: string
}

interface BarisProses {
    mentah: BarisMentah
    nomorValid: string | null
    signature: string
    perusahaan: string | null
    perusahaanKunci: string | null
    cabang: string | null
    peserta: string | null
    pic: string | null
    status: StatusPeserta | null
    statusTemanK3: StatusTemanK3 | null
    teksStatusTemanK3: string
    penyelenggara: Penyelenggara
    training: string
    kelas: string
    jenisKegiatan: JenisKegiatan
    jenisSertifikasi: JenisSertifikasi
    lokasi: string | null
    tanggal: Date[]
    noRegistrasi: string | null
    noSertifikat: string | null
    masaBerlaku: Date | null
    noSkp: string | null
    tanggalTerima: Date | null
}

function teksSemua(nilai: Record<string, string>): string {
    return Object.values(nilai).join(" | ")
}

function ekstrakNoPermohonan(mentah: BarisMentah, rencana: RencanaImport): {
    nomorValid: string | null
} {
    const mentahNomor = rapiTeks(ambil(mentah.nilai, "noPermohonan").split(" | ")[0] ?? "")
    const nomor = mentahNomor.replace(/[\s\t]/g, "")

    if (!mentahNomor) {
        rencana.keputusan.push({
            sheet: mentah.sheet,
            baris: mentah.baris,
            kategori: "nomor-kosong",
            detail: "Kolom No. Permohonan kosong, kegiatan dibentuk dari kunci alami.",
        })
        return { nomorValid: null }
    }

    if (/^\d+$/.test(nomor)) {
        return { nomorValid: nomor }
    }

    const nonAngka = nomor.toUpperCase()

    if (nonAngka === "?") {
        rencana.keputusan.push({
            sheet: mentah.sheet,
            baris: mentah.baris,
            kategori: "nomor-tanda-tanya",
            detail: `No. Permohonan "${mentahNomor}" belum diisi admin.`,
        })
        return { nomorValid: null }
    }

    if (/CANCEL/i.test(nonAngka)) {
        rencana.keputusan.push({
            sheet: mentah.sheet,
            baris: mentah.baris,
            kategori: "nomor-cancel",
            detail: "Kolom No. Permohonan berisi CANCEL, dipindah menjadi status peserta.",
        })
        return { nomorValid: null }
    }

    // SKP DELTA, SKP LPS, SKP LIK, SKP ITC, PJK3 AKAI: penanda mitra, tanpa nomor.
    return { nomorValid: null }
}

function bangunBarisProses(
    mentah: BarisMentah,
    rencana: RencanaImport,
    pemetaanPerusahaan: Map<string, string>,
    pemetaanAlat: Map<string, PemetaanAlat>
): BarisProses | null {
    const pesertaMentah = rapiTeks(ambil(mentah.nilai, "peserta").split(" | ")[0] ?? "")
    const perusahaanMentah = rapiTeks(ambil(mentah.nilai, "perusahaan").split(" | ")[0] ?? "")

    // Buang baris sampah.
    if (!pesertaMentah && !perusahaanMentah) return null

    // Perusahaan + cabang dari anotasi.
    let perusahaan: string | null = null
    let perusahaanKunci: string | null = null
    let cabang: string | null = null

    if (perusahaanMentah) {
        const pecahan = pisahAnotasi(perusahaanMentah)
        const kunci = kunciNama(pecahan.nama)
        perusahaanKunci = kunci
        perusahaan = pemetaanPerusahaan.get(kunci) ?? namaPerusahaanBersih(pecahan.nama)
        cabang = pecahan.cabang

        const master = rencana.perusahaan.get(perusahaan)
        if (master) {
            master.namaAsli.add(perusahaanMentah)
            if (cabang) master.cabang.add(cabang)
        } else {
            rencana.perusahaan.set(perusahaan, {
                nama: perusahaan,
                namaAsli: new Set([perusahaanMentah]),
                cabang: new Set(cabang ? [cabang] : []),
                tipeCabangUtama: "HQ",
            })
        }
    }

    // Peserta: nama dibersihkan, anotasi status diambil dari seluruh sel.
    const semuaTeks = teksSemua(mentah.nilai)
    const peserta = rapiTeks(pesertaMentah.replace(/\([^)]*\)/g, " ")) || null

    if (peserta) {
        const kunciPeserta = `${kunciNama(peserta)}|${perusahaanKunci ?? ""}`
        if (!rencana.peserta.has(kunciPeserta)) {
            rencana.peserta.set(kunciPeserta, { nama: peserta, perusahaan })
        }
    }

    // Status hasil peserta (dari kolom mana pun).
    const status = ekstrakStatusPeserta(semuaTeks)

    // PIC: buang nama yang sama dengan peserta.
    let pic = bersihkanNamaPic(ambil(mentah.nilai, "pic").split(" | ")[0] ?? "")
    if (pic && peserta && kunciNama(pic) === kunciNama(peserta)) pic = null
    if (pic) {
        const kunciPic = kunciNama(pic)
        if (!rencana.pic.has(kunciPic)) {
            rencana.pic.set(kunciPic, { nama: pic, tipe: tipePicDefault(pic) })
        }
    }

    // Penyelenggara.
    const penyelenggaraMentah = ambil(mentah.nilai, "penyelenggara")
    const penyelenggara = petakanPenyelenggara(penyelenggaraMentah)
    if (penyelenggara.perluKeputusan) {
        rencana.keputusan.push({
            sheet: mentah.sheet,
            baris: mentah.baris,
            kategori: "penyelenggara",
            detail: penyelenggaraMentah
                ? `Penyelenggara "${penyelenggaraMentah}" tidak dikenal, dipakai WINA_KARYA_MULIA.`
                : "Penyelenggara kosong, dipakai WINA_KARYA_MULIA.",
        })
    }

    // Training/tingkatan.
    const alatMentah = ambil(mentah.nilai, "alat").split(" | ")[0] ?? ""
    const kelasMentah = ambil(mentah.nilai, "tingkatan").split(" | ")[0] ?? ""
    const alatPemetaan = pemetaanAlat.get(kunciNama(alatMentah))
    const alatKelas = alatPemetaan ?? pisahAlatKelas(alatMentah, kelasMentah)
    const refresh = /^REF\b|REFRESH/i.test(kelasMentah)
    const kelas = refresh && !alatKelas.kelas.includes("(Refresh)")
        ? `${alatKelas.kelas} (Refresh)`
        : alatKelas.kelas

    if (alatMentah) {
        rencana.alat.set(`${kunciNama(alatMentah)}|${kelas}`, {
            namaAsli: `${alatMentah}${kelasMentah ? ` / ${kelasMentah}` : ""}`,
            training: alatKelas.training,
            kelas,
        })
    }

    // Date.
    const teksTanggal = ambil(mentah.nilai, "tanggal")
    const hasilTanggal = parseTanggal(teksTanggal)
    if (hasilTanggal.gagal) {
        rencana.keputusan.push({
            sheet: mentah.sheet,
            baris: mentah.baris,
            kategori: "tanggal",
            detail: hasilTanggal.gagal,
        })
    }
    if (/FEEB/i.test(teksTanggal)) {
        rencana.keputusan.push({
            sheet: mentah.sheet,
            baris: mentah.baris,
            kategori: "tanggal-typo",
            detail: `Penulisan bulan dicurigai typo: "${teksTanggal}".`,
        })
    }

    // Status TemanK3 (hanya KEMNAKER).
    const teksStatusTemanK3 = ambil(mentah.nilai, "statusTemanK3")
    const statusTemanK3 =
        mentah.sheet === "KEMNAKER" ? (ekstrakStatusTemanK3(teksStatusTemanK3) as StatusTemanK3 | null) : null

    // Jenis sertifikasi: BNSP/KEMNAKER dari sheet, kecuali HANYA MATERI.
    const jenisSertifikasi = /HANYA\s*MATERI/i.test(semuaTeks)
        ? JenisSertifikasi.INTERNAL
        : jenisSertifikasiDariSheet(mentah.sheet)

    // Masa berlaku: durasi "3 THN" menjadi null dan dilaporkan.
    const masaBerlakuMentah = ambil(mentah.nilai, "masaBerlaku")
    let masaBerlaku: Date | null = null
    if (masaBerlakuMentah) {
        if (/\b\d+\s*(THN|TAHUN|BLN|BULAN)\b/i.test(masaBerlakuMentah)) {
            rencana.keputusan.push({
                sheet: mentah.sheet,
                baris: mentah.baris,
                kategori: "masa-berlaku",
                detail: `Masa berlaku berupa durasi "${masaBerlakuMentah}", dijadikan kosong.`,
            })
        } else {
            masaBerlaku = cariSatuTanggal(masaBerlakuMentah)
        }
    }

    const tanggalTerima = cariSatuTanggal(ambil(mentah.nilai, "tanggalTerima"))

    // Kolom invoice/pengiriman disimpan untuk fase Invoice.
    const invoice = ambil(mentah.nilai, "invoice")
    const bayar = ambil(mentah.nilai, "bayar")
    const kirim = ambil(mentah.nilai, "kirim")
    const resi = ambil(mentah.nilai, "resi")

    if (invoice || bayar || kirim || resi) {
        rencana.ditunda.push({
            invoice,
            bayar,
            kirim,
            resi,
            keterangan: `${mentah.sheet} baris ${mentah.baris}: ${peserta ?? perusahaan ?? "-"}`,
        })
    }

    const nomor = ekstrakNoPermohonan(mentah, rencana)
    const lokasi = rapiTeks(ambil(mentah.nilai, "lokasi").split(" | ")[0] ?? "") || null
    const jenisKegiatan = petakanJenisKegiatan(ambil(mentah.nilai, "jenisKegiatan") || semuaTeks)

    const signature = [
        penyelenggara.nilai,
        alatKelas.training,
        kelas,
        lokasi ?? "",
        jenisKegiatan,
        hasilTanggal.tanggal.map((item) => item.toISOString().slice(0, 10)).join("+"),
    ].join("|")

    return {
        mentah,
        nomorValid: nomor.nomorValid,
        signature,
        perusahaan,
        perusahaanKunci,
        cabang,
        peserta,
        pic,
        status,
        statusTemanK3,
        teksStatusTemanK3,
        penyelenggara: penyelenggara.nilai,
        training: alatKelas.training,
        kelas,
        jenisKegiatan,
        jenisSertifikasi,
        lokasi,
        tanggal: hasilTanggal.tanggal,
        noRegistrasi: rapiTeks(ambil(mentah.nilai, "noRegistrasi")) || null,
        noSertifikat: rapiTeks(ambil(mentah.nilai, "noSertifikat")) || null,
        masaBerlaku,
        noSkp: rapiTeks(ambil(mentah.nilai, "noSkp")) || null,
        tanggalTerima,
    }
}

function modus<T>(nilai: T[]): T | null {
    if (nilai.length === 0) return null
    const hitung = new Map<T, number>()
    for (const item of nilai) hitung.set(item, (hitung.get(item) ?? 0) + 1)
    return Array.from(hitung.entries()).sort((a, b) => b[1] - a[1])[0][0]
}

function agregatGrup(
    kunci: string,
    baris: BarisProses[],
    rencana: RencanaImport
): RencanaPelaksanaan {
    const pertama = baris[0]
    const penyelenggara = modus(baris.map((item) => item.penyelenggara)) ?? pertama.penyelenggara
    const jenisKegiatan = modus(baris.map((item) => item.jenisKegiatan)) ?? pertama.jenisKegiatan
    const jenisSertifikasi = modus(baris.map((item) => item.jenisSertifikasi)) ?? pertama.jenisSertifikasi

    // Status TemanK3 = yang terbanyak, laporkan bila berkonflik.
    const statusList = baris
        .map((item) => item.statusTemanK3)
        .filter((item): item is StatusTemanK3 => item !== null)
    const statusUnik = new Set(statusList)
    if (statusUnik.size > 1) {
        rencana.keputusan.push({
            sheet: pertama.mentah.sheet,
            baris: pertama.mentah.baris,
            kategori: "status-temank3-konflik",
            detail: `Status TemanK3 berbeda dalam satu kegiatan: ${Array.from(statusUnik).join(", ")}.`,
        })
    }
    const status = modus(statusList)

    // Tanggal upload paling awal dari teks status.
    const tanggalList = baris
        .map((item) => cariSatuTanggal(item.teksStatusTemanK3))
        .filter((item): item is Date => item !== null)
    tanggalList.sort((a, b) => a.getTime() - b.getTime())
    const uploadedAt = tanggalList[0] ?? null

    // Gabung tanggal sesi unik.
    const semuaTanggal = new Map<string, Date>()
    for (const item of baris) {
        for (const tanggal of item.tanggal) {
            semuaTanggal.set(tanggal.toISOString().slice(0, 10), tanggal)
        }
    }

    const peserta: RencanaPesertaPelaksanaan[] = baris
        .filter((item) => item.peserta)
        .map((item) => ({
            peserta: item.peserta as string,
            perusahaan: item.perusahaan,
            pic: item.pic,
            status: item.status,
            noRegistrasi: item.noRegistrasi,
            noSertifikat: item.noSertifikat,
            masaBerlaku: item.masaBerlaku,
            noSkp: item.noSkp,
            tanggalTerimaSertifikat: item.tanggalTerima,
        }))

    // Duplikat peserta dalam satu kegiatan: ambil nilai terisi, laporkan.
    const petaPeserta = new Map<string, RencanaPesertaPelaksanaan>()
    for (const item of peserta) {
        const kunciPeserta = `${kunciNama(item.peserta)}|${item.perusahaan ?? ""}`
        const ada = petaPeserta.get(kunciPeserta)

        if (!ada) {
            petaPeserta.set(kunciPeserta, item)
            continue
        }

        rencana.keputusan.push({
            sheet: pertama.mentah.sheet,
            baris: pertama.mentah.baris,
            kategori: "duplikat-peserta",
            detail: `Peserta "${item.peserta}" muncul lebih dari sekali di kegiatan ${kunci}.`,
        })

        petaPeserta.set(kunciPeserta, {
            ...ada,
            status: ada.status ?? item.status,
            noRegistrasi: ada.noRegistrasi ?? item.noRegistrasi,
            noSertifikat: ada.noSertifikat ?? item.noSertifikat,
            masaBerlaku: ada.masaBerlaku ?? item.masaBerlaku,
            noSkp: ada.noSkp ?? item.noSkp,
            tanggalTerimaSertifikat: ada.tanggalTerimaSertifikat ?? item.tanggalTerimaSertifikat,
            pic: ada.pic ?? item.pic,
        })
    }

    const perusahaanUnik = new Set(peserta.map((item) => item.perusahaan).filter(Boolean))
    if (jenisKegiatan === "INHOUSE" && perusahaanUnik.size > 1) {
        rencana.keputusan.push({
            sheet: pertama.mentah.sheet,
            baris: pertama.mentah.baris,
            kategori: "inhouse",
            detail: `Kegiatan INHOUSE punya ${perusahaanUnik.size} perusahaan, perlu diperiksa.`,
        })
    }

    const noPermohonan = pertama.nomorValid

    return {
        kunci,
        sheet: pertama.mentah.sheet,
        noPermohonan,
        penyelenggara,
        training: pertama.training,
        kelas: pertama.kelas,
        jenisKegiatan,
        jenisSertifikasi,
        lokasi: baris.map((item) => item.lokasi).find((item) => item) ?? null,
        status,
        uploadedAt,
        tanggal: Array.from(semuaTanggal.values()).sort((a, b) => a.getTime() - b.getTime()),
        peserta: Array.from(petaPeserta.values()),
    }
}

export function bangunRencana(
    barisList: BarisMentah[],
    pemetaanPerusahaan: Map<string, string>,
    pemetaanAlat: Map<string, PemetaanAlat>
): RencanaImport {
    const rencana = rencanaKosong()

    const semuaBaris: BarisProses[] = []
    for (const mentah of barisList) {
        const baris = bangunBarisProses(mentah, rencana, pemetaanPerusahaan, pemetaanAlat)
        if (baris) semuaBaris.push(baris)
    }

    // Kelompokkan per nomor lebih dulu.
    const perNomor = new Map<string, BarisProses[]>()
    const perSignature = new Map<string, BarisProses[]>()
    const signaturePerSheet = (item: BarisProses) => `${item.mentah.sheet}:${item.signature}`

    for (const baris of semuaBaris) {
        if (baris.nomorValid) {
            const daftar = perNomor.get(baris.nomorValid) ?? []
            daftar.push(baris)
            perNomor.set(baris.nomorValid, daftar)
        } else {
            const kunci = signaturePerSheet(baris)
            const daftar = perSignature.get(kunci) ?? []
            daftar.push(baris)
            perSignature.set(kunci, daftar)
        }
    }

    // Satu nomor dipakai dua kegiatan berbeda: nomor tetap pada kegiatan dengan baris terbanyak.
    for (const [nomor, daftar] of perNomor) {
        const perSig = new Map<string, BarisProses[]>()
        for (const baris of daftar) {
            const kunci = signaturePerSheet(baris)
            const isi = perSig.get(kunci) ?? []
            isi.push(baris)
            perSig.set(kunci, isi)
        }

        if (perSig.size <= 1) continue

        const urut = Array.from(perSig.entries()).sort((a, b) => b[1].length - a[1].length)
        const utama = urut[0]

        for (const [signature, barisLain] of urut.slice(1)) {
            rencana.keputusan.push({
                sheet: barisLain[0].mentah.sheet,
                baris: barisLain[0].mentah.baris,
                kategori: "satu-nomor-dua-kegiatan",
                detail: `Nomor ${nomor} juga dipakai kegiatan ${utama[0]}; kegiatan ${signature} dijadikan tanpa nomor.`,
            })

            for (const baris of barisLain) {
                baris.nomorValid = null
                const kunci = signaturePerSheet(baris)
                const daftarLain = perSignature.get(kunci) ?? []
                daftarLain.push(baris)
                perSignature.set(kunci, daftarLain)
            }
        }

        perNomor.set(nomor, utama[1])
    }

    for (const [nomor, daftar] of perNomor) {
        rencana.pelaksanaan.set(`nomor:${nomor}`, agregatGrup(`nomor:${nomor}`, daftar, rencana))
    }

    for (const [signature, daftar] of perSignature) {
        rencana.pelaksanaan.set(`sig:${signature}`, agregatGrup(`sig:${signature}`, daftar, rencana))
    }

    return rencana
}
