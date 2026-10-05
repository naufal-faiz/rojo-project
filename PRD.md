# PRD — Rojo Safety Admin

> Sumber kebenaran untuk **APA** yang dibangun. Aturan teknis (**BAGAIMANA**) ada di `AGENTS.md`. Skema data ada di `prisma/schema.prisma`.

| | |
|---|---|
| Status | Draft v0.2 (mode otonom) |
| Diperbarui | 2026-10-05 (setelah F0-F4 selesai di branch `build`) |
| Pemilik | Naufal |
| Sumber kebutuhan | Excel `MASTER DATA PEMBINAAN 2025` (sheet KEMNAKER, BNSP, LAIN-LAIN, EBILLING PEMBINAAN KEMNAKER) dan wawancara dengan admin Rojo Safety |

## 0. Mode kerja agent (otonom)

Agent mengerjakan **seluruh fase tersisa (bagian 9) berurutan sampai selesai, tanpa meminta konfirmasi per langkah**. Pemilik mereview setelah semuanya selesai, mencatat revisi, lalu menyusun PRD berikutnya.

1. **Urutan:** F5, F6, F7, Jalur M, lalu fase Penutup. Satu commit per fase (`F5 selesai: ...`). Jangan lompat fase.
2. **Jangan bertanya untuk keputusan biasa.** Jika ada ambiguitas, pilih opsi paling konservatif yang konsisten dengan PRD dan pola F1-F4, lalu catat di `PROGRESS.md` (bagian Asumsi, ID `A-01`, `A-02`, ...). Pemilik mengoreksi saat review.
3. **Berhenti dan tanya hanya untuk:** (a) perubahan `prisma/schema.prisma` di luar yang tertulis di PRD, (b) perintah destruktif ke database (`migrate reset`, `db push`, `DROP`/`TRUNCATE`, menjalankan import dengan `--commit`), (c) menambah dependency di luar daftar izin (bagian 9), (d) fitur di luar scope (bagian 7), (e) risiko keamanan atau kebocoran data (secret, RLS, data pribadi).
4. **Gerbang kualitas tiap fase** sebelum commit: `npm run lint`, `npx tsc --noEmit`, dan `npm run build` harus bersih. Jika gagal, perbaiki. Jangan lanjut ke fase berikutnya dengan error.
5. **Catat di `PROGRESS.md`** (agent membuatnya, di root repo, di-commit): status per fase, Asumsi, Deviasi dari PRD, Utang teknis baru, Yang sengaja tidak dikerjakan, dan Langkah uji manual (urutan klik) per fase. Format di bagian 12.
6. Item **[DEFAULT SEMENTARA]** di bagian 10 boleh diimplementasikan seperti tertulis. Itu keputusan sementara yang akan direview pemilik.
7. **Jangan mengedit** `PRD.md`, `AGENTS.md`, dan `prisma/schema.prisma`. Jika menemukan kesalahan di PRD, catat di PROGRESS (Deviasi) dan teruskan dengan asumsi yang masuk akal.
8. Bug yang jelas di kode fase sebelumnya boleh diperbaiki (catat di PROGRESS). Refactor besar hanya di fase Penutup.

## 1. Problem Statement

Rojo Safety (penyedia jasa K3 di Bekasi) mengelola data pembinaan dan sertifikasi di satu file Excel, satu baris per peserta. Data peserta, perusahaan, kegiatan, permohonan, invoice, dan pengiriman bercampur dalam satu tabel datar sehingga tidak konsisten. Temuan dari sheet KEMNAKER (±1.440 baris):

- Kolom **No. Permohonan** berisi nilai non-nomor pada 191 baris: `SKP DELTA` (99), `SKP LPS` (66), `?` (15), `PJK3 AKAI` (10), `CANCEL` (1). Itu penanda mitra PJK3 atau data belum lengkap, bukan nomor permohonan.
- **Status TemanK3** adalah teks gabungan status dan riwayat tanggal (submit, revisi, PNBP, e-billing) pada 113 baris, dan jarang diperbarui.
- **Hasil negatif peserta** (TAKEOUT, CANCEL, REMEDIAL, TIDAK LULUS, IKUT BATCH SELANJUTNYA) ditulis di kolom yang berbeda-beda: nama peserta, nama perusahaan, PIC, masa berlaku SIO.
- **Nama perusahaan** yang sama ditulis berbeda (titik, spasi, akhiran), sehingga laporan per perusahaan terpecah.
- **Tanggal pelaksanaan** berupa teks (`28-30 APR, 2 & 3 MEI 2025`), bukan data tanggal.
- **PIC** hanya terisi pada 237 dari ±1.440 baris, sebagian berisi nama peserta yang nyasar.
- Ada baris ganda untuk peserta yang sama dalam satu kegiatan yang isinya berbeda.

Dampak: laporan sulit dibuat, risiko sertifikat salah kirim, riwayat revisi hilang, dan tidak ada satu tempat untuk melihat "siapa ikut kegiatan apa, hasilnya apa, sertifikatnya mana".

### Alur bisnis (dari wawancara)

1. Peserta mendaftar ke **Marketing** dan menyerahkan dokumen. Marketing merapikan dokumen.
2. Kuota terkumpul, Marketing mengajukan tanggal kegiatan ke atasan. Atasan menyetujui.
3. Form pengajuan masuk ke **Admin**.
4. Admin membuat surat permohonan ke TemanK3 dan mengunggah dokumen peserta. Setelah submit, TemanK3 menerbitkan **No. Permohonan** (per kegiatan, bukan per peserta).
5. Kegiatan berlangsung. Laporan diunggah ke TemanK3, bisa direvisi, PNBP dibayar, e-billing terbit.
6. Sertifikat resmi diterima, lalu dikirim ke **PIC penerima sertifikat** (ekspedisi atau diambil langsung).
7. Invoice diterbitkan setelah kegiatan selesai: per perusahaan, atau per peserta bila mendaftar mandiri.

## 2. Goals

| ID | Goal |
|---|---|
| G1 | Satu sumber data terstruktur menggantikan Excel untuk alur inti (permohonan, pendaftaran, hasil/sertifikat). |
| G2 | Satu No. Permohonan = satu Pelaksanaan, dengan banyak peserta di dalamnya. |
| G3 | Hasil peserta tercatat sebagai status terstruktur, bukan teks di kolom sembarang. |
| G4 | Setiap kegiatan mencatat **PIC penerima sertifikat per perusahaan**, termasuk kegiatan PUBLIK dengan banyak perusahaan dan peserta mandiri. |
| G5 | Perusahaan dan peserta adalah data master yang dipilih, bukan diketik ulang (tidak ada lagi nama ganda). |
| G6 | Data historis 2025 termigrasi bersih ke sistem baru, dengan laporan keputusan manual. |
| G7 | Data tidak hilang permanen karena salah klik (soft delete + restore, tanpa data yatim). |

## 3. Target Users

| Pengguna | Peran di sistem | Status |
|---|---|---|
| **Admin Rojo Safety** | Pengguna utama fase 1. Membuat permohonan, mendaftarkan peserta, mengisi status dan data sertifikat. | Dalam scope |
| Marketing | Menerima pendaftaran dan merapikan dokumen. Saat ini bekerja di luar sistem. | **[DEFAULT SEMENTARA]** tidak mendapat akun (lihat bagian 10) |
| Atasan (approver) | Menyetujui tanggal kegiatan, di luar sistem. | **[DEFAULT SEMENTARA]** tidak mendapat akun |
| Finance | Invoice. | Ditunda |
| Peserta / perusahaan klien | Tidak mengakses sistem ini. | Di luar scope |

Role dan permission granular belum didefinisikan. Asumsi fase 1: semua pengguna yang login adalah admin dengan akses penuh.

## 4. User Stories

**Auth**
- US-01 Sebagai admin, saya masuk dengan email dan password agar data tidak bisa diakses orang luar.

**Master Pelatihan**
- US-02 Sebagai admin, saya mengelola daftar Training dan Tingkatan (kelas, mis. "Kelas 1", "Damkar C") agar pilihan jenis pelatihan seragam.

**Master Perusahaan**
- US-03 Sebagai admin, saya menambah perusahaan dan cabangnya agar peserta dapat dikaitkan ke lokasi yang tepat.
- US-04 Sebagai admin, saya menghubungkan beberapa PIC ke satu perusahaan, dan satu PIC ke beberapa perusahaan (mis. HSE level grup), agar kontak penerima sertifikat lengkap.
- US-05 Sebagai admin, saya melihat halaman detail perusahaan berisi peserta dan PIC-nya.

**Master Peserta**
- US-06 Sebagai admin, saya menambah peserta, dengan atau tanpa perusahaan (tampil "-"), agar peserta mandiri tetap tercatat.
- US-07 Sebagai admin, saya melihat riwayat kegiatan seorang peserta.

**Permohonan (Pelaksanaan)**
- US-08 Sebagai admin, saya membuat Permohonan: training/tingkatan, jenis kegiatan (PUBLIK/INHOUSE), tipe (online/offline/blended), lokasi, penyelenggara, jenis sertifikasi, dan No. Permohonan bila ada.
- US-09 Sebagai admin, saya mengisi tanggal pelaksanaan per hari (mis. 28-30 Apr, 2 dan 3 Mei) agar libur tercatat akurat.
- US-10 Sebagai admin, saya memperbarui status TemanK3 dan tanggal unggah untuk satu permohonan.
- US-11 Sebagai admin, saya menandai permohonan yang ditangani mitra PJK3 (tanpa nomor) lewat penyelenggara.

**Pendaftaran**
- US-12 Sebagai admin, saya menambah pendaftaran sebuah perusahaan ke satu permohonan, dan memilih PIC penerima sertifikat dari PIC perusahaan itu bila sudah diketahui.
- US-13 Sebagai admin, saya menambahkan banyak peserta sekaligus ke pendaftaran perusahaan tersebut.
- US-14 Sebagai admin, saya mendaftarkan peserta mandiri langsung ke permohonan tanpa perusahaan.
- US-15 Sebagai admin, saya dicegah mendaftarkan peserta yang sama dua kali ke satu permohonan, dan ditawari restore bila pendaftarannya pernah dihapus.

**Sertifikat / hasil**
- US-16 Sebagai admin, saya mengisi hasil peserta (lulus, gagal, remedial, ikut batch selanjutnya, takeout, cancel).
- US-17 Sebagai admin, saya mengisi No. Registrasi, No. Sertifikat, Masa Berlaku, No. SKP (khusus Kemnaker), dan tanggal terima sertifikat.

**Data aman**
- US-18 Sebagai admin, saya menghapus data dengan soft delete dan bisa me-restore-nya.
- US-19 Sebagai admin, saya dicegah menghapus data yang masih punya turunan aktif, dengan pesan yang jelas.

**Daftar data**
- US-20 Sebagai admin, setiap halaman daftar punya pencarian dan paginasi.

## 5. Functional Requirements

### FR-AUTH
- Login lewat Supabase Auth. Semua route di `(dashboard)` wajib sesi aktif, jika tidak diarahkan ke `/auth/signin`.
- Logout tersedia di header.

### FR-TRAINING (`/master/training`)
- CRUD Training. Tingkatan dikelola di dalam halaman Training.
- `Tingkatan.kelas` adalah string bebas.
- Hapus Training diblokir selama punya Tingkatan aktif. Hapus Tingkatan diblokir selama dipakai Permohonan aktif.

### FR-PERUSAHAAN (`/master/perusahaan`)
- CRUD Perusahaan. Saat dibuat, sistem otomatis membuat satu Cabang bertipe `HQ`.
- Cabang CRUD (tipe HQ, CABANG, DEPOT). Cabang HQ tidak boleh dihapus selama perusahaannya aktif.
- Hubungkan atau lepas PIC (`PerusahaanPic`). PIC punya tipe INTERNAL, DINAS, atau MITRA.
- Halaman detail menampilkan cabang, PIC, dan peserta.
- Saat membuat perusahaan baru, tampilkan peringatan jika ada nama yang mirip (cegah duplikat).
- Tidak ada konsep divisi. Jangan ditambahkan.

### FR-PESERTA (`/master/peserta`)
- CRUD Peserta. `perusahaanCabangId` boleh kosong (UI menampilkan "-").
- Halaman detail menampilkan riwayat pelaksanaan peserta.

### FR-PERMOHONAN (`/permohonan`, model `Pelaksanaan`)
- Field: `noPermohonan` (unik, boleh kosong), `tingkatan`, `jenisKegiatan`, `tipePelaksanaan`, `lokasi`, `penyelenggara`, `jenisSertifikasi`, `status` (status TemanK3), `uploadedAt`, `catatan`.
- Tanggal pelaksanaan disimpan sebagai `SesiPelaksanaan`, satu baris per hari aktual. Tidak ada teks rentang tanggal.
- 1 No. Permohonan = 1 Pelaksanaan. Duplikat nomor ditolak dengan pesan jelas.
- penyelenggara adalah enum: WINA_KARYA_MULIA, DELTA_INDONESIA, LIMA_PRIMA_SOLUSINDO, ARTA_KARYA_AREFAA, LIK, ITC. Selain WINA_KARYA_MULIA berarti kegiatan dipegang mitra PJK3 dan No. Permohonan boleh kosong. Seluruh data BNSP (125 baris) dipegang mitra LIK dan ITC.
- `status` (TemanK3) nullable. Enum hanya `SUDAH_UPLOAD`, `FU_LPS`, `CANCEL` (nilai `BELUM_UPLOAD` sudah dihapus). Arti `null` ditentukan oleh `jenisSertifikasi`: **KEMNAKER + null = "Belum Upload"**, BNSP atau INTERNAL + null = "-" (tidak berlaku, dan kontrol ubah status disembunyikan).
- Halaman detail: info, sesi, pendaftaran perusahaan, peserta mandiri.

### FR-PENDAFTARAN (`/pendaftaran`, model `PendaftaranPerusahaan` dan `PesertaPelaksanaan`)
- PendaftaranPerusahaan = satu perusahaan di satu Permohonan, dengan pic penerima sertifikat yang opsional (boleh kosong saat mendaftar, wajib saat pengiriman sertifikat). Kegiatan INHOUSE hanya boleh punya satu pendaftaran perusahaan.
- PIC yang dipilih harus sudah terhubung ke perusahaan tersebut.
- `PesertaPelaksanaan.pendaftaranPerusahaanId` kosong berarti peserta mandiri. Tidak ada boolean terpisah.
- Satu peserta hanya sekali per Permohonan. Jika baris lama sudah soft delete, tawarkan **restore**, jangan membuat baris baru.
- Peringatan (bukan blokir) jika perusahaan peserta berbeda dengan perusahaan pendaftarannya.

### FR-SERTIFIKAT (`/sertifikat`, field di `PesertaPelaksanaan`)
- `status`: LULUS, GAGAL, REMEDIAL, IKUT_BATCH_SELANJUTNYA, TAKEOUT, CANCEL.
- Field sertifikat (noRegistrasi, noSertifikat, masaBerlaku, noSkp, tanggalTerimaSertifikat) semuanya opsional dan boleh terisi tidak serempak. noRegistrasi bisa ada sebelum hasil keluar. Jika belum ada hasil, status dibiarkan kosong. Jangan menyimpulkan GAGAL dari data yang kosong.
- `noSkp` hanya tampil untuk `jenisSertifikasi = KEMNAKER`. BNSP dan Kemnaker memakai alur yang sama, perbedaannya hanya SKP dan ditangani di UI.
- `jenisSertifikasi = INTERNAL` (mis. food handler) tidak memakai field sertifikat resmi.

### FR-SOFTDELETE (berlaku di semua modul)
- Hapus = isi `deletedAt`. Semua query baca memakai `deletedAt: null`.
- Hapus **diblokir** selama masih ada turunan aktif:

| Dihapus | Diblokir selama masih ada (aktif) |
|---|---|
| Training | Tingkatan |
| Tingkatan | Pelaksanaan |
| Perusahaan | Cabang, PendaftaranPerusahaan |
| Cabang | Peserta (HQ tidak boleh dihapus selagi perusahaan aktif) |
| Peserta | PesertaPelaksanaan |
| Pic | PendaftaranPerusahaan |
| Pelaksanaan | PendaftaranPerusahaan, PesertaPelaksanaan |
| PendaftaranPerusahaan | PesertaPelaksanaan |
| PesertaPelaksanaan | tidak ada (opsional: peringatan jika `noSertifikat` terisi) |

- **Restore** hanya boleh bila parent-nya aktif.
- Cek turunan dan penghapusan dalam satu transaksi.
- Menambah data di bawah parent yang sudah terhapus ditolak di sisi server.
- `SesiPelaksanaan` dan `PerusahaanPic` memang hard delete (bukan data riwayat).

### FR-LIST
- Halaman daftar: pencarian, paginasi (default 10), data dari server, dan status/filter yang relevan.

### FR-DASHBOARD
- Halaman `/` saat ini berisi data dummy. Diganti data nyata setelah modul inti selesai (fase F7).

### FR-IMPORT (jalur paralel, bukan halaman)
- Skrip satu kali untuk memigrasi sheet KEMNAKER dan BNSP.
- Wajib punya mode **dry-run** yang menghasilkan laporan sebelum menulis ke database, dan idempoten.
- Aturan pembersihan: strip spasi/tab di No. Permohonan. `SKP DELTA`, `SKP LPS`, `PJK3 AKAI` menjadi `noPermohonan = null` dan dipecah menjadi banyak Pelaksanaan berdasarkan alat, tanggal, dan klien. `?` dan baris tanpa nomor masuk daftar "perlu diisi admin". `CANCEL` di kolom nomor dipindah menjadi status. Anotasi `(TAKEOUT)` dan sejenisnya dipindah ke `status`.
- Nama perusahaan beda tanda baca digabung ke satu master. Peserta dicocokkan lewat nama ternormalisasi dan perusahaan, nama sama di perusahaan berbeda tidak digabung otomatis.
- Duplikat dalam satu kegiatan digabung (ambil nilai terisi), bukan dihapus. Yang perusahaannya berbeda masuk file review.
- BNSP: seluruh No. Permohonan adalah placeholder (SKP LIK, SKP ITC), jadi noPermohonan = null. Bentuk kegiatan dari kombinasi penyelenggara, alat, tanggal, tempat, dan jenis kegiatan (±61 kegiatan dari 125 baris). Parser tanggal harus mengenal bulan Indonesia dan 5 format (Selasa, 18 Feb 2025, 29 SEPT 2025, 30/05/2025, dan lainnya). MASA BERLAKU berisi 3 THN (8 baris) dijadikan null dan dilaporkan. Typo 24 FEEB 2028 dan 17 JUNI 2025 masuk daftar review. Anotasi di nama perusahaan seperti (BEKASI) diperlakukan sebagai cabang, bukan perusahaan baru. Bangun master Perusahaan dan Peserta dari kedua sheet sebelum membuat kegiatan (12 perusahaan dan 9 peserta ada di dua sheet).

## 6. Non-Functional Requirements

| Area | Kebutuhan |
|---|---|
| Keamanan | Semua akses data lewat server (Prisma). RLS **aktif di semua tabel `public`** tanpa policy, karena kunci Supabase publik terkirim ke browser. Jangan membuat query data dari client. Jangan menaruh secret di variabel `NEXT_PUBLIC_*`. |
| Integritas | FK dengan `onDelete: Restrict`, unique constraint di skema, operasi multi-tabel dalam transaksi. |
| Performa | Index di kolom FK, paginasi di server, hindari N+1, `cache()` untuk fungsi get. |
| Maintainability | Gaya kode mengikuti `AGENTS.md`. Komponen dipecah dan dipakai ulang. |
| Lokalisasi | UI berbahasa Indonesia. Zona waktu WIB. Tanggal disimpan sebagai tipe tanggal, tidak pernah teks. |
| Tampilan | Responsif dan mendukung dark mode (sudah ada di template). |
| Audit | `createdAt`, `updatedAt`, `deletedAt` di tabel utama. |
| Operasional | Perubahan skema lewat migrasi (`prisma migrate`), bukan `db push` di database bersama. |

## 7. Scope

### Dalam scope (fase 1)
Auth, Master Pelatihan (Training dan Tingkatan), Master Perusahaan (Cabang dan PIC), Master Peserta, Permohonan (Pelaksanaan dan Sesi), Pendaftaran (perusahaan dan mandiri), Sertifikat/hasil, soft delete dan restore, migrasi data KEMNAKER dan BNSP.

### Di luar scope (ditunda, jangan dikerjakan)
- **Invoice** dan **Pengiriman** (tanggal kirim, resi, ekspedisi). Skema menunggu analisis sheet EBILLING. Halaman `/invoice` hanya placeholder.
- **Log riwayat TemanK3** (submit, revisi, PNBP, e-billing terbit). Status terkini ada di `Pelaksanaan.status`.
- Analisis sheet **LAIN-LAIN** dan **EBILLING PEMBINAAN KEMNAKER**.
- Integrasi otomatis dengan TemanK3 atau BNSP.
- Role dan permission granular, notifikasi, portal peserta atau perusahaan, website publik dan artikel.

## 8. Keputusan yang sudah final

| Keputusan | Detail |
|---|---|
| ID | UUID native Postgres |
| 1 permohonan | 1 Pelaksanaan. Pelanggaran di data lama adalah human error dan dikoreksi saat migrasi. |
| Nama perusahaan | Variasi kecil digabung jadi satu master |
| Divisi | Tidak dimodelkan |
| Penyelenggara | Enum. Penyelenggara baru = migrasi baru. |
| Peserta tanpa perusahaan | Boleh, tampil "-" |
| Mandiri | `pendaftaranPerusahaanId` kosong, tanpa boolean |
| BNSP dan Kemnaker | Satu alur, beda di `noSkp` dan ditangani di UI |
| Soft delete | Berlaku menyeluruh. Hapus diblokir bila ada turunan aktif. Konflik unique diselesaikan dengan restore. |
| Invoice, Pengiriman, Log | Ditunda |
| Status TemanK3 | Nullable, enum `SUDAH_UPLOAD`, `FU_LPS`, `CANCEL`. KEMNAKER + null = "Belum Upload", BNSP/INTERNAL + null = "-". |
| PIC pendaftaran | `PendaftaranPerusahaan.picId` opsional |
| Penyelenggara | Enum bertambah `LIK` dan `ITC` |

## 9. Status dan Fase Tersisa

### 9.1 Status aktual (branch `build`)

| Fase | Isi | Status |
|---|---|---|
| F0 Fondasi | env, migrasi, RLS, client Prisma, login dan guard, komponen bersama, pola soft delete | Selesai |
| F1 Master Pelatihan | `/master/training` | Selesai |
| F2 Master Perusahaan | `/master/perusahaan` | Selesai, dengan deviasi (lihat 9.2) |
| F3 Master Peserta | `/master/peserta`, `/master/peserta/[id]` | Selesai |
| F4 Permohonan | `/permohonan`, `/permohonan/[id]`, sesi, status TemanK3 | Selesai |
| Sinkron DB | migrasi `sync_status_temank3_nullable`: status nullable, `BELUM_UPLOAD` dihapus, `picId` nullable, enum `LIK` dan `ITC` | Selesai |
| **F5 Pendaftaran** | `/pendaftaran` | **Berikutnya** |
| F6 Sertifikat | `/sertifikat` | Belum |
| F7 Dashboard, Riwayat Kegiatan, placeholder Invoice | `/`, `/master/riwayat-kegiatan`, `/invoice` | Belum |
| Jalur M Migrasi Excel | skrip dry-run (bukan halaman) | Belum |
| Penutup | utang teknis (bagian 11), `PROGRESS.md` final | Belum |

Menu sidebar sudah memuat `/pendaftaran`, `/sertifikat`, `/invoice`, `/master/riwayat-kegiatan` tetapi halamannya belum ada (404). Semuanya harus ada setelah fase terkait selesai.

### 9.2 Deviasi yang sudah ada

- **Detail perusahaan** berupa baris expand inline di daftar (bukan route `/master/perusahaan/[id]`), dan belum menampilkan peserta perusahaan. Diselesaikan di fase Penutup (bagian 11 no. 5).
- **Form tambah/ubah memakai modal** (`<Entitas>FormModal`), detail memakai route `[id]` hanya untuk Peserta dan Permohonan. Ini menjadi konvensi tetap.

### 9.3 Aturan umum untuk semua fase tersisa

- Salin pola modul yang sudah ada (referensi: **F1 Training** untuk yang sederhana, **F4 Permohonan** untuk yang lengkap): `get/getX.ts`, `action/xAction.ts`, `components/main/<fitur>/<Entitas>List`, `<Entitas>FormModal`, `Deleted<Entitas>List`, `page.tsx`.
- Soft delete, blokir turunan aktif, restore dengan cek parent, dan filter `deletedAt: null` di semua query dan include (FR-SOFTDELETE) berlaku di setiap modul.
- UI Bahasa Indonesia, memakai komponen yang sudah ada (`AGENTS.md` bagian 4), tanpa komponen atau ikon baru.
- Daftar memakai `DataTable` (pencarian, paginasi di server).

### 9.4 F5 Pendaftaran (`/pendaftaran`, `/pendaftaran/[pelaksanaanId]`)

**Tujuan:** mengelola siapa yang ikut di sebuah Permohonan: lewat perusahaan (dengan PIC) atau mandiri. Panel pendaftaran di `/permohonan/[id]` tetap ringkasan read-only, tambahkan tombol "Kelola Pendaftaran" yang menuju halaman kerja.

- `/pendaftaran`: daftar Permohonan (pencarian, filter jenis sertifikasi) dengan kolom: no. permohonan, training/kelas, tanggal sesi, jumlah perusahaan, jumlah peserta mandiri, total peserta. Klik baris menuju halaman kerja.
- `/pendaftaran/[pelaksanaanId]`, dua panel dan satu tab "Terhapus":
  1. **Pendaftaran Perusahaan.** Daftar per perusahaan dengan PIC dan jumlah peserta, bisa di-expand untuk melihat pesertanya.
     - Tambah: pilih perusahaan (pencarian), PIC **opsional** (hanya PIC yang terhubung ke perusahaan itu lewat `PerusahaanPic`, aktif). Ubah PIC dan lepas PIC diperbolehkan.
     - Unik per (perusahaan, permohonan). Jika baris lama sudah soft delete, tawarkan **restore** dan jangan membuat baris baru.
     - Kegiatan `INHOUSE` maksimal 1 pendaftaran perusahaan aktif. Tolak yang kedua dengan pesan jelas.
     - Hapus diblokir selama masih ada peserta aktif di dalamnya.
  2. **Peserta Mandiri.** Daftar peserta dengan `pendaftaranPerusahaanId = null`.
- **Menambah peserta** (ke pendaftaran perusahaan maupun mandiri) lewat satu modal dengan tiga cara:
  - pilih dari master peserta (multi-pilih, pencarian). Peringatan, bukan blokir, jika perusahaan peserta berbeda dari perusahaan pendaftaran.
  - tambah peserta baru cepat (nama dan cabang), memakai `PesertaFormModal` yang ada.
  - tempel banyak nama (satu nama per baris). Tampilkan **pratinjau**: nama yang cocok dengan peserta yang ada (nama ternormalisasi: huruf besar, spasi dirapikan, anotasi dalam kurung dibuang), nama baru yang akan dibuat, dan baris yang ditolak. Simpan setelah pengguna menekan konfirmasi.
- Satu peserta hanya sekali per Permohonan (`@@unique([pesertaId, pelaksanaanId])`). Jika sudah aktif, tolak dan sebutkan di mana ia terdaftar. Jika pernah dihapus, tawarkan restore.
- Hapus peserta dari pendaftaran = soft delete, dengan peringatan jika `noSertifikat` sudah terisi.
- Semua operasi multi-baris dalam satu `prisma.$transaction`.
- Tidak ada konsep kuota. Jangan ditambahkan.

### 9.5 F6 Sertifikat (`/sertifikat`)

**Tujuan:** mengisi hasil dan data sertifikat per peserta per kegiatan.

- Daftar `PesertaPelaksanaan` aktif. Kolom: peserta, perusahaan, kegiatan (no. permohonan, training/kelas, tanggal), PIC penerima (read-only dari pendaftaran), status hasil, no. sertifikat, tanggal terima.
- Filter: kegiatan, jenis sertifikasi, status hasil (termasuk "belum ada hasil"), pencarian (nama peserta, perusahaan, no. sertifikat).
- Ubah lewat `SertifikatFormModal`: `status`, `noRegistrasi`, `noSertifikat`, `masaBerlaku`, `noSkp`, `tanggalTerimaSertifikat`, `catatan`. Semua opsional.
  - `noSkp` hanya tampil untuk `KEMNAKER`.
  - Untuk `INTERNAL`, sembunyikan `noRegistrasi`, `noSertifikat`, `noSkp`, `masaBerlaku`.
  - Peringatan (bukan blokir) bila `noSertifikat` sudah dipakai peserta lain pada jenis sertifikasi yang sama.
- **Ubah status massal:** pilih beberapa baris, set `status` sekaligus (dalam satu transaksi).
- `status` kosong berarti belum ada hasil. Jangan pernah mengisi `GAGAL` otomatis.
- Pengiriman sertifikat (resi, ekspedisi, tanggal kirim) **tidak** dikerjakan.

### 9.6 F7 Dashboard, Riwayat Kegiatan, Invoice

- **Dashboard `/`:** ganti seluruh data dummy dengan data nyata. Kartu angka: kegiatan tahun ini, kegiatan KEMNAKER belum upload, total peserta terdaftar, hasil belum diisi. Tabel: 5 kegiatan terdekat (sesi mendatang, WIB) dan 5 kegiatan terakhir. **Jangan menambah library chart.** Hapus tautan ke `/admin/training/jadwal`.
- **Riwayat Kegiatan `/master/riwayat-kegiatan`** **[DEFAULT SEMENTARA]:** daftar read-only Permohonan yang semua sesinya sudah lewat. Filter: tahun, penyelenggara, jenis sertifikasi, jenis kegiatan. Kolom: no. permohonan, training/kelas, rentang tanggal, jumlah perusahaan, jumlah peserta, ringkasan hasil (lulus, gagal, lainnya). Klik menuju `/permohonan/[id]`.
- **Invoice `/invoice`:** halaman placeholder "Segera hadir" dengan `PageHeader` dan `ComponentCard`. Tanpa model dan logika.

### 9.7 Jalur M: skrip migrasi Excel (bukan halaman)

Lokasi `scripts/import/`. Input `data/MASTER_DATA_PEMBINAAN_2025.xlsx` (tambahkan `data/` ke `.gitignore`: berisi data pribadi, jangan di-commit). Dependency yang **diizinkan**: `exceljs`, dan `tsx` (devDependency).

- **Mode:** `--dry-run` (default) tidak menulis ke database sama sekali. `--commit` hanya boleh dijalankan pemilik dan butuh `ALLOW_IMPORT=1`. **Agent tidak boleh menjalankan `--commit`.**
- **Keluaran dry-run** di `data/import-report/` (juga di-gitignore): `ringkasan.md`, `perlu_keputusan.csv` (kolom: sheet, baris, kategori, detail), `pemetaan_perusahaan.csv` (nama asli ke master, bisa diedit pemilik dan dibaca ulang sebagai input), `pemetaan_alat.csv` (nama alat ke Training dan Tingkatan), `ditunda_invoice_pengiriman.csv` (kolom invoice, bayar, kirim, resi, keterangan, disimpan untuk fase Invoice nanti).
- **Idempoten** lewat pencarian kunci alami (tanpa kolom baru di skema): kegiatan = `noPermohonan`, atau bila kosong = penyelenggara + tingkatan + tanggal sesi + lokasi + jenis kegiatan. Peserta = nama ternormalisasi + cabang. Perusahaan = nama ternormalisasi dan pemetaan.
- **Aturan No. Permohonan:** strip spasi dan tab. Non-angka (`SKP DELTA`, `SKP LPS`, `SKP LIK`, `SKP ITC`, `PJK3 AKAI`) menjadi `noPermohonan = null`, dan kegiatan dibentuk dari kunci alami. `?` dan baris tanpa nomor: `null` dan masuk `perlu_keputusan.csv`. `CANCEL` di kolom nomor menjadi status peserta `CANCEL`. Satu nomor dipakai dua kegiatan berbeda: nomor tetap pada kegiatan dengan baris terbanyak, lainnya `null`, laporkan. Buang baris sampah (tanpa nama peserta dan perusahaan).
- **Penyelenggara:** `PT WINA KARYA MULIA` (dengan atau tanpa titik) = `WINA_KARYA_MULIA`; `PT DELTA INDONESIA` = `DELTA_INDONESIA`; `PT LIMA PRIMA SOLUSINDO` dan `PJK3 LPS` = `LIMA_PRIMA_SOLUSINDO`; `PT ARTA KARYA AREFAA INDONESIA` dan `PJK3 AKAI` = `ARTA_KARYA_AREFAA`; `LIK`, `ITC` apa adanya. Kosong: `WINA_KARYA_MULIA` dan laporkan.
- **Perusahaan:** satukan variasi tanda baca, spasi, dan "PT" dengan atau tanpa titik. Anotasi lokasi dalam kurung (mis. `(BEKASI)`) dijadikan **Cabang**, bukan perusahaan baru. Setiap perusahaan otomatis punya Cabang `HQ`. Bangun master dari **kedua sheet** (KEMNAKER dan BNSP) sebelum membuat kegiatan.
- **Peserta:** cocokkan lewat nama ternormalisasi + perusahaan. Nama sama di perusahaan berbeda **tidak** digabung otomatis. Nama mirip tetapi tidak persis masuk `perlu_keputusan.csv`. Anotasi `(TAKEOUT)` dan sejenisnya dibuang dari nama dan dipindah ke `status`.
- **Hasil peserta:** TAKEOUT, TAKE OUT, CANCEL, TIDAK LULUS, REMEDIAL, IKUT BATCH SELANJUTNYA (di kolom mana pun ia muncul) menjadi `StatusPeserta`. Ada `noSertifikat` tanpa status negatif menjadi `LULUS`. Selain itu `status` null, **jangan menyimpulkan `GAGAL`**. `HANYA MATERI` berarti kegiatan `jenisSertifikasi = INTERNAL`.
- **Status TemanK3** (hanya KEMNAKER): teks diawali "Sudah upload" menjadi `SUDAH_UPLOAD`, `FU LPS` menjadi `FU_LPS`, `CANCEL` menjadi `CANCEL`, selain itu `null`. Nilai per kegiatan = yang terbanyak di antara barisnya; laporkan jika berkonflik. `uploadedAt` dari kolom tanggal upload. BNSP: `status = null`.
- **Tanggal:** parser mengenal bulan Indonesia (JAN, FEB/FEEB, MAR, APR, MEI, JUN/JUNI, JUL, AGU/AGUSTUS, SEP/SEPT, OKT, NOV, DES), rentang (`28-30 APR, 2 & 3 MEI 2025`, `21, 24-28 FEB 2025`) dipecah per hari menjadi `SesiPelaksanaan`, serta format `Selasa, 18 Feb 2025`, `29 SEPT 2025`, `30/05/2025`. Yang gagal diparsing masuk `perlu_keputusan.csv`.
- **Masa berlaku:** durasi seperti `3 THN` menjadi `null`. Tahun yang tidak masuk akal (mis. `17 JUNI 2025` untuk kegiatan Juni 2025 saat lainnya 2028) dan typo bulan masuk laporan.
- **PIC:** hanya nama yang bersih. Buang nilai status (CANCEL, TAKEOUT, dst.), nama yang sama dengan nama peserta di grupnya, dan instruksi pengiriman (mis. `DIKIRIM KE RUMAH ...`). Awalan BAPAK, IBU, PAK dibuang dari nama. `tipe` default `INTERNAL`, kecuali Ivan dan Fadli = `MITRA`, Louis = `DINAS`. Hubungkan lewat `PerusahaanPic`, dan isi `PendaftaranPerusahaan.picId` bila ada.
- **Tingkatan:** normalisasi nama alat lewat `pemetaan_alat.csv`. Varian REFRESH (mis. `REFRESH POPU`, `REF OPLB3`) = Tingkatan terpisah (`... (Refresh)`).
- **INHOUSE:** kegiatan INHOUSE hanya satu perusahaan. Jika data melanggar, laporkan.
- Hasil akhir yang diharapkan di `ringkasan.md`: jumlah kegiatan, perusahaan, cabang, peserta, pendaftaran, dan baris yang butuh keputusan, per sheet. Sertakan juga prosedur untuk pemilik menjalankan `--commit`.

### 9.8 Fase Penutup

Kerjakan seluruh utang teknis di bagian 11, finalkan `PROGRESS.md`, dan pastikan gerbang kualitas bersih di branch terakhir.

### 9.9 Peta navigasi, model, dan fase

Sumber: `src/components/main/Sidebar/navigationData.tsx`.

| Menu (UI) | Route | Model Prisma | Fase |
|---|---|---|---|
| Pelatihan | `/master/training` | Training, Tingkatan | F1 (selesai) |
| Perusahaan | `/master/perusahaan` | Perusahaan, Cabang, Pic, PerusahaanPic | F2 (selesai) |
| Peserta | `/master/peserta` | Peserta | F3 (selesai) |
| Permohonan | `/permohonan` | Pelaksanaan, SesiPelaksanaan | F4 (selesai) |
| Pendaftaran | `/pendaftaran` | PendaftaranPerusahaan, PesertaPelaksanaan | F5 |
| Sertifikat | `/sertifikat` | PesertaPelaksanaan (field sertifikat) | F6 |
| Riwayat Kegiatan | `/master/riwayat-kegiatan` | Pelaksanaan (read-only) | F7 |
| Invoice | `/invoice` | belum ada | F7 (placeholder) |

## 10. Keputusan Sementara (menggantikan "Pertanyaan Terbuka")

Agent memakai default berikut tanpa bertanya. Pemilik mereview dan mengoreksinya.

| # | Pertanyaan | **[DEFAULT SEMENTARA]** |
|---|---|---|
| 1 | Role dan akun Marketing atau atasan | Semua pengguna yang login adalah admin dengan akses penuh. Tidak ada role dan tidak ada akun Marketing. |
| 2 | Isi Riwayat Kegiatan | Lihat 9.6. |
| 3 | PJK3 LPS = PT Lima Prima Solusindo? | Ya, satu nilai enum `LIMA_PRIMA_SOLUSINDO`. |
| 4 | Nomor permohonan grup `?` dan satu nomor untuk dua kegiatan | Lihat aturan di 9.7, dilaporkan di `perlu_keputusan.csv`. |
| 5 | Penghapusan permanen otomatis 30 hari (dari kode contoh lama) | **Tidak diimplementasikan.** Soft delete bertahan tanpa batas waktu. |
| 6 | Log riwayat revisi TemanK3 | Tidak di fase 1. Hanya `status` dan `uploadedAt`. |
| 7 | Konvensi form | Modal untuk tambah/ubah. Halaman terpisah hanya untuk detail dan halaman kerja (Peserta, Permohonan, Pendaftaran). |
| 8 | Nama lengkap LIK dan ITC | Dipakai `LIK` dan `ITC` apa adanya. |
| 9 | REFRESH | Tingkatan terpisah, tanpa penanda tambahan. |
| 10 | INHOUSE banyak perusahaan | Ditolak di aplikasi (maksimal 1 pendaftaran perusahaan). |
| 11 | PIC pada pendaftaran | Opsional. Wajib baru di fase Pengiriman (belum dikerjakan). |

Pertanyaan yang masih menunggu **jawaban user Rojo Safety** (jangan menunggu untuk melanjutkan): nama lengkap LIK/ITC, nomor permohonan asli grup `?`, koreksi satu nomor untuk dua kegiatan, dan definisi Riwayat Kegiatan.

## 11. Utang Teknis (dikerjakan di fase Penutup, atau saat menyentuh file terkait)

1. **Pecah file panjang** sesuai `AGENTS.md` bagian 6: `perusahaanAction.ts` (406 baris), `PelaksanaanList.tsx` (382), `PesertaList.tsx` (337), `CabangManager.tsx` (315), `PicManager.tsx` (295), `PelaksanaanFormModal.tsx` (292). Perilaku tidak boleh berubah.
2. **Satukan peta status.** `common/StatusBadge.tsx` masih memuat `BELUM_UPLOAD` yang sudah dihapus dari enum, dan ada peta paralel `permohonan/statusTemanK3.ts`. Jadikan satu sumber dan turunkan tipenya dari enum Prisma.
3. **Peta label enum tunggal** untuk `jenisKegiatan`, `tipePelaksanaan`, `jenisSertifikasi`, `penyelenggara`. Halaman detail permohonan masih menampilkan nilai mentah.
4. **Semantik `status` null** (lihat FR-PERMOHONAN): terapkan di daftar, detail, dan `StatusTemanK3Cell`.
5. **Detail perusahaan:** tambahkan daftar peserta (nama, cabang) di baris expand. Tidak membuat route baru.
6. **Panel card di halaman detail** menulis ulang kelas card. Pakai `ComponentCard`.
7. **Riwayat migrasi:** pastikan `npx prisma migrate status` bersih (file `20261004100000_enable_rls` pernah direkonstruksi).

## 12. Format `PROGRESS.md`

```
# PROGRESS
## Status fase            (tabel: fase, status, commit)
## Asumsi                 (A-01 ...: apa, alasan, dampak jika salah)
## Deviasi dari PRD       (D-01 ...: apa, kenapa)
## Utang teknis baru      (T-01 ...)
## Sengaja tidak dikerjakan
## Ikon yang dibutuhkan tapi tidak tersedia
## Langkah uji manual     (per fase: urutan klik dan hasil yang diharapkan)
```