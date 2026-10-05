import {
    JenisKegiatan,
    JenisSertifikasi,
    Penyelenggara,
    StatusTemanK3,
    StatusPeserta,
    TipeCabang,
    TipePic,
} from "@/lib/generated/prisma/enums"

export type NamaSheet = "KEMNAKER" | "BNSP"

/** Satu baris mentah dari Excel (nilai sudah jadi teks). */
export interface BarisMentah {
    sheet: NamaSheet
    baris: number
    nilai: Record<string, string>
}

/** Baris yang butuh keputusan manual pemilik. */
export interface Keputusan {
    sheet: NamaSheet
    baris: number
    kategori: string
    detail: string
}

export interface RencanaPerusahaan {
    nama: string
    namaAsli: Set<string>
    cabang: Set<string>
    tipeCabangUtama: TipeCabang
}

export interface RencanaPeserta {
    nama: string
    perusahaan: string | null
}

export interface RencanaPesertaPelaksanaan {
    peserta: string
    perusahaan: string | null
    pic: string | null
    status: StatusPeserta | null
    noRegistrasi: string | null
    noSertifikat: string | null
    masaBerlaku: Date | null
    noSkp: string | null
    tanggalTerimaSertifikat: Date | null
}

export interface RencanaPelaksanaan {
    kunci: string
    sheet: NamaSheet
    noPermohonan: string | null
    penyelenggara: Penyelenggara
    training: string
    kelas: string
    jenisKegiatan: JenisKegiatan
    jenisSertifikasi: JenisSertifikasi
    lokasi: string | null
    status: StatusTemanK3 | null
    uploadedAt: Date | null
    tanggal: Date[]
    peserta: RencanaPesertaPelaksanaan[]
}

export interface RencanaImport {
    perusahaan: Map<string, RencanaPerusahaan>
    peserta: Map<string, RencanaPeserta>
    pic: Map<string, { nama: string; tipe: TipePic }>
    alat: Map<string, { namaAsli: string; training: string; kelas: string }>
    pelaksanaan: Map<string, RencanaPelaksanaan>
    keputusan: Keputusan[]
    ditunda: Array<{
        invoice: string
        bayar: string
        kirim: string
        resi: string
        keterangan: string
    }>
}

export function rencanaKosong(): RencanaImport {
    return {
        perusahaan: new Map(),
        peserta: new Map(),
        pic: new Map(),
        alat: new Map(),
        pelaksanaan: new Map(),
        keputusan: [],
        ditunda: [],
    }
}
