"use client";
import React, { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import SearchSelect from "@/components/form/SearchSelect";
import DatePickerInput from "@/components/main/common/DatePickerInput";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import ActionButton from "@/components/main/common/ActionButton";
import DokumenChips from "./DokumenChips";
import { CheckLineIcon, Edit, PlusIcon, TrashBinIcon } from "@/icons";
import { useToast } from "@/lib/context/ToastContext";
import { useStore, JENIS, Jenis, Dok, Pendaftaran, Status, label, kurang } from "@/lib/mock/store";

const LIMIT = 12;
const lbl = "mb-1 text-xs";
export const statusUi: Record<Status, { c: "warning" | "success" | "error" | "info"; t: string }> = {
  DRAFT: { c: "warning", t: "Belum lengkap" },
  SIAP: { c: "success", t: "Siap" },
  DIKEMBALIKAN: { c: "error", t: "Dikembalikan" },
  DIPAKAI: { c: "info", t: "Dipakai" },
};
const kosong: Pendaftaran = { id: "", nik: "", nama: "", tempatLahir: "", tglLahir: "", hp: "", alamat: "", perusahaan: "", depot: "", alamatUsaha: null, dok: {}, status: "DRAFT", catatan: "" };

function Form({ initial, onClose }: { initial: Pendaftaran | null; onClose: () => void }) {
  const { rows, add, update } = useStore();
  const { notify } = useToast();
  const [f, setF] = useState<Pendaftaran>(initial ?? kosong);
  const [pending, setPending] = useState<Partial<Record<Jenis, Dok>>>({});
  const [isDepot, setIsDepot] = useState(!!f.depot);
  const [ganti, setGanti] = useState(false);
  const [ulang, setUlang] = useState(false);
  const set = <K extends keyof Pendaftaran>(k: K, v: Pendaftaran[K]) => setF((s) => ({ ...s, [k]: v }));

  const master = useMemo(() => { const m = new Map<string, Pendaftaran>(); rows.forEach((r) => m.set(r.nik, r)); return [...m.values()]; }, [rows]);
  const perusahaan = useMemo(() => {
    const map = new Map<string, Pendaftaran>();
    rows.forEach((r) => { if (r.perusahaan && !map.has(label(r))) map.set(label(r), r); });
    return [...map.values()];
  }, [rows]);
  const pilihPerusahaan = (value: string) => {
    const match = perusahaan.find((r) => label(r) === value);
    setF((s) => ({ ...s, perusahaan: match?.perusahaan ?? value, depot: match?.depot ?? "", alamatUsaha: match?.alamatUsaha ?? "" }));
    setIsDepot(!!match?.depot);
  };
  const q = f.nama.toLowerCase();
  const saran = !initial && !ulang && q.length >= 2 ? master.filter((m) => m.nama.toLowerCase().includes(q) || m.nik.includes(q)).slice(0, 5) : [];
  const nikDup = !initial && !ulang && f.nik.length === 16 && master.some((m) => m.nik === f.nik);

  const pilih = (m: Pendaftaran) => {
    const dok = { ...m.dok }; delete dok.PAKTA;
    setF({ ...kosong, ...m, id: "", dok, status: "DRAFT", catatan: "" });
    setIsDepot(!!m.depot); setUlang(true);
  };
  const pilihFile = (j: Jenis, file?: File) => {
    if (!file) return;
    if (!/^(image\/(png|jpeg)|application\/pdf)$/.test(file.type)) return notify("error", "Format ditolak", "Gunakan png, jpg, jpeg, atau pdf.");
    if (file.size > 3 * 1024 * 1024) return notify("error", "Ukuran terlalu besar", "Maksimal 3 MB per file.");
    const dok = { nama: file.name, url: URL.createObjectURL(file), mime: file.type };
    if (f.dok[j]) setPending((p) => ({ ...p, [j]: dok }));
    else set("dok", { ...f.dok, [j]: dok });
  };
  const simpan = () => {
    if (!/^\d{16}$/.test(f.nik)) return notify("error", "NIK tidak valid", "NIK harus 16 digit angka.");
    if (!f.nama || !f.tempatLahir || !f.tglLahir) return notify("error", "Data belum lengkap", "Nama, tempat dan tanggal lahir wajib diisi.");
    if (Object.keys(pending).length) setGanti(true); else final();
  };
  const final = () => {
    // File lama baru dilepas setelah konfirmasi (di produksi: hapus objek di bucket pada titik ini).
    (Object.keys(pending) as Jenis[]).forEach((k) => { const u = f.dok[k]?.url; if (u?.startsWith("blob:")) URL.revokeObjectURL(u); });
    const data = { ...f, dok: { ...f.dok, ...pending }, depot: isDepot ? f.depot : "", alamatUsaha: f.alamatUsaha?.trim() || null };
    if (initial) update(initial.id, data); else add(data);
    notify("success", "Berhasil", initial ? "Pendaftaran diperbarui." : "Peserta didaftarkan.");
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-[900px] p-5">
      <h3 className="mb-3 pr-10 text-base font-semibold text-gray-800 dark:text-white/90">{initial ? "Edit pendaftaran" : "Daftarkan peserta"}</h3>
      <div className="grid grid-cols-1 gap-x-5 gap-y-2.5 lg:grid-cols-[1fr_300px]">
        <div className="grid grid-cols-2 content-start gap-x-3 gap-y-2.5">
          <div className="relative col-span-2">
            <Label className={lbl}>Nama peserta *</Label>
            <Input value={f.nama} onChange={(e) => set("nama", e.target.value)} placeholder="Ketik nama atau NIK untuk mencari di master" />
            {saran.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                {saran.map((m) => (
                  <li key={m.nik}>
                    <button type="button" onClick={() => pilih(m)} className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-white/5">
                      <span><span className="block text-sm text-gray-800 dark:text-white/90">{m.nama}</span><span className="block text-xs text-gray-500">{m.nik}</span></span>
                      <span className="text-xs text-gray-500">{label(m)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {ulang && !initial && <p className="mt-1 text-xs text-warning-600">Data dan dokumen diambil dari master. Crosscheck ulang kelayakannya; pakta integritas wajib diupload baru.</p>}
          </div>
          <div><Label className={lbl}>NIK *</Label><Input value={f.nik} onChange={(e) => set("nik", e.target.value.replace(/\D/g, "").slice(0, 16))} error={nikDup} hint={nikDup ? "NIK sudah ada di master, pilih dari saran nama." : undefined} /></div>
          <div><Label className={lbl}>No. HP</Label><Input value={f.hp} onChange={(e) => set("hp", e.target.value)} /></div>
          <div><Label className={lbl}>Tempat lahir *</Label><Input value={f.tempatLahir} onChange={(e) => set("tempatLahir", e.target.value)} /></div>
          <div><Label className={lbl}>Tanggal lahir *</Label><DatePickerInput value={f.tglLahir} onChange={(v) => set("tglLahir", v)} /></div>
          <div>
              <Label className={lbl}>Nama perusahaan</Label>
              <SearchSelect options={perusahaan.map((r) => ({ value: label(r), label: label(r), description: r.alamatUsaha || "Alamat belum tercatat" }))} value={f.perusahaan ? label(f) : ""} onChange={pilihPerusahaan} placeholder="Cari perusahaan / cabang" allowCustom />
          </div>
          <div><Label className={lbl}>Alamat peserta</Label><Input value={f.alamat} onChange={(e) => set("alamat", e.target.value)} placeholder="Alamat tempat tinggal peserta" /></div>
          <div className="col-span-2 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-gray-100 pt-2.5 dark:border-white/5">
            <p className="col-span-2 text-xs font-medium text-gray-500 dark:text-gray-400">Lokasi perusahaan tempat peserta bekerja</p>
            <label className="col-span-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" className="h-4 w-4 accent-brand-500" checked={isDepot} onChange={(e) => { setIsDepot(e.target.checked); setF((s) => ({ ...s, depot: "", alamatUsaha: e.target.checked ? "" : perusahaan.find((r) => r.perusahaan === s.perusahaan && !r.depot)?.alamatUsaha ?? "" })); }} />Dari depot / cabang
            </label>
            {isDepot && <div><Label className={lbl}>Nama depot / cabang</Label><Input value={f.depot} onChange={(e) => setF((s) => ({ ...s, depot: e.target.value, alamatUsaha: perusahaan.find((r) => r.perusahaan === s.perusahaan && r.depot.toLowerCase() === e.target.value.toLowerCase())?.alamatUsaha ?? "" }))} placeholder="Contoh: Banjar" /></div>}
            <div className={isDepot ? "" : "col-span-2"}><Label className={lbl}>{isDepot ? "Alamat depot / cabang (opsional)" : "Alamat perusahaan (opsional)"}</Label><Input value={f.alamatUsaha ?? ""} onChange={(e) => set("alamatUsaha", e.target.value)} placeholder="Boleh dikosongkan" /></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 p-3 dark:border-white/10">
          <p className="mb-2 rounded-lg border border-blue-light-200 bg-blue-light-50 px-2 py-1.5 text-xs font-medium text-blue-light-700 dark:border-blue-light-500/30 dark:bg-blue-light-500/15 dark:text-blue-light-300">Dokumen (png, jpg, jpeg, pdf · maks 3 MB)</p>
          <ul className="flex flex-col divide-y divide-gray-100 dark:divide-white/5">
            {JENIS.map((j) => {
              const p = pending[j.key]; const cur = p ?? f.dok[j.key];
              return (
                <li key={j.key} className="flex items-center justify-between gap-2 py-1.5">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 dark:text-white/90">{j.label}{j.key === "PAKTA" && <span className="ml-1 inline-block rounded border border-warning-200 bg-warning-50 px-1.5 py-0.5 text-xs font-medium text-warning-700 dark:border-warning-500/30 dark:bg-warning-500/15 dark:text-warning-300">Selalu baru</span>}</p>
                    <p className="truncate text-xs text-gray-500">{cur ? `${p ? "Pengganti: " : ""}${cur.nama}` : "Belum ada"}</p>
                    {p && <button type="button" className="text-xs text-brand-500" onClick={() => { URL.revokeObjectURL(p.url); setPending((s) => { const n = { ...s }; delete n[j.key]; return n; }); }}>Batalkan penggantian</button>}
                  </div>
                  <label className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-white/5">
                    {cur ? "Ganti" : "Pilih"}<input type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden" onChange={(e) => { pilihFile(j.key, e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onClose}>Batal</Button>
        <Button size="sm" onClick={simpan}>Simpan</Button>
      </div>
      <ConfirmDialog isOpen={ganti} onClose={() => setGanti(false)} onConfirm={() => { setGanti(false); final(); }} title="Ganti dokumen?" message={`${Object.keys(pending).length} dokumen lama akan dihapus dan digantikan file baru. Tindakan ini tidak dapat dibatalkan.`} confirmLabel="Ya, ganti" variant="warning" />
    </Modal>
  );
}

export default function PendaftaranView() {
  const { rows: semua, update, remove } = useStore();
  const rows = semua.filter((r) => !r.masterOnly && r.status !== "DIPAKAI");
  const { notify } = useToast();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<Pendaftaran | "baru" | null>(null);
  const [lengkapId, setLengkapId] = useState<string | null>(null);
  const [hapusId, setHapusId] = useState<string | null>(null);
  const filtered = useMemo(() => rows.filter((r) => `${r.nama} ${r.nik} ${label(r)}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);
  const data = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const tandai = (r: Pendaftaran) => {
    const k = kurang(r);
    if (k.length) notify("error", "Belum bisa ditandai lengkap", `Kurang: ${k.join(", ")}.`);
    else setLengkapId(r.id);
  };
  return (
    <>
      <PageHeader title="Pendaftaran" description="Data dan dokumen peserta sebelum masuk permohonan" primaryAction={{ label: "Daftarkan peserta", onClick: () => setEdit("baru"), icon: <PlusIcon className="size-4" /> }} />
      <DataTable<Pendaftaran>
        data={data} totalItems={filtered.length} totalPages={Math.max(1, Math.ceil(filtered.length / LIMIT))} currentPage={page}
        onPageChange={setPage} onSearch={(v) => { setQ(v); setPage(1); }} searchPlaceholder="Cari nama, NIK, perusahaan..."
        columns={[
          { header: "Peserta", cell: (r) => <div><div className="text-sm font-medium text-gray-800 dark:text-white/90">{r.nama}</div><div className="text-xs text-gray-500">{r.nik}</div></div> },
          { header: "Perusahaan", cell: (r) => <span className="text-sm text-gray-700 dark:text-gray-300">{label(r)}</span> },
          { header: "Dokumen", cell: (r) => <DokumenChips dok={r.dok} /> },
          { header: "Status", cell: (r) => <Badge size="sm" color={statusUi[r.status].c}>{statusUi[r.status].t}</Badge> },
          { header: "Aksi", cell: (r) => (
            <div className="flex flex-wrap gap-2">
              {r.status !== "DIPAKAI" && <ActionButton tone="info" icon={<Edit />} onClick={() => setEdit(r)}>Edit</ActionButton>}
              {r.status !== "DIPAKAI" && <ActionButton tone="error" icon={<TrashBinIcon />} onClick={() => setHapusId(r.id)}>Hapus</ActionButton>}
              {(r.status === "DRAFT" || r.status === "DIKEMBALIKAN") && <ActionButton tone="success" icon={<CheckLineIcon />} onClick={() => tandai(r)}>Lengkap</ActionButton>}
            </div>) },
        ]}
      />
      {edit && <Form initial={edit === "baru" ? null : edit} onClose={() => setEdit(null)} />}
      <ConfirmDialog isOpen={!!lengkapId} onClose={() => setLengkapId(null)} variant="primary" title="Tandai lengkap?" confirmLabel="Ya, sudah dicek"
        message="Pastikan nama sesuai KTP, foto terbaca jelas, ijazah sesuai syarat, surat kerja masih berlaku, dan pakta integritas sudah ditandatangani."
        onConfirm={() => { update(lengkapId!, { status: "SIAP", catatan: "" }); setLengkapId(null); notify("success", "Berhasil", "Peserta masuk antrean."); }} />
      <ConfirmDialog isOpen={!!hapusId} onClose={() => setHapusId(null)} title="Hapus pendaftaran?" message="Pendaftaran ini dihapus dari daftar. Data master peserta tidak ikut terhapus."
        onConfirm={() => { remove(hapusId!); setHapusId(null); notify("success", "Berhasil", "Pendaftaran dihapus."); }} />
    </>
  );
}
