-- Sinkronkan skema database dengan prisma/schema.prisma (AGENTS.md poin 9.7):
-- 1. Tambah nilai enum Penyelenggara: LIK dan ITC.
-- 2. StatusTemanK3 menjadi nullable dan nilai BELUM_UPLOAD dihapus
--    (data kosong direpresentasikan sebagai NULL).
-- 3. PendaftaranPerusahaan.pic_id menjadi nullable.

-- AlterEnum
ALTER TYPE "Penyelenggara" ADD VALUE 'LIK';
ALTER TYPE "Penyelenggara" ADD VALUE 'ITC';

-- AlterEnum
BEGIN;
CREATE TYPE "StatusTemanK3_new" AS ENUM ('SUDAH_UPLOAD', 'FU_LPS', 'CANCEL');
ALTER TABLE "public"."pelaksanaan" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "pelaksanaan" ALTER COLUMN "status" TYPE "StatusTemanK3_new" USING ("status"::text::"StatusTemanK3_new");
ALTER TYPE "StatusTemanK3" RENAME TO "StatusTemanK3_old";
ALTER TYPE "StatusTemanK3_new" RENAME TO "StatusTemanK3";
DROP TYPE "public"."StatusTemanK3_old";
COMMIT;

-- AlterTable
ALTER TABLE "pelaksanaan" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "pendaftaran_perusahaan" ALTER COLUMN "pic_id" DROP NOT NULL;
