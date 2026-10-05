-- Aktifkan Row Level Security (RLS) untuk semua tabel.
-- Tidak ada policy: seluruh akses data hanya lewat server (Prisma) memakai
-- koneksi dengan hak akses owner, sehingga RLS tidak mengganggu aplikasi.
ALTER TABLE "cabang" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pelaksanaan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pendaftaran_perusahaan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "perusahaan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "perusahaan_pic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "peserta" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "peserta_pelaksanaan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sesi_pelaksanaan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tingkatan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "training" ENABLE ROW LEVEL SECURITY;
