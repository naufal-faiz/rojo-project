/** Format tanggal singkat zona WIB, contoh: "3 Okt 2026". */
export const formatTanggal = (value: Date | string | null | undefined): string => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
};

/** Ringkasan daftar sesi, dipisah koma. */
export const formatDaftarSesi = (sesi: Array<{ tanggal: Date | string }>): string =>
  sesi.length === 0 ? "-" : sesi.map((item) => formatTanggal(item.tanggal)).join(", ");

/** Ubah Date menjadi string YYYY-MM-DD untuk input tanggal. */
export const keTanggalInput = (value: Date | string | null | undefined): string => {
  if (!value) return "";

  const tanggal = new Date(value);
  if (Number.isNaN(tanggal.getTime())) return "";

  const tahun = tanggal.getUTCFullYear();
  const bulan = String(tanggal.getUTCMonth() + 1).padStart(2, "0");
  const hari = String(tanggal.getUTCDate()).padStart(2, "0");

  return `${tahun}-${bulan}-${hari}`;
};
