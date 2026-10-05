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
| F6 Sertifikat | Belum | - |
| F7 Dashboard, Riwayat Kegiatan, Invoice | Belum | - |
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

## Deviasi dari PRD

- **D-01** (sudah ada di PRD 9.2) Detail perusahaan berupa baris expand inline, bukan route, dan belum menampilkan peserta. Diselesaikan di fase Penutup (utang teknis #5).
- **D-02** PRD 9.4 menyebut tiga cara menambah peserta, termasuk "tambah peserta baru cepat memakai `PesertaFormModal`". Karena `PesertaFormModal` tidak mengembalikan id peserta, ditambahkan prop opsional `onCreated` (backward-compatible) agar peserta baru langsung didaftarkan.

## Utang teknis baru

- Tidak ada. Utang teknis lama tetap mengacu ke `PRD.md` bagian 11. `PelaksanaanList.tsx` masih di atas ±150 baris (utang #1, dikerjakan di fase Penutup).

## Sengaja tidak dikerjakan

- F6 Sertifikat, F7 Dashboard/Riwayat/Invoice, Jalur M, dan fase Penutup.
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
