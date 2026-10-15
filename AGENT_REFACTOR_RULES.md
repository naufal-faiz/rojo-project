# AGENTS_REFACTOR_RULES.md — Aturan agent saat refactor `v2`

> Tempel isi file ini ke `AGENTS.md` sebagai bagian baru "Aturan Refactor". **APA dan urutan fasenya**
> ada di `REFACTOR_PLAN.md`; dokumen ini hanya tentang **BAGAIMANA agent bekerja**. Baca
> `REFACTOR_PLAN.md` bagian 1-4 dan `prisma/schema.prisma` sebelum mulai.

## 1. Aturan utama

1. **Refactor = pindah dan pecah, bukan ubah.** Perilaku, tampilan, teks UI, alur, dan nama ekspor yang
   dipakai file lain tidak boleh berubah. Jika menemukan bug, **catat** di `REFACTOR_PROGRESS.md`
   (Temuan), jangan diperbaiki di commit refactor.
2. Kerjakan **satu fase dan satu kelompok file per tugas**, sesuai `REFACTOR_PLAN.md` bagian 4. Jangan
   melompat fase dan jangan merapikan file di luar tugas.
3. **Batas ukuran adalah syarat selesai.** Setiap file ≤ 100 baris (batas keras 120), baris ≤ 100
   karakter, satu fungsi/komponen ≤ 80 baris, satu tanggung jawab per file. Cara memadatkan kode
   (menaruh banyak pernyataan dalam satu baris, rantai ternary, `;` berantai) **dilarang** sebagai cara
   memenuhi batas. Satu-satunya cara yang sah adalah memecah ke file lain.
4. **Kode baru ditulis dalam bentuk berformat.** Satu pernyataan per baris, objek dan JSX panjang
   dipecah ke beberapa baris. Jalankan Prettier (`--print-width 100`) pada file yang Anda ubah.
5. **Dilarang** mengedit `prisma/schema.prisma`, `PRD.md`, dan `package.json` (kecuali menambah skrip
   `check:size` dan devDependency `prettier` bila pemilik sudah menyetujui D3).
6. Tidak ada dependency baru selain yang disetujui. Tidak ada fitur, halaman, atau field baru.
7. Setiap fase diakhiri gerbang kualitas (bagian 9) yang bersih, lalu commit.
8. Jika bingung, berhenti dan tanya (bagian 10). Jangan menebak aturan bisnis.

## 2. Jangan tertukar dengan branch `new`

Branch `new` dipakai **hanya sebagai contoh cara memecah file** (perakit tipis, `*Columns`, `use*`,
`*Form`, `*Types`). Aturan UI-nya **tidak berlaku** di `v2`:

- `v2` **tetap memakai modal** (`Modal`), `ConfirmDialog`, dan toast `useToast`. **Jangan** mengganti
  dengan panel inline, `FlashAlert`, atau `InlineConfirm`.
- `v2` memakai state dari `lib/mock/store` (data demo), bukan `lib/data/get` atau `lib/data/action`.
  **Jangan** menghubungkan ke Prisma atau Supabase.
- Gaya UI v2 (input `h-9`, tabel padat, tanpa gradien dekoratif, lightbox untuk gambar) **dipertahankan**.

## 3. Struktur dan penempatan hasil pecahan

Satu fitur = satu folder di `src/components/main/<fitur>/`. Nama folder fitur mengikuti route/menu
(`peserta`, `training`, `permohonan`, `pendaftaran`, `antrean`, `riwayat-kegiatan`, `dashboard`).

| Bagian yang dipecah | Dipindah ke | Contoh nama |
|---|---|---|
| Perakit halaman (header + tabel + modal terbuka) | `<fitur>/<Entitas>View.tsx` | `PermohonanView.tsx` |
| Definisi kolom tabel | `<fitur>/<Entitas>Columns.tsx` | `PermohonanColumns.tsx` |
| Cangkang modal (judul, tombol, tutup) | `<fitur>/<Aksi><Entitas>Modal.tsx` | `BuatPermohonanModal.tsx` |
| Satu kelompok field form | `<fitur>/<Kelompok>Fields.tsx` | `SesiTanggalFields.tsx` |
| State, submit, transisi | `<fitur>/use<Entitas><Tujuan>.ts` | `usePermohonanForm.ts` |
| Tipe | `<fitur>/<entitas>Types.ts` atau `lib/mock/types.ts` | |
| Nilai awal, opsi, peta label, konstanta | `<fitur>/<nama>.ts` | `permohonanDefaults.ts` |
| Data demo | `lib/mock/seed/<entitas>Seed.ts` | `pendaftaranSeed.ts` |
| Fungsi murni (format, hitung) | `lib/mock/<nama>.ts` | `sesi.ts` |
| Pembantu yang dipakai ≥ 2 fitur | hanya daftar di `REFACTOR_PLAN.md` §4 fase 3 | `usePagedSearch.ts` |

Aturan penempatan:
- File yang dipakai satu fitur tinggal di folder fitur itu. Dipakai ≥ 2 fitur → `components/main/common/`
  atau `lib/`, tetapi **hanya** untuk daftar di fase 3. Jangan membuat komponen generik lain.
- Tidak boleh ada folder baru di luar tabel di atas tanpa izin. Maksimal **satu level** subfolder
  di dalam folder fitur (tidak ada `fitur/a/b/c/`).
- Arah impor satu arah: `types` → `constants/helpers` → `hooks` → komponen kecil → `View`. Dilarang
  impor melingkar dan dilarang mengimpor `View` dari file di bawahnya.
- Impor dalam satu folder memakai `./`, lintas folder memakai `@/`.
- Barrel `index.ts` **dilarang** kecuali `lib/mock/store.ts` (jembatan sementara, dihapus di fase 7).
- Satu komponen utama per file, `export default`. Ekspor bernama hanya untuk tipe, konstanta, dan hook.

## 4. Prosedur per file yang dipecah

1. **Baca seluruh file** dan format sementara dengan Prettier agar ukuran aslinya terlihat.
2. **Tulis rencana pecahan** di `REFACTOR_PROGRESS.md` sebelum menyentuh kode: daftar file baru,
   tanggung jawab, perkiraan baris, dan siapa yang mengimpor file asal.
3. **Ekstrak dari bawah ke atas:** tipe/konstanta → fungsi murni → hook → komponen presentasi kecil →
   perakit. Kompilasi (`npx tsc --noEmit`) setelah tiap langkah.
4. **Pindahkan kode apa adanya.** Nama variabel dan isi logika tidak diubah. Perubahan yang diizinkan
   hanya: memecah baris, menambah `import`/`export`, mengganti variabel yang dipakai bersama menjadi
   props atau nilai kembalian hook, dan memberi nama pada fungsi anonim yang diekstrak.
5. **Props eksplisit.** Setiap komponen hasil pecahan punya `interface <Nama>Props` bertipe jelas.
   Hook mengembalikan objek bernama. **Dilarang** context baru atau state global baru.
6. Pertahankan **path ekspor lama** sampai semua pengimpor diperbarui. Perbarui semua pengimpor dalam
   commit yang sama.
7. **Seluruh pengimpor halaman** (`app/(dashboard)/**/page.tsx`) hanya berganti path impor.
8. Format dengan Prettier, jalankan gerbang (bagian 9), jalankan uji manual untuk fitur itu
   (`REFACTOR_PLAN.md` §7), lalu commit.

## 5. Gaya kode yang wajib

- TypeScript strict. Tanpa `any` dan `@ts-ignore`. Alias `@/*` = `src/*`.
- **Satu pernyataan per baris.** Dilarang: `a(); b();` dalam satu baris, rantai `? :` lebih dari satu
  tingkat, dan fungsi panah panjang tanpa kurung kurawal yang berisi banyak cabang.
- JSX: satu elemen per baris bila punya lebih dari dua atribut. Kondisi dan `map` yang panjang
  diekstrak menjadi variabel atau komponen kecil.
- String `className` yang melewati 100 karakter dipecah dengan `twMerge`/array `.join(" ")` atau
  dipindah ke konstanta bernama. Semua kelas warna tetap punya varian `dark:`.
- Komponen: `const X: React.FC<XProps>`, `interface XProps` dengan komentar singkat per prop,
  indentasi 2 spasi, titik koma, tanda kutip ganda.
- Komentar dan teks UI Bahasa Indonesia. Nama variabel dan fungsi **tidak diganti**.
- Ikon hanya dari `@/icons`. `<svg>` inline yang sudah ada dipindah **apa adanya** menjadi ekspor baru
  di `src/icons/` (agar tampilan tidak berubah), lalu dicatat di `REFACTOR_PROGRESS.md`.
- Jangan menyalin ulang pembantu yang sudah ada (`lbl`, `opt`, `LIMIT`, `cekFile`). Pakai versi bersama
  dari fase 3.

## 6. Batas ukuran (rujukan cepat)

| Jenis | Target | Batas keras |
|---|---|---|
| Komponen, hook, columns, form, fields | ≤ 100 baris | 120 |
| Data murni (seed, peta label, tipe) | ≤ 150 | 150 |
| Panjang baris | ≤ 100 karakter | 120 |
| Satu fungsi/komponen | ≤ 80 baris | 90 |

Pengecualian hanya: `lib/mock/seed/**` (data murni) dan `src/icons/**`. Pengecualian lain harus
ditulis di `REFACTOR_PROGRESS.md` beserta alasannya dan disetujui pemilik.

Jika sebuah file masih terlalu panjang setelah dipecah, pecah lagi menurut **tanggung jawab**, bukan
menurut jumlah baris (jangan memotong di tengah fungsi hanya demi angka).

## 7. Penghapusan kode mati (fase 1)

1. Jalankan analisis keterjangkauan (`REFACTOR_PLAN.md` §6) dan simpan daftarnya.
2. Ikuti golongan 1a (hapus), 1b (arsipkan lalu hapus), 1c (pindah ke `docs/legacy-data-layer/`, jangan dihapus) di `REFACTOR_PLAN.md` fase 1, hanya untuk file yang tidak terjangkau dan sudah disetujui pemilik (D1).
3. Satu golongan satu commit, didahului tag `archive/pre-cleanup`. Setelah tiap kelompok: `tsc` dan `build` bersih.
4. Jangan menghapus `prisma/`, `public/`, `src/lib/supabase/*`, `src/middleware.ts`, dan file
   konfigurasi.
5. Jangan "menyelamatkan" kode mati dengan memindahkannya ke folder `_old` atau `legacy`. Kodenya
   sudah ada di `build`, `new`, dan tag `pre-refactor`.

## 8. Commit dan pelaporan

- Satu commit per kelompok file yang dipecah. Pesan: `refactor(<fitur>): pecah <File> menjadi <n> file`
  (fase 1: `chore: hapus kode mati <kelompok>`, fase 2: `refactor(mock): pecah store`).
- Commit refactor **tidak boleh** bercampur dengan perbaikan bug atau fitur.
- Setelah setiap commit, perbarui `REFACTOR_PROGRESS.md` dengan format:

```
## <Fase> — <File>
- Sebelum: <baris nyata> baris → Sesudah: <n> file (terbesar <baris>)
- File baru: <daftar>
- Gerbang: lint ✔ tsc ✔ build ✔ check:size ✔
- Uji manual: <halaman yang dicek> ✔
- Temuan (bug/utang, tidak diperbaiki): <daftar atau "-">
```

- Jangan menyatakan "selesai" sebelum fase 7 rampung dan `npm run check:size` bersih untuk seluruh `src/`.

## 9. Gerbang kualitas (harus bersih sebelum commit)

```
npm run lint
npx tsc --noEmit
npm run build
sh scripts/check-size.sh          # file > 120 baris atau baris > 120 karakter = gagal
```

Pemeriksaan tambahan (hasil harus kosong untuk file yang Anda sentuh):

```
grep -rn "<svg" src/components/main                       # svg inline baru
awk 'length($0)>100 {print FILENAME": "FNR}' <file-yang-diubah>
grep -rnE "import .* from \"\.\./\.\./" src/components    # impor relatif lintas fitur (pakai @/)
```

Definition of Done untuk satu fase:
- [ ] Semua file hasil pecahan memenuhi batas ukuran (bagian 6).
- [ ] Tidak ada perubahan perilaku/tampilan; checklist uji manual fitur itu lulus.
- [ ] Tidak ada impor melingkar dan tidak ada import yang tidak terpakai.
- [ ] Tidak ada file di luar cakupan fase yang berubah (`git diff --stat` diperiksa).
- [ ] `REFACTOR_PROGRESS.md` diperbarui dan commit memakai format pesan yang benar.

## 10. Kapan harus berhenti dan bertanya

Berhenti dan tanya pemilik hanya untuk:

1. Perlu mengubah **perilaku, teks UI, atau alur** agar file bisa dipecah.
2. Perlu mengubah `prisma/schema.prisma` atau menambah dependency selain `prettier`.
3. Satu file tidak bisa ≤ 120 baris tanpa mengubah logika (minta izin pengecualian).
4. Gerbang kualitas sudah merah sebelum Anda mengubah apa pun (catat, lalu tanya apakah dilanjutkan).
5. Keputusan D1-D4 di `REFACTOR_PLAN.md` bagian 3 belum dijawab dan fase terkait sudah tiba
   (jika tidak dijawab, pakai rekomendasi dan catat sebagai asumsi).

Selain itu, ambil keputusan yang paling konservatif (tidak mengubah apa pun), catat di
`REFACTOR_PROGRESS.md` bagian Asumsi, dan lanjut.

## 11. Larangan ringkas

- Jangan memadatkan kode untuk memenuhi batas baris.
- Jangan mengubah logika, nama, teks UI, atau gaya visual.
- Jangan memigrasi modal ke inline atau menghubungkan ke Prisma/Supabase.
- Jangan membuat komponen generik, context, atau folder di luar yang diizinkan.
- Jangan menghapus file yang masih terjangkau.
- Jangan mencampur refactor dengan perbaikan bug atau fitur.
- Jangan menambah dependency, kecuali `prettier` yang sudah disetujui pemilik.