# PROGRESS

Dokumen ini dirawat per fase. Format mengikuti `PRD.md` bagian 12.

## Status revisi R0–R8

| Fase | Status | Commit |
|---|---|---|
| R0 | Implementasi selesai; lint, tipe, build lulus | R0 selesai: fondasi antarmuka dan pembersihan |
| R1 | Implementasi selesai; lint, tipe, build lulus | R1 selesai: aturan pendaftaran dan kegiatan aktif |
| R2 | Implementasi selesai; lint, tipe, build, uji terisolasi lulus; uji browser admin belum diverifikasi | 25e10af + commit penutup R2 |
| R3 | Implementasi selesai; lint, tipe, build, uji terisolasi dan pemeriksaan browser baca saja lulus | R3 selesai: detail perusahaan dan pengelolaan inline |
| R4 | Implementasi selesai; lint, tipe, build lulus | R4 selesai: daftar, panel inline, dan detail peserta |
| R5 | Belum dikerjakan | - |
| R6 | Belum dikerjakan | - |
| R7 | Belum dikerjakan | - |
| R8 | Belum dikerjakan | - |

## Checklist revisi

| ID | Status | Catatan |
|---|---|---|
| U-01 | Selesai | Daftar menuju route detail perusahaan R3. |
| U-02 | Selesai | Peserta dan PIC ditambah inline di detail. |
| U-03 | Selesai | Header dan grid informasi:cabang 60:40, PIC:peserta 30:70. |
| U-04 | Selesai | Cabang, PIC, peserta inline; peserta ditautkan ke cabang perusahaan aktif. |
| U-05 | Sebagian | R2–R4 memakai form dan konfirmasi inline; modul lain menunggu fase terkait. |
| U-06 | Sebagian | Tombol aksi R2–R4 memakai ikon dari icons/index; modul lain menunggu fase terkait. |
| U-07 | Selesai | Pembersihan R0. |
| U-08 | Sebagian | R2–R4 memakai pencarian, filter dan paginasi server; modul lain menunggu fase terkait. |
| U-09 | Sebagian | R3–R4 memakai SearchableSelect server (seluruh hasil maksimal 10); modul lain menyusul. |
| U-10 | Tidak dikerjakan | Menunggu fase terkait. |
| U-11 | Tidak dikerjakan | Menunggu fase terkait. |
| U-12 | Tidak dikerjakan | Menunggu fase terkait. |
| U-13 | Tidak dikerjakan | Menunggu fase terkait. |
| U-14 | Selesai | Peserta tanpa perusahaan dapat dihubungkan; filter cabang tersedia. |
| U-15 | Tidak dikerjakan | Menunggu fase terkait. |
| U-16 | Tidak dikerjakan | Menunggu fase terkait. |
| U-17 | Tidak dikerjakan | Menunggu fase terkait. |
| B-01 | Selesai | Backend R1 selesai; penerapan UI pada fase modul. |
| B-02 | Selesai | Backend R1 selesai; penerapan UI pada fase modul. |
| B-03 | Sebagian | Backend R1 selesai; penerapan UI pada fase modul. |
| X-01 | Sebagian | Modal Training dan Perusahaan diganti pada R2–R3; modul lain menunggu fase terkait. |
| X-02 | Selesai | Pembersihan R0. |
| X-03 | Selesai | Backend R1 selesai; penerapan UI pada fase modul. |

## Status fase (arsip v0.2)

| Fase | Status | Commit |
|---|---|---|
| F0 Fondasi | Selesai | - |
| F1 Master Pelatihan | Selesai | - |
| F2 Master Perusahaan | Selesai (deviasi D-01) | - |
| F3 Master Peserta | Selesai | - |
| F4 Permohonan | Selesai (revisi status TemanK3) | sudah di-commit (revisi perbaikan ui pelaksanaan) |
| Sinkron DB | Selesai (`sync_status_temank3_nullable`) | sudah di-commit |
| F5 Pendaftaran | Selesai | F5 selesai: pendaftaran perusahaan, peserta mandiri, tempel nama |
| F6 Sertifikat | Selesai | F6 selesai: daftar sertifikat, form hasil, ubah status massal |
| F7 Dashboard, Riwayat Kegiatan, Invoice | Selesai | F7 selesai: dashboard data nyata, riwayat kegiatan, placeholder invoice |
| Jalur M Migrasi Excel | Selesai (dry-run teruji dengan file contoh) | Jalur M selesai: skrip impor Excel dry-run dan commit terkunci |
| Penutup | Selesai | Penutup selesai: pecah file panjang, peta label tunggal, detail perusahaan, ComponentCard |

## Asumsi

- **A-01** Status TemanK3 dipindahkan dari tabel permohonan ke halaman detail; tabel hanya menampilkan badge read-only. Alasan: status perlu mencatat tanggal unggah, sehingga aksi lebih tepat berada di detail. Dampak jika salah: admin harus membuka detail untuk mengubah status.
- **A-02** Semantik `uploadedAt`: `SUDAH_UPLOAD` mencatat waktu sekarang; `FU_LPS` dan `CANCEL` tidak mengubah tanggal unggah; kembali ke `null` (Belum Upload) mengosongkan tanggal unggah. Alasan: hanya "sudah upload" yang jelas menandai unggahan, sedangkan reset membersihkan data yang salah isi. Dampak jika salah: tanggal unggah mungkin perlu dipertahankan saat reset.
- **A-03** Status TemanK3 hanya berlaku untuk `jenisSertifikasi = KEMNAKER`. Untuk BNSP/INTERNAL panel hanya menampilkan keterangan dan server menolak perubahan. Alasan: PRD FR-PERMOHONAN.
- **A-04** Peta label/warna status disatukan di `main/common/StatusBadge` (utang teknis PRD #2); nilai `BELUM_UPLOAD` dihapus dan file `permohonan/statusTemanK3.ts` dihapus. Alasan: `BELUM_UPLOAD` sudah tidak ada di enum Prisma.
- **A-05** Tab "Terhapus" pada halaman kerja pendaftaran menampilkan pendaftaran perusahaan dan peserta yang sudah dihapus, keduanya bisa direstore. Alasan: PRD 9.4 hanya menyebut "satu tab Terhapus"; keduanya relevan untuk restore.
- **A-06** Peserta yang sudah terdaftar aktif di satu permohonan ditolak seluruh batchnya (bukan dilewati diam-diam) dengan menyebut nama dan tempat pendaftarannya. Alasan: PRD FR-PENDAFTARAN "tolak dan sebutkan di mana ia terdaftar".
- **A-07** Batch peserta yang berisi peserta sudah terdaftar tidak diproses sebagian; pengguna diminta memperbaiki pilihan. Alasan: konservatif, menghindari data setengah jadi.
- **A-08** Normalisasi nama untuk tempel massal: buang anotasi dalam kurung, rapikan spasi, huruf besar (`src/lib/normalisasi.ts`). Dipakai juga oleh Jalur M nanti.
- **A-09** Peringatan perusahaan peserta berbeda dengan perusahaan pendaftaran ditampilkan sebagai bagian pesan sukses, bukan dialog terpisah. Alasan: PRD hanya mewajibkan peringatan, bukan blokir.
- **A-10** `DataTable` dan `ui/table` ditambah prop opsional `onRowClick`/`onClick` (backward-compatible) untuk kebutuhan "klik baris menuju halaman kerja".
- **A-11** Peta label enum umum (`jenisKegiatan`, `tipePelaksanaan`, `jenisSertifikasi`, `penyelenggara`) disatukan di `main/common/enumLabels.ts` (utang teknis PRD #3).
- **A-12** Halaman `/sertifikat` tidak punya tab Terhapus. Penghapusan dan restore peserta sudah tersedia di F5 `/pendaftaran/[pelaksanaanId]`, dan PRD 9.5 tidak meminta tab terhapus. Dampak jika salah: admin harus menghapus dari halaman Pendaftaran.
- **A-13** Filter kegiatan di `/sertifikat` memuat maksimal 200 permohonan aktif terbaru agar halaman tetap ringan. Dampak jika salah: permohonan lama tidak muncul di filter kegiatan (masih bisa lewat pencarian).
- **A-14** Peringatan No. Sertifikat ganda ditampilkan sebagai bagian pesan sukses (tidak memblokir), sesuai PRD "peringatan (bukan blokir)".
- **A-15** Untuk `jenisSertifikasi = INTERNAL`, field resmi (`noRegistrasi`, `noSertifikat`, `noSkp`, `masaBerlaku`) tidak ditampilkan dan dipaksa `null` di server.
- **A-16** `formatTanggal` dan `formatDaftarSesi` dipindah ke `main/common/formatTanggal.ts` karena dipakai F5 dan F6 (helper umum dipakai 2 tempat atau lebih).
- **A-17** Dashboard memakai `export const dynamic = "force-dynamic"` agar angka dan daftar kegiatan selalu segar (tanpa ini Next.js mem-prerender `/` menjadi statis).
- **A-18** "Kegiatan tahun ini" = pelaksanaan aktif yang punya minimal satu sesi di tahun berjalan (WIB).
- **A-19** "5 kegiatan terdekat/terakhir" diambil dari baris sesi (bukan pelaksanaan), unik per kegiatan, diurut tanggal terdekat/terbaru.
- **A-20** Ringkasan hasil pada Riwayat Kegiatan: Lulus = status `LULUS`, Gagal = `GAGAL`, Lainnya = sisanya (termasuk status kosong dan enum lain).
- **A-21** Filter tahun Riwayat Kegiatan diambil dari tahun-tahun yang punya sesi pada pelaksanaan aktif.
- **A-22** `keTanggalInput` di `main/common/formatTanggal.ts` mengubah Date `@db.Date` ke `YYYY-MM-DD` memakai getter UTC agar tanggal tidak bergeser.
- **A-23** Jalur M: `.gitignore` memakai `/data/` (hanya root) agar folder `src/lib/data/` tidak ikut terabaikan. Catatan: percobaan pertama memakai `data/` dan sempat mengabaikan file baru di `src/lib/data/`.
- **A-24** Jalur M: `--commit` dikunci `ALLOW_IMPORT=1` dan hanya untuk pemilik; agent tidak pernah menjalankannya. Dry-run selalu menulis laporan ke `data/import-report/` (di-gitignore).
- **A-25** Jalur M: `pemetaan_perusahaan.csv` dan `pemetaan_alat.csv` dibaca ulang sebagai input bila ada di `data/import-report/`, sehingga pemilik bisa mengoreksi pemetaan lalu menjalankan dry-run lagi.
- **A-26** Jalur M: kolom Excel dideteksi lewat alias header pada 10 baris pertama (nama kolom asli belum diketahui saat kode ditulis). Header yang tidak cocok dilaporkan lewat baris yang tidak terbaca.
- **A-27** Penutup: pemecahan file panjang (utang #1) murni ekstraksi kolom/hook tanpa mengubah perilaku; `perusahaanAction.ts` dipecah menjadi `perusahaanAction.ts` + `cabangAction.ts` + `picAction.ts`; `PelaksanaanList`/`PesertaList` memakai file `*Columns.tsx`; `CabangManager`/`PicManager`/`PelaksanaanFormModal` memakai hook `use*`.
- **A-36** R4: `PesertaFormModal` dipindah ke `components/main/pendaftaran/` karena satu-satunya pemakai yang tersisa adalah `PesertaBulkModal` (dihapus di R6). Modul Peserta kini sepenuhnya memakai panel inline; tidak ada perubahan perilaku pada alur pendaftaran. Dampak jika salah: R6 perlu memperbarui impor atau menghapus file ini bersama `PesertaBulkModal`.
- **A-37** R4: pencarian daftar peserta dibatasi ke nama (PRD 5.12). Filter perusahaan memakai `SearchableSelect` dengan pencarian server, dan pilihan "Tanpa perusahaan" saling menimpa dengan filter perusahaan (memilih salah satu mengosongkan yang lain). Dampak jika salah: admin yang terbiasa mencari lewat nama perusahaan harus memakai dropdown filter.
- **A-38** R4: penghapusan peserta tetap hanya tersedia di daftar; halaman detail hanya memuat kartu informasi (ubah inline) dan riwayat kegiatan sesuai PRD 5.5. Dampak jika salah: admin perlu kembali ke daftar untuk menghapus.

## Deviasi dari PRD

- **D-01** Arsip v0.2: detail perusahaan sebelumnya berupa baris expand. Diselesaikan R3 dengan route `/master/perusahaan/[id]`.
- **D-02** PRD 9.4 menyebut tiga cara menambah peserta, termasuk "tambah peserta baru cepat memakai `PesertaFormModal`". Karena `PesertaFormModal` tidak mengembalikan id peserta, ditambahkan prop opsional `onCreated` (backward-compatible) agar peserta baru langsung didaftarkan.
- **D-03** Detail permohonan menampilkan status peserta mandiri dengan `StatusBadge` (sebelumnya teks mentah). Bagian dari utang teknis #3/#4.

## Utang teknis baru

- Tidak ada. Seluruh utang teknis di `PRD.md` bagian 11 (nomor 1-7) sudah dikerjakan di fase Penutup.

## Perbaikan bug (di luar utang, dicatat sesuai PRD bagian 0 butir 8)

- Hapus PIC kini diblokir bila PIC dipakai `PendaftaranPerusahaan` aktif (FR-SOFTDELETE).
- Riwayat kegiatan peserta mandiri di `/master/peserta/[id]` sebelumnya selalu "-" karena hanya membaca relasi `pendaftaranPerusahaan`; kini membaca `pelaksanaan` langsung.
- `.gitignore` `data/` diubah menjadi `/data/` (lihat A-23).

## Sengaja tidak dikerjakan

- Modul Invoice dan Pengiriman (placeholder saja), log riwayat TemanK3, analisis sheet LAIN-LAIN dan EBILLING, integrasi TemanK3/BNSP, role granular (sesuai PRD bagian 7).
- Kuota peserta: PRD 9.4 menyatakan tidak ada konsep kuota.
- Import `--commit` ke database: hanya boleh dijalankan pemilik dengan `ALLOW_IMPORT=1`.

## Ikon yang dibutuhkan tapi tidak tersedia

- Tidak ada.

## Langkah uji manual

### F4 Permohonan — status TemanK3 & unggah berkas
1. `npm run dev`, buka `/permohonan`. Kolom "Status TemanK3" menampilkan badge read-only (KEMNAKER + kosong = "Belum Upload"; BNSP/INTERNAL yang kosong = "-").
2. Buka detail `/permohonan/[id]` berkegiatan KEMNAKER. Panel "Status TemanK3 & Unggah Berkas" menampilkan badge dan keterangan tanggal (atau "Belum ada tanggal unggah berkas").
3. Klik **Nyatakan file sudah diupload** → badge menjadi "Sudah Upload" dan tanggal unggah muncul (WIB).
4. Klik **Tandai FU LPS** → badge "FU LPS"; tanggal unggah tidak berubah.
5. Klik **Tandai Cancel** → badge "Cancel".
6. Klik **Kembalikan ke Belum Upload** → badge "Belum Upload" dan tanggal unggah hilang.
7. Buka detail kegiatan BNSP/INTERNAL. Panel menampilkan keterangan bahwa status hanya untuk KEMNAKER, tanpa tombol.

### F4 Permohonan — sesi
1. Di detail, pilih tanggal lewat date picker lalu klik "+ Tambah Hari Sesi". Tanggal muncul di daftar sesi.
2. Klik ikon hapus pada sebuah sesi, konfirmasi, sesi hilang.

### F5 Pendaftaran
1. Buka `/pendaftaran`. Daftar permohonan tampil dengan kolom jumlah perusahaan, mandiri, dan total peserta. Filter jenis sertifikasi dan pencarian bekerja. Klik baris menuju halaman kerja.
2. Di halaman kerja, tab **Pendaftaran Perusahaan**: klik "Tambah Pendaftaran", cari perusahaan, pilih PIC opsional, simpan. Baris perusahaan muncul. Pada kegiatan INHOUSE, pendaftaran kedua ditolak dengan pesan jelas.
3. Klik "Tambah Peserta" pada baris perusahaan: modal tiga tab muncul.
   - Tab **Pilih dari Master**: cari dan centang peserta, klik "Tambah N Peserta". Peserta muncul saat baris di-expand. Peserta yang sudah terdaftar tampil berlabel dan tidak bisa dicentang.
   - Tab **Peserta Baru**: isi nama dan cabang, klik simpan. Peserta langsung terdaftar.
   - Tab **Tempel Nama**: tempel beberapa nama (satu per baris), klik "Pratinjau". Cocok/baru/ditolak tampil; klik "Simpan N Peserta".
4. Peserta yang perusahaannya berbeda dengan pendaftaran tetap masuk, dengan catatan peringatan pada pesan sukses.
5. Hapus peserta dari pendaftaran: tombol "Hapus" pada baris peserta. Bila `noSertifikat` terisi, dialog peringatan muncul.
6. Hapus pendaftaran perusahaan yang masih punya peserta aktif → ditolak dengan pesan. Setelah peserta dihapus, pendaftaran bisa dihapus.
7. Tab **Peserta Mandiri**: "Tambah Peserta Mandiri" memakai modal yang sama; peserta muncul tanpa perusahaan.
8. Tab **Terhapus**: pendaftaran/peserta yang dihapus bisa direstore. Restore ditolak bila parent sudah dihapus.
9. Duplikat: tambahkan peserta yang sama dua kali → ditolak dengan menyebut tempat pendaftarannya.

### F6 Sertifikat
1. Buka `/sertifikat`. Daftar peserta terdaftar tampil dengan kolom peserta, perusahaan pendaftar, kegiatan, PIC, status hasil, no. sertifikat, dan tanggal terima.
2. Filter kegiatan, jenis sertifikasi, dan status hasil (termasuk "Belum ada hasil"). Pencarian nama peserta / perusahaan / no. sertifikat bekerja.
3. Klik **Ubah** pada satu baris. Isi status, no. registrasi, no. sertifikat, masa berlaku, tanggal terima, catatan. Simpan.
   - Kegiatan INTERNAL: field resmi tidak tampil.
   - Kegiatan KEMNAKER: field No. SKP tampil.
4. Isi No. Sertifikat yang sama pada dua peserta dengan jenis sertifikasi sama → tersimpan dengan pesan peringatan.
5. Centang beberapa baris → bar muncul. Pilih status lalu **Terapkan Status**; semua baris terpilih berubah.
6. Status kosong tetap "Belum ada hasil"; sistem tidak pernah mengisi GAGAL otomatis.

### F7 Dashboard, Riwayat Kegiatan, Invoice
1. Buka `/`. Empat kartu angka tampil (kegiatan tahun ini, KEMNAKER belum upload, peserta terdaftar, hasil belum diisi), lalu daftar "5 Kegiatan Terdekat" dan "5 Kegiatan Terakhir". Klik salah satu item menuju detail permohonan. Tidak ada lagi tautan ke `/admin/training/jadwal`.
2. Buka `/master/riwayat-kegiatan`. Hanya permohonan yang seluruh sesinya sudah lewat yang tampil. Filter tahun, penyelenggara, jenis sertifikasi, jenis kegiatan, dan pencarian bekerja. Klik baris menuju detail permohonan.
3. Buka `/invoice`. Halaman placeholder "Segera Hadir" tampil tanpa error.

### Jalur M — skrip migrasi Excel
1. Letakkan berkas `MASTER DATA PEMBINAAN 2025.xlsx` di folder `data/` (folder ini di-gitignore).
2. Jalankan `npm run import:excel`. Skrip membaca sheet KEMNAKER dan BNSP, menulis laporan ke `data/import-report/`, dan **tidak** menulis ke database.
3. Periksa `ringkasan.md`, `perlu_keputusan.csv`, `pemetaan_perusahaan.csv`, `pemetaan_alat.csv`, dan `ditunda_invoice_pengiriman.csv`.
4. Bila perlu, sunting `pemetaan_perusahaan.csv` / `pemetaan_alat.csv`, lalu jalankan `npm run import:excel` lagi; pemetaan dibaca ulang.
5. Tanpa berkas, skrip berhenti dengan pesan yang jelas dan tidak error.
6. `npm run import:excel -- --commit` ditolak kecuali `ALLOW_IMPORT=1` (khusus pemilik).

### Penutup — regresi
1. `/master/perusahaan`: expand sebuah perusahaan → bagian Cabang, PIC, dan **Peserta** tampil. Tambah/ubah/hapus cabang dan PIC berfungsi seperti sebelumnya.
2. Hapus PIC yang masih dipakai pendaftaran aktif → ditolak dengan pesan jelas.
3. `/master/peserta/[id]` untuk peserta mandiri → riwayat kegiatan menampilkan nama pelatihan dan tanggalnya (bukan "-").
4. `/permohonan` dan `/master/peserta`: kolom tabel, pencarian, paginasi, tambah/ubah/hapus/restore berfungsi seperti sebelumnya setelah pemecahan file.
5. Semua halaman menu bisa dibuka: `/`, `/permohonan`, `/pendaftaran`, `/sertifikat`, `/invoice`, `/master/training`, `/master/perusahaan`, `/master/peserta`, `/master/riwayat-kegiatan`.

## Catatan revisi v0.3

- **A-28** PRD v0.3 menjadi acuan bila tabel lama AGENTS bagian 3 menyebut Riwayat Kegiatan belum ada. Riwayat tetap dikerjakan di R7.
- **A-29** UI terhapus di Peserta dan Permohonan juga dihapus di R0 sesuai larangan seluruh UI pemulihan (PRD 5.10); getter dan server action restore tetap dipertahankan.
- **A-30** Button mendapat isLoading opsional; PageHeader mendapat backHref/badges opsional; RowActions menerima editHref opsional untuk halaman ubah permohonan.
- **D-04** Lint awal gagal pada Sidebar (rule tidak tersedia dan mutasi ref lewat props). R0 memperbaiki registrasi ref melalui callback pemilik ref serta impor tidak terpakai agar gerbang kualitas dapat dijalankan.
- Status migrasi: tiga migrasi, database up to date (pemeriksaan baca saja).
- Catatan arsip: langkah uji F0–F7/Jalur M di atas menggambarkan v0.2 dan digantikan langkah revisi berikut. Jalur impor sudah dihapus; jangan menjalankan instruksi impor arsip.

### Uji manual R0
1. Buka seluruh menu: daftar aktif tetap tampil; tab Terhapus tidak ada.
2. Komponen baru diuji lewat modul yang dimigrasi R2–R7: sukses hilang dalam lima detik, error/warning bertahan sampai ditutup.
3. Dropdown: ketik cepat, navigasi panah/Enter/Esc, hasil maksimal sepuluh, input dan tinggi daftar tetap stabil.

- Validasi R0: npm run lint bersih; tsc --noEmit --incremental false lulus; npm run build lulus setelah akses Google Fonts diizinkan. Pencarian pola komponen R0 dan UI terhapus kosong. Seluruh route menu ada di hasil build. Uji interaksi admin belum diverifikasi karena belum tersedia sesi login browser.

### Catatan dan uji manual R1
- **A-31** Sesi tidak memiliki deletedAt di skema, sehingga seluruh sesi milik kegiatan aktif dipakai untuk batas tujuh hari. Tidak ada perubahan skema.
- **A-32** Training yang hanya mempunyai kelas internal KELAS_UMUM tetap ditampilkan sebagai tanpa tingkatan. Transaksi serializable mencegah pembuatan kelas otomatis ganda.
- **A-33** Penyimpanan jadwal sesi dalam transaksi disiapkan bersama input permohonan di R1 untuk digunakan form R5; field status tetap dikelola lewat aksi status.
- Uji terisolasi dengan transaksi tiruan lulus: pergantian tanggal WIB, penolakan peserta perusahaan lain sebelum menulis, mandiri tanpa mutasi perusahaan, penautan HQ, pemulihan hanya mengubah deletedAt/pendaftaranPerusahaanId.
1. Pendaftaran perusahaan X: pencarian tidak menampilkan peserta Y; pemanggilan server dengan ID peserta Y ditolak tanpa menyebut nama Y.
2. Pilih peserta tanpa perusahaan: peserta tercatat di HQ/cabang pilihan X dan muncul di master X.
3. Daftarkan peserta berperusahaan secara mandiri: perusahaan asal tidak berubah.
4. Tambahkan kembali peserta/pendaftaran yang dihapus: pesan dipulihkan dan data sertifikat lama tetap.
5. Training tanpa tingkatan dapat dipilih pada form R5 dan label tidak menampilkan kelas internal.

- Validasi R1: lint bersih, tsc tanpa error, build produksi lulus. Uji data langsung belum dijalankan; pengujian transaksi menggunakan fixture terisolasi tanpa mengubah database bersama.

### Validasi R2
- Daftar Master Pelatihan memakai pencarian, filter punya/tanpa tingkatan, panel tambah inline, edit inline, dan pengelolaan tingkatan inline.
- Konfirmasi hapus memakai `InlineConfirm`; notifikasi memakai `FlashAlert`; komponen modal lama Training dihapus.
- Form ubah tingkatan tampil di baris yang dipilih, label terhubung dengan input, dan callback panel DataTable dievaluasi sekali per baris. Input pencarian mengikuti perubahan URL.
- Validasi penutup: `npm run lint`, `tsc --noEmit --incremental false`, dan `npm run build` lulus. Build memakai akses Google Fonts; masih ada peringatan bawaan Next.js tentang konvensi middleware yang deprecated.
- Pencarian pola modal, `useModal`, dialog browser, dan reload pada modul Training kosong; `git diff --check` lulus.
- Uji terisolasi dengan Prisma tiruan lulus: nama kosong ditolak, nama/tingkatan dipangkas, tingkatan awal opsional, hapus ditolak saat relasi aktif, soft delete, filter ada/tanpa tingkatan (kelas internal dikecualikan), pencarian, dan paginasi. Tidak ada perubahan database dari pengujian.
- Interaksi browser admin belum diverifikasi. Langkah manual di bawah adalah checklist, bukan hasil pengujian yang sudah dijalankan.
- **D-05** Implementasi parsial R2 sudah tersimpan di `25e10af` ketika pekerjaan dilanjutkan. Perapian dan validasi disimpan dalam commit lanjutan agar riwayat yang ada tetap utuh.
- Berhenti setelah penutup R2 sesuai instruksi pengguna untuk menyelesaikan satu fitur sampai commit. R3 belum dimulai.

### Uji manual R2 yang tersisa
1. Login lalu buka `/master/training`. Uji pencarian, filter punya/tanpa tingkatan, paginasi, dan tombol kembali browser.
2. Tambah pelatihan dengan/tanpa tingkatan awal. Setelah sukses, form tambah tetap terbuka dan fokus kembali ke input nama.
3. Ubah nama pelatihan inline; perluas tingkatan lalu tambah/ubah/batalkan pada baris yang dipilih.
4. Hapus tingkatan yang masih dipakai permohonan aktif dan pelatihan dengan tingkatan aktif: error tampil, data tetap ada. Uji batal konfirmasi dan hapus data kosong yang diizinkan.
5. Periksa tampilan gelap/terang, label input, navigasi keyboard, dan perilaku FlashAlert (sukses hilang setelah lima detik, error dapat ditutup).

### R3 — Perusahaan, cabang, PIC, dan peserta
- Route detail menggantikan expand lama. Daftar memakai pencarian nama, filter tanpa PIC/tanpa peserta, paginasi server dan jumlah peserta aktif tanpa memuat seluruh data peserta.
- Detail memakai header dan grid 60:40 / 30:70, informasi yang dapat diubah inline, cabang lima per halaman, PIC inline, serta peserta sepuluh per halaman dengan pencarian dan filter cabang di URL.
- Peserta baru dan penghubungan peserta master memvalidasi cabang/perusahaan aktif, hanya menerima master tanpa perusahaan, dan menolak nama duplikat ter-normalisasi dengan tautan ke peserta yang ada. Operasi memakai transaksi serializable.
- PIC dapat dibuat, dihubungkan, diubah (dengan catatan penggunaan bersama), dilepas, dan dihapus. Pemeriksaan pendaftaran aktif dan mutasi lepas/hapus dilakukan dalam transaksi. Cabang HQ tidak dapat dihapus atau diubah tipenya.
- **A-34** Penolakan nama peserta memakai `normalisasiNama` yang sudah ada, termasuk penghapusan anotasi kurung. Nama pembeda harus ditulis di luar kurung agar tidak dianggap sama.
- **A-35** `PageHeader.actions`, nilai awal opsional `useFlash`, dan `Button.value` ditambahkan secara backward-compatible untuk aksi header, pesan sukses setelah navigasi, serta Simpan & tambah lagi.
- **D-06** Aturan hapus perusahaan lama dipertahankan sesuai PRD 0.8: pendaftaran/peserta aktif memblokir, sedangkan cabang kosong ikut di-soft-delete dalam transaksi. Ini berbeda dari tabel 5.10 yang menyebut cabang aktif sebagai pemblokir; memblokir seluruh cabang termasuk HQ akan membuat perusahaan tidak pernah dapat dihapus. Tidak ada perubahan skema.
- **D-07** Komponen modal khusus Perusahaan dan hook lamanya yang sudah tidak memiliki pengimpor dihapus dalam R3 agar gerbang pola modul bersih. Komponen modal bersama tetap menunggu R8.
- Validasi: tiga migrasi sudah up to date (baca saja); lint seluruh proyek, TypeScript, build produksi, dan `git diff --check` lulus. Build tetap memberi peringatan Next.js tentang middleware yang deprecated. Pola modal/dialog, SVG inline dan reload pada modul Perusahaan kosong.
- Uji transaksi tiruan lulus: penolakan cabang/perusahaan di luar scope, master yang sudah punya perusahaan, nama duplikat dan tautannya, penetapan cabang, blokir hapus peserta aktif, parent PIC terhapus, PIC yang sedang dipakai, proteksi HQ, dan filter daftar. Pengujian ini tidak menulis database.
- Uji browser setelah login: daftar dan detail dengan data aktual terbuka; jumlah cabang/PIC/peserta tampil; form peserta inline autofocus dan default HQ; mode master menampilkan dropdown dengan hasil kosong yang benar; form HQ mengunci tipe; konfirmasi lepas PIC digantikan konfirmasi hapus peserta sehingga hanya satu terbuka; pembatalan bekerja. Log error browser kosong. Tampilan layar sempit ditinjau.
- Batas validasi: penyimpanan/hapus data nyata, tampilan desktop lebar/dark, dan paginasi dengan data lebih dari satu halaman belum diuji lewat browser. Aturan mutasinya diuji terisolasi. Tidak ada data perusahaan yang diubah untuk pengujian browser.

### Langkah uji manual R3 lanjutan
1. Tambah perusahaan dengan nama mirip: peringatan dan tautan muncul. Simpan perusahaan baru: pindah ke detail, notifikasi sukses tampil, HQ tercipta.
2. Ubah informasi, tambah cabang, lalu Simpan & tambah lagi: form tetap terbuka, nama/alamat kosong, fokus kembali. HQ tidak menawarkan hapus; tipe HQ terkunci.
3. Tambah PIC baru atau hubungkan master; edit PIC yang dipakai beberapa perusahaan menampilkan catatan. Lepas/hapus PIC yang dipakai pendaftaran aktif ditolak.
4. Tambah peserta dengan default HQ atau cabang lain. Nama sama setelah normalisasi ditolak dengan tautan. Hubungkan master tanpa perusahaan; peserta langsung muncul pada perusahaan dan cabang yang dipilih.
5. Ubah peserta inline; hapus peserta yang punya pendaftaran aktif ditolak. Detail peserta menuju route yang sudah ada.
6. Uji pencarian/filter URL, kembali browser, cabang lebih dari lima, peserta lebih dari sepuluh, tampilan desktop dan dark mode.
- Berhenti setelah commit R3 sesuai cakupan pengguna. R4 dikerjakan pada commit terpisah.

### R4 — Peserta
- Daftar memakai pencarian nama, filter perusahaan (`SearchableSelect`, pencarian server maksimal 10), filter "Tanpa perusahaan", paginasi server, `RowActions` (Detail ke `/master/peserta/[id]`, Ubah inline, Hapus dengan `InlineConfirm`).
- Panel tambah inline: nama, perusahaan opsional lewat `SearchableSelect`, cabang bergantung perusahaan dengan default HQ; tombol "Simpan" dan "Simpan & tambah lagi" (fokus kembali ke nama).
- Detail `/master/peserta/[id]`: header dengan tombol kembali dan Ubah, kartu informasi dapat diubah inline, kartu riwayat kegiatan memakai label tingkatan yang menyembunyikan kelas internal "Umum".
- Pencarian/filter tersimpan di URL (`search`, `perusahaan`, `filter=tanpaPerusahaan`, `page`); notifikasi memakai `FlashAlert`, konfirmasi hapus `InlineConfirm`.
- `PesertaFormModal` dan kolom "data terhapus" lama dihapus dari modul Peserta; modal dipindah ke folder pendaftaran (A-36).
- Validasi: `npm run lint`, `npx tsc --noEmit --incremental false`, dan `npm run build` lulus. Gerbang pola antarmuka folder `src/components/main/peserta` dan `src/app/(dashboard)` kosong untuk pencarian `AlertModal|ConfirmDialog|AlertDialog`, `useModal|ui/modal|FormModal`, dan `<svg`; tidak ada `window.location.reload`.
- Batas validasi: uji browser dengan data nyata belum dijalankan (belum tersedia sesi login pada sesi kerja ini).

### Langkah uji manual R4
1. Buka `/master/peserta`. Daftar menampilkan kolom Nama, Perusahaan (tanpa perusahaan tampil "-"), Cabang, dan tiga ikon aksi.
2. Cari nama peserta; pilih filter perusahaan lewat dropdown (ketik untuk menyaring); pilih "Tanpa perusahaan" untuk melihat peserta mandiri. Kedua filter saling mengganti; parameter URL berubah dan paginasi kembali ke halaman 1.
3. Klik "Tambah Peserta": panel inline terbuka, fokus di nama. Isi nama lalu Enter → tersimpan tanpa pindah halaman.
4. Pada panel tambah, pilih perusahaan: dropdown cabang muncul dengan default HQ. "Simpan & tambah lagi" mengosongkan nama dan mengembalikan fokus.
5. Klik Ubah pada satu baris: baris berubah menjadi form; ubah nama/perusahaan/cabang lalu Simpan → kembali ke tampilan baris dengan notifikasi.
6. Klik Hapus: `InlineConfirm` muncul di baris itu; peserta dengan pendaftaran aktif ditolak dengan pesan; peserta tanpa pendaftaran aktif terhapus dan notifikasi hijau.
7. Buka Detail dari daftar: kartu informasi dan riwayat tampil. Klik Ubah, ganti data, simpan. Riwayat menampilkan pelatihan (tanpa "Umum"), tanggal, dan status.
8. Uji tampilan gelap/terang, layar sempit, dan navigasi keyboard pada form inline.
