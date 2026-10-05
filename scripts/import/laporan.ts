import fs from "node:fs"
import path from "node:path"
import { bacaCsv, tulisCsv } from "./csv"
import { kunciNama } from "./pemetaan"
import { RencanaImport } from "./tipe"
import { PemetaanAlat } from "./rencana"

export const DIREKTORI_LAPORAN = path.join("data", "import-report")

export function bacaPemetaanPerusahaan(): Map<string, string> {
    const rows = bacaCsv(path.join(DIREKTORI_LAPORAN, "pemetaan_perusahaan.csv"))
    const peta = new Map<string, string>()

    for (const row of rows) {
        const kunci = row["kunci"]?.trim() || kunciNama(row["nama_asli"] ?? "")
        const master = row["nama_master"]?.trim()
        if (kunci && master) peta.set(kunci, master)
    }

    return peta
}

export function bacaPemetaanAlat(): Map<string, PemetaanAlat> {
    const rows = bacaCsv(path.join(DIREKTORI_LAPORAN, "pemetaan_alat.csv"))
    const peta = new Map<string, PemetaanAlat>()

    for (const row of rows) {
        const kunci = row["kunci"]?.trim() || kunciNama(row["nama_alat"] ?? "")
        const training = row["training"]?.trim()
        const kelas = row["kelas"]?.trim()
        if (kunci && training && kelas) peta.set(kunci, { training, kelas })
    }

    return peta
}

export function tulisLaporan(rencana: RencanaImport, jumlahBaris: Map<string, number>): void {
    fs.mkdirSync(DIREKTORI_LAPORAN, { recursive: true })

    // perlu_keputusan.csv
    tulisCsv(
        path.join(DIREKTORI_LAPORAN, "perlu_keputusan.csv"),
        ["sheet", "baris", "kategori", "detail"],
        rencana.keputusan.map((item) => ({
            sheet: item.sheet,
            baris: String(item.baris),
            kategori: item.kategori,
            detail: item.detail,
        }))
    )

    // pemetaan_perusahaan.csv
    const barisPerusahaan: Array<Record<string, string>> = []
    for (const [kunci, master] of rencana.perusahaan) {
        const daftarNama = Array.from(master.namaAsli)
        for (const namaAsli of daftarNama.length > 0 ? daftarNama : [master.nama]) {
            barisPerusahaan.push({
                nama_asli: namaAsli,
                kunci,
                nama_master: master.nama,
                cabang: Array.from(master.cabang).join("; "),
            })
        }
    }
    tulisCsv(
        path.join(DIREKTORI_LAPORAN, "pemetaan_perusahaan.csv"),
        ["nama_asli", "kunci", "nama_master", "cabang"],
        barisPerusahaan
    )

    // pemetaan_alat.csv
    tulisCsv(
        path.join(DIREKTORI_LAPORAN, "pemetaan_alat.csv"),
        ["nama_alat", "kunci", "training", "kelas"],
        Array.from(rencana.alat.entries()).map(([kunci, item]) => ({
            nama_alat: item.namaAsli,
            kunci,
            training: item.training,
            kelas: item.kelas,
        }))
    )

    // ditunda_invoice_pengiriman.csv
    tulisCsv(
        path.join(DIREKTORI_LAPORAN, "ditunda_invoice_pengiriman.csv"),
        ["invoice", "bayar", "kirim", "resi", "keterangan"],
        rencana.ditunda
    )

    // ringkasan.md
    const jumlahPesertaPelaksanaan = Array.from(rencana.pelaksanaan.values()).reduce(
        (total, item) => total + item.peserta.length,
        0
    )
    const jumlahCabang = Array.from(rencana.perusahaan.values()).reduce(
        (total, item) => total + Math.max(1, item.cabang.size + 1),
        0
    )
    const jumlahPendaftaran = Array.from(rencana.pelaksanaan.values()).reduce((total, item) => {
        const perusahaanUnik = new Set(item.peserta.map((peserta) => peserta.perusahaan).filter(Boolean))
        return total + perusahaanUnik.size
    }, 0)

    const ringkasSheet = Array.from(jumlahBaris.entries())
        .map(([sheet, jumlah]) => `- ${sheet}: ${jumlah} baris data terbaca`)
        .join("\n")

    const kategoriKeputusan = new Map<string, number>()
    for (const item of rencana.keputusan) {
        kategoriKeputusan.set(item.kategori, (kategoriKeputusan.get(item.kategori) ?? 0) + 1)
    }
    const rincianKeputusan = Array.from(kategoriKeputusan.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([kategori, jumlah]) => `- ${kategori}: ${jumlah}`)
        .join("\n")

    const isi = `# Ringkasan Impor Excel

Laporan ini dihasilkan mode **dry-run** (tidak menulis ke database).

## Baris terbaca

${ringkasSheet}

## Rencana yang dibentuk

- Perusahaan: ${rencana.perusahaan.size}
- Cabang (termasuk HQ): ${jumlahCabang}
- Peserta: ${rencana.peserta.size}
- PIC: ${rencana.pic.size}
- Kegiatan (Pelaksanaan): ${rencana.pelaksanaan.size}
- Baris peserta pendaftaran: ${jumlahPesertaPelaksanaan}
- Pendaftaran perusahaan: ${jumlahPendaftaran}

## Butuh keputusan manual (${rencana.keputusan.length})

${rincianKeputusan || "- Tidak ada"}

Detail lengkap ada di \`perlu_keputusan.csv\`.

## Berkas lain

- \`perlu_keputusan.csv\` — daftar baris yang butuh keputusan admin.
- \`pemetaan_perusahaan.csv\` — nama asli ke master. Bisa diedit pemilik lalu dibaca ulang.
- \`pemetaan_alat.csv\` — nama alat ke Training dan Tingkatan. Bisa diedit lalu dibaca ulang.
- \`ditunda_invoice_pengiriman.csv\` — data invoice dan pengiriman, disimpan untuk fase Invoice.

## Prosedur commit (khusus pemilik)

1. Periksa \`ringkasan.md\` dan \`perlu_keputusan.csv\`.
2. Sunting \`pemetaan_perusahaan.csv\` dan \`pemetaan_alat.csv\` bila perlu, lalu jalankan dry-run lagi.
3. Bila sudah yakin, jalankan:

   \`\`\`powershell
   $env:ALLOW_IMPORT="1"; npm run import:excel -- --commit
   \`\`\`

   Agent tidak boleh menjalankan langkah ini.
`

    fs.writeFileSync(path.join(DIREKTORI_LAPORAN, "ringkasan.md"), isi, "utf8")
}
