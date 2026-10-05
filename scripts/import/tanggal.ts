const BULAN: Record<string, number> = {
    JAN: 0,
    JANUARI: 0,
    FEB: 1,
    FEEB: 1,
    FEBRUARI: 1,
    MAR: 2,
    MARET: 2,
    APR: 3,
    APRIL: 3,
    MEI: 4,
    JUN: 5,
    JUNI: 5,
    JUL: 6,
    JULI: 6,
    AGU: 7,
    AGUSTUS: 7,
    AGS: 7,
    SEP: 8,
    SEPT: 8,
    SEPTEMBER: 8,
    OKT: 9,
    OKTOBER: 9,
    NOV: 10,
    NOVEMBER: 10,
    DES: 11,
    DESEMBER: 11,
}

const NAMA_HARI = /\b(SENIN|SELASA|RABU|KAMIS|JUMAT|JUM'AT|SABTU|MINGGU)\b,?/gi

function utc(tahun: number, bulan: number, hari: number): Date | null {
    const tanggal = new Date(Date.UTC(tahun, bulan, hari))
    if (
        tanggal.getUTCFullYear() !== tahun ||
        tanggal.getUTCMonth() !== bulan ||
        tanggal.getUTCDate() !== hari
    ) {
        return null
    }
    return tanggal
}

function bulanDariSegmen(segmen: string): number | null {
    const kata = segmen.toUpperCase().match(/[A-Z]+/g) ?? []
    for (const item of kata) {
        if (BULAN[item] !== undefined) return BULAN[item]
    }
    return null
}

/**
 * Parser tanggal teks Indonesia.
 * Mendukung: `Selasa, 18 Feb 2025`, `29 SEPT 2025`, `30/05/2025`,
 * rentang `28-30 APR, 2 & 3 MEI 2025`, `21, 24-28 FEB 2025`.
 */
export function parseTanggal(teks: string): { tanggal: Date[]; gagal: string | null } {
    const bersih = teks.replace(/\s+/g, " ").trim().toUpperCase()
    if (!bersih) return { tanggal: [], gagal: null }

    const iso = bersih.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (iso) {
        const tanggal = utc(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
        return tanggal ? { tanggal: [tanggal], gagal: null } : { tanggal: [], gagal: `Tanggal tidak valid: ${teks}` }
    }

    const slash = bersih.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
    if (slash) {
        const tanggal = utc(Number(slash[3]), Number(slash[2]) - 1, Number(slash[1]))
        return tanggal ? { tanggal: [tanggal], gagal: null } : { tanggal: [], gagal: `Tanggal tidak valid: ${teks}` }
    }

    const tanpaHari = bersih.replace(NAMA_HARI, "").trim()
    const tahunGlobal = tanpaHari.match(/\b(19|20)\d{2}\b/)
    const bulanGlobal = (() => {
        const unik = new Set<number>()
        for (const kata of tanpaHari.match(/[A-Z]+/g) ?? []) {
            if (BULAN[kata] !== undefined) unik.add(BULAN[kata])
        }
        return unik.size === 1 ? Array.from(unik)[0] : null
    })()

    const segmen = tanpaHari.split(",").map((bagian) => bagian.trim()).filter(Boolean)
    const hasil: Date[] = []
    const gagal: string[] = []

    for (const bagian of segmen) {
        const tahunSegmen = bagian.match(/\b(19|20)\d{2}\b/)
        const tahun = tahunSegmen ? Number(tahunSegmen[0]) : tahunGlobal ? Number(tahunGlobal[0]) : null
        const bulan = bulanDariSegmen(bagian) ?? bulanGlobal

        const angka = (bagian.match(/\d+/g) ?? []).map(Number)
        const hari = angka.filter((nilai) => nilai >= 1 && nilai <= 31)

        if (hari.length === 0) continue

        if (tahun === null || bulan === null) {
            gagal.push(bagian)
            continue
        }

        if (/[-–]/.test(bagian) && hari.length >= 2) {
            const awal = hari[0]
            const akhir = hari[hari.length - 1]
            for (let tanggal = awal; tanggal <= akhir; tanggal += 1) {
                const nilai = utc(tahun, bulan, tanggal)
                if (nilai) hasil.push(nilai)
                else gagal.push(`${tanggal}/${bulan + 1}/${tahun}`)
            }
            continue
        }

        for (const tanggal of hari) {
            const nilai = utc(tahun, bulan, tanggal)
            if (nilai) hasil.push(nilai)
            else gagal.push(`${tanggal}/${bulan + 1}/${tahun}`)
        }
    }

    if (hasil.length === 0 && gagal.length === 0) {
        return { tanggal: [], gagal: `Tanggal tidak dikenali: ${teks}` }
    }

    const unik = Array.from(new Map(hasil.map((tanggal) => [tanggal.toISOString(), tanggal])).values())
    unik.sort((a, b) => a.getTime() - b.getTime())

    return { tanggal: unik, gagal: gagal.length > 0 ? `Bagian tanggal tidak valid: ${gagal.join(", ")}` : null }
}

/** Ambil tanggal pertama dari teks bebas (mis. teks status TemanK3). */
export function cariSatuTanggal(teks: string): Date | null {
    const hasil = parseTanggal(teks)
    return hasil.tanggal[0] ?? null
}
