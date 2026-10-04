# PRD — Rojo Safety Admin

> Sumber kebenaran untuk **APA** yang dibangun. Aturan teknis (**BAGAIMANA**) ada di `AGENTS.md`. Skema data ada di `prisma/schema.prisma`.

| | |
|---|---|
| Status | Draft v0.1 |
| Diperbarui | 2026-10-04 |
| Pemilik | Naufal |
| Sumber kebutuhan | Excel `MASTER DATA PEMBINAAN 2025` (sheet KEMNAKER, BNSP, LAIN-LAIN, EBILLING PEMBINAAN KEMNAKER) dan wawancara dengan admin Rojo Safety |

## 0. Aturan untuk agent

1. Kerjakan hanya yang ada di **bagian 9 (Fokus Saat Ini)**. Fitur lain tidak dikerjakan walau terlihat berguna.
2. Jika ada konflik atau ambiguitas, **berhenti dan tanya**. Jangan menebak.
3. Item bertanda **[BELUM DIPUTUSKAN]** jangan diimplementasikan.
4. Perubahan scope hanya sah bila pemilik memperbarui dokumen ini.
5. `prisma/schema.prisma` adalah kontrak. Jangan mengubahnya tanpa persetujuan eksplisit.

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
| Marketing | Menerima pendaftaran dan merapikan dokumen. Saat ini bekerja di luar sistem. | **[BELUM DIPUTUSKAN]** apakah mendapat akun |
| Atasan (approver) | Menyetujui tanggal kegiatan, di luar sistem. | **[BELUM DIPUTUSKAN]** |
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
- status (TemanK3) boleh kosong. Hanya diisi untuk kegiatan KEMNAKER.
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

## 9. Fokus Saat Ini

Urutan mengikuti ketergantungan FK. Pelatihan dikerjakan pertama karena paling sederhana dan menjadi **template pola CRUD** untuk modul lain.

| Fase | Isi | Status |
|---|---|---|
| **F0 Fondasi** | `.env`, migrasi awal, generate client, RLS, `lib/prisma.ts` benar, login dan guard route, komponen bersama (`DataTable`, `PageHeader`, `ConfirmDialog`, peta warna `StatusBadge`), helper soft delete dan restore | **SEDANG DIKERJAKAN** |
| F1 Master Pelatihan | `/master/training`: daftar, tambah/ubah (Training + Tingkatan), soft delete dengan guard, restore | Belum |
| F2 Master Perusahaan | `/master/perusahaan`: perusahaan, cabang (HQ otomatis), PIC, halaman detail | Belum |
| F3 Master Peserta | `/master/peserta`: CRUD, peserta tanpa perusahaan, detail riwayat | Belum |
| F4 Permohonan | `/permohonan`: Pelaksanaan + Sesi, status TemanK3 | Belum |
| F5 Pendaftaran | `/pendaftaran`: pendaftaran perusahaan + PIC, peserta bulk, mandiri | Belum |
| F6 Sertifikat | `/sertifikat`: hasil dan data sertifikat | Belum |
| F7 Dashboard dan Riwayat Kegiatan | Dashboard data nyata. Riwayat Kegiatan **[BELUM DIPUTUSKAN]** definisinya. | Belum |
| Jalur M Migrasi | Skrip dry-run lalu import. Dimulai setelah F5 stabil dan item terbuka terjawab. | Belum |

Setiap fase dikerjakan per halaman (vertical slice): daftar, tambah/ubah, hapus/restore, detail. Satu fase selesai penuh sebelum fase berikutnya dimulai.

### Peta navigasi, model, dan fase

Sumber: `src/components/main/Sidebar/navigationData.tsx`.

| Menu (UI) | Route | Model Prisma | Fase |
|---|---|---|---|
| Pelatihan | `/master/training` | Training, Tingkatan | F1 |
| Perusahaan | `/master/perusahaan` | Perusahaan, Cabang, Pic, PerusahaanPic | F2 |
| Peserta | `/master/peserta` | Peserta | F3 |
| Permohonan | `/permohonan` | Pelaksanaan, SesiPelaksanaan | F4 |
| Pendaftaran | `/pendaftaran` | PendaftaranPerusahaan, PesertaPelaksanaan | F5 |
| Sertifikat | `/sertifikat` | PesertaPelaksanaan (field sertifikat) | F6 |
| Riwayat Kegiatan | `/master/riwayat-kegiatan` | **[BELUM DIPUTUSKAN]** | F7 |
| Invoice | `/invoice` | belum ada | Ditunda (placeholder) |

## 10. Pertanyaan Terbuka

Belum boleh diimplementasikan sampai dijawab.

1. Apakah Marketing dan atasan mendapat akun? Apakah ada pembedaan role?
2. Apa isi halaman **Riwayat Kegiatan** (daftar pelaksanaan selesai, atau riwayat per peserta/perusahaan)?
3. Apakah PJK3 LPS dan PT Lima Prima Solusindo adalah entitas yang sama? (Di data keduanya berada di grup `SKP LPS`.)
4. Nomor permohonan sebenarnya untuk 15 baris grup `?` (Nikomas, Juru Las Kelas III, 27-30 Okt 2025) dan koreksi kasus satu nomor untuk dua kegiatan (mis. `250312073918`).
5. Contoh kode lama menyebut penghapusan otomatis 30 hari setelah soft delete. Apakah dipakai di sistem ini? Jika ya, harus menghapus dari tabel paling bawah dan hanya baris tanpa turunan, serta bertentangan dengan restore tanpa batas waktu.
6. Apakah log riwayat revisi TemanK3 dimasukkan di fase 1 atau tetap ditunda?
7. Konvensi form: tambah/ubah lewat modal (`Modal` + `useModal`) atau halaman terpisah? Usulan: modal untuk master sederhana (Training, Tingkatan), halaman terpisah untuk Permohonan dan Pendaftaran.
8. Nama lengkap penyelenggara LIK dan ITC.
9. Apakah "REFRESH" (mis. REFRESH POPU, REF OPLB3) dimodelkan sebagai Tingkatan terpisah, atau perlu penanda tersendiri? Saat ini diasumsikan Tingkatan terpisah.