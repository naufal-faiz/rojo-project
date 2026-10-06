# AGENTS.md — Rojo Safety Admin

Panduan teknis untuk agent AI (Claude Code, Gemini CLI, Codex, Cursor, dll.). **APA yang dibangun ada di `PRD.md`. Baca bagian 0, 5.0, 5.1, dan 9 PRD sebelum mulai.** Dokumen ini hanya tentang **BAGAIMANA**.

## 1. Aturan utama

1. **Mode otonom.** Ikuti `PRD.md` bagian 0: kerjakan semua fase revisi (R0-R8) berurutan tanpa meminta konfirmasi per langkah. Ambiguitas diputuskan sendiri dengan opsi paling konservatif dan dicatat di `PROGRESS.md` (Asumsi). Berhenti dan tanya hanya untuk lima hal di PRD bagian 0 butir 3.
2. Kerjakan hanya cakupan fase di `PRD.md` bagian 9. Jangan menambah fitur, halaman, atau field di luar itu.
3. **Tanpa modal.** Form dan notifikasi tidak memakai dialog. Pakai halaman penuh, halaman detail, atau panel inline (bagian 4). Ini aturan keras.
4. **Cari dulu, baru buat.** Jangan membuat komponen, hook, atau helper baru jika sudah ada yang sejenis. Komponen bersama baru yang diizinkan hanya yang tercantum di `PRD.md` 5.1.
5. Ikuti gaya kode file di sekitarnya (bagian 5) dan pola modul bagian 4.2. Jangan memformat ulang file yang tidak Anda ubah.
6. Kode panjang harus dipecah (bagian 6).
7. **Dilarang mengedit** `prisma/schema.prisma`, `PRD.md`, dan `AGENTS.md`. Jika perlu perubahan skema, berhenti dan tanya. Jika PRD salah, catat di `PROGRESS.md` (Deviasi).
8. Jangan menambah dependency. Tidak ada library baru (ikon, toast, combobox, dan sejenisnya).
9. Jangan menyentuh file di luar tugas, termasuk file demo template.
10. Satu commit per fase, dan gerbang kualitas (bagian 10) harus bersih sebelum commit.

## 2. Stack dan perintah

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · Prisma 7 + `@prisma/adapter-pg` · Supabase (`@supabase/ssr`) untuk Auth dan Storage · Postgres (Supabase).

| Tujuan | Perintah |
|---|---|
| Jalankan dev | `npm run dev` |
| Build produksi | `npm run build` |
| Lint | `npm run lint` |
| Cek tipe | `npx tsc --noEmit` |
| Migrasi (buat + terapkan) | `npm run db:migrate -- --name <deskripsi>` |
| Generate Prisma Client | `npm run db:generate` |
| Prisma Studio | `npm run db:studio` |

- Jangan memakai `db:push` atau `migrate reset` pada database bersama.
- Client Prisma dihasilkan ke `src/lib/generated/prisma` (di-gitignore). **Jangan diedit dan jangan di-commit.** Impor dari `@/lib/generated/prisma/client` dan `@/lib/generated/prisma/enums`.
- Runtime memakai `DATABASE_URL` (pooler, adapter-pg). CLI memakai `DIRECT_URL` lewat `prisma7.config.ts`.
- Jangan pernah commit `.env*` (kecuali `.env.example`) atau menaruh secret di `NEXT_PUBLIC_*`.

## 3. Struktur dan routing berbasis `navigationData`

```
src/
  app/(dashboard)/        halaman admin (layout memakai AppSidebar + AppHeader)
  app/auth/               halaman login
  components/
    ui/                   primitif: button, badge, table, alert, avatar, dropdown (jangan memakai modal)
    form/                 input form (pakai yang di form/input/* dan form/*.tsx)
    main/                 komponen fitur: Sidebar, Header, Dropdown, tables
    common/ auth/         umum dan auth
  layout/                 AppSidebar, AppHeader, Backdrop
  lib/
    prisma.ts             satu-satunya instance PrismaClient
    data/get/             fungsi baca (server)
    data/action/          server action (tulis)
    supabase/             client, server, middleware, uploadImage
    context/              SidebarContext
  hooks/  icons/  types/
```

**`src/components/main/Sidebar/navigationData.tsx` adalah patokan halaman.**

- Setiap entri di `navigationData` (grup "Kegiatan") dan `othersItems` (grup "Master Data") = satu folder route di `src/app/(dashboard)/<path>/page.tsx`.
- Menambah halaman = tambah entri di `navigationData` dulu (ikon dari `@/icons`), bukan menaruh link manual di tempat lain. Sub-menu lewat `subItems`.
- Pola tiap halaman: daftar di `<path>`, detail di `<path>/[id]`. Cara tambah/ubah: **tanpa modal**, lihat `PRD.md` 5.0 dan bagian 4 di bawah.
- `page.tsx` adalah server component: ambil data lewat `lib/data/get/*`, lalu teruskan ke komponen. Gunakan `"use client"` hanya untuk bagian yang butuh state, event, atau hook.

### Peta menu, UI, dan model

| Menu | Route | Model Prisma |
|---|---|---|
| Pelatihan | `/master/training` | Training, Tingkatan |
| Perusahaan | `/master/perusahaan` | Perusahaan, Cabang, Pic, PerusahaanPic |
| Peserta | `/master/peserta` | Peserta |
| Permohonan | `/permohonan` | **Pelaksanaan**, SesiPelaksanaan |
| Pendaftaran | `/pendaftaran` | PendaftaranPerusahaan, PesertaPelaksanaan |
| Sertifikat | `/sertifikat` | PesertaPelaksanaan (field sertifikat) |
| Invoice, Riwayat Kegiatan | | belum ada, jangan dikerjakan |

Di UI selalu pakai istilah Indonesia ("Permohonan", "Pendaftaran", "Pelatihan"), meski nama model Prisma berbeda.

## 4. Komponen dan pola antarmuka

### 4.1 Inventaris komponen (pakai ulang)

| Kebutuhan | Pakai |
|---|---|
| Tabel daftar dengan pencarian dan paginasi | `main/common/DataTable` (props: `data`, `columns` dengan `header`/`accessor`/`cell`, `totalPages`, `currentPage`, `totalItems`, `onPageChange`, `onSearch`, `searchValue`, `searchPlaceholder`, `emptyText`, `isLoading`, `onRowClick`) |
| Judul halaman + aksi utama + tombol kembali | `main/common/PageHeader` (`title`, `description`, `primaryAction`, `backHref`, `badges`) |
| Panel/kartu berjudul | `main/common/ComponentCard` (`title`, `desc`, `className`). Jangan menulis ulang kelas kartu. |
| **Notifikasi hasil aksi** | `main/common/FlashAlert` + `useFlash` (membungkus `ui/alert/Alert`) |
| **Konfirmasi hapus** | `main/common/InlineConfirm` |
| **Aksi baris (ikon)** | `main/common/RowActions` |
| **Dropdown data banyak (pencarian server)** | `main/common/SearchableSelect` |
| **Bar filter daftar** | `main/common/FilterBar` |
| Label status berwarna | `main/common/StatusBadge` (satu sumber peta warna dan label) |
| Peta label enum dan label tingkatan | `main/common/enumLabels.ts` |
| Input tanggal | `main/common/DatePickerInput` |
| Format tanggal | `main/common/formatTanggal.ts` |
| Tombol | `ui/button/Button` (`size`, `variant`, `startIcon`, `endIcon`, `isLoading` bila ada) |
| Badge | `ui/badge/Badge` |
| Alert dasar | `ui/alert/Alert` (jangan diubah; pakai lewat `FlashAlert` dan `InlineConfirm`) |
| Form | `form/Form`, `form/Label`, `form/input/InputField`, `form/input/TextArea`, `form/Select` (hanya enum dan daftar kecil), `form/MultiSelect`, `form/input/Checkbox`, `form/switch/Switch` |

**Komponen yang tidak boleh dipakai di fitur:** `ui/modal`, `hooks/useModal`, `main/Modal/*` (termasuk `AlertModal`), `main/common/AlertDialog`, `main/common/ConfirmDialog`, dan semua `*FormModal`. Yang masih dipakai modul lama dimigrasi dulu per fase, lalu dihapus di R8.

Jangan menyalin file demo template (`form/form-elements/*`, `form/*Components.tsx`, `main/tables/BasicTableOne.tsx`, `ui/images/*`, `ui/Alert.tsx` duplikat).

### 4.2 Pola modul (salin, jangan mengarang)

```
lib/data/get/get<Entitas>.ts          getAll<Entitas> (daftar, paginasi, search, filter), get<Entitas>ById
lib/data/action/<entitas>Action.ts    create, update, delete (soft, ber-guard), restore (tanpa UI), search<Entitas> (untuk SearchableSelect, maks 10)
components/main/<fitur>/<Entitas>List.tsx        DataTable + FilterBar + RowActions + panel tambah inline
components/main/<fitur>/<Entitas>Form.tsx        form (dipakai sebagai panel inline atau di halaman penuh)
components/main/<fitur>/<Entitas>Columns.tsx     definisi kolom
components/main/<fitur>/use<Entitas>...ts        logika state dan submit
app/(dashboard)/<route>/page.tsx                 server component: ambil data lalu kirim ke List
app/(dashboard)/<route>/[id]/page.tsx            detail (kartu bergrid)
app/(dashboard)/<route>/baru/page.tsx            halaman buat (hanya entitas kompleks, mis. Permohonan)
```

### 4.3 Pola antarmuka

- **Daftar:** `PageHeader` + `FilterBar` + `DataTable`. Tombol "Tambah" membuka **panel inline** di atas tabel (`ComponentCard` berisi `<Entitas>Form`), bukan dialog.
- **Ubah inline:** baris tabel atau kartu berganti menjadi field, dengan tombol Simpan (`CheckLineIcon`) dan Batal (`CloseLineIcon`). Setelah simpan kembali ke tampilan baca.
- **Hapus:** `RowActions` memicu `InlineConfirm` di baris/kartu itu. Satu konfirmasi terbuka per halaman.
- **Notifikasi:** satu `useFlash` per halaman. Panggil `showSuccess/showError/showWarning` setelah setiap aksi. Letakkan `<FlashAlert />` tepat di bawah `PageHeader` (atau di atas panel terkait). Pesan error dari server ditampilkan apa adanya.
- **Detail:** `PageHeader` dengan `backHref`, lalu grid kartu. Pakai `grid grid-cols-1 gap-6 lg:grid-cols-5` untuk 60:40 (kolom `lg:col-span-3` dan `lg:col-span-2`) dan `lg:grid-cols-10` untuk 30:70 (`lg:col-span-3` dan `lg:col-span-7`). Ukuran tiap halaman ada di `PRD.md` bagian 5.
- **Dropdown data banyak:** `SearchableSelect` dengan fungsi `search<Entitas>` dari lapisan action (maksimal 10 hasil, urut nama). Jangan memuat seluruh tabel ke `<select>`.
- **Kecepatan input:** autofocus field pertama, `Enter` menyimpan, "Simpan & tambah lagi" menjaga fokus dan mengosongkan field. Jangan memanggil `window.location.reload()` atau `router.refresh()` berlebihan. Cukup `revalidatePath` dari action dan perbarui state lokal.
- **Peserta dan perusahaan:** ikuti B-01/B-02 di `PRD.md` 5.13. Jangan pernah menampilkan peserta perusahaan lain pada pendaftaran perusahaan. Pada pendaftaran **mandiri**, peserta dari perusahaan mana pun boleh dipilih (tampilkan perusahaan sebagai subjudul) dan perusahaan peserta tidak diubah.

### 4.4 Aturan membuat komponen baru

- **Dilarang** membuat komponen generik baru di luar daftar `PRD.md` 5.1 (tombol, tabel, modal, kartu, badge, input, dropdown, toast).
- Komponen khusus fitur boleh dibuat di `components/main/<fitur>/` dan wajib mengikuti pola 4.2.
- Jika perlu satu prop tambahan di komponen bersama, tambahkan sebagai **prop opsional backward-compatible** dan catat di `PROGRESS.md`.

### 4.5 Ikon

- Impor hanya dari `@/icons/index`. **Dilarang** `<svg>` inline, file SVG baru, atau library ikon.
- Pemetaan standar: Tambah `PlusIcon`, Ubah `PencilIcon`, Hapus `TrashBinIcon`, Detail `EyeIcon`, Simpan `CheckLineIcon`, Batal/Tutup `CloseLineIcon`, Kembali `ChevronLeftIcon`, Lanjut `ArrowRightIcon`, Tanggal `CalenderIcon`, Unduh `DownloadIcon`, Salin `CopyIcon`, Peringatan `AlertIcon`, Info `InfoIcon`, Pengguna `UserIcon`, Grup/peserta `GroupIcon`, Berkas `FileIcon`, Dokumen `DocsIcon`, Cari `ListIcon` hanya bila tidak ada pilihan lain.
- Ikon lain yang tersedia: `CheckCircleIcon`, `ErrorIcon`, `ChevronDownIcon`, `ChevronUpIcon`, `AngleDownIcon`, `AngleUpIcon`, `ArrowUpIcon`, `ArrowDownIcon`, `EyeCloseIcon`, `TimeIcon`, `PageIcon`, `FolderIcon`, `TableIcon`, `GridIcon`, `UserCircleIcon`, `LockIcon`, `MailIcon`, `EnvelopeIcon`, `PaperPlaneIcon`, `BellIcon`, `TaskIcon`, `PieChartIcon`, `BoxIcon`, `BoxCubeIcon`, `BoltIcon`, `PlugInIcon`, `MoreDotIcon`, `ChatIcon`, `DollarLineIcon`, `ShootingStarIcon`, `AudioIcon`, `VideoIcon`, `CloseIcon`.
- Tombol ikon saja wajib punya `title` dan `aria-label`. Jika ikon yang pas tidak ada, pakai yang terdekat dan catat di `PROGRESS.md` ("Ikon yang dibutuhkan").

## 5. Gaya kode (ikuti yang sudah ada)

- TypeScript strict. Impor dengan alias `@/*` (= `src/*`). Hindari `any` dan `@ts-ignore`.
- **Komponen UI:** file PascalCase, `export default`, `const X: React.FC<XProps>`, `interface XProps` dengan komentar singkat per prop, indentasi 2 spasi dan titik koma.
- **Lapisan data (`lib/data/*`):** indentasi 4 spasi, tanpa titik koma, tanda kutip ganda. Ikuti pola di `exampleGet.ts` dan `exampleAction.ts`.
- Tailwind v4 dengan token dari `src/app/globals.css`: `brand-*` (merah, brand-500 `#ba131b`), `success-*`, `error-*`, `warning-*`, `gray-*`, `shadow-theme-xs`, `text-theme-sm`. **Setiap kelas warna wajib punya varian `dark:`.** Jangan hardcode hex.
- Gabungan class kondisional boleh memakai template string, atau `twMerge` (dari `tailwind-merge`) bila perlu menimpa class.
- Komentar dan teks UI dalam **Bahasa Indonesia**. Nama variabel dan fungsi dalam Inggris atau istilah domain seperti di skema.
- Penamaan file data: `getTraining.ts` (get), `trainingAction.ts` (action).

## 6. Memecah kode panjang

Untuk **kode baru**: file yang melewati **±150 baris** atau menangani lebih dari satu tanggung jawab harus dipecah sejak awal. Pola yang benar sudah ada di Sidebar (perakit tipis, komponen presentasi kecil, logika di hook, konfigurasi di file sendiri).

| Bagian | Dipisah ke |
|---|---|
| Definisi kolom tabel | `<fitur>/<Entitas>Columns.tsx` |
| Logika state, submit, dan transisi | hook `use<Entitas>...ts` di `hooks/` atau di folder fitur |
| Form dan validasi | `<Entitas>Form.tsx` + helper validasi `<entitas>Validation.ts` |
| Konstanta, peta label, opsi dropdown | `<fitur>/<nama>.ts` |
| Query berbeda tujuan | file get terpisah per tujuan, bukan satu file raksasa |
| Action untuk entitas anak | `<anak>Action.ts` sendiri |

Untuk **kode lama** yang sudah melewati batas, lihat daftar di `PRD.md` bagian 11. Itu dikerjakan di fase Penutup, tanpa mengubah perilaku.

## 7. Lapisan data

**Get (`lib/data/get/getX.ts`):**
- Dibungkus `cache()` dari `react`, `try/catch` dengan `console.error` dan nilai fallback yang bentuknya sama dengan hasil normal.
- Selalu menyertakan `deletedAt: null` di `where`.
- Daftar mengembalikan `{ data, totalItems, pagination: { page, limit, totalItems, totalPages } }`, menerima opsi `page`, `limit`, `search` (pencarian `contains`, `mode: "insensitive"`), dan default limit 10.

**Action (`lib/data/action/xAction.ts`):**
- Diawali `"use server"`. Memanggil `revalidatePath` setelah menulis. Mengembalikan `{ success: true, ... }` atau `{ success: false, error }` dengan pesan Indonesia yang bisa ditampilkan.
- Hapus = `update { deletedAt: new Date() }`, bukan `delete`.
- Validasi input di server, jangan percaya client.

**Aturan data penting (detail di `PRD.md` FR-SOFTDELETE):**
- Hapus **diblokir** bila ada turunan aktif. Cek turunan dan hapus dalam satu `prisma.$transaction`.
- Restore hanya bila parent aktif. Fungsi `restore*` dipertahankan di server, tetapi **tidak ada antarmukanya** saat ini. Pendaftaran ulang atas baris yang sudah di-soft-delete (`PesertaPelaksanaan`, `PendaftaranPerusahaan`) **otomatis memulihkannya** dalam aksi tambah, bukan `create` baru, dan pesan sukses menyebut "dipulihkan" (PRD 5.10).
- Pencarian untuk `SearchableSelect` ada di lapisan action, `take` maksimal 10, urut nama, dan ber-scope sesuai B-02. Jangan mengembalikan data di luar scope.
- Penyaringan kegiatan aktif memakai satu fungsi `whereKegiatanAktif()` (PRD 5.11), zona waktu WIB.
- Training tanpa tingkatan: gunakan `ensureTingkatanUmum` dan konstanta `KELAS_UMUM` (PRD B-03). Jangan menulis string `"Umum"` di tempat lain.
- `include` relasi tidak otomatis menyaring `deletedAt`. Tambahkan `where: { deletedAt: null }` pada setiap include.
- Tolak pembuatan data di bawah parent yang sudah terhapus.
- Pastikan PIC pada `PendaftaranPerusahaan` terhubung ke perusahaannya lewat `PerusahaanPic`.
- Tidak ada query data dari client component. Semua lewat server.

## 8. Prisma dan database

- Satu instance client di `src/lib/prisma.ts`. Impor `prisma` dari sana, jangan membuat `new PrismaClient()` lagi.
- Setelah mengubah skema (dengan izin): `npm run db:migrate -- --name <deskripsi>` lalu `npm run db:generate`. Commit folder `prisma/migrations`.
- Tabel baru wajib RLS aktif (tanpa policy), karena seluruh akses lewat server dengan Prisma.
- Enum Prisma dipakai sebagai sumber nilai di UI. Jangan menduplikasi string enum secara manual.

## 9. Kondisi repo saat ini

Status fase ada di `PRD.md` bagian 9.1: F0-F7, Jalur M, dan Penutup sudah selesai; yang sedang dikerjakan adalah **revisi R0-R8** yang mengubah tampilan dan alur. Hal teknis yang perlu diketahui:

1. **Next.js 16:** `params` dan `searchParams` di `page.tsx` adalah `Promise` (gunakan `await`).
2. **Prisma 7:** client dibuat ke `src/lib/generated/prisma` (impor dari `.../client` dan `.../enums`), konfigurasi CLI di `prisma7.config.ts`. Revisi ini **tidak mengubah skema**. Cek `npx prisma migrate status` sebelum mulai.
3. **Modul yang masih berbasis modal** (harus dimigrasi sesuai fase): Training (`TrainingFormModal`, `TingkatanManager`), Perusahaan (`PerusahaanFormModal`, `CabangManager`, `PicManager`, `PicSelectionModal`), Peserta (`PesertaFormModal`), Permohonan (`PelaksanaanFormModal`, `SesiManager`), Pendaftaran (`PendaftaranFormModal`, `PendaftaranPicModal`, `PesertaBulkModal`, `PesertaTempelTab`, `PesertaPilihTab`), Sertifikat (`SertifikatFormModal`).
4. `AlertModal` dipakai di 23 file dan `ConfirmDialog` di 12 file. `ui/alert/Alert` belum dipakai. Semua harus diganti `FlashAlert` dan `InlineConfirm`.
5. **Sisa jalur import** (`scripts/import/`, skrip `import:excel`, dependency `exceljs` dan `tsx`) dihapus di R0. Pertahankan `src/lib/normalisasi.ts`.
6. **UI data terhapus** (`DeletedTrainingList`, `DeletedPerusahaanList`, `PendaftaranTerhapusPanel`) dihapus di R0. Fungsi server `restore*` tetap ada.
7. Detail perusahaan saat ini baris expand inline di daftar. Menjadi route `/master/perusahaan/[id]` di R3.
8. `.gitignore` mengabaikan `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.claude/`, `.gemini/`, dan `*.xlsx`. File panduan ini tidak ikut ter-commit.
9. `exampleAction.ts` dan `exampleGet.ts` dari template lama sudah tidak relevan. Rujuk modul yang sudah jadi.

## 10. Gerbang kualitas dan Definition of Done

Sebelum commit setiap fase, semua harus terpenuhi:

- [ ] Hanya cakupan fase ini yang dikerjakan, tanpa fitur tambahan.
- [ ] `npm run lint`, `npx tsc --noEmit`, dan `npm run build` bersih.
- [ ] Semua halaman di menu tetap bisa dibuka (tidak 404) dan tanpa galat konsol.
- [ ] Soft delete memenuhi aturan blokir turunan, restore dengan cek parent, dan filter `deletedAt` di semua query dan include.
- [ ] Semua kelas warna punya varian `dark:`. Teks UI Bahasa Indonesia.
- [ ] Tidak ada secret, `.env`, atau file `generated/` ikut ter-commit.
- [ ] `PROGRESS.md` diperbarui: status fase, Checklist revisi, Asumsi, Deviasi, Utang teknis baru, Langkah uji manual.
- [ ] Commit dengan pesan `R<n> selesai: <ringkasan>`.

**Gerbang pola antarmuka** (jalankan dari root repo; untuk modul yang sudah dimigrasi hasilnya harus kosong. Sebelum R8, periksa hanya folder modul fase itu):

```
grep -rnE "AlertModal|ConfirmDialog|AlertDialog" src/components/main/<modul> "src/app/(dashboard)"
grep -rnE "useModal|ui/modal|FormModal" src/components/main/<modul> "src/app/(dashboard)"
grep -rn "<svg" src/components/main/<modul>
grep -rnE "lucide|react-icons|heroicons" src
grep -rn "window.location.reload" src/components src/app
```

Pada R8, seluruh perintah di atas dijalankan untuk `src/components/main` dan `src/app` tanpa filter modul dan hasilnya harus kosong, kecuali berkas template yang memang tidak dipakai dan masih terdaftar di `PROGRESS.md`.

Jangan menyatakan pekerjaan selesai sebelum R8 rampung dan `PROGRESS.md` final berisi semua bagian di `PRD.md` bagian 12, dengan Checklist revisi lengkap (semua ID di PRD 8.1).

## 11. Glosarium

| Istilah | Arti |
|---|---|
| Permohonan | Satu kegiatan yang diajukan ke TemanK3 (model `Pelaksanaan`). Nomornya terbit dari TemanK3 setelah submit. |
| TemanK3 | Sistem Kemnaker tempat permohonan dan dokumen peserta diunggah. |
| PJK3 | Perusahaan Jasa K3. Mitra (mis. LPS, Delta) bisa memegang permohonan, Rojo hanya menjalankan pelatihan. |
| PUBLIK / INHOUSE | Kegiatan terbuka untuk banyak perusahaan atau mandiri / khusus satu perusahaan klien. |
| Mandiri | Peserta yang mendaftar sendiri tanpa lewat perusahaan. |
| PIC | Kontak penerima sertifikat. Bisa karyawan perusahaan (INTERNAL), pihak dinas (DINAS), atau staf PJK3 mitra (MITRA). |
| SIO | Surat Izin Operator. `masaBerlaku` adalah masa berlaku sertifikatnya. |
| SKP | Tanda "ahli" dari kegiatan Kemnaker. Tidak ada pada BNSP. |
| Tingkatan | Kelas/jenis di bawah Training (mis. "Kelas 1", "Damkar C"). Setara kolom JENIS ALAT di Excel lama. |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
