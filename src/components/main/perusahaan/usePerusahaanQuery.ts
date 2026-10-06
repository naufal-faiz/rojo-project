"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function usePerusahaanQuery() {
  const router = useRouter();
  const params = useSearchParams();
  const change = (key: string, value: string, pageKey: string) => {
    const next = new URLSearchParams(params.toString());
    next.delete("created");
    if (value) next.set(key, value); else next.delete(key);
    if (key !== pageKey) next.set(pageKey, "1");
    router.push(`?${next}`, { scroll: false });
  };
  return { params, change };
}
