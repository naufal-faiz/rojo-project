# PROGRESS

Dokumen ini dirawat per fase. Format mengikuti `PRD.md` bagian 12.

## Status fase

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
| Jalur M Migrasi Excel | Belum | - |
| Penutup | Belum | - |

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

## Deviasi dari PRD

- **D-01** (sudah ada di PRD 9.2) Detail perusahaan berupa baris expand inline, bukan route, dan belum menampilkan peserta. Diselesaikan di fase Penutup (utang teknis #5).
- **D-02** PRD 9.4 menyebut tiga cara menambah peserta, termasuk "tambah peserta baru cepat memakai `PesertaFormModal`". Karena `PesertaFormModal` tidak mengembalikan id peserta, ditambahkan prop opsional `onCreated` (backward-compatible) agar peserta baru langsung didaftarkan.

## Utang teknis baru

- Tidak ada. Utang teknis lama tetap mengacu ke `PRD.md` bagian 11. `PelaksanaanList.tsx` masih di atas ±150 baris (utang #1, dikerjakan di fase Penutup).

## Sengaja tidak dikerjakan

- F7 Dashboard/Riwayat/Invoice, Jalur M, dan fase Penutup.
- Kuota peserta: PRD 9.4 menyatakan tidak ada konsep kuota.

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
