# AGENTS.md: Rojo Safety Admin

Aplikasi admin internal untuk mendata peserta pelatihan K3 dan menyiapkan berkas permohonan. Sistem TIDAK terintegrasi dengan temanK3 dan TIDAK mengelola invoice atau resi.

## Stack
Next.js (App Router) + TypeScript + Tailwind v4 (template TailAdmin) + Prisma + Supabase (Postgres, Auth, Storage). Bahasa UI: Indonesia.

## Alur domain (jangan diubah tanpa persetujuan)
1. Pendaftaran: data peserta + 5 dokumen (KTP, ijazah, pas foto, surat kerja, pakta integritas). Peserta dicari dari master (NIK = kunci identitas).
2. Status pendaftaran: DRAFT -> SIAP -> (DIKEMBALIKAN -> SIAP) -> DIPAKAI. Antrean = pendaftaran berstatus SIAP; bukan tabel terpisah.
3. Permohonan dibuat setelah itu; peserta dipilih dari antrean. Satu pendaftaran hanya untuk satu permohonan. Permohonan batal atau peserta dikeluarkan = kembali ke antrean.
4. Status permohonan yang disimpan hanya AKTIF/DITUNDA/DIBATALKAN. Belum mulai/berjalan/selesai dihitung dari tanggal sesi.
5. Pakta integritas selalu diupload baru per pendaftaran. Dokumen lain boleh dipakai ulang dengan pengingat crosscheck.
6. Perusahaan tanpa UI master: dipilih atau dibuat inline di form peserta; depot/cabang tampil "PT A - Banjar", HQ tidak diberi label.
7. Peran: sementara satu role. Anggi (operator pendaftaran), Aurel (antrean, permohonan, unduh). Buat pengecekan izin dalam satu fungsi agar mudah dipisah nanti.

## Aturan UI
- Pakai komponen template yang ada (Modal, ConfirmDialog, Alert, Button, Badge, DataTable). Jangan membuat gaya baru.
- Semua konfirmasi = modal ConfirmDialog. Hasil aksi = toast Alert di kanan atas, 5 detik (useToast).
- Input kecil (h-9). Form harus muat satu layar laptop, minim scroll. Tabel padat, banyak baris per halaman.
- Gambar dibuka di lightbox modal, PDF di tab baru. Tanggal sesi lewat formatSesi().
- Hindari tampilan generik: tanpa gradien dekoratif, tanpa kartu berlebihan, tanpa animasi masuk.
- Jangan buat svg inline, cukup gunakan file icons seadanya yang sudah disediakan di icons/index

## Aturan file dan keamanan
- Bucket Supabase privat, tanpa policy anon. Akses hanya dari server (service role key tanpa NEXT_PUBLIC_).
- Simpan path saja di database. Path pakai UUID, tanpa NIK/nama. Batas 3 MB; png, jpg, jpeg, pdf.
- Mengganti dokumen: file lama TIDAK boleh dihapus sebelum pengguna mengonfirmasi. Hapus objek bucket hanya setelah konfirmasi.

## Cara kerja agent
- Baca file ini dan prisma/schema.prisma sebelum mengubah apa pun.
- Kerjakan satu fitur per tugas. Jangan refactor di luar lingkup tugas.
- Jika alur ambigu, tanya dulu. Jangan menebak aturan bisnis.
- Jangan ubah skema tanpa menunjukkan diff dan menunggu persetujuan.
- Setelah selesai: jalankan `npm run lint` dan `npx tsc --noEmit`, lalu ringkas apa yang berubah.

## Tambahan keputusan
- Kelas ditambah inline di halaman Pelatihan (tidak ada halaman Kelas terpisah). Di skema tetap model Kelas.
- Riwayat Kegiatan: daftar permohonan selesai/dibatalkan, dengan hasil peserta, nomor dan masa berlaku sertifikat, serta scan sertifikat (disimpan di bucket Supabase, jenis SERTIFIKAT).
- Master peserta bisa ditambah langsung (tanpa pendaftaran). Dokumen tetap diunggah lewat pendaftaran.