-- CreateEnum
CREATE TYPE "TipeCabang" AS ENUM ('HQ', 'CABANG', 'DEPOT');

-- CreateEnum
CREATE TYPE "TipePic" AS ENUM ('INTERNAL', 'DINAS', 'MITRA');

-- CreateEnum
CREATE TYPE "TipePelaksanaan" AS ENUM ('ONLINE', 'OFFLINE', 'BLENDED');

-- CreateEnum
CREATE TYPE "JenisKegiatan" AS ENUM ('PUBLIK', 'INHOUSE');

-- CreateEnum
CREATE TYPE "JenisSertifikasi" AS ENUM ('KEMNAKER', 'BNSP', 'INTERNAL');

-- CreateEnum
CREATE TYPE "Penyelenggara" AS ENUM ('WINA_KARYA_MULIA', 'DELTA_INDONESIA', 'LIMA_PRIMA_SOLUSINDO', 'ARTA_KARYA_AREFAA');

-- CreateEnum
CREATE TYPE "StatusTemanK3" AS ENUM ('BELUM_UPLOAD', 'SUDAH_UPLOAD', 'FU_LPS', 'CANCEL');

-- CreateEnum
CREATE TYPE "StatusPeserta" AS ENUM ('LULUS', 'GAGAL', 'REMEDIAL', 'IKUT_BATCH_SELANJUTNYA', 'TAKEOUT', 'CANCEL');

-- CreateTable
CREATE TABLE "training" (
    "id" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tingkatan" (
    "id" UUID NOT NULL,
    "training_id" UUID NOT NULL,
    "kelas" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tingkatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perusahaan" (
    "id" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat_legal" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "perusahaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabang" (
    "id" UUID NOT NULL,
    "perusahaan_id" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "TipeCabang" NOT NULL,
    "alamat" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cabang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peserta" (
    "id" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "perusahaan_cabang_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "peserta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pic" (
    "id" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    "no_telp" TEXT,
    "tipe" "TipePic" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perusahaan_pic" (
    "id" UUID NOT NULL,
    "perusahaan_id" UUID NOT NULL,
    "pic_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perusahaan_pic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pelaksanaan" (
    "id" UUID NOT NULL,
    "no_permohonan" TEXT,
    "tingkatan_id" UUID NOT NULL,
    "jenis_kegiatan" "JenisKegiatan" NOT NULL,
    "tipe_pelaksanaan" "TipePelaksanaan" NOT NULL,
    "lokasi" TEXT,
    "penyelenggara" "Penyelenggara" NOT NULL,
    "jenis_sertifikasi" "JenisSertifikasi" NOT NULL,
    "status" "StatusTemanK3" NOT NULL DEFAULT 'BELUM_UPLOAD',
    "uploaded_at" TIMESTAMP(3),
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pelaksanaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesi_pelaksanaan" (
    "id" UUID NOT NULL,
    "pelaksanaan_id" UUID NOT NULL,
    "tanggal" DATE NOT NULL,

    CONSTRAINT "sesi_pelaksanaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendaftaran_perusahaan" (
    "id" UUID NOT NULL,
    "perusahaan_id" UUID NOT NULL,
    "pelaksanaan_id" UUID NOT NULL,
    "pic_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pendaftaran_perusahaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peserta_pelaksanaan" (
    "id" UUID NOT NULL,
    "peserta_id" UUID NOT NULL,
    "pelaksanaan_id" UUID NOT NULL,
    "pendaftaran_perusahaan_id" UUID,
    "status" "StatusPeserta",
    "no_registrasi" TEXT,
    "no_sertifikat" TEXT,
    "masa_berlaku" DATE,
    "no_skp" TEXT,
    "tanggal_terima_sertifikat" DATE,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "peserta_pelaksanaan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tingkatan_training_id_idx" ON "tingkatan"("training_id");

-- CreateIndex
CREATE INDEX "cabang_perusahaan_id_idx" ON "cabang"("perusahaan_id");

-- CreateIndex
CREATE INDEX "peserta_perusahaan_cabang_id_idx" ON "peserta"("perusahaan_cabang_id");

-- CreateIndex
CREATE INDEX "perusahaan_pic_pic_id_idx" ON "perusahaan_pic"("pic_id");

-- CreateIndex
CREATE UNIQUE INDEX "perusahaan_pic_perusahaan_id_pic_id_key" ON "perusahaan_pic"("perusahaan_id", "pic_id");

-- CreateIndex
CREATE UNIQUE INDEX "pelaksanaan_no_permohonan_key" ON "pelaksanaan"("no_permohonan");

-- CreateIndex
CREATE INDEX "pelaksanaan_tingkatan_id_idx" ON "pelaksanaan"("tingkatan_id");

-- CreateIndex
CREATE INDEX "sesi_pelaksanaan_pelaksanaan_id_idx" ON "sesi_pelaksanaan"("pelaksanaan_id");

-- CreateIndex
CREATE INDEX "pendaftaran_perusahaan_pelaksanaan_id_idx" ON "pendaftaran_perusahaan"("pelaksanaan_id");

-- CreateIndex
CREATE INDEX "pendaftaran_perusahaan_pic_id_idx" ON "pendaftaran_perusahaan"("pic_id");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_perusahaan_perusahaan_id_pelaksanaan_id_key" ON "pendaftaran_perusahaan"("perusahaan_id", "pelaksanaan_id");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_perusahaan_id_pelaksanaan_id_key" ON "pendaftaran_perusahaan"("id", "pelaksanaan_id");

-- CreateIndex
CREATE INDEX "peserta_pelaksanaan_pelaksanaan_id_idx" ON "peserta_pelaksanaan"("pelaksanaan_id");

-- CreateIndex
CREATE INDEX "peserta_pelaksanaan_pendaftaran_perusahaan_id_idx" ON "peserta_pelaksanaan"("pendaftaran_perusahaan_id");

-- CreateIndex
CREATE UNIQUE INDEX "peserta_pelaksanaan_peserta_id_pelaksanaan_id_key" ON "peserta_pelaksanaan"("peserta_id", "pelaksanaan_id");

-- AddForeignKey
ALTER TABLE "tingkatan" ADD CONSTRAINT "tingkatan_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "training"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cabang" ADD CONSTRAINT "cabang_perusahaan_id_fkey" FOREIGN KEY ("perusahaan_id") REFERENCES "perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta" ADD CONSTRAINT "peserta_perusahaan_cabang_id_fkey" FOREIGN KEY ("perusahaan_cabang_id") REFERENCES "cabang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perusahaan_pic" ADD CONSTRAINT "perusahaan_pic_perusahaan_id_fkey" FOREIGN KEY ("perusahaan_id") REFERENCES "perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perusahaan_pic" ADD CONSTRAINT "perusahaan_pic_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "pic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelaksanaan" ADD CONSTRAINT "pelaksanaan_tingkatan_id_fkey" FOREIGN KEY ("tingkatan_id") REFERENCES "tingkatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesi_pelaksanaan" ADD CONSTRAINT "sesi_pelaksanaan_pelaksanaan_id_fkey" FOREIGN KEY ("pelaksanaan_id") REFERENCES "pelaksanaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_perusahaan" ADD CONSTRAINT "pendaftaran_perusahaan_perusahaan_id_fkey" FOREIGN KEY ("perusahaan_id") REFERENCES "perusahaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_perusahaan" ADD CONSTRAINT "pendaftaran_perusahaan_pelaksanaan_id_fkey" FOREIGN KEY ("pelaksanaan_id") REFERENCES "pelaksanaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_perusahaan" ADD CONSTRAINT "pendaftaran_perusahaan_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "pic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_pelaksanaan" ADD CONSTRAINT "peserta_pelaksanaan_peserta_id_fkey" FOREIGN KEY ("peserta_id") REFERENCES "peserta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_pelaksanaan" ADD CONSTRAINT "peserta_pelaksanaan_pelaksanaan_id_fkey" FOREIGN KEY ("pelaksanaan_id") REFERENCES "pelaksanaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peserta_pelaksanaan" ADD CONSTRAINT "peserta_pelaksanaan_pendaftaran_perusahaan_id_pelaksanaan__fkey" FOREIGN KEY ("pendaftaran_perusahaan_id", "pelaksanaan_id") REFERENCES "pendaftaran_perusahaan"("id", "pelaksanaan_id") ON DELETE RESTRICT ON UPDATE CASCADE;
