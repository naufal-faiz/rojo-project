"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Buat } from "@/components/main/permohonan/PermohonanView";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import ActionButton from "@/components/main/common/ActionButton";
import DokumenChips from "./DokumenChips";
import { PlusIcon, Undo, Zip } from "@/icons";
import { useToast } from "@/lib/context/ToastContext";
import { useStore, Pendaftaran, label } from "@/lib/mock/store";

const LIMIT = 12;
type Tab = "SIAP" | "DIKEMBALIKAN";

export default function AntreanView() {
  const { rows, update } = useStore();
  const { notify } = useToast();
  const router = useRouter();
  const [buat, setBuat] = useState(false);
  const [tab, setTab] = useState<Tab>("SIAP");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<Pendaftaran | null>(null);
  const [catatan, setCatatan] = useState("");
  const count = (s: Tab) => rows.filter((r) => r.status === s).length;
  const filtered = useMemo(() => rows.filter((r) => r.status === tab && `${r.nama} ${r.nik} ${label(r)}`.toLowerCase().includes(q.toLowerCase())), [rows, tab, q]);
  const data = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const kirim = () => {
    if (!catatan.trim()) return notify("error", "Catatan wajib diisi", "Tulis alasan pengembalian untuk Anggi.");
    update(target!.id, { status: "DIKEMBALIKAN", catatan: catatan.trim() });
    notify("success", "Berhasil", "Pendaftaran dikembalikan dengan catatan.");
    setTarget(null); setCatatan("");
  };
  const tabCls = (t: Tab) => `border-b-2 px-3 py-2 text-sm font-medium ${tab === t ? "border-brand-500 text-brand-500" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`;
  return (
    <>
      <PageHeader title="Antrean" description="Pendaftaran yang sudah siap dan belum masuk permohonan" primaryAction={{ label: "Buat permohonan", onClick: () => setBuat(true), icon: <PlusIcon className="size-4" /> }} />
      <div className="mb-3 flex gap-1 border-b border-gray-200 dark:border-white/10">
        {(["SIAP", "DIKEMBALIKAN"] as Tab[]).map((t) => (
          <button key={t} className={tabCls(t)} onClick={() => { setTab(t); setPage(1); }}>{t === "SIAP" ? "Siap" : "Dikembalikan"} ({count(t)})</button>
        ))}
      </div>
      <DataTable<Pendaftaran>
        data={data} totalItems={filtered.length} totalPages={Math.max(1, Math.ceil(filtered.length / LIMIT))} currentPage={page}
        onPageChange={setPage} onSearch={(v) => { setQ(v); setPage(1); }} searchPlaceholder="Cari nama, NIK, perusahaan..."
        emptyText={tab === "SIAP" ? "Antrean kosong." : "Tidak ada pendaftaran yang dikembalikan."}
        columns={[
          { header: "Peserta", cell: (r) => <div><div className="text-sm font-medium text-gray-800 dark:text-white/90">{r.nama}</div><div className="text-xs text-gray-500">{r.nik}</div></div> },
          { header: "Perusahaan", cell: (r) => <span className="text-sm text-gray-700 dark:text-gray-300">{label(r)}</span> },
          { header: "Dokumen", cell: (r) => <DokumenChips dok={r.dok} /> },
          ...(tab === "DIKEMBALIKAN" ? [{ header: "Catatan", cell: (r: Pendaftaran) => <span className="text-sm text-error-600">{r.catatan}</span> }] : []),
          { header: "Aksi", cell: (r) => (
            <div className="flex flex-wrap gap-2">
              <ActionButton tone="info" icon={<Zip />} onClick={() => notify("info", "Unduh ZIP", `ZIP ${r.nama}.zip aktif setelah terhubung ke Supabase Storage.`)}>Unduh</ActionButton>
              {tab === "SIAP" && <ActionButton tone="warning" icon={<Undo />} onClick={() => setTarget(r)}>Kembalikan</ActionButton>}
            </div>) },
        ]}
      />
      {buat && <Buat onClose={() => setBuat(false)} onSaved={(id) => router.push(`/permohonan?kelola=${id}`)} />}
      <Modal isOpen={!!target} onClose={() => setTarget(null)} className="max-w-[440px] p-6">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">Kembalikan ke Anggi</h3>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{target?.nama}. Tulis dokumen atau data yang perlu diperbaiki.</p>
        <textarea rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => setTarget(null)}>Batal</Button>
          <Button size="sm" onClick={kirim}>Kembalikan</Button>
        </div>
      </Modal>
    </>
  );
}
