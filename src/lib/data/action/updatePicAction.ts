"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { TipePic } from "@/lib/generated/prisma/enums"

export async function updatePic(perusahaanId: string, id: string, data: { nama: string; noTelp?: string; tipe: TipePic }) {
    if (!data.nama?.trim() || !Object.values(TipePic).includes(data.tipe)) {
        return { success: false, error: "Nama dan tipe PIC wajib diisi dengan benar." }
    }
    try {
        await prisma.pic.update({
            where: { id, deletedAt: null, perusahaanPic: { some: { perusahaanId, perusahaan: { deletedAt: null } } } },
            data: { nama: data.nama.trim(), noTelp: data.noTelp?.trim() || null, tipe: data.tipe }
        })
        revalidatePath("/master/perusahaan")
        revalidatePath("/master/perusahaan/[id]", "page")
        return { success: true }
    } catch {
        return { success: false, error: "Gagal memperbarui PIC. Pastikan PIC masih terhubung ke perusahaan aktif." }
    }
}
