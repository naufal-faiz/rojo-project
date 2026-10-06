# PRD — Rojo Safety Admin

> Sumber kebenaran untuk **APA** yang dibangun. Aturan teknis (**BAGAIMANA**) ada di `AGENTS.md`. Skema data ada di `prisma/schema.prisma`.

| | |
|---|---|
| Status | Draft v0.3 — revisi antarmuka dan aturan backend (mode otonom) |
| Diperbarui | 2026-10-06 (setelah F0-F7 + Penutup selesai di branch `new`) |
| Pemilik | Naufal |
| Sumber kebutuhan | Excel `MASTER DATA PEMBINAAN 2025` (sheet KEMNAKER, BNSP, LAIN-LAIN, EBILLING PEMBINAAN KEMNAKER), wawancara admin Rojo Safety, dan review pemilik atas hasil v0.2 |

## 0. Mode kerja agent (otonom)

Agent mengerjakan **seluruh fase revisi di bagian 9 berurutan sampai selesai, tanpa meminta konfirmasi per langkah**. Pemilik mereview setelah semuanya selesai, mencatat revisi, lalu menyusun PRD berikutnya.

1. **Urutan:** R0, R1, R2, R3, R4, R5, R6, R7, R8. Satu commit per fase (`R<n> selesai: ...`). Jangan lompat fase.
2. **Jangan bertanya untuk keputusan biasa.** Pilih opsi paling konservatif yang konsisten dengan PRD dan pola yang sudah ada, lalu catat di `PROGRESS.md` (Asumsi `A-28` dan seterusnya).
3. **Berhenti dan tanya hanya untuk:** (a) perubahan `prisma/schema.prisma` (revisi ini **tidak memerlukannya**), (b) perintah destruktif ke database (`migrate reset`, `db push`, `DROP`/`TRUNCATE`), (c) menambah dependency, (d) fitur di luar scope (bagian 7), (e) risiko keamanan atau kebocoran data.
4. **Gerbang kualitas tiap fase** sebelum commit: `npm run lint`, `npx tsc --noEmit`, `npm run build` bersih, ditambah **gerbang pola antarmuka** (`AGENTS.md` bagian 10: pencarian `grep` yang harus kosong).
5. **`PROGRESS.md` terus dirawat.** Tambahkan bagian baru **"Checklist revisi"** (bagian 8.1 dan 12): setiap ID revisi (`U-xx`, `B-xx`, `X-xx`) diberi status Selesai, Sebagian, atau Tidak dikerjakan beserta alasannya.
6. Item **[DEFAULT SEMENTARA]** boleh diimplementasikan seperti tertulis. Itu keputusan sementara yang akan direview pemilik.
7. **Jangan mengedit** `PRD.md`, `AGENTS.md`, dan `prisma/schema.prisma`. Jika menemukan kesalahan di PRD, catat di `PROGRESS.md` (Deviasi) dan teruskan dengan asumsi yang masuk akal.
8. **Perilaku yang sudah benar tidak boleh berubah** saat migrasi tampilan: aturan soft delete, blokir turunan aktif, validasi di server, dan hasil query. Ubah tampilan dan alurnya, bukan aturan datanya (kecuali yang tertulis di bagian 5.13).
9. Kode yang tidak lagi dipakai setelah migrasi (komponen modal, `AlertModal`, dan sejenisnya) **dihapus di fase R8** setelah dipastikan tidak ada pengimpornya.

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
| G1 | Satu sumber data terstruktur menggantikan Excel untuk alur inti (permohonan, pendaftaran, hasil/sertifikat) mulai 2027. |
| G2 | Satu No. Permohonan = satu Pelaksanaan, dengan banyak peserta di dalamnya. |
| G3 | Hasil peserta tercatat sebagai status terstruktur, bukan teks di kolom sembarang. |
| G4 | Setiap kegiatan mencatat **PIC penerima sertifikat per perusahaan**, termasuk kegiatan PUBLIK dengan banyak perusahaan dan peserta mandiri. |
| G5 | Perusahaan dan peserta adalah data master yang dipilih, bukan diketik ulang. |
| G6 | Data tidak hilang permanen karena salah klik (soft delete, tanpa data yatim). |
| G7 | **Input di sistem tidak boleh terasa lebih lambat daripada Excel.** Sedikit halaman, sedikit klik, tanpa pop-up yang memutus konteks (lihat 5.0). |
| G8 | Data peserta satu perusahaan tidak bocor ke pendaftaran perusahaan lain. |

Data sebelum 2027 tetap di Excel sebagai arsip. **Tidak ada import dan tidak ada skrip migrasi.**

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
- US-05 Sebagai admin, saya melihat halaman detail perusahaan berisi informasi, cabang, PIC, dan peserta, dan menambah atau mengubahnya langsung di halaman itu.

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
- US-13 Sebagai admin, saya menambah peserta ke pendaftaran perusahaan dengan memilih dari master (hanya peserta perusahaan itu dan peserta tanpa perusahaan) atau mengetik peserta baru dengan cepat, dan peserta otomatis tercatat sebagai peserta perusahaan tersebut.
- US-14 Sebagai admin, saya mendaftarkan peserta mandiri langsung ke permohonan tanpa perusahaan, termasuk peserta yang sudah tercatat di sebuah perusahaan tetapi mendaftar sendiri.
- US-15 Sebagai admin, saya dicegah mendaftarkan peserta yang sama dua kali ke satu permohonan, dan otomatis dipulihkan bila pendaftarannya pernah dihapus.

**Sertifikat / hasil**
- US-16 Sebagai admin, saya mengisi hasil peserta (lulus, gagal, remedial, ikut batch selanjutnya, takeout, cancel).
- US-17 Sebagai admin, saya mengisi No. Registrasi, No. Sertifikat, Masa Berlaku, No. SKP (khusus Kemnaker), dan tanggal terima sertifikat.

**Data aman**
- US-18 Sebagai admin, saya menghapus data dengan soft delete. Antarmuka pemulihan data terhapus ditunda (bagian 7), tetapi pendaftaran ulang atas data yang pernah dihapus otomatis memulihkannya.
- US-19 Sebagai admin, saya dicegah menghapus data yang masih punya turunan aktif, dengan pesan yang jelas.

**Daftar data**
- US-20 Sebagai admin, setiap halaman daftar punya pencarian dan paginasi.
- US-21 Sebagai admin, saya membuat permohonan di satu halaman penuh, termasuk semua tanggal sesinya, tanpa membuka detail terlebih dahulu.
- US-22 Sebagai admin, saya mengubah status kelulusan peserta langsung dari halaman detail permohonan.
- US-23 Sebagai admin, saya membuat permohonan untuk training yang tidak punya tingkatan (mis. Petugas P3K) tanpa menambah tingkatan lebih dulu.
- US-24 Sebagai admin, saya hanya melihat kegiatan yang relevan (akan datang, berjalan, atau baru selesai) di menu Kegiatan, sedangkan yang lama ada di Riwayat Kegiatan.

## 5. Functional Requirements

### 5.0 Prinsip Antarmuka (berlaku untuk semua halaman)

| ID | Prinsip |
|---|---|
| P-01 | **Tidak ada modal** untuk form maupun notifikasi. Dialog (`ui/modal`, `useModal`, `AlertModal`, `ConfirmDialog`, `*FormModal`) tidak dipakai di fitur mana pun. |
| P-02 | **Tiga pola menggantikan modal.** (a) **Halaman penuh** untuk membuat dan mengubah entitas kompleks (Permohonan). (b) **Halaman detail** untuk entitas yang punya anak (Perusahaan, Peserta, Permohonan, Pendaftaran). (c) **Panel inline**: form yang terbuka di tempat (di atas tabel, atau mengubah baris menjadi form) untuk entitas sederhana dan data anak. |
| P-03 | **Notifikasi hanya lewat `ui/alert/Alert`**, dibungkus `FlashAlert` + `useFlash` (5.1). Muncul di atas panel terkait, sukses hilang sendiri (5 detik), galat dan peringatan bertahan sampai ditutup. |
| P-04 | **Konfirmasi hapus inline** lewat `InlineConfirm`: tombol Hapus mengubah baris atau kartu menjadi bar konfirmasi (varian warning) dengan tombol "Batal" dan "Ya, Hapus". Satu konfirmasi terbuka per halaman. |
| P-05 | **Aksi baris standar** lewat `RowActions` (ikon + tooltip): Detail (`EyeIcon`) menuju halaman detail, Ubah (`PencilIcon`) membuka edit inline, Hapus (`TrashBinIcon`) membuka `InlineConfirm`. Tombol utama memakai `startIcon`: Tambah `PlusIcon`, Simpan `CheckLineIcon`, Batal `CloseLineIcon`, Kembali `ChevronLeftIcon`. Hanya ikon dari `@/icons/index`. |
| P-06 | **Dropdown data banyak memakai `SearchableSelect`**: pencarian di server, maksimal 10 hasil, kotak input tidak pernah di-unmount saat memuat, tinggi daftar stabil. Wajib untuk perusahaan, peserta, PIC, permohonan, training. `Select` biasa hanya untuk enum dan daftar kecil yang pasti. |
| P-07 | **Kecepatan input.** Setelah menyimpan, pengguna tetap di halaman dan fokus kembali ke field pertama. Panel tambah punya "Simpan" dan "Simpan & tambah lagi" (peserta, cabang, PIC, sesi). `Enter` menyimpan. Aksi non-destruktif tidak meminta konfirmasi. Tidak ada reload penuh halaman. |
| P-08 | **Setiap tabel punya pencarian** dan filter sesuai 5.12. Filter disimpan di URL (`searchParams`). Paginasi di server. |
| P-09 | **Tata letak detail:** grid di layar `lg` ke atas, menumpuk di bawahnya. Setiap halaman detail memakai `PageHeader` dengan tombol kembali. Ukuran grid ditentukan per halaman di bawah. |
| P-10 | Teks UI Bahasa Indonesia. Setiap kelas warna punya varian `dark:`. |

**Anggaran interaksi** (patokan uji manual): menambah satu peserta ke perusahaan = ketik nama lalu `Enter`. Membuat permohonan lengkap dengan semua sesinya = satu halaman, satu kali simpan. Mengubah status kelulusan = satu pilihan di dropdown.

### 5.1 Komponen bersama baru (hanya ini yang boleh dibuat, di `main/common/`)

| Komponen | Fungsi dan spesifikasi |
|---|---|
| `FlashAlert` + hook `useFlash` | Pembungkus tunggal `ui/alert/Alert` (jangan mengubah file itu). Menambah tombol tutup (`CloseLineIcon`), auto-hilang untuk `success`, `role="alert"` dan `aria-live`, dan scroll ke tampak saat muncul. Hook mengembalikan `{ flash, showSuccess, showError, showWarning, showInfo, clear }`. Satu `FlashAlert` per halaman atau per panel, bukan per baris. |
| `InlineConfirm` | Bar konfirmasi memakai `ui/alert/Alert` varian `warning` + tombol `Button` (Batal, Ya Hapus) dengan `isLoading`. Props: `message`, `confirmLabel`, `onConfirm`, `onCancel`, `loading`. |
| `RowActions` | Kumpulan tombol ikon (Detail, Ubah, Hapus, dan aksi lain bila perlu) dengan `title` dan `aria-label`. Props opsional per aksi (`onDetail` atau `detailHref`, `onEdit`, `onDelete`), aksi yang tidak diberi tidak ditampilkan. |
| `SearchableSelect` | Mode `single` dan `multi`. Memanggil fungsi pencarian (server action) dengan debounce 300 ms, mengembalikan paling banyak 10 hasil, menampilkan "Menampilkan 10 teratas, ketik untuk mempersempit" bila ada kemungkinan lebih. Input tetap terpasang saat memuat, daftar memakai tinggi minimum tetap dan indikator "Mencari..." tidak mengubah tinggi. Navigasi keyboard (panah, `Enter`, `Esc`). Props: `search`, `value`, `onChange`, `placeholder`, `disabled`, `renderOption` opsional. |
| `FilterBar` | Diekstrak dari filter bar Sertifikat dan Riwayat Kegiatan yang sudah ada, dipakai semua daftar. Membaca dan menulis `searchParams`. |
| `PageHeader` (ubah) | Tambahkan prop opsional `backHref` dan `badges`. Backward-compatible. |

### 5.2 Auth (FR-AUTH)
Tetap seperti sebelumnya: login lewat Supabase Auth, semua route `(dashboard)` wajib sesi, logout di header.

### 5.3 Training dan Tingkatan (`/master/training`)

- Daftar `DataTable` dengan pencarian nama dan filter "Semua, Punya tingkatan, Tanpa tingkatan".
- **Tambah Training:** panel inline di atas tabel (nama, dan tingkatan awal opsional). Menyimpan tidak berpindah halaman.
- **Ubah nama:** inline di baris. **Tingkatan:** baris training bisa di-expand, di dalamnya daftar tingkatan dengan tambah, ubah, dan hapus inline (menggantikan `TingkatanManager` berbasis modal).
- Hapus lewat `InlineConfirm`. Aturan blokir tetap (Training diblokir bila punya Tingkatan aktif, Tingkatan diblokir bila dipakai Permohonan aktif).
- Training tanpa tingkatan ditandai badge "Tanpa tingkatan". Lihat B-03 di 5.13.

### 5.4 Perusahaan (`/master/perusahaan` dan `/master/perusahaan/[id]`)

**Daftar**
- Kolom: nama, jumlah cabang, jumlah PIC, jumlah peserta aktif, `RowActions` (Detail, Hapus).
- Pencarian nama. Filter: "Semua, Tanpa PIC, Tanpa peserta".
- **Tambah Perusahaan:** panel inline di atas tabel (nama, alamat legal opsional). Cabang HQ dibuat otomatis. Peringatan "nama mirip" tampil sebagai `FlashAlert` warning berisi tautan ke perusahaan yang mirip. Setelah tersimpan, **arahkan ke halaman detail** perusahaan baru dengan pesan sukses.
- Baris expand lama dihapus. Detail kini berupa route.

**Detail `/master/perusahaan/[id]`**
- `PageHeader`: tombol kembali, nama, badge (jumlah cabang, PIC, peserta), aksi Ubah (mengaktifkan edit inline kartu Informasi) dan Hapus (`InlineConfirm`).
- **Baris 1, grid 60:40** (`lg:grid-cols-5`, kolom 3 dan 2):
  - Kiri, kartu **Informasi Perusahaan:** nama, alamat legal, tanggal dibuat, ringkasan angka. Edit inline.
  - Kanan, kartu **Cabang:** daftar (nama, badge tipe, alamat), 5 per halaman dengan paginasi, tambah/ubah/hapus inline. Cabang HQ tidak bisa dihapus dan tipenya tidak bisa diubah.
- **Baris 2, grid 30:70** (`lg:grid-cols-10`, kolom 3 dan 7). Alasannya: daftar PIC pendek dan sempit (nama, telepon, badge, tiga ikon), sedangkan tabel peserta lebar.
  - Kiri, kartu **PIC:** daftar item. Tambah PIC dengan dua cara: buat baru (nama, telepon, tipe) atau hubungkan PIC yang sudah ada lewat `SearchableSelect`. Aksi ikon: Ubah (inline; tampilkan catatan bila PIC terhubung ke perusahaan lain), Lepas dari perusahaan, Hapus PIC. Semua lewat `InlineConfirm`. Aturan blokir tetap (PIC yang dipakai pendaftaran aktif tidak bisa dilepas atau dihapus).
  - Kanan, kartu **Peserta:** tabel (nama, cabang, jumlah kegiatan, `RowActions`: Detail menuju `/master/peserta/[id]`, Ubah inline, Hapus). Pencarian nama, filter cabang (dropdown), paginasi 10. **Tambah** lewat panel inline dengan dua mode:
    1. *Peserta baru:* nama dan cabang (default HQ), tombol "Simpan" dan "Simpan & tambah lagi". Peserta langsung tercatat sebagai peserta perusahaan ini.
    2. *Hubungkan dari master:* `SearchableSelect` yang hanya menampilkan peserta **tanpa perusahaan**, lalu pilih cabang. Peserta yang dipilih otomatis menjadi peserta perusahaan ini.
- Peserta baru dengan nama yang sama persis (setelah normalisasi) di perusahaan yang sama ditolak dengan pesan dan tautan ke data yang sudah ada.

### 5.5 Peserta (`/master/peserta` dan `/master/peserta/[id]`)

- Daftar: pencarian nama, filter perusahaan (`SearchableSelect`), filter "Tanpa perusahaan". `RowActions`: Detail, Ubah inline, Hapus.
- **Tambah Peserta:** panel inline (nama, perusahaan opsional lewat `SearchableSelect`, cabang bergantung perusahaan dengan default HQ). Perusahaan kosong tampil "-".
- Detail `/master/peserta/[id]`: kartu informasi (edit inline) dan tabel riwayat kegiatan.
- Hapus tetap diblokir bila punya `PesertaPelaksanaan` aktif.

### 5.6 Permohonan (`/permohonan`, `/permohonan/baru`, `/permohonan/[id]`, `/permohonan/[id]/ubah`)

**Daftar `/permohonan`**
- Hanya menampilkan kegiatan **aktif** (aturan 5.11). Tautan "Lihat riwayat" menuju `/master/riwayat-kegiatan`.
- Pencarian (no. permohonan, training, kelas, lokasi). Filter: jenis sertifikasi, jenis kegiatan, penyelenggara, status TemanK3. Kolom status hanya badge read-only.
- Tombol "Buat Permohonan" menuju `/permohonan/baru`. `RowActions`: Detail, Ubah (menuju `/permohonan/[id]/ubah`), Hapus (`InlineConfirm`).

**Buat dan ubah (halaman penuh, satu komponen `PermohonanForm` dipakai bersama)**
- Kartu **Informasi Kegiatan:** training (`SearchableSelect`), tingkatan (dropdown, **disembunyikan dan diganti keterangan "Tanpa tingkatan" bila training tidak punya tingkatan**, lihat B-03), jenis kegiatan, tipe pelaksanaan, lokasi, penyelenggara, jenis sertifikasi, no. permohonan (unik, boleh kosong), catatan.
- Kartu **Jadwal Sesi:** pilih tanggal lalu "Tambah Hari", atau "Tambah Rentang" (dari tanggal, sampai tanggal, opsi "lewati Sabtu dan Minggu"). Hasilnya chip tanggal yang bisa dihapus satu per satu, urut naik, tanpa duplikat. Boleh kosong (muncul petunjuk bahwa jadwal belum diisi).
- Tombol: "Simpan" (menuju detail) dan "Simpan & Kelola Pendaftaran" (menuju `/pendaftaran/[id]`). Status TemanK3 tidak diisi saat membuat.
- 1 No. Permohonan = 1 Pelaksanaan: duplikat ditolak dengan pesan jelas (aturan lama tetap).

**Detail `/permohonan/[id]`**
- `PageHeader`: kembali, judul (training dan kelas), badge (jenis sertifikasi, jenis kegiatan), aksi Ubah, Kelola Pendaftaran, Hapus (`InlineConfirm`).
- **Baris 1, grid 60:40:**
  - Kiri, kartu **Informasi Kegiatan** (semua field, sesi sebagai chip tanggal read-only dan tautan "Ubah jadwal").
  - Kanan, kartu **Status TemanK3 dan Unggah Berkas** (perilaku A-01 sampai A-03 tetap). **Kartu ini tidak dirender sama sekali untuk BNSP dan INTERNAL**, dan kartu Informasi mengisi seluruh lebar.
- **Baris 2:** dua kartu terpisah, **Peserta via Perusahaan** (dikelompokkan per perusahaan dengan PIC, bisa di-expand) dan **Peserta Mandiri** (dengan kolom Perusahaan: nama perusahaan peserta, atau "-" bila tidak ada). Setiap baris peserta memiliki dropdown **Status Kelulusan** (Belum ada hasil, Lulus, Gagal, Remedial, Ikut batch selanjutnya, Takeout, Cancel) yang tersimpan langsung saat dipilih, dengan `FlashAlert`. Hanya status. Field sertifikat lain tetap di `/sertifikat`.
- Panel sesi tambah/hapus terpisah di detail **dihapus** (pindah ke form buat/ubah).

### 5.7 Pendaftaran (`/pendaftaran` dan `/pendaftaran/[pelaksanaanId]`)

- **Daftar `/pendaftaran`:** hanya kegiatan aktif (5.11). Pencarian dan filter jenis sertifikasi dan jenis kegiatan.
- **Halaman kerja:** dua tab, **Pendaftaran Perusahaan** dan **Peserta Mandiri**. Tab "Terhapus" dihapus (bagian 7).
- **Tambah pendaftaran perusahaan:** panel inline. Perusahaan lewat `SearchableSelect` (input stabil saat mengetik, hasil maksimal 10), PIC opsional dari PIC perusahaan itu (dropdown kecil). Unik per (perusahaan, permohonan). Kegiatan INHOUSE maksimal 1 pendaftaran perusahaan. Hapus diblokir selama ada peserta aktif.
- **Tambah peserta ke pendaftaran perusahaan** (panel inline di baris perusahaan), dua mode, **tanpa tempel nama**:
  1. *Pilih dari master:* daftar bercentang dengan pencarian, maksimal 10 per pencarian, hanya berisi **peserta perusahaan itu dan peserta tanpa perusahaan** (lihat B-02). Tidak menampilkan subjudul nama perusahaan. Peserta tanpa perusahaan diberi badge kecil "Belum punya perusahaan". Peserta yang sudah terdaftar di kegiatan ini ditandai dan tidak bisa dipilih.
  2. *Peserta baru:* nama (dan cabang opsional, default HQ), tombol "Simpan" dan "Simpan & tambah lagi".
- **Tambah peserta mandiri:** dua mode yang sama. Daftar master berisi **peserta dari perusahaan mana pun maupun yang tanpa perusahaan** (peserta yang sudah punya perusahaan boleh mendaftar sendiri), dengan nama perusahaan sebagai subjudul (atau "Tanpa perusahaan") agar peserta bernama sama bisa dibedakan. Pendaftaran mandiri **tidak mengubah** perusahaan peserta. Peserta baru dibuat tanpa perusahaan.
- Satu peserta hanya sekali per Permohonan. Jika sudah aktif, tolak dan sebutkan di mana ia terdaftar. Jika pernah dihapus, otomatis dipulihkan (5.10).
- Hapus peserta dari pendaftaran lewat `InlineConfirm` (peringatan tambahan bila `noSertifikat` terisi).
- Semua operasi multi-baris dalam satu `prisma.$transaction`. Tidak ada konsep kuota.

### 5.8 Sertifikat (`/sertifikat`)

- Daftar, filter, dan ubah status massal tetap seperti sebelumnya. **Tidak** terkena aturan "aktif" (5.11), karena sertifikat biasanya diterima lama setelah kegiatan.
- Form ubah dipindah dari modal ke **panel inline** yang terbuka di bawah baris (`SertifikatFormModal` menjadi `SertifikatForm`). Perilaku field tetap: semua opsional, `noSkp` hanya KEMNAKER, INTERNAL menyembunyikan field resmi, peringatan No. Sertifikat ganda sebagai `FlashAlert` warning.
- `status` kosong berarti belum ada hasil. Jangan pernah mengisi `GAGAL` otomatis. Pengiriman sertifikat tidak dikerjakan.

### 5.9 Dashboard, Riwayat Kegiatan, Invoice

- Dashboard dan Riwayat Kegiatan tetap. Riwayat Kegiatan menjadi tempat semua kegiatan lama (5.11), dengan pencarian dan filter yang ada, dan setiap baris menuju detail permohonan (tempat status TemanK3 dan status kelulusan masih bisa diubah).
- Invoice tetap placeholder.

### 5.10 Soft delete (FR-SOFTDELETE)

- Aturan lama tetap: hapus = isi `deletedAt`, semua query dan include memakai `deletedAt: null`, hapus diblokir selama ada turunan aktif, restore hanya bila parent aktif, cek dan hapus dalam satu transaksi, tolak membuat data di bawah parent yang terhapus.
- **Antarmuka "Data Terhapus" dihapus sekarang** (`DeletedTrainingList`, `DeletedPerusahaanList`, `PendaftaranTerhapusPanel`, dan tab terkait). Fungsi server `restore*` **dipertahankan** untuk halaman terpisah di masa depan.
- **Pemulihan otomatis saat bentrok unique:** menambahkan peserta ke pelaksanaan yang pernah dihapus (`@@unique([pesertaId, pelaksanaanId])`) atau menambah pendaftaran perusahaan yang pernah dihapus (`@@unique([perusahaanId, pelaksanaanId])`) memulihkan baris lama (`deletedAt = null`) beserta data sebelumnya, memperbarui hanya `pendaftaranPerusahaanId` dan `picId` sesuai input baru, dan menyebutkan "dipulihkan" di `FlashAlert`. **[DEFAULT SEMENTARA]**
- Tabel blokir turunan:

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
| PesertaPelaksanaan | tidak ada (peringatan jika `noSertifikat` terisi) |

### 5.11 Aturan "kegiatan aktif" (daftar Permohonan dan Pendaftaran)

Sebuah Permohonan **aktif** bila: tidak punya sesi aktif, **atau** tanggal sesi terakhirnya `>= hari ini (WIB) dikurangi 7 hari`. Ini mencakup kegiatan yang belum dimulai, sedang berjalan, dan baru selesai kurang dari seminggu. Kegiatan yang sesi terakhirnya lebih dari 7 hari lalu hanya tampil di Riwayat Kegiatan. Satu fungsi bersama `whereKegiatanAktif()` di lapisan get dipakai kedua daftar.

### 5.12 Pencarian dan filter per tabel

| Tabel | Pencarian | Filter |
|---|---|---|
| Training | nama | punya/tanpa tingkatan |
| Perusahaan | nama | tanpa PIC, tanpa peserta |
| Peserta (master) | nama | perusahaan (`SearchableSelect`), tanpa perusahaan |
| Peserta di detail perusahaan | nama | cabang |
| Cabang di detail perusahaan | nama (tampil bila lebih dari 5) | tipe |
| Permohonan | no. permohonan, training, kelas, lokasi | jenis sertifikasi, jenis kegiatan, penyelenggara, status TemanK3 |
| Pendaftaran (daftar) | no. permohonan, training, kelas | jenis sertifikasi, jenis kegiatan |
| Pendaftaran perusahaan di halaman kerja | nama perusahaan | - |
| Sertifikat | nama peserta, perusahaan, no. sertifikat | kegiatan, jenis sertifikasi, status hasil |
| Riwayat Kegiatan | no. permohonan, training | tahun, penyelenggara, jenis sertifikasi, jenis kegiatan |

### 5.13 Aturan backend baru

| ID | Aturan |
|---|---|
| B-01 | **Tambah peserta ke pendaftaran perusahaan otomatis menjadikannya peserta perusahaan itu.** Peserta baru dibuat dengan `perusahaanCabangId` = cabang yang dipilih (default HQ perusahaan). Peserta master yang belum punya perusahaan di-set ke cabang itu dalam transaksi yang sama. Pesan sukses menyebutkan berapa peserta yang kini tercatat di perusahaan tersebut. |
| B-02 | **Tidak ada kebocoran data antar perusahaan.** Pencarian "Pilih dari master" pada pendaftaran perusahaan X hanya mengembalikan peserta dengan `cabang.perusahaanId = X` atau tanpa perusahaan. Server **menolak** (bukan sekadar memperingatkan) peserta yang sudah punya perusahaan lain saat ditambahkan ke pendaftaran perusahaan X, dengan pesan tanpa menyebut nama perusahaan lain. Peserta tanpa perusahaan diterima dan diatur sesuai B-01. **Pendaftaran mandiri tidak dibatasi perusahaan:** peserta dari perusahaan mana pun boleh didaftarkan mandiri, tanpa mengubah perusahaannya dan tanpa auto-assign. Peringatan "perusahaan berbeda" yang lama dihapus karena kasusnya kini ditolak. |
| B-03 | **Training tanpa tingkatan.** Server menyediakan `ensureTingkatanUmum(trainingId)` yang membuat satu Tingkatan berkelas `"Umum"` bila training belum punya tingkatan, dan dipanggil saat membuat atau mengubah permohonan untuk training tanpa tingkatan. Konstanta `KELAS_UMUM = "Umum"` ada di satu file. Fungsi label tampilan menyembunyikan kelas `"Umum"` (tampil hanya nama training). Tanpa perubahan skema. |
| B-04 | Semua fungsi pencarian untuk `SearchableSelect` adalah server action dengan `take` maksimal 10, terurut nama, dan ber-scope sesuai B-02. |
| B-05 | Pada `getPelaksanaan` dan `getPendaftaran` tersedia filter `aktif` berdasarkan `whereKegiatanAktif()` (5.11), dengan zona waktu WIB. |

## 6. Non-Functional Requirements

| Area | Kebutuhan |
|---|---|
| Keamanan | Semua akses data lewat server (Prisma). RLS aktif di semua tabel `public` tanpa policy. Tidak ada query data dari client. Tidak ada secret di `NEXT_PUBLIC_*`. Data peserta antar perusahaan tidak boleh bocor (B-02). |
| Integritas | FK `onDelete: Restrict`, unique constraint di skema, operasi multi-tabel dalam transaksi, validasi di server (jangan percaya client). |
| UX | Prinsip 5.0 dan anggaran interaksi. Tidak ada reload penuh. Fokus dan keyboard dijaga. Notifikasi dapat dibaca pembaca layar (`aria-live`). |
| Performa | Index di kolom FK, paginasi di server, hasil dropdown maksimal 10, hindari N+1, `cache()` untuk fungsi get. |
| Maintainability | Gaya kode `AGENTS.md`. File baru maksimal sekitar 150 baris, dipecah bila lebih. Komponen dipakai ulang. |
| Lokalisasi | UI Bahasa Indonesia. Zona waktu WIB. Tanggal disimpan sebagai tipe tanggal. |
| Tampilan | Responsif dan mendukung dark mode. |
| Audit | `createdAt`, `updatedAt`, `deletedAt` di tabel utama. |
| Operasional | Perubahan skema lewat `prisma migrate`. Revisi ini tidak mengubah skema. |

## 7. Scope

### Dalam scope (revisi ini)
Migrasi seluruh form dan notifikasi dari modal ke halaman, panel inline, dan `FlashAlert`. Halaman detail perusahaan. Halaman buat dan ubah permohonan. Aturan backend 5.13. Pencarian dan filter di semua tabel. Penghapusan UI data terhapus dan pembersihan jalur import.

### Di luar scope (ditunda, jangan dikerjakan)
- **Import data Excel dan skrip migrasi.** Data sebelum 2027 tetap di Excel sebagai arsip. Seluruh kode `scripts/import/` dihapus (R0).
- Halaman **Data Terhapus** (daftar dan pemulihan) dan entri `navigationData`-nya. Ditunda sampai review berikutnya.
- **Ekspor Excel** dan halaman Kamus Data. Tidak dikerjakan: Excel dibekukan sebagai arsip (keputusan final, bagian 8).
- **Invoice** dan **Pengiriman**. Halaman `/invoice` hanya placeholder.
- **Log riwayat TemanK3**, analisis sheet LAIN-LAIN dan EBILLING.
- Integrasi otomatis TemanK3 atau BNSP, role dan permission granular, notifikasi email, portal peserta atau perusahaan, website publik.

## 8. Keputusan yang sudah final

| Keputusan | Detail |
|---|---|
| ID | UUID native Postgres |
| 1 permohonan | 1 Pelaksanaan |
| Nama perusahaan | Variasi kecil digabung jadi satu master (dipilih lewat pencarian, bukan diketik ulang) |
| Divisi | Tidak dimodelkan |
| Penyelenggara | Enum: `WINA_KARYA_MULIA`, `DELTA_INDONESIA`, `LIMA_PRIMA_SOLUSINDO`, `ARTA_KARYA_AREFAA`, `LIK`, `ITC` |
| Peserta tanpa perusahaan | Boleh, tampil "-" |
| Mandiri | `pendaftaranPerusahaanId` kosong, tanpa boolean |
| BNSP dan Kemnaker | Satu alur, beda di `noSkp` dan kartu status TemanK3 (hanya KEMNAKER) |
| Status TemanK3 | Nullable, enum `SUDAH_UPLOAD`, `FU_LPS`, `CANCEL`. KEMNAKER + null = "Belum Upload", selain itu "-". |
| PIC pendaftaran | Opsional |
| Soft delete | Menyeluruh. Hapus diblokir bila ada turunan aktif. Bentrok unique diselesaikan dengan pemulihan otomatis. |
| Import Excel | **Tidak ada.** Data lama tetap di Excel. |
| Form dan notifikasi | **Tanpa modal.** Halaman penuh, detail, dan panel inline. Notifikasi lewat `ui/alert/Alert`. |
| Invoice, Pengiriman, Log TemanK3, Data Terhapus (UI) | Ditunda |
| Excel setelah 2027 | Dibekukan sebagai arsip. Tidak ada ekspor, tidak ada Kamus Data. |
| Kegiatan aktif | Aturan 7 hari berlaku untuk daftar Permohonan dan Pendaftaran, **tidak** untuk Sertifikat. |
| Peserta berperusahaan | Boleh mendaftar mandiri. Tidak boleh didaftarkan oleh perusahaan lain. Peserta tanpa perusahaan yang didaftarkan perusahaan otomatis menjadi peserta perusahaan itu. |

### 8.1 Peta revisi (checklist untuk `PROGRESS.md`)

| ID | Ringkasan revisi dari pemilik | Fase |
|---|---|---|
| U-01 | List perusahaan menjadi detail yang memuat PIC dan peserta | R3 |
| U-02 | Tambah peserta dan PIC inline lewat detail | R3 |
| U-03 | Layout detail perusahaan: baris 1 informasi:cabang 60:40, baris 2 PIC:peserta 30:70, ada header | R3 |
| U-04 | Cabang, PIC, peserta ditambah inline dan peserta tercatat milik perusahaan itu | R3 |
| U-05 | Aksi Ubah inline, Detail redirect, Hapus dengan konfirmasi dan alert inline (`ui/alert`) | R0, R2-R7 |
| U-06 | Tombol aksi memakai ikon dari `icons/index` | R0, R2-R7 |
| U-07 | Pisahkan data terhapus; hapus UI sekarang | R0 |
| U-08 | Pencarian atau filter di setiap tabel | R2-R7 |
| U-09 | Dropdown data banyak: batas tampil dan pencarian | R0, R3-R6 |
| U-10 | Buat permohonan di halaman sendiri, sesi ditambah di form | R5 |
| U-11 | Detail permohonan bergrid, status TemanK3 disembunyikan untuk BNSP | R5 |
| U-12 | Modal pendaftaran perusahaan "refresh" saat mulai mengetik | R0, R6 |
| U-13 | Hapus subjudul perusahaan di pemilihan peserta via perusahaan | R6 |
| U-14 | Detail perusahaan: peserta bisa dipilih lewat dropdown | R3 |
| U-15 | Detail permohonan: ubah status kelulusan peserta | R5 |
| U-16 | Daftar kegiatan hanya yang belum mulai, tanpa sesi, atau selesai kurang dari seminggu | R5, R6 |
| U-17 | Hapus tempel nama | R6 |
| B-01 | Tambah peserta via pendaftaran perusahaan otomatis menjadi peserta perusahaan | R1 |
| B-02 | Pilih dari master hanya peserta perusahaan itu dan tanpa perusahaan | R1 |
| B-03 | Training tanpa tingkatan bisa dibuatkan permohonan | R1, R5 |
| X-01 | Seluruh `AlertModal` dan `ConfirmDialog` diganti `FlashAlert` dan `InlineConfirm` | R2-R7 |
| X-02 | Hapus `scripts/import/`, skrip `import:excel`, dependency `exceljs` dan `tsx` | R0 |
| X-03 | Pemulihan otomatis saat bentrok unique | R1 |

## 9. Status dan Fase Revisi

### 9.1 Status aktual (branch `new`)

F0 sampai F7, Jalur M, dan Penutup dari PRD v0.2 sudah selesai. Fase di bawah mengubah **tampilan, alur, dan sebagian aturan backend**, bukan memulai dari nol. Halaman yang sudah ada (`/`, `/permohonan`, `/pendaftaran`, `/sertifikat`, `/invoice`, `/master/*`) harus tetap bisa dibuka di setiap akhir fase.

| Fase | Isi | Status |
|---|---|---|
| **R0** | Komponen bersama baru, pembersihan (import, UI data terhapus) | **Berikutnya** |
| R1 | Aturan backend B-01 sampai B-05, pemulihan otomatis | Belum |
| R2 | Training dan Tingkatan tanpa modal | Belum |
| R3 | Perusahaan: daftar, detail route, cabang, PIC, peserta inline | Belum |
| R4 | Peserta: daftar, panel inline, detail | Belum |
| R5 | Permohonan: halaman buat/ubah, detail bergrid, status kelulusan | Belum |
| R6 | Pendaftaran tanpa modal | Belum |
| R7 | Sertifikat inline, Riwayat Kegiatan, Dashboard (alert dan filter) | Belum |
| R8 | Penutup: hapus kode mati, gerbang pola antarmuka, PROGRESS final | Belum |

### 9.2 Aturan umum semua fase

- Setiap modul yang dimigrasi memakai pola `AGENTS.md` bagian 4.2 (versi baru): daftar `DataTable` + panel inline, halaman detail, komponen bersama bagian 5.1. Dilarang membuat komponen generik di luar daftar 5.1.
- **Migrasi per modul tuntas:** semua `AlertModal`, `ConfirmDialog`, `useModal`, dan `*FormModal` di modul itu diganti dalam fase yang sama. Jangan meninggalkan modul setengah modal.
- Perilaku data tidak berubah kecuali B-01 sampai B-05.
- Setiap fase menambahkan **Langkah uji manual** di `PROGRESS.md`.

### 9.3 R0 Fondasi dan pembersihan

1. Buat komponen bagian 5.1 (`FlashAlert` + `useFlash`, `InlineConfirm`, `RowActions`, `SearchableSelect`, `FilterBar`) dan ubah `PageHeader`. `SearchableSelect` harus mengatasi masalah **U-12**: pada modal pendaftaran lama, kotak hasil bergantian antara satu baris "Mencari..." dan daftar penuh di setiap ketikan (debounce 300 ms), sehingga tinggi berubah dan tampilan melompat. Perbaikannya ada di komponen baru (tinggi tetap, input tidak di-unmount).
2. **Hapus jalur import (X-02):** direktori `scripts/import/`, skrip `import:excel` di `package.json`, dependency `exceljs` dan `tsx` (`npm uninstall`). Pertahankan `src/lib/normalisasi.ts` (dipakai untuk pengecekan nama mirip).
3. **Hapus UI data terhapus (U-07):** `DeletedTrainingList`, `DeletedPerusahaanList`, `PendaftaranTerhapusPanel`, dan tab "Terhapus" di halaman yang memakainya. **Pertahankan** fungsi server `restore*` dan getter data terhapus.
4. Jangan menghapus `AlertModal`, `ConfirmDialog`, dan komponen modal lain dulu (masih dipakai sampai modul terkait dimigrasi). Penghapusan di R8.

### 9.4 R1 Backend

Kerjakan B-01 sampai B-05 (5.13) dan pemulihan otomatis (5.10, X-03). Wajib lewat server action yang sudah ada atau baru, semuanya dalam `prisma.$transaction` untuk operasi multi-baris. Buat fungsi pencarian ber-scope untuk `SearchableSelect`: perusahaan, peserta (mode perusahaan X: perusahaan itu dan tanpa perusahaan; mode mandiri: semua peserta dengan perusahaan sebagai subjudul), PIC perusahaan, training, permohonan. Tambahkan `ensureTingkatanUmum` dan `KELAS_UMUM`, serta fungsi label tampilan tingkatan. Belum mengubah halaman, kecuali memanggil fungsi baru bila perlu agar fase berikutnya bisa langsung memakainya.

### 9.5 R2 sampai R7

Kerjakan sesuai bagian 5.3 sampai 5.9, 5.11, dan 5.12 per modul, berurutan: Training (R2), Perusahaan (R3), Peserta (R4), Permohonan (R5), Pendaftaran (R6), Sertifikat dan Riwayat dan Dashboard (R7). Pada R3, kerjakan peserta dan PIC di detail perusahaan sebelum kembali memperbaiki daftar. Pada R5, `PermohonanForm` dipakai untuk buat dan ubah. Pada R6, hapus `PesertaTempelTab`, `PesertaBulkModal`, `PendaftaranFormModal`, `PendaftaranPicModal` setelah diganti panel inline.

### 9.6 R8 Penutup

1. Hapus kode yang tidak lagi dipakai: komponen modal (`main/Modal/*`, `common/AlertDialog`, `common/ConfirmDialog`, `*FormModal`, `PicSelectionModal`, `PesertaBulkModal`, `PesertaTempelTab`), setelah `grep` memastikan tidak ada pengimpor.
2. Jalankan gerbang pola antarmuka (`AGENTS.md` bagian 10) dan pastikan kosong.
3. Cek bahwa semua halaman menu terbuka dan tanpa galat konsol.
4. Finalkan `PROGRESS.md` termasuk Checklist revisi lengkap (bagian 8.1).

### 9.7 Peta navigasi, model, dan fase

Sumber: `src/components/main/Sidebar/navigationData.tsx`. Tidak ada entri baru pada revisi ini (entri "Data Terhapus" ditunda).

| Menu (UI) | Route | Model Prisma | Fase |
|---|---|---|---|
| Pelatihan | `/master/training` | Training, Tingkatan | R2 |
| Perusahaan | `/master/perusahaan`, `/master/perusahaan/[id]` | Perusahaan, Cabang, Pic, PerusahaanPic | R3 |
| Peserta | `/master/peserta`, `/master/peserta/[id]` | Peserta | R4 |
| Permohonan | `/permohonan`, `/permohonan/baru`, `/permohonan/[id]`, `/permohonan/[id]/ubah` | Pelaksanaan, SesiPelaksanaan | R5 |
| Pendaftaran | `/pendaftaran`, `/pendaftaran/[pelaksanaanId]` | PendaftaranPerusahaan, PesertaPelaksanaan | R6 |
| Sertifikat | `/sertifikat` | PesertaPelaksanaan | R7 |
| Riwayat Kegiatan | `/master/riwayat-kegiatan` | Pelaksanaan (read-only) | R7 |
| Invoice | `/invoice` | belum ada | placeholder |

## 10. Keputusan Sementara

Agent memakai default berikut tanpa bertanya. Pemilik mereview dan mengoreksinya.

| # | Pertanyaan | **[DEFAULT SEMENTARA]** |
|---|---|---|
| 1 | Role dan akun Marketing atau atasan | Semua pengguna yang login adalah admin dengan akses penuh. |
| 2 | Isi Riwayat Kegiatan | Daftar read-only kegiatan yang sesi terakhirnya lebih dari 7 hari lalu (bersama yang lain bila filter dilonggarkan), dengan filter yang ada. |
| 3 | PJK3 LPS = PT Lima Prima Solusindo | Ya, satu nilai enum. |
| 4 | Penghapusan permanen otomatis | Tidak diimplementasikan. |
| 5 | Log riwayat revisi TemanK3 | Tidak di fase ini. |
| 6 | Konvensi form | **Tanpa modal** (5.0). Halaman penuh, detail, panel inline. |
| 7 | Nama lengkap LIK dan ITC | Dipakai `LIK` dan `ITC` apa adanya. |
| 8 | REFRESH | Tingkatan terpisah. |
| 9 | INHOUSE banyak perusahaan | Ditolak (maksimal 1 pendaftaran perusahaan). |
| 10 | PIC pada pendaftaran | Opsional. Wajib baru di fase Pengiriman. |
| 11 | Aturan "aktif" untuk `/sertifikat` | **Final (dikonfirmasi pemilik).** Tidak diterapkan di Sertifikat. Hanya Permohonan dan Pendaftaran. |
| 12 | Excel setelah 2027: paralel atau arsip | **Final (dikonfirmasi pemilik): arsip, dibekukan.** Tidak ada ekspor dan tidak ada Kamus Data. |
| 13 | Peserta berperusahaan di pendaftaran | **Final (dikonfirmasi pemilik).** Peserta yang sudah punya perusahaan boleh mendaftar mandiri. Yang dilarang: peserta didaftarkan oleh perusahaan lain. |
| 14 | Item U-03 ("detail peserta") | Ditafsirkan sebagai halaman detail **perusahaan** (isinya informasi, cabang, PIC, peserta). |
| 15 | Item U-14 | Di detail perusahaan, peserta tanpa perusahaan bisa dihubungkan lewat `SearchableSelect`, dan tabel peserta punya filter cabang berupa dropdown. |
| 16 | Peserta kembar dalam satu perusahaan | Nama yang sama persis (setelah normalisasi) ditolak. Dua orang bernama sama dibedakan dengan tambahan keterangan pada nama. |
| 17 | Pemulihan otomatis | Mempertahankan data hasil dan sertifikat lama pada baris yang dipulihkan. |

Pertanyaan yang masih menunggu jawaban pemilik atau user Rojo Safety (jangan menunggu untuk melanjutkan): nama lengkap LIK/ITC dan definisi akhir Riwayat Kegiatan.

## 11. Utang Teknis

Tidak ada utang yang dibawa dari v0.2. Utang baru yang muncul di fase ini dicatat di `PROGRESS.md` (Utang teknis baru) dan diselesaikan di R8 bila kecil. Gerbang ukuran: tidak ada file baru lebih dari sekitar 150 baris (`AGENTS.md` bagian 6).

## 12. Format `PROGRESS.md`

Pertahankan format yang ada, tambahkan **Checklist revisi** di bagian atas:

```
# PROGRESS
## Status fase            (tabel R0-R8: status dan commit)
## Checklist revisi       (tabel: ID dari 8.1, status Selesai/Sebagian/Tidak dikerjakan, catatan)
## Asumsi                 (A-28 dan seterusnya: apa, alasan, dampak jika salah)
## Deviasi dari PRD       (D-04 dan seterusnya)
## Utang teknis baru
## Sengaja tidak dikerjakan
## Ikon yang dibutuhkan tapi tidak tersedia
## Langkah uji manual     (per fase: urutan klik dan hasil yang diharapkan)
```