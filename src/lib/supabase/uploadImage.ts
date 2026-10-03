import { createClient } from "./client";

export class UploadError extends Error {}

/**
 * Upload gambar ke Supabase Storage.
 * @param file - File gambar yang akan diupload
 * @param bucket - Nama bucket Supabase Storage, mis. "articles" atau "trainings"
 * @param prefix - Prefix nama file, mis. "thumb" atau "content"
 * @returns Public URL dari file yang berhasil diupload
 */
export async function uploadImage(file: File, bucket: string, prefix: string): Promise<string> {
    if (!file.type.startsWith("image/")) {
        throw new UploadError("Harap pilih file gambar (JPG, PNG, WebP, dll)");
    }

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
    if (uploadError) {
        throw new UploadError(`Gagal mengunggah gambar: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    if (!data?.publicUrl) {
        throw new UploadError("Gagal mendapatkan URL gambar setelah upload.");
    }

    return data.publicUrl;
}