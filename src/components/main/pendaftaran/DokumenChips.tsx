"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { JENIS, Jenis, Dok } from "@/lib/mock/store";

const kecil: Record<Jenis, string> = { KTP: "KTP", IJAZAH: "Ijazah", PAS_FOTO: "Foto", SURAT_KERJA: "Surat", PAKTA: "Pakta" };

export default function DokumenChips({ dok, tampil, nama }: { dok: Partial<Record<Jenis, Dok>>; tampil?: Jenis[]; nama?: Partial<Record<Jenis, string>> }) {
  const [aktif, setAktif] = useState<Jenis | null>(null);
  const gambar = JENIS.filter((j) => dok[j.key]?.mime.startsWith("image/")).map((j) => j.key);
  const idx = aktif ? gambar.indexOf(aktif) : -1;
  const geser = (n: number) => setAktif(gambar[(idx + n + gambar.length) % gambar.length]);
  const buka = (j: Jenis) => {
    const x = dok[j];
    if (!x) return;
    if (x.mime === "application/pdf") window.open(x.url, "_blank");
    else setAktif(j);
  };
  return (
    <>
      <div className="flex flex-wrap gap-1">
        {(tampil ? JENIS.filter((j) => tampil.includes(j.key)) : JENIS).map((j) =>
          dok[j.key] ? (
            <button key={j.key} type="button" onClick={() => buka(j.key)} title={`Lihat ${j.label}`}>
              <Badge size="sm" color="success">{nama?.[j.key] ?? kecil[j.key]}</Badge>
            </button>
          ) : (
            <Badge key={j.key} size="sm" color="light">{nama?.[j.key] ?? kecil[j.key]}</Badge>
          )
        )}
      </div>
      <Modal isOpen={!!aktif} onClose={() => setAktif(null)} className="max-w-4xl p-3">
        {aktif && dok[aktif] && (
          <div className="flex flex-col gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dok[aktif]!.url} alt={aktif} className="mx-auto max-h-[78vh] rounded-xl object-contain" />
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{nama?.[aktif] ?? JENIS.find((j) => j.key === aktif)?.label} · {dok[aktif]!.nama} ({idx + 1}/{gambar.length})</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => geser(-1)}>Sebelumnya</Button>
                <Button size="sm" variant="outline" onClick={() => geser(1)}>Berikutnya</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
