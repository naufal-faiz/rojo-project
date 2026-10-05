/** Format tanggal singkat zona WIB, contoh: "3 Okt 2026". */
export const formatTanggal = (value: Date | string): string =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));

/** Ringkasan daftar sesi, dipisah koma. */
export const formatDaftarSesi = (sesi: Array<{ tanggal: Date | string }>): string =>
  sesi.length === 0 ? "-" : sesi.map((item) => formatTanggal(item.tanggal)).join(", ");
