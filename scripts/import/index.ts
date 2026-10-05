import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { bacaSheet, bacaWorkbook } from "./kolom"
import { bangunRencana } from "./rencana"
import {
    bacaPemetaanAlat,
    bacaPemetaanPerusahaan,
    tulisLaporan,
    DIREKTORI_LAPORAN,
} from "./laporan"
import { commitRencana } from "./commit"
import { BarisMentah } from "./tipe"

const FILE_DEFAULT = path.join("data", "MASTER_DATA_PEMBINAAN_2025.xlsx")

function ambilArgumen(args: string[], nama: string): string | null {
    const index = args.indexOf(nama)
    if (index === -1) return null
    return args[index + 1] ?? null
}

async function main() {
    const args = process.argv.slice(2)
    const modeCommit = args.includes("--commit")
    const file = ambilArgumen(args, "--file") ?? FILE_DEFAULT

    if (modeCommit && process.env.ALLOW_IMPORT !== "1") {
        console.error("Mode --commit hanya untuk pemilik dan butuh variabel ALLOW_IMPORT=1.")
        console.error('Contoh: $env:ALLOW_IMPORT="1"; npm run import:excel -- --commit')
        process.exitCode = 1
        return
    }

    if (!fs.existsSync(file)) {
        console.log(`Berkas Excel tidak ditemukan: ${file}`)
        console.log("Letakkan berkas MASTER DATA PEMBINAAN 2025 di folder data/ atau jalankan:")
        console.log("  npm run import:excel -- --file <path-ke-berkas.xlsx>")
        return
    }

    console.log(`Membaca ${file}...`)
    const sheets = await bacaWorkbook(file)

    if (sheets.size === 0) {
        console.log("Sheet KEMNAKER dan BNSP tidak ditemukan di berkas ini.")
        return
    }

    const barisList: BarisMentah[] = []
    const jumlahBaris = new Map<string, number>()

    for (const [namaSheet, worksheet] of sheets) {
        const baris = bacaSheet(worksheet, namaSheet)
        barisList.push(...baris)
        jumlahBaris.set(namaSheet, baris.length)
        console.log(`- Sheet ${namaSheet}: ${baris.length} baris`)
    }

    if (barisList.length === 0) {
        console.log("Tidak ada baris data yang bisa dibaca. Periksa baris header.")
        return
    }

    const pemetaanPerusahaan = bacaPemetaanPerusahaan()
    const pemetaanAlat = bacaPemetaanAlat()

    if (pemetaanPerusahaan.size > 0) {
        console.log(`Pemetaan perusahaan dibaca ulang: ${pemetaanPerusahaan.size} entri.`)
    }
    if (pemetaanAlat.size > 0) {
        console.log(`Pemetaan alat dibaca ulang: ${pemetaanAlat.size} entri.`)
    }

    const rencana = bangunRencana(barisList, pemetaanPerusahaan, pemetaanAlat)
    tulisLaporan(rencana, jumlahBaris)

    console.log("")
    console.log(`Perusahaan       : ${rencana.perusahaan.size}`)
    console.log(`Peserta          : ${rencana.peserta.size}`)
    console.log(`PIC              : ${rencana.pic.size}`)
    console.log(`Kegiatan         : ${rencana.pelaksanaan.size}`)
    console.log(
        `Peserta kegiatan : ${Array.from(rencana.pelaksanaan.values()).reduce(
            (total, item) => total + item.peserta.length,
            0
        )}`
    )
    console.log(`Perlu keputusan  : ${rencana.keputusan.length}`)
    console.log(`Laporan          : ${DIREKTORI_LAPORAN}`)

    if (!modeCommit) {
        console.log("")
        console.log("Mode dry-run: tidak ada data yang ditulis ke database.")
        return
    }

    console.log("")
    console.log("Menulis ke database (--commit)...")
    const statistik = await commitRencana(rencana)
    console.log("Selesai:")
    console.log(`- Perusahaan baru      : ${statistik.perusahaan}`)
    console.log(`- Cabang baru          : ${statistik.cabang}`)
    console.log(`- Peserta baru         : ${statistik.peserta}`)
    console.log(`- PIC baru             : ${statistik.pic}`)
    console.log(`- Kegiatan baru        : ${statistik.kegiatan}`)
    console.log(`- Pendaftaran baru     : ${statistik.pendaftaran}`)
    console.log(`- Peserta kegiatan baru: ${statistik.pesertaPelaksanaan}`)
    console.log(`- Dilewati (sudah ada) : ${statistik.dilewati}`)
}

main().catch((err) => {
    console.error("Impor gagal:", err)
    process.exitCode = 1
})
