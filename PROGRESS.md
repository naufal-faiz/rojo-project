# PROGRESS

Dokumen ini dirawat per fase. Format mengikuti `PRD.md` bagian 12.

## Status fase

| Fase | Status | Commit |
|---|---|---|
| F0 Fondasi | Selesai | - |
| F1 Master Pelatihan | Selesai | - |
| F2 Master Perusahaan | Selesai (deviasi D-01) | - |
| F3 Master Peserta | Selesai | - |
| F4 Permohonan | Selesai (revisi status TemanK3) | belum di-commit |
| Sinkron DB | Selesai (`sync_status_temank3_nullable`) | belum di-commit |
| F5 Pendaftaran | Berikutnya | - |
| F6 Sertifikat | Belum | - |
| F7 Dashboard, Riwayat Kegiatan, Invoice | Belum | - |
| Jalur M Migrasi Excel | Belum | - |
| Penutup | Belum | - |

## Asumsi

- **A-01** Status TemanK3 dipindahkan dari tabel permohonan ke halaman detail; tabel hanya menampilkan badge read-only. Alasan: status perlu mencatat tanggal unggah, sehingga aksi lebih tepat berada di detail. Dampak jika salah: admin harus membuka detail untuk mengubah status.
- **A-02** Semantik `uploadedAt`: `SUDAH_UPLOAD` mencatat waktu sekarang; `FU_LPS` dan `CANCEL` tidak mengubah tanggal unggah; kembali ke `null` (Belum Upload) mengosongkan tanggal unggah. Alasan: hanya "sudah upload" yang jelas menandai unggahan, sedangkan reset membersihkan data yang salah isi. Dampak jika salah: tanggal unggah mungkin perlu dipertahankan saat reset.
- **A-03** Status TemanK3 hanya berlaku untuk `jenisSertifikasi = KEMNAKER`. Untuk BNSP/INTERNAL panel hanya menampilkan keterangan dan server menolak perubahan. Alasan: PRD FR-PERMOHONAN.
- **A-04** Peta label/warna status disatukan di `main/common/StatusBadge` (utang teknis PRD #2); nilai `BELUM_UPLOAD` dihapus dan file `permohonan/statusTemanK3.ts` dihapus. Alasan: `BELUM_UPLOAD` sudah tidak ada di enum Prisma.

## Deviasi dari PRD

- **D-01** (sudah ada di PRD 9.2) Detail perusahaan berupa baris expand inline, bukan route, dan belum menampilkan peserta. Diselesaikan di fase Penutup (utang teknis #5).

## Utang teknis baru

- Tidak ada. Utang teknis lama tetap mengacu ke `PRD.md` bagian 11. `PelaksanaanList.tsx` masih di atas ±150 baris (utang #1, dikerjakan di fase Penutup).

## Sengaja tidak dikerjakan

- F5 Pendaftaran, F6 Sertifikat, F7 Dashboard/Riwayat/Invoice, Jalur M, dan fase Penutup.

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
