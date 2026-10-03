import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
// NOTE: Jalankan `npx prisma generate` untuk men-generate client ke folder ./generated/prisma
// @ts-ignore - Terbentuk setelah menjalankan `npx prisma generate`
import { PrismaClient } from "./generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;