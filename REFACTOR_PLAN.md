# REFACTOR_PLAN.md — Rapikan branch `v2`

> Dokumen ini menjawab **APA** yang dirapikan dan **URUTANNYA**. Aturan perilaku agent ada di
> `AGENTS_REFACTOR_RULES.md` (tempel ke `AGENTS.md` sebagai bagian baru). Refactor ini **tidak
> mengubah perilaku, tampilan, alur, maupun skema**.

## 1. Temuan (hasil membaca `v2` dan `new`)

| Temuan | Angka |
|---|---|
| Jumlah file `.ts/.tsx` di `src/` (v2) | 142 |
| File yang **tidak terjangkau** dari route/layout mana pun (kode mati) | **78 file, ±8.700 baris** |
| Hotspot "dikompres": `PermohonanView.tsx` | tampak 179 baris, **±568 baris** setelah diformat |
| `PendaftaranView.tsx` | tampak 194, **±472** |
| `lib/mock/store.tsx` | tampak 116, **±358** (tipe + konstanta + seed + helper + context jadi satu) |
| `MasterPeserta.tsx` / `RiwayatView.tsx` / `MasterTraining.tsx` / `AntreanView.tsx` | ±326 / ±219 / ±207 / ±171 |
| Baris sangat panjang (template) | `UserDropdown.tsx` 2.279 karakter (SVG inline), `AppHeader.tsx` 675 |

Penyebab utama: satu file memuat **form modal + tabel + konfirmasi + state + data** sekaligus, lalu
ditulis rapat agar "terlihat pendek". Jumlah baris yang tampak bukan ukuran sebenarnya.

### Pola struktur di branch `new` yang dijadikan acuan

Satu fitur = satu folder di `components/main/<fitur>/`, dengan peran file yang tetap:

| Peran | Pola nama | Isi |
|---|---|---|
| Perakit tipis | `<Entitas>List.tsx` / `<Entitas>View.tsx` | menyusun komponen lain, tanpa logika berat |
| Kolom tabel | `<Entitas>Columns.tsx` | definisi kolom `DataTable` |
| Form | `<Entitas>Form.tsx`, `<Kelompok>Fields.tsx` | satu kelompok field per file |
| Logika | `use<Entitas><Tujuan>.ts` | state, submit, transisi |
| Tipe & konstanta | `<entitas>Types.ts`, `<nama>.ts` | tipe, default, opsi, peta label |
| Halaman | `app/(dashboard)/<route>/page.tsx` | server component tipis |

Contoh di `new`: `peserta/` = `PesertaList` (103) + `PesertaColumns` (23) + `usePesertaQuery` (19) +
`PesertaForm` (145). Pola inilah yang ditiru, dengan batas lebih ketat (±100 baris).

> **Perbedaan penting `new` vs `v2` (jangan tertukar).** `new` memakai aturan **tanpa modal** (panel
> inline, `FlashAlert`, `InlineConfirm`). `v2` memakai **modal**, `ConfirmDialog`, dan toast
> (`useToast`) sesuai revisi klien. Refactor ini hanya meminjam **cara memecah file** dari `new`,
> **bukan** aturan UI-nya. Jangan memigrasi modal ke inline.

## 2. Target ukuran

| Jenis file | Target | Batas keras |
|---|---|---|
| Komponen, hook, columns, form, fields | ≤ 100 baris | 120 |
| Data murni (seed, peta label, tipe) | ≤ 150 baris | 150 |
| Panjang baris | ≤ 100 karakter | 120 (hanya satu string `className` yang tak bisa dipecah) |
| Satu fungsi/komponen | ≤ 80 baris | 90 |
| Satu tanggung jawab per file | wajib | — |

Baris dihitung setelah diformat Prettier (`--print-width 100`), tanpa baris kosong dan komentar.

## 3. Keputusan pemilik (butuh jawaban sebelum fase terkait)

| ID | Pertanyaan | Rekomendasi (dipakai jika tidak dijawab) |
|---|---|---|
| D1 | Hapus kode mati? Dipisah tiga golongan (lihat Fase 1). Pemeriksaan skema menunjukkan `lib/data/*` memakai model `tingkatan`, `pic`, `perusahaanPic` yang **tidak ada** di `prisma/schema.prisma` v2 (v2 memakai `Kelas`, `Dokumen`, `StatusPendaftaran`) | **1a hapus. 1b arsipkan lalu hapus. 1c tidak dihapus** |
| D2 | Pindahkan folder `master/*` ke folder fitur (`peserta/`, `training/`, `riwayat-kegiatan/`, `dashboard/`) agar sejajar dengan `new`? | **Ya** |
| D3 | Tambah `prettier` sebagai devDependency + `.prettierrc` (`printWidth: 100`)? | **Ya**. Tanpa ini agent berikutnya akan memadatkan kode lagi. Alternatif: tanpa dependency, pakai `npx prettier@3` sekali jalan |
| D4 | Template TailAdmin (`AppHeader`, `UserDropdown`, `DatePickerInput`, `ui/alert/Alert`) ikut dipecah? | **Ya**, di fase terakhir, prioritas terendah |

## 4. Rencana fase

Setiap fase = satu atau beberapa commit. Gerbang kualitas (`AGENTS_REFACTOR_RULES.md` §9) harus bersih
sebelum commit. Fase berikutnya tidak dimulai sebelum fase sebelumnya hijau.

### Fase 0 — Baseline (tanpa mengubah kode)
1. `git checkout -b refactor/v2-structure` dari `v2`, lalu `git tag pre-refactor`.
2. Jalankan `npm run lint`, `npx tsc --noEmit`, `npm run build`. Catat hasil awal di `REFACTOR_PROGRESS.md`
   (jika sudah merah sebelum disentuh, catat sebagai "merah bawaan", bukan salah refactor).
3. Hitung ulang file mati dengan analisis keterjangkauan (§6) dan catat daftarnya.
4. Tulis checklist uji manual (§7) dan jalankan sekali sebagai **pembanding awal**.

### Fase 1 — Bersihkan kode mati (setelah D1)
Kode mati dibagi tiga golongan menurut kemungkinan dipakai lagi saat tahap backend.

| Golongan | Isi | Tindakan |
|---|---|---|
| **1a. Demo template** | `form/form-elements/*`, duplikat di `form/*`, `main/Modal/*`, `main/tables/BasicTableOne`, `ui/images/*`, `ui/avatar/*`, `ui/Alert.tsx` (duplikat), `lib/data/*/example*.ts` | **Hapus.** Tidak berhubungan dengan alur Rojo dan bisa diambil lagi dari TailAdmin, `build`, atau `new` |
| **1b. Modul lama alur lama** | `permohonan/PelaksanaanList`, `PelaksanaanFormModal`, `SesiManager`; `peserta/*`, `perusahaan/*`, `training/*` (Modal lama); `common/AlertDialog` | **Arsipkan lalu hapus.** Dibuat untuk alur lama (master perusahaan, form langsung) yang sudah diganti alur temanK3. Sudah diganti `master/*`, `PermohonanView`, `PendaftaranView` |
| **1c. Lapisan data Prisma** | `lib/data/get/*`, `lib/data/action/*` (kecuali `authAction`, yang masih terpakai) | **Jangan dihapus dulu.** Pindahkan ke `docs/legacy-data-layer/` di luar `src/` (tidak ikut lint, tsc, dan ukuran), sebagai bahan rujukan pola saat backend. Tulis `README` singkat: "ditulis untuk skema lama, harus disesuaikan" |

Urutan dan pengaman (hasil pemeriksaan header):
- **Kerjakan 1b lebih dulu, baru 1a.** Semua pengimpor `main/Modal/AlertModal` adalah file golongan 1b.
  Menghapus `main/Modal/*` sebelum 1b akan membuat `tsc` gagal.
- **Header tidak terpengaruh.** `AppHeader`, `UserDropdown`, dan `NotificationItem` memakai
  `next/image` langsung ke `/images/user/user-01.png` dan `/images/logo/*`, bukan `ui/avatar/*`.
  Jangan menghapus `public/images/**` dan `lib/data/action/authAction.ts` (dipakai `signOutAction`).
- `ui/avatar/*` tetap boleh dihapus; bila nanti avatar perlu komponen sendiri, tulis ulang kecil.

Syarat umum:
- Sebelum menghapus, buat tag `archive/pre-cleanup` pada commit terakhir yang masih memuat file itu.
- Hapus hanya file yang tidak terjangkau saat dicek ulang (§6). `common/StatusBadge` dikecualikan
  dari 1a/1b: putuskan di fase 4 apakah dipakai untuk `statusUi`.
- Setelah tiap golongan: `tsc` dan `build` bersih. `prisma/` tidak disentuh.
- Perkiraan hasil: ±56 file (1a+1b) keluar dari `src/`; 1c ±1.300 baris dipindah ke `docs/`.

### Fase 2 — Pecah `lib/mock/store.tsx` (fondasi, dikerjakan sebelum view)
Semua view bergantung padanya, jadi dipecah dulu. Path `@/lib/mock/store` **dipertahankan** sebagai
barrel (`store.ts` hanya `export *`) supaya import lama tidak rusak; barrel boleh dihapus di fase 7.

```
lib/mock/
  types.ts               Jenis, Dok, Status, Hasil, Pendaftaran, Permohonan, Training, KelasItem
  constants.ts           JENIS, HASIL, BULAN, PAGE_LIMIT
  pendaftaranHelpers.ts  label(), kurang()
  sesi.ts                formatSesi(), statusJadwal()   (digabung dengan lib/session-dates.ts bila sejenis)
  seed/
    pendaftaranSeed.ts   data murni
    permohonanSeed.ts    data murni
    trainingSeed.ts      Training + KelasItem
  StoreContext.tsx       Context + StoreProvider (≤100)
  useStore.ts            hook akses context
  storeActions.ts        addP, pilihPeserta, keluarkan, batalkan (fungsi murni bila memungkinkan)
  store.ts               barrel re-export
```

### Fase 3 — Pembantu bersama (kecil, sekali saja)
Dikerjakan **sebelum** memecah view supaya tidak menyalin pembantu yang sama berulang kali. Hanya
daftar ini yang boleh dibuat baru:

| Nama | Lokasi | Menggantikan |
|---|---|---|
| `labelClass` | `components/main/common/formStyles.ts` | `const lbl = "mb-1 text-xs"` (diulang di 4+ file) |
| `toOptions` | `components/main/common/options.ts` | `const opt = (a) => a.map(...)` |
| `PAGE_LIMIT` | `lib/mock/constants.ts` | `const LIMIT = 12` (diulang di 5 file) |
| `cekFile` | `lib/files/cekFile.ts` | `export const cekFile` di dalam `PermohonanView.tsx` |
| `usePagedSearch` | `hooks/usePagedSearch.ts` | pola `q` + `page` + filter + potong halaman di 5 view |

### Fase 4 — Dua file terbesar
**`PermohonanView.tsx` (±568 → ±12 file)**

```
permohonan/
  PermohonanView.tsx           perakit: PageHeader + DataTable + modal terbuka (≤100)
  PermohonanColumns.tsx
  usePermohonanView.ts         q, buat, kelola, batal
  BuatPermohonanModal.tsx      cangkang Modal + tombol (komponen `Buat`)
  BuatPermohonanFields.tsx     training/kelas/jenis/lokasi/penyelenggara
  SesiTanggalFields.tsx        tgl, akhir, mode, skipWeekend
  usePermohonanForm.ts         state f + submit
  permohonanDefaults.ts        `kosong`
  KelolaModal.tsx              cangkang (komponen `Kelola`)
  KelolaPesertaTable.tsx       peserta terdaftar + aksi keluarkan/ganti dokumen
  KelolaPilihPeserta.tsx       pilih dari antrean
  KelolaConfirms.tsx           dua ConfirmDialog
  useKelolaPermohonan.ts
  StatusTemanK3Cell.tsx / statusTemanK3.ts   (sudah ada, tetap)
```

**`PendaftaranView.tsx` (±472 → ±10 file)**

```
pendaftaran/
  PendaftaranView.tsx
  PendaftaranColumns.tsx
  usePendaftaranView.ts
  PendaftaranFormModal.tsx     cangkang Modal (komponen `Form`)
  PendaftaranDataDiriFields.tsx
  PendaftaranPerusahaanFields.tsx
  PendaftaranDokumenFields.tsx
  usePendaftaranForm.ts        f, pending, isDepot, ganti, ulang + submit
  pendaftaranStatus.ts         statusUi, kosong
  DokumenChips.tsx             (sudah ada)
```

### Fase 5 — View master dan antrean (pindah ke folder fitur, setelah D2)

| Dari | Ke | Dipecah menjadi |
|---|---|---|
| `master/MasterPeserta.tsx` (326) | `peserta/` | `PesertaView`, `PesertaColumns`, `PesertaDetailModal`, `PesertaDetailFields`, `usePesertaDetail`, `usePesertaView` |
| `master/RiwayatView.tsx` (219) | `riwayat-kegiatan/` | `RiwayatView`, `RiwayatColumns`, `RiwayatDetailModal`, `RiwayatPesertaTable`, `useRiwayat` |
| `master/MasterTraining.tsx` (207) | `training/` | `TrainingView`, `TrainingColumns`, `TrainingFormModal`, `KelasFields`, `useTrainingView` |
| `pendaftaran/AntreanView.tsx` (171) | `antrean/` | `AntreanView`, `AntreanColumns`, `AntreanKembalikanModal`, `useAntrean` |
| `master/DashboardView.tsx` (26) | `dashboard/` | tetap satu file |

`page.tsx` di `app/(dashboard)/**` hanya berganti path import. Nama folder fitur mengikuti `new`.

### Fase 6 — Layout dan template (setelah D4)

| File | Pecah menjadi |
|---|---|
| `layout/AppHeader.tsx` (180) | `AppHeader` + `HeaderSidebarToggle` + `HeaderSearch` + `HeaderActions` |
| `main/Dropdown/UserDropdown.tsx` (170, baris 2.279 karakter) | `UserDropdown` + `UserDropdownMenu` + `userMenuItems.ts`; SVG inline dipindah **apa adanya** ke `src/icons/` sebagai ekspor baru (tidak mengubah tampilan) |
| `common/DatePickerInput.tsx` (284) | `DatePickerInput` + `DatePickerCalendar` + `useDatePicker` + `dateUtils.ts` |
| `common/DataTable.tsx` (152) | `DataTable` + `DataTablePagination` + `dataTableTypes.ts` |
| `ui/alert/Alert.tsx` (146), `Header/NotificationDropdown.tsx` (107), `Sidebar/SidebarNavItem.tsx` (111) | rapikan, potong hingga ≤ 100 |
| `icons/index.tsx` (140) | dikecualikan (daftar ekspor/data) |

### Fase 7 — Kunci agar tidak kembali berantakan
1. Aktifkan aturan ESLint (tanpa dependency baru, semuanya aturan bawaan):

```js
// eslint.config.mjs (tambahan)
{
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/lib/mock/seed/**", "src/icons/**"],
  rules: {
    "max-lines": ["error", { max: 120, skipBlankLines: true, skipComments: true }],
    "max-len": ["error", { code: 120, ignoreUrls: true, ignoreStrings: true,
                           ignoreTemplateLiterals: true }],
    "max-lines-per-function": ["warn", { max: 90, skipBlankLines: true, skipComments: true }],
    "max-statements-per-line": ["error", { max: 1 }],
  },
},
```
2. Tambah `scripts/check-size.sh` (§6) dan skrip npm `check:size`.
3. Tempel `AGENTS_REFACTOR_RULES.md` ke `AGENTS.md`; perbarui bagian "Cara kerja agent" agar
   merujuk batas ±100 baris.
4. Hapus barrel `lib/mock/store.ts` bila semua import sudah diperbarui, lalu rapikan `PROGRESS`.

## 5. Ringkasan hasil yang diharapkan

| | Sebelum | Sesudah (perkiraan) |
|---|---|---|
| File `src/` | 142 | ±110 (64 live dikurangi mati, ditambah hasil pecahan) |
| File terbesar | ±568 baris | ≤ 120 |
| Baris > 140 karakter | puluhan file | 0 |
| Kode mati | 78 file | 0 |

## 6. Alat bantu

**Analisis keterjangkauan (kode mati).** Telusuri impor mulai dari semua `app/**/page.tsx`,
`app/**/layout.tsx`, dan `src/middleware.ts` (alias `@/` = `src/`, termasuk `index.ts(x)`). File yang
tidak pernah dikunjungi = kandidat mati. Agent wajib menjalankan ulang pengecekan ini sebelum setiap
penghapusan dan tidak boleh menghapus file yang terjangkau.

**`scripts/check-size.sh`:**
```sh
#!/bin/sh
# Gagal bila ada file > 120 baris (non-kosong) atau baris > 120 karakter.
fail=0
for f in $(git ls-files 'src/*.ts' 'src/*.tsx' | grep -vE 'mock/seed/|src/icons/'); do
  n=$(grep -cv '^[[:space:]]*$' "$f")
  [ "$n" -gt 120 ] && { echo "BESAR  $n  $f"; fail=1; }
  l=$(awk 'length($0)>120' "$f" | wc -l)
  [ "$l" -gt 0 ] && { echo "PANJANG $l baris  $f"; fail=1; }
done
exit $fail
```

## 7. Checklist uji manual (dijalankan sebelum dan sesudah tiap fase)

Karena v2 belum punya tes otomatis, perilaku diverifikasi dengan jalan manual. Hasil harus identik.

- [ ] `/` dashboard tampil, angka sama.
- [ ] `/pendaftaran`: cari, paging, tambah (peserta baru dan dari master), ubah, hapus (modal konfirmasi),
      unggah/ganti dokumen, tandai lengkap → toast 5 detik kanan atas.
- [ ] `/antrean`: tab SIAP/DIKEMBALIKAN, kembalikan dengan catatan, buat pendaftaran dari sini.
- [ ] `/permohonan`: buat (single/rentang tanggal, lewati akhir pekan), kelola (pilih dari antrean,
      keluarkan, ganti dokumen), batalkan, tampilan tanggal `2-5 Desember 2026`.
- [ ] `/master/peserta`: cari, tambah, detail, ubah, hapus.
- [ ] `/master/training`: tambah training + kelas inline, ubah, hapus (diblokir bila terpakai).
- [ ] `/master/riwayat-kegiatan`: detail kegiatan, unggah sertifikat, lightbox gambar, PDF tab baru.
- [ ] Mode gelap, sidebar (buka/tutup), header, dropdown pengguna.
- [ ] Konsol browser tanpa galat baru.

## 8. Risiko dan penanganannya

| Risiko | Penanganan |
|---|---|
| Refactor diam-diam mengubah perilaku | Dilarang ubah logika; ekstraksi murni; checklist §7; satu kelompok file per commit agar mudah di-revert |
| Props bocor antar file hasil pecahan | Tipe props eksplisit; hook mengembalikan objek bernama; tanpa context baru |
| Impor melingkar | Arah impor satu arah: `types` → `helpers` → `hooks` → `komponen` → `view` |
| Agent "menyempurnakan" ke pola `new` (tanpa modal) | Aturan eksplisit di `AGENTS_REFACTOR_RULES.md` §2 |
| Kode kembali dipadatkan | Prettier + ESLint `max-lines`/`max-len` + `check:size` (fase 7) |
| Hapus kode mati yang ternyata dibutuhkan backend nanti | Tetap ada di `build`/`new` + tag `pre-refactor` |