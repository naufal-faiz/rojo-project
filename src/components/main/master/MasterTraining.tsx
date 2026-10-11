"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import { useToast } from "@/lib/context/ToastContext";
import { useStore, Training } from "@/lib/mock/store";

const LIMIT = 12;

export default function MasterTraining() {
  const { training, kelasList, permohonan, setTraining, setKelasList } = useStore();
  const { notify } = useToast();
  const [q, setQ] = useState(""); const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<Training | "baru" | null>(null);
  const [nama, setNama] = useState(""); const [ks, setKs] = useState<string[]>([]); const [kBaru, setKBaru] = useState("");
  const [hapus, setHapus] = useState<Training | null>(null);
  const kelasDari = (t: Training) => kelasList.filter((k) => k.trainingId === t.id);
  const dipakai = (t: string, k: string) => permohonan.some((p) => p.training === t && p.kelas === k);
  const filtered = training.filter((t) => `${t.nama} ${kelasDari(t).map((k) => k.nama).join(" ")}`.toLowerCase().includes(q.toLowerCase()));
  const buka = (t: Training | "baru") => { setNama(t === "baru" ? "" : t.nama); setKs(t === "baru" ? [] : kelasDari(t).map((k) => k.nama)); setKBaru(""); setEdit(t); };
  const tambahK = () => {
    const v = kBaru.trim(); if (!v) return;
    if (ks.some((x) => x.toLowerCase() === v.toLowerCase())) return notify("error", "Kelas sudah ada", "Gunakan nama kelas yang berbeda.");
    setKs([...ks, v]); setKBaru("");
  };
  const hapusK = (k: string) => {
    if (edit && edit !== "baru" && dipakai(edit.nama, k)) return notify("error", "Kelas dipakai", "Kelas ini dipakai oleh sebuah permohonan.");
    setKs(ks.filter((x) => x !== k));
  };
  const simpan = () => {
    if (!nama.trim()) return notify("error", "Data belum lengkap", "Nama pelatihan wajib diisi.");
    const id = edit === "baru" || !edit ? crypto.randomUUID() : edit.id;
    const baru = edit === "baru";
    setTraining((r) => (baru ? [{ id, nama: nama.trim() }, ...r] : r.map((x) => (x.id === id ? { ...x, nama: nama.trim() } : x))));
    setKelasList((r) => { const lama = r.filter((k) => k.trainingId === id); return [...r.filter((k) => k.trainingId !== id), ...ks.map((n) => lama.find((k) => k.nama === n) ?? { id: crypto.randomUUID(), trainingId: id, nama: n })]; });
    notify("success", "Berhasil", baru ? "Pelatihan ditambahkan." : "Pelatihan diperbarui."); setEdit(null);
  };
  const coba = (t: Training) => kelasDari(t).some((k) => dipakai(t.nama, k.nama)) ? notify("error", "Tidak bisa dihapus", "Ada kelas yang dipakai oleh permohonan.") : setHapus(t);
  return (
    <>
      <PageHeader title="Pelatihan" description="Jenis pelatihan beserta kelasnya. Anggi dan Aurel bisa menambah" primaryAction={{ label: "Tambah pelatihan", onClick: () => buka("baru") }} />
      <DataTable<Training> data={filtered.slice((page - 1) * LIMIT, page * LIMIT)} totalItems={filtered.length} totalPages={Math.max(1, Math.ceil(filtered.length / LIMIT))} currentPage={page}
        onPageChange={setPage} onSearch={(x) => { setQ(x); setPage(1); }} searchPlaceholder="Cari pelatihan atau kelas..."
        columns={[
          { header: "Pelatihan", cell: (t) => <span className="text-sm font-medium text-gray-800 dark:text-white/90">{t.nama}</span> },
          { header: "Kelas", cell: (t) => <div className="flex flex-wrap gap-1">{kelasDari(t).length ? kelasDari(t).map((k) => <Badge key={k.id} size="sm" color="light">{k.nama}</Badge>) : <span className="text-xs text-gray-400">Belum ada kelas</span>}</div> },
          { header: "Aksi", cell: (t) => (<div className="flex gap-3"><button className="text-xs font-medium text-brand-500 hover:underline" onClick={() => buka(t)}>Edit</button><button className="text-xs font-medium text-error-500 hover:underline" onClick={() => coba(t)}>Hapus</button></div>) },
        ]} />
      {edit && (
        <Modal isOpen onClose={() => setEdit(null)} className="max-w-[480px] p-5">
          <h3 className="mb-3 pr-10 text-base font-semibold text-gray-800 dark:text-white/90">{edit === "baru" ? "Tambah pelatihan" : "Edit pelatihan"}</h3>
          <Label className="mb-1 text-xs">Nama pelatihan *</Label>
          <Input value={nama} onChange={(e) => setNama(e.target.value)} />
          <Label className="mb-1 mt-3 text-xs">Kelas</Label>
          <div className="mb-2 flex min-h-7 flex-wrap gap-1">
            {ks.length === 0 && <span className="text-xs text-gray-400">Belum ada kelas</span>}
            {ks.map((k) => <button key={k} type="button" title="Hapus kelas" onClick={() => hapusK(k)}><Badge size="sm" color="light">{k} ✕</Badge></button>)}
          </div>
          <div className="flex gap-2" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); tambahK(); } }}>
            <div className="flex-1"><Input value={kBaru} onChange={(e) => setKBaru(e.target.value)} placeholder="Nama kelas, lalu Enter" /></div>
            <Button size="sm" variant="outline" onClick={tambahK}>Tambah</Button>
          </div>
          <div className="mt-4 flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setEdit(null)}>Batal</Button><Button size="sm" onClick={simpan}>Simpan</Button></div>
        </Modal>
      )}
      <ConfirmDialog isOpen={!!hapus} onClose={() => setHapus(null)} title="Hapus pelatihan?" message={`${hapus?.nama} beserta semua kelasnya dihapus dari master.`} confirmLabel="Ya, hapus"
        onConfirm={() => { setTraining((r) => r.filter((x) => x.id !== hapus!.id)); setKelasList((r) => r.filter((k) => k.trainingId !== hapus!.id)); setHapus(null); notify("success", "Berhasil", "Pelatihan dihapus."); }} />
    </>
  );
}
