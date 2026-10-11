"use client";
import React from "react";
import Link from "next/link";
import PageHeader from "@/components/main/common/PageHeader";
import { useStore, statusJadwal } from "@/lib/mock/store";

export default function DashboardView() {
  const { rows: semua, permohonan } = useStore();
  const rows = semua.filter((r) => !r.masterOnly);
  const n = (s: string) => rows.filter((r) => r.status === s).length;
  const stat = [
    ["Belum lengkap", n("DRAFT"), "/pendaftaran"], ["Siap di antrean", n("SIAP"), "/antrean"],
    ["Dikembalikan", n("DIKEMBALIKAN"), "/antrean"], ["Permohonan berjalan", permohonan.filter((p) => statusJadwal(p).t === "Berjalan").length, "/permohonan"],
  ] as const;
  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan pendaftaran dan permohonan" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stat.map(([t, v, h]) => (
          <Link key={t} href={h} className="rounded-xl border border-gray-200 p-4 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5">
            <p className="text-xs text-gray-500">{t}</p><p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">{v}</p>
          </Link>))}
      </div>
    </>
  );
}
