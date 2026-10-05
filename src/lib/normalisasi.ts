// Normalisasi nama untuk pencocokan master (dipakai pendaftaran dan Jalur M).
// Aturan: buang anotasi dalam kurung, rapikan spasi, huruf besar.
export const normalisasiNama = (nama: string): string =>
    nama
        .replace(/\([^)]*\)/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase()
