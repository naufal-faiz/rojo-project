"use client";
import { useRouter, useSearchParams } from "next/navigation";

/** Satu helper navigasi URL untuk daftar Peserta: filter saling menimpa, halaman direset. */
export default function usePesertaQuery() {
  const router = useRouter();
  const params = useSearchParams();
  const navigate = (updates: Array<[string, string | null]>) => {
    const next = new URLSearchParams(params.toString());
    next.delete("deleted");
    for (const [key, value] of updates) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!updates.some(([key]) => key === "page")) next.set("page", "1");
    router.push(`?${next}`, { scroll: false });
  };
  return { params, navigate };
}
