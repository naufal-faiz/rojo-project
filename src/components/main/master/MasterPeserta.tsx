"use client";
import React, { useMemo, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import { useToast } from "@/lib/context/ToastContext";
import { useStore, Pendaftaran, HASIL, formatSesi, label } from "@/lib/mock/store";

const LIMIT = 12;
const baru: Pendaftaran = { id: "", nik: "", nama: "", tempatLahir: "", tglLahir: "", jk: "", pendidikan: "", jabatan: "", hp: "", alamat: "", perusahaan: "", depot: "", alamatUsaha: "", dok: {}, status: "DRAFT", catatan: "", masterOnly: true };
const lbl = "mb-1 text-xs";

function Detail({ m: mm, onClose }: { m: Pendaftaran | null; onClose: () => void }) {
  const m = mm ?? baru;
  const baruMode = !mm;
  const { rows, permohonan, setRows, add } = useStore();
  const { notify } = useToast();
  const [f, setF] = useState<Pendaftaran>(m);
  const riwayat = rows.filter((r) => r.nik === m.nik && r.permohonanId);
  const T = (k: keyof Pendaftaran, l: string, type?: string, span = "") => (
    <div className={span}><Label className={lbl}>{l}</Label><Input type={type} value={String(f[k] ?? "")} onChange={(e) => setF((s) => ({ ...s, [k]: e.target.value }))} /></div>
  );
  const simpan = () => {
    if (baruMode && !/^\d{16}$/.test(f.nik)) return notify("error", "NIK tidak valid", "NIK harus 16 digit angka.");
    if (baruMode && rows.some((r) => r.nik === f.nik)) return notify("error", "NIK sudah terdaftar", "Peserta ini sudah ada di master.");
    if (!f.nama || !f.tempatLahir || !f.tglLahir || !f.jk) return notify("error", "Data belum lengkap", "Nama, tempat dan tanggal lahir, serta jenis kelamin wajib diisi.");
    if (baruMode) { add({ ...f, masterOnly: true }); notify("success", "Berhasil", "Peserta ditambahkan ke master."); return onClose(); }
    const { nama, tempatLahir, tglLahir, jk, pendidikan, jabatan, hp, alamat, perusahaan, depot, alamatUsaha } = f;
    setRows((r) => r.map((x) => (x.nik === m.nik ? { ...x, nama, tempatLahir, tglLahir, jk, pendidikan, jabatan, hp, alamat, perusahaan, depot, alamatUsaha } : x)));
    notify("success", "Berhasil", "Data peserta diperbarui."); onClose();
  };
  return (
    <Modal isOpen onClose={onClose} className="max-w-[820px] p-5">
      <h3 className="mb-3 pr-10 text-base font-semibold text-gray-800 dark:text-white/90">{baruMode ? "Tambah peserta" : `Data peserta · ${m.nik}`}</h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          {baruMode && <div className="col-span-2"><Label className={lbl}>NIK *</Label><Input value={f.nik} onChange={(e) => setF((s) => ({ ...s, nik: e.target.value.replace(/\D/g, "").slice(0, 16) }))} /></div>}
          {T("nama", "Nama *", undefined, "col-span-2")}
          {T("tempatLahir", "Tempat lahir *")}{T("tglLahir", "Tanggal lahir *", "date")}
          <div><Label className={lbl}>Jenis kelamin *</Label><Select options={[{ value: "L", label: "Laki-laki" }, { value: "P", label: "Perempuan" }]} defaultValue={f.jk} onChange={(v) => setF((s) => ({ ...s, jk: v as "L" | "P" }))} /></div>
          {T("pendidikan", "Pendidikan")}{T("jabatan", "Jabatan")}{T("hp", "No. HP")}{T("alamat", "Alamat", undefined, "col-span-2")}
          <div><Label className={lbl}>Perusahaan</Label><Input list="dl-prs" value={f.perusahaan} onChange={(e) => setF((s) => ({ ...s, perusahaan: e.target.value }))} /><datalist id="dl-prs">{[...new Set(rows.map((r) => r.perusahaan))].map((x) => <option key={x} value={x} />)}</datalist></div>{T("depot", "Depot / cabang (kosong = HQ)")}{T("alamatUsaha", "Alamat perusahaan / depot", undefined, "col-span-2")}
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Riwayat pelatihan</p>
          <ul className="max-h-[340px] divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 dark:divide-white/5 dark:border-white/10">
            {riwayat.length === 0 && <li className="p-4 text-center text-sm text-gray-500">Belum pernah mengikuti pelatihan.</li>}
            {riwayat.map((r) => { const p = permohonan.find((x) => x.id === r.permohonanId); return (
              <li key={r.id} className="px-3 py-2"><p className="text-sm text-gray-800 dark:text-white/90">{p?.training} · {p?.kelas}</p>
                <p className="text-xs text-gray-500">{p ? formatSesi(p.sesi) : "-"} · {label(r)}</p>
                {r.hasil && <Badge size="sm" color={r.hasil === "LULUS" ? "success" : "warning"}>{HASIL.find((h) => h.value === r.hasil)?.label}</Badge>}</li>); })}
          </ul>
          <p className="mt-2 text-xs text-gray-500">Dokumen diubah lewat halaman Pendaftaran.</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2"><Button size="sm" variant="outline" onClick={onClose}>Batal</Button><Button size="sm" onClick={simpan}>Simpan</Button></div>
    </Modal>
  );
}

export default function MasterPeserta() {
  const { rows, setRows } = useStore();
  const { notify } = useToast();
  const [q, setQ] = useState(""); const [page, setPage] = useState(1);
  const [edit, setEdit] = useState<Pendaftaran | null>(null);
  const [tambah, setTambah] = useState(false);
  const [hapus, setHapus] = useState<Pendaftaran | null>(null);
  const master = useMemo(() => { const m = new Map<string, Pendaftaran>(); [...rows].reverse().forEach((r) => m.set(r.nik, r)); return [...m.values()]; }, [rows]);
  const filtered = master.filter((m) => `${m.nama} ${m.nik} ${label(m)}`.toLowerCase().includes(q.toLowerCase()));
  const coba = (m: Pendaftaran) => rows.some((r) => r.nik === m.nik && r.permohonanId) ? notify("error", "Tidak bisa dihapus", "Peserta tercatat di permohonan. Keluarkan dulu dari permohonan.") : setHapus(m);
  return (
    <>
      <PageHeader title="Peserta" description="Master peserta. Dokumen diunggah saat pendaftaran" primaryAction={{ label: "Tambah peserta", onClick: () => setTambah(true) }} />
      <DataTable<Pendaftaran> data={filtered.slice((page - 1) * LIMIT, page * LIMIT)} totalItems={filtered.length} totalPages={Math.max(1, Math.ceil(filtered.length / LIMIT))} currentPage={page}
        onPageChange={setPage} onSearch={(x) => { setQ(x); setPage(1); }} searchPlaceholder="Cari nama, NIK, perusahaan..."
        columns={[
          { header: "Peserta", cell: (m) => <div><div className="text-sm font-medium text-gray-800 dark:text-white/90">{m.nama}</div><div className="text-xs text-gray-500">{m.nik}</div></div> },
          { header: "Tempat, tgl lahir", cell: (m) => <span className="text-sm text-gray-700 dark:text-gray-300">{m.tempatLahir}, {m.tglLahir}</span> },
          { header: "Perusahaan", cell: (m) => <span className="text-sm text-gray-700 dark:text-gray-300">{label(m)}</span> },
          { header: "Pelatihan", cell: (m) => <span className="text-sm">{rows.filter((r) => r.nik === m.nik && r.permohonanId).length}x</span> },
          { header: "Aksi", cell: (m) => (<div className="flex gap-3"><button className="text-xs font-medium text-brand-500 hover:underline" onClick={() => setEdit(m)}>Detail</button><button className="text-xs font-medium text-error-500 hover:underline" onClick={() => coba(m)}>Hapus</button></div>) },
        ]} />
      {edit && <Detail m={edit} onClose={() => setEdit(null)} />}
      {tambah && <Detail m={null} onClose={() => setTambah(false)} />}
      <ConfirmDialog isOpen={!!hapus} onClose={() => setHapus(null)} title="Hapus peserta?" message={`${hapus?.nama} dan semua pendaftarannya yang belum dipakai akan dihapus, termasuk file dokumennya.`} confirmLabel="Ya, hapus"
        onConfirm={() => { setRows((r) => r.filter((x) => x.nik !== hapus!.nik)); setHapus(null); notify("success", "Berhasil", "Peserta dihapus."); }} />
    </>
  );
}
