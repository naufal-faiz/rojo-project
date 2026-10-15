# Progres Refactor v2

## Fase 0 — Baseline (2026-10-14)

Status awal: tertahan oleh gerbang lint merah bawaan. Pengguna telah mengizinkan
perbaikan prasyarat pada 2026-10-14. Hasil perbaikan dicatat di bagian akhir.
Baseline fungsional dilanjutkan pada 2026-10-14; hasil dan batas cakupan ada di bawah.

- Sumber: branch `v2`, commit `98fa308` (Revisi kebutuhan form).
- Branch kerja: `refactor/v2-structure`, dibuat dari `v2`.
- Tag pembanding: `pre-refactor`, menunjuk commit sumber.
- Dokumen pengguna `REFACTOR_PLAN.md` dan `AGENT_REFACTOR_RULES.md` masih untracked
  ketika baseline diambil, sehingga tidak termasuk isi tag.
- Dibaca sebelum pekerjaan: kedua dokumen di atas, `AGENTS.md`, dan `prisma/schema.prisma`.
- Sebelum/sesudah: belum ada file kode yang dipecah; pengukuran ukuran hasil belum berlaku.

### Gerbang awal

| Pemeriksaan | Hasil |
|---|---|
| `npm run lint` | Gagal: 3 error dan 4 warning bawaan |
| `npx tsc --noEmit` | Lulus (exit 0) |
| `npm run build` | Belum terverifikasi: tidak selesai setelah beberapa menit; percobaan dihentikan |
| `sh scripts/check-size.sh` | Belum tersedia; dijadwalkan pada fase 7 |

Error lint seluruhnya pada `src/components/main/Sidebar/SidebarNavItem.tsx`:
- Baris 9: aturan `react-compiler/react-compiler` tidak ditemukan.
- Baris 35: `react-hooks/preserve-manual-memoization`, dependensi ref tidak cocok.
- Baris 37: `react-hooks/immutability`, mutasi ref yang diterima melalui props.

Warning: impor Link tidak dipakai pada UserDropdown, impor Application pada navigationData,
serta directive eslint-disable tidak terpakai pada SidebarNavItem dan useSidebarSubmenu.
Temuan dicatat, belum diperbaiki dan tidak dicampur dengan refactor.

Build berhenti mengeluarkan output pada `Creating an optimized production build ...`.
Output awal juga memuat peringatan konvensi middleware deprecated. Tidak ada error akhir
yang membuktikan penyebab build tertahan; perlu diulang sebelum baseline dinyatakan lulus.

### Analisis keterjangkauan

Analisis AST TypeScript atas import/export dan pemanggilan literal import()/require(),
dengan resolusi modul dari tsconfig (termasuk alias dan index).
Akar adalah page/layout App Router dan middleware. Pemeriksaan entry framework lain
(route/error/loading/template/not-found/metadata/instrumentation/proxy serta ambient d.ts)
tidak menemukan akar tambahan.

- Total: 142 file TS/TSX di src.
- Terjangkau: 64.
- Kandidat tidak terjangkau: 78.
- Impor relatif tidak terselesaikan: 40, semuanya dari demo form tidak terjangkau.
- Import dinamis nonliteral ditemukan: 0.
- Tidak ada file yang dihapus. Keterjangkauan saja bukan izin penghapusan.
- Supabase tetap dilindungi; Prisma dan lapisan data tidak otomatis dihapus.
  StatusBadge/StatusTemanK3 mengikuti keputusan fase terkait.
- Analisis wajib diulang sebelum setiap kelompok penghapusan.

Akar analisis:
- `src/app/(dashboard)/antrean/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/master/peserta/page.tsx`
- `src/app/(dashboard)/master/riwayat-kegiatan/page.tsx`
- `src/app/(dashboard)/master/training/page.tsx`
- `src/app/(dashboard)/page.tsx`
- `src/app/(dashboard)/pendaftaran/page.tsx`
- `src/app/(dashboard)/permohonan/page.tsx`
- `src/app/auth/layout.tsx`
- `src/app/auth/signin/page.tsx`
- `src/app/layout.tsx`
- `src/middleware.ts`

Daftar kandidat di bawah memakai **baris sumber nonkosong**, termasuk komentar,
bukan ukuran sesudah Prettier dan bukan validasi batas ukuran refactor.

| Kandidat | Baris nonkosong |
|---|---:|
| `src/components/form/CheckboxComponents.tsx` | 36 |
| `src/components/form/DefaultInputs.tsx` | 117 |
| `src/components/form/DropZone.tsx` | 70 |
| `src/components/form/FileInputExample.tsx` | 21 |
| `src/components/form/Form.tsx` | 20 |
| `src/components/form/InputGroup.tsx` | 55 |
| `src/components/form/InputStates.tsx` | 65 |
| `src/components/form/MultiSelect.tsx` | 154 |
| `src/components/form/RadioButtons.tsx` | 41 |
| `src/components/form/SelectInputs.tsx` | 56 |
| `src/components/form/TextAreaInput.tsx` | 40 |
| `src/components/form/ToggleSwitch.tsx` | 41 |
| `src/components/form/date-picker.tsx` | 54 |
| `src/components/form/form-elements/CheckboxComponents.tsx` | 36 |
| `src/components/form/form-elements/DefaultInputs.tsx` | 117 |
| `src/components/form/form-elements/DropZone.tsx` | 70 |
| `src/components/form/form-elements/FileInputExample.tsx` | 21 |
| `src/components/form/form-elements/InputGroup.tsx` | 55 |
| `src/components/form/form-elements/InputStates.tsx` | 65 |
| `src/components/form/form-elements/RadioButtons.tsx` | 41 |
| `src/components/form/form-elements/SelectInputs.tsx` | 56 |
| `src/components/form/form-elements/TextAreaInput.tsx` | 40 |
| `src/components/form/form-elements/ToggleSwitch.tsx` | 41 |
| `src/components/form/group-input/PhoneInput.tsx` | 131 |
| `src/components/form/input/FileInput.tsx` | 15 |
| `src/components/form/input/Radio.tsx` | 62 |
| `src/components/form/input/RadioSm.tsx` | 56 |
| `src/components/form/input/TextArea.tsx` | 57 |
| `src/components/form/switch/Switch.tsx` | 67 |
| `src/components/main/Modal/AlertModal.tsx` | 215 |
| `src/components/main/Modal/DefaultModal.tsx` | 50 |
| `src/components/main/Modal/FormInModal.tsx` | 64 |
| `src/components/main/Modal/FullScreenModal.tsx` | 64 |
| `src/components/main/Modal/ModalBasedAlerts.tsx` | 268 |
| `src/components/main/Modal/VerticallyCenteredModal.tsx` | 44 |
| `src/components/main/common/AlertDialog.tsx` | 80 |
| `src/components/main/common/ComponentCard.tsx` | 36 |
| `src/components/main/common/StatusBadge.tsx` | 47 |
| `src/components/main/permohonan/PelaksanaanFormModal.tsx` | 267 |
| `src/components/main/permohonan/PelaksanaanList.tsx` | 357 |
| `src/components/main/permohonan/SesiManager.tsx` | 123 |
| `src/components/main/permohonan/StatusTemanK3Cell.tsx` | 72 |
| `src/components/main/permohonan/statusTemanK3.ts` | 21 |
| `src/components/main/perusahaan/CabangManager.tsx` | 297 |
| `src/components/main/perusahaan/DeletedPerusahaanList.tsx` | 128 |
| `src/components/main/perusahaan/PerusahaanFormModal.tsx` | 119 |
| `src/components/main/perusahaan/PerusahaanList.tsx` | 249 |
| `src/components/main/perusahaan/PicManager.tsx` | 277 |
| `src/components/main/perusahaan/PicSelectionModal.tsx` | 180 |
| `src/components/main/peserta/PesertaFormModal.tsx` | 160 |
| `src/components/main/peserta/PesertaList.tsx` | 314 |
| `src/components/main/tables/BasicTableOne.tsx` | 221 |
| `src/components/main/training/DeletedTrainingList.tsx` | 181 |
| `src/components/main/training/TingkatanManager.tsx` | 204 |
| `src/components/main/training/TrainingFormModal.tsx` | 98 |
| `src/components/main/training/TrainingList.tsx` | 222 |
| `src/components/ui/Alert.tsx` | 137 |
| `src/components/ui/avatar/Avatar.tsx` | 58 |
| `src/components/ui/avatar/AvatarText.tsx` | 41 |
| `src/components/ui/dropdown/Dropdown.tsx` | 41 |
| `src/components/ui/dropdown/DropdownItem.tsx` | 41 |
| `src/components/ui/images/ResponsiveImage.tsx` | 17 |
| `src/components/ui/images/ThreeColumnImageGrid.tsx` | 35 |
| `src/components/ui/images/TwoColumnImageGrid.tsx` | 26 |
| `src/hooks/useModal.ts` | 9 |
| `src/lib/data/action/exampleAction.ts` | 78 |
| `src/lib/data/action/pelaksanaanAction.ts` | 206 |
| `src/lib/data/action/perusahaanAction.ts` | 352 |
| `src/lib/data/action/pesertaAction.ts` | 93 |
| `src/lib/data/action/trainingAction.ts` | 159 |
| `src/lib/data/get/exampleGet.ts` | 96 |
| `src/lib/data/get/getPelaksanaan.ts` | 124 |
| `src/lib/data/get/getPerusahaan.ts` | 175 |
| `src/lib/data/get/getPeserta.ts` | 113 |
| `src/lib/data/get/getTraining.ts` | 120 |
| `src/lib/prisma.ts` | 11 |
| `src/lib/supabase/client.ts` | 6 |
| `src/lib/supabase/uploadImage.ts` | 26 |

### Checklist manual pembanding awal

Checklist menyeluruh belum dijalankan. Uji regresi khusus perbaikan sidebar dicatat di bagian
akhir. Hasil pengujian sesi sebelumnya tidak dianggap sebagai pengujian baseline baru.

- [ ] Dashboard: jumlah ringkasan.
- [ ] Pendaftaran: cari, paging, tambah baru/dari master, edit, hapus dengan konfirmasi.
- [ ] Pendaftaran: upload/ganti dokumen, lengkap, toast kanan atas selama 5 detik.
- [ ] Antrean: SIAP/DIKEMBALIKAN, kembalikan dengan catatan, alur menuju permohonan.
- [ ] Permohonan: sesi satuan/rentang/lewati akhir pekan, pilih antrean, keluarkan peserta.
- [ ] Permohonan: ganti dokumen, batalkan, format tanggal sesi.
- [ ] Master peserta: cari, tambah, detail, edit, hapus.
- [ ] Pelatihan: tambah pelatihan/kelas inline, edit, cegah hapus ketika digunakan.
- [ ] Riwayat kegiatan: detail, upload sertifikat, gambar lightbox, PDF tab baru.
- [ ] Dark mode, sidebar, header, user dropdown.
- [ ] Tidak ada error browser baru.

### Asumsi dan tindak lanjut

- Nama aturan aktual di disk adalah AGENT_REFACTOR_RULES.md; rujukan AGENTS_REFACTOR_RULES.md
  di isi dokumen diperlakukan sebagai rujukan ke file tersebut.
- D1–D4 belum diterapkan; dibahas saat fase yang relevan, tanpa menambah dependency sekarang.
- Tidak mengubah schema, UI, perilaku, atau menghubungkan preview ke database.
- Aturan 10.4 mengharuskan bertanya jika gerbang sudah merah sebelum perubahan.
  Pengguna menyetujui perbaikan yang diperlukan pada 2026-10-14.
  Selesaikan checklist manual fase 0 sebelum memulai fase penghapusan/pemecahan.

## Perbaikan prasyarat — Sidebar (2026-10-14)

- Otorisasi: pengguna meminta semua perbaikan yang diperlukan setelah laporan lint bawaan.
- Ini commit perbaikan terpisah, bukan pemecahan komponen fase 6.
- Registrasi elemen submenu sekarang dilakukan callback stabil di useSidebarSubmenu,
  tempat ref dibuat. SidebarNavItem tidak lagi memutasi ref yang diterima melalui props.
- Callback menerima null saat elemen dilepas sehingga tidak menyimpan referensi DOM lama.
- SidebarNavList dan AppSidebar meneruskan callback tersebut.
- Menghapus aturan react-compiler yang tidak tersedia, dua directive disable tidak terpakai,
  dan impor Link/Application tidak terpakai. Tidak menonaktifkan pemeriksaan ESLint.
- Enam file diformat dengan Prettier 3 sekali pakai, printWidth 100; dependency tidak ditambah.
- Ukuran/kelas panjang dan SVG template bawaan tetap ditangani fase 6; tidak memecah template
  atau memperluas commit perbaikan ini menjadi refactor.
- Build awal yang tertahan di sandbox berhasil diulang di luar sandbox. Konfigurasi build
  tidak perlu diubah. Peringatan middleware deprecated masih ada, bukan error build.
- Gerbang final setelah formatting: lint lulus tanpa warning, tsc lulus, build lulus
  (11 halaman statis), git diff --check lulus. check:size belum tersedia (fase 7).
- Uji browser production preview: dashboard menampilkan 2 belum lengkap, 2 siap,
  1 dikembalikan, 0 berjalan; navigasi submenu menuju Pendaftaran berhasil.
- Submenu buka/tutup terukur 136px/0px; sidebar ciut/buka kembali berhasil;
  dropdown pengguna terbuka dengan menu yang sama. Log browser error/warning kosong.
- Checklist fitur lain, termasuk upload, belum diuji ulang pada pekerjaan perbaikan ini.

## Lanjutan baseline — 2026-10-14

- Otorisasi pengguna: selesaikan kebutuhan awal lalu lanjut refactor utama.
- Dashboard: 2 belum lengkap, 2 siap, 1 dikembalikan, 0 berjalan.
- Pelatihan: tambah Uji Baseline + Kelas Uji, edit nama, cari, hapus via konfirmasi lulus.
  Hapus Forklift terpakai ditolak dengan alert.
- Master peserta: tambah data sintetis, kalender tahun 1990, simpan dengan perusahaan kosong,
  cari, detail, edit nama, hapus via konfirmasi lulus.
- Pendaftaran: pencarian Budi, tambah peserta baru, tambah dari master, pakta tidak disalin,
  upload pakta PNG, edit/ganti KTP PDF dengan konfirmasi, lengkap ke SIAP, hapus via modal lulus.
- Antrean: tab SIAP/DIKEMBALIKAN, kembalikan Dedi dengan catatan, catatan muncul pada tab
  Dikembalikan; tombol Buat permohonan membuka form.
- Permohonan: cari Forklift, pilih kelas, rentang 2–5 Oktober 2026 dengan lewati akhir pekan
  menghasilkan 2 dan 5 Oktober; sesi satuan 20 Oktober dan penyimpanan UJI-BASELINE lulus.
- Kelola: Budi dipilih dari antrean, jumlah peserta bertambah; keluarkan lewat konfirmasi
  mengembalikannya ke antrean. Pembatalan mengubah status ke Dibatalkan.
- Riwayat: detail Damkar, upload sertifikat Lia, lightbox gambar Hendra, ganti sertifikat
  PDF dengan konfirmasi lulus. Format sesi seed tetap 2-5 Desember 2026.
- Tema gelap/terang dan regresi sidebar/header/dropdown lulus. Log error/warning browser kosong.
- Batas verifikasi: navigasi PDF blob diblokir kebijakan browser otomatis; tidak dicoba
  lewat jalan lain. Paging >12 data dan durasi toast secara stopwatch belum diverifikasi.
  Uji di atas tidak boleh disebut checklist lengkap tanpa batasan ini.
- Data uji hanya di memori preview dan hilang saat reload; tidak ada koneksi database.
- Temuan bawaan (tidak diperbaiki): dua pendaftaran NIK yang sama dapat dibuat dari master.
- D1 mengikuti rekomendasi dokumen dan arahan lanjut pengguna: arsipkan lalu hapus 1b.
  Kelompok pertama dibatasi file tidak terjangkau; kode halaman aktif dipertahankan identik
  dan dibandingkan hash untuk menutup risiko perubahan perilaku pada pembersihan ini.

## Fase 1b — Modul lama

- Tag arsip: archive/pre-cleanup pada f1fa716.
- Analisis ulang AST TypeScript: 142 file, 64 terjangkau, 78 kandidat tidak terjangkau.
- Hapus 16 file modul lama berikut; tidak ada file baru/pemecahan, tidak mengubah UI aktif.
- `src/components/main/common/AlertDialog.tsx`
- `src/components/main/permohonan/PelaksanaanFormModal.tsx`
- `src/components/main/permohonan/PelaksanaanList.tsx`
- `src/components/main/permohonan/SesiManager.tsx`
- `src/components/main/perusahaan/CabangManager.tsx`
- `src/components/main/perusahaan/DeletedPerusahaanList.tsx`
- `src/components/main/perusahaan/PerusahaanFormModal.tsx`
- `src/components/main/perusahaan/PerusahaanList.tsx`
- `src/components/main/perusahaan/PicManager.tsx`
- `src/components/main/perusahaan/PicSelectionModal.tsx`
- `src/components/main/peserta/PesertaFormModal.tsx`
- `src/components/main/peserta/PesertaList.tsx`
- `src/components/main/training/DeletedTrainingList.tsx`
- `src/components/main/training/TingkatanManager.tsx`
- `src/components/main/training/TrainingFormModal.tsx`
- `src/components/main/training/TrainingList.tsx`
- StatusBadge dan StatusTemanK3 tetap disimpan sesuai rencana.
- Prisma, Supabase, authAction, public dan konfigurasi tidak berubah.
- Sebelum: 16 file / 3.504 baris fisik sumber → sesudah: 0 file pada kelompok ini.
  Angka baris adalah diff penghapusan, bukan pengukuran komponen hasil Prettier.
- Gerbang: lint lulus tanpa warning, tsc lulus, build lulus (11 halaman statis),
  git diff --check lulus. check:size belum tersedia sampai fase 7.
- Analisis setelah: 126 file TS/TSX tersisa; 64 terjangkau; 62 kandidat tidak terjangkau.
  Hash SHA-256 seluruh 64 file terjangkau identik dengan sebelum penghapusan.
- Uji setelah build: dashboard 2/2/1/0, pendaftaran 5, antrean 2 siap/1 dikembalikan,
  master peserta 8, pelatihan 3, riwayat Damkar 3 peserta/2 lulus/1 dari 2 scan.
  Modal pendaftaran dan detail riwayat terbuka; tabel permohonan dan format sesi sama.
  Log error/warning browser kosong.
- Tidak ada kode runtime, dependency, konfigurasi, schema, atau aset yang diubah.
- File PDF sementara untuk uji telah dihapus. Reload mengembalikan data seed.
- Berikutnya: kelompok 1a (demo template), kemudian 1c (arsip lapisan data).
  Pembersihan berikutnya harus mengulang analisis keterjangkauan dan gerbang.
- Cakupan tetap satu kelompok per tugas sesuai aturan 1.2; fase 2–7 belum dimulai.

## Fase 1a — Demo template (2026-10-14)

- Arahan lanjut pengguna menerapkan D1 untuk kelompok demo template.
- Sebelum penghapusan: 126 file TS/TSX, 64 terjangkau, 62 kandidat tidak terjangkau.
- Hasil: 48 file demo beserta pembantu template yang hanya dipakai kelompok ini dihapus.
  ComponentCard, useModal, dan ui/dropdown duplikat termasuk pembantu demo; pemeriksaan AST
  memastikan tidak ada pengimpor dari luar 48 file tersebut.
- Tag archive/pre-cleanup tetap dipertahankan; git diff terhadap tag untuk semua target kosong.
- Tidak menghapus konfigurasi, public, schema, authAction, Prisma, Supabase, StatusBadge,
  atau StatusTemanK3. Tidak ada pemecahan/formatting kode aktif pada kelompok penghapusan ini.
- Target yang diperiksa ulang sebelum penghapusan:
- `src/components/form/CheckboxComponents.tsx`
- `src/components/form/DefaultInputs.tsx`
- `src/components/form/DropZone.tsx`
- `src/components/form/FileInputExample.tsx`
- `src/components/form/Form.tsx`
- `src/components/form/InputGroup.tsx`
- `src/components/form/InputStates.tsx`
- `src/components/form/MultiSelect.tsx`
- `src/components/form/RadioButtons.tsx`
- `src/components/form/SelectInputs.tsx`
- `src/components/form/TextAreaInput.tsx`
- `src/components/form/ToggleSwitch.tsx`
- `src/components/form/date-picker.tsx`
- `src/components/form/form-elements/CheckboxComponents.tsx`
- `src/components/form/form-elements/DefaultInputs.tsx`
- `src/components/form/form-elements/DropZone.tsx`
- `src/components/form/form-elements/FileInputExample.tsx`
- `src/components/form/form-elements/InputGroup.tsx`
- `src/components/form/form-elements/InputStates.tsx`
- `src/components/form/form-elements/RadioButtons.tsx`
- `src/components/form/form-elements/SelectInputs.tsx`
- `src/components/form/form-elements/TextAreaInput.tsx`
- `src/components/form/form-elements/ToggleSwitch.tsx`
- `src/components/form/group-input/PhoneInput.tsx`
- `src/components/form/input/FileInput.tsx`
- `src/components/form/input/Radio.tsx`
- `src/components/form/input/RadioSm.tsx`
- `src/components/form/input/TextArea.tsx`
- `src/components/form/switch/Switch.tsx`
- `src/components/main/Modal/AlertModal.tsx`
- `src/components/main/Modal/DefaultModal.tsx`
- `src/components/main/Modal/FormInModal.tsx`
- `src/components/main/Modal/FullScreenModal.tsx`
- `src/components/main/Modal/ModalBasedAlerts.tsx`
- `src/components/main/Modal/VerticallyCenteredModal.tsx`
- `src/components/main/common/ComponentCard.tsx`
- `src/components/main/tables/BasicTableOne.tsx`
- `src/components/ui/Alert.tsx`
- `src/components/ui/avatar/Avatar.tsx`
- `src/components/ui/avatar/AvatarText.tsx`
- `src/components/ui/dropdown/Dropdown.tsx`
- `src/components/ui/dropdown/DropdownItem.tsx`
- `src/components/ui/images/ResponsiveImage.tsx`
- `src/components/ui/images/ThreeColumnImageGrid.tsx`
- `src/components/ui/images/TwoColumnImageGrid.tsx`
- `src/hooks/useModal.ts`
- `src/lib/data/action/exampleAction.ts`
- `src/lib/data/get/exampleGet.ts`
- Finalisasi: 2026-10-15, branch `refactor/v2-structure` (turunan `v2`).
- Sesudah: 78 file TS/TSX; 64 terjangkau; 14 tidak terjangkau dipertahankan untuk fase berikutnya
  atau karena dilindungi. Semua 64 file aktif identik berdasarkan SHA256 sebelum/sesudah.
- Sebelum: 48 file target, 3.455 baris fisik → Sesudah: 0 file target. Tidak ada file kode baru.
  Angka baris ini hitungan mentah penghapusan, bukan metrik sesudah format Prettier.
- Gerbang final: `npm run lint` lulus; `npx tsc --noEmit` lulus; `npm run build` lulus (11 halaman).
  `check:size` belum tersedia dan dijadwalkan fase 7; tidak ada hasil pecahan pada fase 1a.
- Analisis impor: tidak ada pengimpor aktif ke file yang dihapus dan tidak ada impor TS lokal
  yang tidak terselesaikan. Penghapusan tidak menambah siklus, SVG, atau impor lintas fitur.
- Uji manual sesudah (smoke, bukan seluruh regresi CRUD): dashboard tetap 2/2/1/0;
  pendaftaran membuka form, validasi NIK kosong, batal, dan konfirmasi hapus; daftar permohonan
  tetap Damkar/Forklift; antrean SIAP 2 dan DIKEMBALIKAN 1; pelatihan 3; master peserta 8;
  riwayat Damkar 3 peserta/2 lulus, modal detail dan lightbox sertifikat tampil.
  Dropdown pengguna dapat dibuka. Konsol browser pada smoke terakhir tanpa error/warning.
- Batas verifikasi: pembukaan PDF sebelumnya diblokir keamanan browser; paging >12 dan durasi
  toast dengan stopwatch belum diverifikasi. Tidak diklaim lulus seluruh checklist manual.
- Temuan: tidak ada regresi teramati pada smoke. Temuan baseline tetap dicatat dan tidak
  diperbaiki dalam commit penghapusan ini. Build masih memberi peringatan deprecasi middleware.
- Panduan `REFACTOR_PLAN.md` dan `AGENT_REFACTOR_RULES.md` ikut disimpan ke Git untuk perangkat lain.
- Fase 1a selesai untuk lingkup penghapusan demo. Berikutnya fase 1c (arsip lapisan data lama);
  fase 2–7 belum dikerjakan, refactor keseluruhan belum selesai.
