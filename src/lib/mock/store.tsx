"use client";
import React, { createContext, useContext, useState } from "react";

export type Jenis = "KTP" | "IJAZAH" | "PAS_FOTO" | "SURAT_KERJA" | "PAKTA";
export const JENIS: { key: Jenis; label: string }[] = [
  { key: "KTP", label: "KTP" },
  { key: "IJAZAH", label: "Ijazah" },
  { key: "PAS_FOTO", label: "Pas foto" },
  { key: "SURAT_KERJA", label: "Surat kerja" },
  { key: "PAKTA", label: "Pakta integritas" },
];
export type Dok = { nama: string; url: string; mime: string };
export type Status = "DRAFT" | "SIAP" | "DIKEMBALIKAN" | "DIPAKAI";
export type Pendaftaran = {
  id: string; nik: string; nama: string; tempatLahir: string; tglLahir: string;
  hp: string; alamat: string;
  perusahaan: string; depot: string; alamatUsaha: string | null;
  dok: Partial<Record<Jenis, Dok>>; status: Status; catatan: string;
  permohonanId?: string; hasil?: Hasil; sertifikat?: Dok; noSertifikat?: string; masaBerlaku?: string; masterOnly?: boolean;
};

export const label = (p: Pendaftaran) => (p.perusahaan ? p.perusahaan + (p.depot ? ` - ${p.depot}` : "") : "-");
export const kurang = (p: Pendaftaran) => [
  ...(/^\d{16}$/.test(p.nik) ? [] : ["NIK"]),
  ...(p.nama && p.tempatLahir && p.tglLahir ? [] : ["data diri"]),
  ...JENIS.filter((j) => !p.dok[j.key]).map((j) => j.label),
];

const d = (n: string): Dok => ({ nama: n, url: "/images/logo/logo-image.png", mime: "image/png" });
const all = { KTP: d("ktp.png"), IJAZAH: d("ijazah.png"), PAS_FOTO: d("foto.png"), SURAT_KERJA: d("surat.png"), PAKTA: d("pakta.png") };
const base = { hp: "", alamat: "", catatan: "" };
const seed: Pendaftaran[] = [
  { ...base, id: "1", nik: "3201010101900001", nama: "Budi Santoso", tempatLahir: "Bekasi", tglLahir: "1990-01-01", perusahaan: "PT Maju Jaya", depot: "Banjar", alamatUsaha: "Jl. Raya Banjar No. 5", dok: all, status: "SIAP" },
  { ...base, id: "2", nik: "3201010202920002", nama: "Siti Aminah", tempatLahir: "Bogor", tglLahir: "1992-02-02", perusahaan: "PT Maju Jaya", depot: "", alamatUsaha: "Jl. Industri No. 1", dok: { ...all, PAKTA: undefined }, status: "DRAFT" },
  { ...base, id: "3", nik: "3201010303880003", nama: "Andi Pratama", tempatLahir: "Depok", tglLahir: "1988-03-03", perusahaan: "PT Sinar Baja", depot: "", alamatUsaha: "Jl. Baja No. 9", dok: all, status: "DIKEMBALIKAN", catatan: "Foto KTP buram, mohon upload ulang" },
  { ...base, id: "4", nik: "3201010404950004", nama: "Rina Marlina", tempatLahir: "Cirebon", tglLahir: "1995-04-04", perusahaan: "PT Sinar Baja", depot: "Cikarang", alamatUsaha: "Kawasan Jababeka", dok: { KTP: all.KTP, IJAZAH: all.IJAZAH }, status: "DRAFT" },
  { ...base, id: "5", nik: "3201010505850005", nama: "Dedi Kurniawan", tempatLahir: "Garut", tglLahir: "1985-05-05", perusahaan: "CV Karya Mandiri", depot: "", alamatUsaha: "Jl. Karya No. 3", dok: all, status: "SIAP" },
  { ...base, id: "6", nik: "3201010606870006", nama: "Hendra Wijaya", tempatLahir: "Bandung", tglLahir: "1987-06-06", perusahaan: "PT Sinar Baja", depot: "", alamatUsaha: "Jl. Baja No. 9", dok: all, status: "DIPAKAI", permohonanId: "p0", hasil: "LULUS", noSertifikat: "KEM-2026-0412", masaBerlaku: "2029-09-02", sertifikat: d("sertifikat.png") },
  { ...base, id: "7", nik: "3201010707910007", nama: "Lia Permata", tempatLahir: "Bekasi", tglLahir: "1991-07-07", perusahaan: "CV Karya Mandiri", depot: "", alamatUsaha: "Jl. Karya No. 3", dok: all, status: "DIPAKAI", permohonanId: "p0", hasil: "LULUS" },
  { ...base, id: "8", nik: "3201010808830008", nama: "Maman Surya", tempatLahir: "Cianjur", tglLahir: "1983-08-08", perusahaan: "PT Maju Jaya", depot: "Banjar", alamatUsaha: "Jl. Raya Banjar No. 5", dok: all, status: "DIPAKAI", permohonanId: "p0", hasil: "GAGAL" },
];

export type Hasil = "LULUS" | "GAGAL" | "REMEDIAL" | "IKUT_BATCH_SELANJUTNYA" | "TAKEOUT" | "CANCEL";
export const HASIL: { value: Hasil; label: string }[] = [
  { value: "LULUS", label: "Lulus" }, { value: "GAGAL", label: "Gagal" }, { value: "REMEDIAL", label: "Remedial" },
  { value: "IKUT_BATCH_SELANJUTNYA", label: "Batch berikutnya" }, { value: "TAKEOUT", label: "Takeout" }, { value: "CANCEL", label: "Cancel" },
];
export type Permohonan = {
  id: string; no: string; training: string; kelas: string; jenis: string; tipe: string; lokasi: string;
  penyelenggara: string; sertifikasi: string; sesi: string[]; status: "AKTIF" | "DITUNDA" | "DIBATALKAN"; catatan: string;
};
export type Training = { id: string; nama: string };
export type KelasItem = { id: string; trainingId: string; nama: string };
const seedT: Training[] = [{ id: "t1", nama: "Forklift" }, { id: "t2", nama: "Damkar" }, { id: "t3", nama: "P3K" }];
const seedK: KelasItem[] = [
  { id: "k1", trainingId: "t1", nama: "Operator Kelas 1" }, { id: "k2", trainingId: "t1", nama: "Operator Kelas 2" },
  { id: "k3", trainingId: "t2", nama: "Damkar C" }, { id: "k4", trainingId: "t2", nama: "Damkar D" }, { id: "k5", trainingId: "t3", nama: "Pertolongan Pertama" },
];
type SetS<T> = React.Dispatch<React.SetStateAction<T>>;

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
// 2 hari berurutan jadi "2-5 Desember 2026", terputus jadi "2, 4-5 Desember 2026", lintas bulan dipisah koma.
export function formatSesi(dates: string[]) {
  const parts: Record<string, number[][]> = {};
  [...new Set(dates)].sort().forEach((s) => {
    const [y, m, d] = s.split("-").map(Number);
    const g = (parts[`${BULAN[m - 1]} ${y}`] ??= []);
    const last = g[g.length - 1];
    if (last && last[last.length - 1] === d - 1) last.push(d); else g.push([d]);
  });
  const out = Object.entries(parts).map(([k, g]) => g.map((x) => (x.length > 1 ? `${x[0]}-${x[x.length - 1]}` : `${x[0]}`)).join(", ") + " " + k);
  return out.length ? out.join(", ") : "-";
}
// Belum mulai / berjalan / selesai dihitung dari tanggal, bukan disimpan.
export function statusJadwal(p: Permohonan): { t: string; c: "warning" | "success" | "error" | "info" | "light" } {
  if (p.status === "DIBATALKAN") return { t: "Dibatalkan", c: "error" };
  if (p.status === "DITUNDA") return { t: "Ditunda", c: "warning" };
  const ds = [...p.sesi].sort(); const hari = new Date().toISOString().slice(0, 10);
  if (!ds.length) return { t: "Belum dijadwalkan", c: "light" };
  if (hari < ds[0]) return { t: "Belum mulai", c: "info" };
  return hari > ds[ds.length - 1] ? { t: "Selesai", c: "success" } : { t: "Berjalan", c: "warning" };
}

const seedP: Permohonan[] = [
  { id: "p0", no: "", training: "Damkar", kelas: "Damkar C", jenis: "PUBLIK", tipe: "OFFLINE", lokasi: "Cikarang", penyelenggara: "WINA_KARYA_MULIA", sertifikasi: "KEMNAKER", sesi: ["2026-09-01", "2026-09-02"], status: "AKTIF", catatan: "" },
  { id: "p1", no: "", training: "Forklift", kelas: "Operator Kelas 1", jenis: "PUBLIK", tipe: "OFFLINE", lokasi: "Bekasi", penyelenggara: "WINA_KARYA_MULIA", sertifikasi: "KEMNAKER", sesi: ["2026-12-02", "2026-12-03", "2026-12-04", "2026-12-05"], status: "AKTIF", catatan: "" },
];

type Store = {
  rows: Pendaftaran[]; permohonan: Permohonan[]; training: Training[]; kelasList: KelasItem[];
  setRows: SetS<Pendaftaran[]>; setTraining: SetS<Training[]>; setKelasList: SetS<KelasItem[]>;
  add: (p: Pendaftaran) => void; update: (id: string, patch: Partial<Pendaftaran>) => void; remove: (id: string) => void;
  addP: (p: Permohonan) => void; pilihPeserta: (pid: string, ids: string[]) => void; keluarkan: (id: string) => void; batalkan: (pid: string) => void;
};
const noop = () => {};
const Ctx = createContext<Store>({ rows: [], permohonan: [], training: [], kelasList: [], setRows: noop, setTraining: noop, setKelasList: noop, add: noop, update: noop, remove: noop, addP: noop, pilihPeserta: noop, keluarkan: noop, batalkan: noop });
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [rows, setRows] = useState<Pendaftaran[]>(seed);
  const [permohonan, setP] = useState<Permohonan[]>(seedP);
  const [training, setTraining] = useState<Training[]>(seedT);
  const [kelasList, setKelasList] = useState<KelasItem[]>(seedK);
  const lepas = (x: Pendaftaran): Pendaftaran => ({ ...x, status: "SIAP", permohonanId: undefined, hasil: undefined, sertifikat: undefined });
  const v: Store = {
    rows, permohonan, training, kelasList, setRows, setTraining, setKelasList,
    add: (p) => setRows((r) => [{ ...p, id: crypto.randomUUID() }, ...r]),
    update: (id, patch) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    remove: (id) => setRows((r) => r.filter((x) => x.id !== id)),
    addP: (p) => setP((r) => [{ ...p, id: p.id || crypto.randomUUID() }, ...r]),
    pilihPeserta: (pid, ids) => setRows((r) => r.map((x) => (ids.includes(x.id) ? { ...x, status: "DIPAKAI", permohonanId: pid } : x))),
    keluarkan: (id) => setRows((r) => r.map((x) => (x.id === id ? lepas(x) : x))),
    batalkan: (pid) => { setP((r) => r.map((x) => (x.id === pid ? { ...x, status: "DIBATALKAN" } : x))); setRows((r) => r.map((x) => (x.permohonanId === pid ? lepas(x) : x))); },
  };
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
