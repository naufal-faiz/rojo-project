import ExcelJS from "exceljs"
import { BarisMentah, NamaSheet } from "./tipe"

/** Alias header kolom. Dicocokkan setelah header dinormalisasi (huruf besar, spasi rapi). */
const ALIAS: Record<string, string[]> = {
    noPermohonan: ["NO PERMOHONAN", "NO. PERMOHONAN", "NOMOR PERMOHONAN", "NO PERMOHONAN."],
    tanggal: ["TANGGAL PELAKSANAAN", "TANGGAL", "TGL PELAKSANAAN", "TANGGAL KEGIATAN"],
    alat: ["JENIS ALAT", "ALAT", "JENIS PELATIHAN", "TRAINING", "NAMA PELATIHAN"],
    tingkatan: ["TINGKATAN", "KELAS", "JENIS", "LEVEL"],
    perusahaan: ["NAMA PERUSAHAAN", "PERUSAHAAN", "INSTANSI", "KLIEN", "NAMA INSTANSI"],
    peserta: ["NAMA PESERTA", "PESERTA", "NAMA", "NAMA LENGKAP"],
    pic: ["PIC", "NAMA PIC", "PENERIMA SERTIFIKAT"],
    status: ["STATUS", "HASIL", "KETERANGAN", "HASIL PESERTA"],
    statusTemanK3: ["STATUS TEMANK3", "STATUS TEMAN K3", "STATUS UPLOAD", "STATUS PERMOHONAN"],
    noRegistrasi: ["NO REGISTRASI", "NO. REGISTRASI", "REGISTRASI"],
    noSertifikat: ["NO SERTIFIKAT", "NO. SERTIFIKAT", "SERTIFIKAT"],
    masaBerlaku: ["MASA BERLAKU", "MASA BERLAKU SIO", "BERLAKU SAMPAI"],
    noSkp: ["NO SKP", "NO. SKP", "SKP"],
    tanggalTerima: ["TANGGAL TERIMA", "TGL TERIMA", "TANGGAL TERIMA SERTIFIKAT", "TGL TERIMA SERTIFIKAT"],
    penyelenggara: ["PENYELENGGARA", "PJK3", "PENYELENGGARA PJK3"],
    lokasi: ["TEMPAT", "LOKASI", "TEMPAT PELAKSANAAN"],
    jenisKegiatan: ["JENIS KEGIATAN", "TIPE KEGIATAN", "SIFAT KEGIATAN"],
    invoice: ["INVOICE", "NO INVOICE", "NOMOR INVOICE"],
    bayar: ["BAYAR", "PEMBAYARAN", "STATUS BAYAR", "TGL BAYAR"],
    kirim: ["KIRIM", "TANGGAL KIRIM", "TGL KIRIM"],
    resi: ["RESI", "NO RESI", "NOMOR RESI"],
}

export const KUNCI_ALIAS = ALIAS

function normalisasiHeader(nilai: string): string {
    return nilai.replace(/\s+/g, " ").trim().toUpperCase()
}

function keTeks(nilai: ExcelJS.CellValue): string {
    if (nilai === null || nilai === undefined) return ""
    if (nilai instanceof Date) {
        const tahun = nilai.getUTCFullYear()
        const bulan = String(nilai.getUTCMonth() + 1).padStart(2, "0")
        const hari = String(nilai.getUTCDate()).padStart(2, "0")
        return `${tahun}-${bulan}-${hari}`
    }
    if (typeof nilai === "object") {
        if ("richText" in nilai && Array.isArray(nilai.richText)) {
            return nilai.richText.map((bagian) => bagian.text).join("").trim()
        }
        if ("text" in nilai && typeof nilai.text === "string") return nilai.text.trim()
        if ("result" in nilai) return keTeks(nilai.result as ExcelJS.CellValue)
        if ("hyperlink" in nilai && "text" in nilai && typeof nilai.text === "string") {
            return nilai.text.trim()
        }
        return ""
    }
    return String(nilai).replace(/\s+/g, " ").trim()
}

/** Ambil gabungan nilai semua kolom yang cocok dengan alias. */
export function ambil(nilai: Record<string, string>, kunci: string): string {
    const alias = ALIAS[kunci] ?? []
    const bagian: string[] = []

    for (const [header, isi] of Object.entries(nilai)) {
        if (alias.includes(header) && isi) {
            bagian.push(isi)
        }
    }

    return bagian.join(" | ").trim()
}

// Cari baris header dengan mencocokkan alias pada 10 baris pertama.
function cariBarisHeader(worksheet: ExcelJS.Worksheet): { nomor: number; peta: Record<number, string> } | null {
    const semuaAlias = Object.values(ALIAS).flat()

    for (let nomor = 1; nomor <= Math.min(10, worksheet.rowCount); nomor += 1) {
        const row = worksheet.getRow(nomor)
        const peta: Record<number, string> = {}
        let cocok = 0

        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            const teks = normalisasiHeader(keTeks(cell.value))
            if (!teks) return
            if (semuaAlias.includes(teks)) cocok += 1
            peta[colNumber] = teks
        })

        if (cocok >= 2) {
            return { nomor, peta }
        }
    }

    return null
}

export function bacaSheet(worksheet: ExcelJS.Worksheet, sheet: NamaSheet): BarisMentah[] {
    const header = cariBarisHeader(worksheet)
    if (!header) return []

    const hasil: BarisMentah[] = []

    for (let nomor = header.nomor + 1; nomor <= worksheet.rowCount; nomor += 1) {
        const row = worksheet.getRow(nomor)
        const nilai: Record<string, string> = {}
        let adaIsi = false

        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            const headerKolom = header.peta[colNumber]
            if (!headerKolom) return

            const teks = keTeks(cell.value)
            if (!teks) return

            adaIsi = true
            nilai[headerKolom] = nilai[headerKolom] ? `${nilai[headerKolom]} | ${teks}` : teks
        })

        if (adaIsi) {
            hasil.push({ sheet, baris: nomor, nilai })
        }
    }

    return hasil
}

export async function bacaWorkbook(path: string): Promise<Map<NamaSheet, ExcelJS.Worksheet>> {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(path)

    const hasil = new Map<NamaSheet, ExcelJS.Worksheet>()

    for (const worksheet of workbook.worksheets) {
        const nama = worksheet.name.trim().toUpperCase()
        if (nama === "KEMNAKER") hasil.set("KEMNAKER", worksheet)
        if (nama === "BNSP") hasil.set("BNSP", worksheet)
    }

    return hasil
}
