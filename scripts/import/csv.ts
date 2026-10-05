import fs from "node:fs"
import path from "node:path"

export function bacaCsv(lokasi: string): Array<Record<string, string>> {
    if (!fs.existsSync(lokasi)) return []

    const isi = fs.readFileSync(lokasi, "utf8").replace(/\r\n/g, "\n").trim()
    if (!isi) return []

    const baris = isi.split("\n")
    const header = pisahBarisCsv(baris[0])

    return baris.slice(1).filter(Boolean).map((satu) => {
        const kolom = pisahBarisCsv(satu)
        const hasil: Record<string, string> = {}
        header.forEach((nama, index) => {
            hasil[nama] = kolom[index] ?? ""
        })
        return hasil
    })
}

function pisahBarisCsv(baris: string): string[] {
    const hasil: string[] = []
    let sekarang = ""
    let dalamKutip = false

    for (let i = 0; i < baris.length; i += 1) {
        const karakter = baris[i]

        if (karakter === '"') {
            if (dalamKutip && baris[i + 1] === '"') {
                sekarang += '"'
                i += 1
                continue
            }
            dalamKutip = !dalamKutip
            continue
        }

        if (karakter === "," && !dalamKutip) {
            hasil.push(sekarang)
            sekarang = ""
            continue
        }

        sekarang += karakter
    }

    hasil.push(sekarang)
    return hasil
}

function escape(nilai: string): string {
    if (/[",\n]/.test(nilai)) {
        return `"${nilai.replace(/"/g, '""')}"`
    }
    return nilai
}

export function tulisCsv(lokasi: string, header: string[], rows: Array<Record<string, string>>): void {
    fs.mkdirSync(path.dirname(lokasi), { recursive: true })

    const baris = [header.join(",")]

    for (const row of rows) {
        baris.push(header.map((nama) => escape(row[nama] ?? "")).join(","))
    }

    fs.writeFileSync(lokasi, `${baris.join("\n")}\n`, "utf8")
}
