import {
    JenisKegiatan,
    JenisSertifikasi,
    Penyelenggara,
    StatusPeserta,
    TipePic,
} from "@/lib/generated/prisma/enums"

export function rapiTeks(teks: string): string {
    return teks.replace(/\s+/g, " ").trim()
}

/** Kunci pencocokan nama: huruf besar, tanpa tanda baca, tanpa awalan PT. */
export function kunciNama(nama: string): string {
    return rapiTeks(nama)
        .toUpperCase()
        .replace(/[.,;:'"()/\\-]/g, " ")
        .replace(/\s+/g, " ")
        .replace(/^PT\s+/, "")
        .trim()
}

/** Pisahkan anotasi lokasi dalam kurung menjadi nama cabang. */
export function pisahAnotasi(nama: string): { nama: string; cabang: string | null } {
    const anotasi = nama.match(/\(([^)]+)\)/g)?.map((bagian) => bagian.slice(1, -1).trim()) ?? []
    const tanpaAnotasi = rapiTeks(nama.replace(/\([^)]*\)/g, " "))

    return {
        nama: tanpaAnotasi,
        cabang: anotasi.length > 0 ? anotasi.join(" ") : null,
    }
}

/** Nama perusahaan untuk master: buang PT/titik, rapikan. */
export function namaPerusahaanBersih(nama: string): string {
    return rapiTeks(
        nama
            .replace(/^PT\.?\s+/i, "")
            .replace(/\./g, " ")
    )
}

const PENYELENGGARA_MAP: Array<{ cocok: RegExp; nilai: Penyelenggara }> = [
    { cocok: /WINA\s*KARYA\s*MULIA/i, nilai: Penyelenggara.WINA_KARYA_MULIA },
    { cocok: /DELTA\s*INDONESIA/i, nilai: Penyelenggara.DELTA_INDONESIA },
    { cocok: /LIMA\s*PRIMA|PJK3\s*LPS|\bLPS\b/i, nilai: Penyelenggara.LIMA_PRIMA_SOLUSINDO },
    { cocok: /ARTA\s*KARYA|PJK3\s*AKAI|\bAKAI\b/i, nilai: Penyelenggara.ARTA_KARYA_AREFAA },
    { cocok: /\bLIK\b/i, nilai: Penyelenggara.LIK },
    { cocok: /\bITC\b/i, nilai: Penyelenggara.ITC },
]

export function petakanPenyelenggara(teks: string): {
    nilai: Penyelenggara
    perluKeputusan: boolean
} {
    const bersih = rapiTeks(teks)

    for (const item of PENYELENGGARA_MAP) {
        if (item.cocok.test(bersih)) {
            return { nilai: item.nilai, perluKeputusan: false }
        }
    }

    return { nilai: Penyelenggara.WINA_KARYA_MULIA, perluKeputusan: true }
}

export function petakanJenisKegiatan(teks: string): JenisKegiatan {
    return /IN\s*HOUSE|INHOUSE/i.test(teks) ? JenisKegiatan.INHOUSE : JenisKegiatan.PUBLIK
}

export function jenisSertifikasiDariSheet(sheet: "KEMNAKER" | "BNSP"): JenisSertifikasi {
    return sheet === "KEMNAKER" ? JenisSertifikasi.KEMNAKER : JenisSertifikasi.BNSP
}

const STATUS_PESERTA_POLA: Array<{ cocok: RegExp; nilai: StatusPeserta }> = [
    { cocok: /IKUT\s*BATCH\s*SELANJUTNYA|BATCH\s*SELANJUTNYA/i, nilai: StatusPeserta.IKUT_BATCH_SELANJUTNYA },
    { cocok: /TAKE\s*OUT|TAKEOUT/i, nilai: StatusPeserta.TAKEOUT },
    { cocok: /TIDAK\s*LULUS|GAGAL/i, nilai: StatusPeserta.GAGAL },
    { cocok: /REMEDIAL/i, nilai: StatusPeserta.REMEDIAL },
    { cocok: /\bCANCEL\b/i, nilai: StatusPeserta.CANCEL },
]

/** Ekstrak status hasil peserta dari teks kolom mana pun. */
export function ekstrakStatusPeserta(teks: string): StatusPeserta | null {
    for (const item of STATUS_PESERTA_POLA) {
        if (item.cocok.test(teks)) return item.nilai
    }
    return null
}

/** Ekstrak status TemanK3 dari teks. */
export function ekstrakStatusTemanK3(teks: string): "SUDAH_UPLOAD" | "FU_LPS" | "CANCEL" | null {
    if (/SUDAH\s*UPLOAD/i.test(teks)) return "SUDAH_UPLOAD"
    if (/FU\s*LPS/i.test(teks)) return "FU_LPS"
    if (/\bCANCEL\b/i.test(teks)) return "CANCEL"
    return null
}

const STATUS_TERLARANG_PIC = /\b(CANCEL|TAKEOUT|TAKE OUT|TIDAK LULUS|REMEDIAL|LULUS|GAGAL)\b/i

/** Bersihkan nama PIC dari awalan sapaan dan teks instruksi. */
export function bersihkanNamaPic(teks: string): string | null {
    const bersih = rapiTeks(teks)
    if (!bersih) return null
    if (STATUS_TERLARANG_PIC.test(bersih)) return null
    if (/^DIKIRIM|^KIRIM|ALAMAT/i.test(bersih)) return null

    const tanpaSapaan = rapiTeks(bersih.replace(/^(BAPAK|IBU|PAK|BU|MAS|MBAK)\s+/i, ""))
    if (!tanpaSapaan) return null
    if (tanpaSapaan.length > 60) return null

    return tanpaSapaan
}

const PIC_MITRA = ["IVAN", "FADLI"]
const PIC_DINAS = ["LOUIS"]

export function tipePicDefault(nama: string): TipePic {
    const kunci = kunciNama(nama)
    if (PIC_MITRA.some((item) => kunci.startsWith(item))) return TipePic.MITRA
    if (PIC_DINAS.some((item) => kunci.startsWith(item))) return TipePic.DINAS
    return TipePic.INTERNAL
}

/** Pisahkan nama alat menjadi Training dan Tingkatan, termasuk varian REFRESH. */
export function pisahAlatKelas(alatMentah: string, kelasMentah: string): { training: string; kelas: string } {
    const alat = rapiTeks(alatMentah)
    const kelas = rapiTeks(kelasMentah)

    if (!kelas) {
        return { training: alat || "Tanpa Pelatihan", kelas: "-" }
    }

    const refresh = /^REF\b|REFRESH/i.test(kelas) || /^REF\b|REFRESH/i.test(alat)
    const namaKelas = refresh ? `${kelas} (Refresh)` : kelas

    return { training: alat || "Tanpa Pelatihan", kelas: namaKelas }
}
