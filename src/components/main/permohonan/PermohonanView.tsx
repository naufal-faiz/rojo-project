"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import SearchSelect from "@/components/form/SearchSelect";
import DatePickerInput from "@/components/main/common/DatePickerInput";
import { sessionDates } from "@/lib/session-dates";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import ActionButton, { actionButtonClass } from "@/components/main/common/ActionButton";
import DokumenChips from "@/components/main/pendaftaran/DokumenChips";
import { CloseLineIcon, FileEdit, FileUpload, Manage, PlusIcon, Zip } from "@/icons";
import { useToast } from "@/lib/context/ToastContext";
import { useStore, Permohonan, Pendaftaran, Dok, HASIL, Hasil, formatSesi, statusJadwal, label } from "@/lib/mock/store";

const lbl = "mb-1 text-xs";
const opt = (a: string[]) => a.map((x) => ({ value: x, label: x }));
const kosong: Permohonan = { id: "", no: "", training: "", kelas: "", jenis: "PUBLIK", tipe: "OFFLINE", lokasi: "", penyelenggara: "WINA_KARYA_MULIA", sertifikasi: "KEMNAKER", sesi: [], status: "AKTIF", catatan: "" };
export const cekFile = (f: File) => !/^(image\/(png|jpeg)|application\/pdf)$/.test(f.type) ? "Gunakan png, jpg, jpeg, atau pdf." : f.size > 3 * 1024 * 1024 ? "Maksimal 3 MB per file." : null;

export function Buat({ onClose, onSaved }: { onClose: () => void; onSaved?: (id: string) => void }) {
  const { addP, training, kelasList } = useStore();
  const { notify } = useToast();
  const [f, setF] = useState<Permohonan>(kosong);
  const [tgl, setTgl] = useState("");
  const [akhir, setAkhir] = useState("");
  const [mode, setMode] = useState("single");
  const [skipWeekend, setSkipWeekend] = useState(false);
  const set = <K extends keyof Permohonan>(k: K, v: Permohonan[K]) => setF((s) => ({ ...s, [k]: v }));
  const tambahSesi = () => {
    if (!tgl || (mode === "range" && !akhir)) return notify("error", "Tanggal belum lengkap", "Pilih tanggal sesi melalui kalender.");
    if (mode === "range" && akhir < tgl) return notify("error", "Rentang tidak valid", "Tanggal akhir harus sama atau setelah tanggal awal.");
    const dates = sessionDates(tgl, mode === "range" ? akhir : tgl, skipWeekend);
    if (!dates.length) return notify("warning", "Tidak ada hari terpilih", "Tanggal jatuh pada Sabtu–Minggu. Pilih tanggal lain atau nonaktifkan opsi lewati.");
    const added = dates.filter((d) => !f.sesi.includes(d));
    if (!added.length) return notify("info", "Sesi sudah ada", "Tanggal yang dipilih sudah tercantum dalam sesi.");
    set("sesi", [...new Set([...f.sesi, ...dates])].sort());
    setTgl(""); setAkhir("");
    notify("success", "Sesi ditambahkan", `${added.length} tanggal ditambahkan tanpa duplikat.`);
  };
  const simpan = () => {
    if (!f.training || !f.kelas || !f.sesi.length) return notify("error", "Data belum lengkap", "Pelatihan, kelas, dan minimal satu tanggal sesi wajib diisi.");
    const id = crypto.randomUUID(); addP({ ...f, id }); notify("success", "Berhasil", "Permohonan dibuat."); onClose(); onSaved?.(id);
  };
  return (
    <Modal isOpen onClose={onClose} className="max-w-[760px] p-5">
      <h3 className="mb-3 pr-10 text-base font-semibold text-gray-800 dark:text-white/90">Buat permohonan</h3>
      <div className="grid grid-cols-3 gap-x-3 gap-y-2.5">
        <div><Label className={lbl}>Pelatihan *</Label><SearchSelect options={opt(training.map((t) => t.nama))} value={f.training} placeholder="Cari pelatihan" onChange={(v) => setF((s) => ({ ...s, training: v, kelas: "" }))} /></div>
        <div><Label className={lbl}>Kelas *</Label><Select key={f.training} options={opt(kelasList.filter((k) => training.find((t) => t.id === k.trainingId)?.nama === f.training).map((k) => k.nama))} placeholder="Pilih" onChange={(v) => set("kelas", v)} /></div>
        <div><Label className={lbl}>No. permohonan</Label><Input value={f.no} onChange={(e) => set("no", e.target.value)} placeholder="Kosongkan jika tidak ada" /></div>
        <div><Label className={lbl}>Jenis kegiatan</Label><Select options={opt(["Publik", "Inhouse"])} defaultValue={f.jenis} onChange={(v) => set("jenis", v)} /></div>
        <div><Label className={lbl}>Tipe</Label><Select options={opt(["Offline", "Blended"])} defaultValue={f.tipe} onChange={(v) => set("tipe", v)} /></div>
        <div><Label className={lbl}>Sertifikasi</Label><Select options={[{ value: "KEMNAKER", label: "Kemnaker" }, { value: "BNSP", label: "BNSP" }, { value: "LAIN_LAIN", label: "Lain-lain" }]} defaultValue={f.sertifikasi} onChange={(v) => set("sertifikasi", v)} /></div>
        <div><Label className={lbl}>Penyelenggara</Label><Select options={[{ value: "WINA_KARYA_MULIA", label: "PT Wina Karya Mulia" }, { value: "DELTA_INDONESIA", label: "Delta Indonesia" }, { value: "LIMA_PRIMA_SOLUSINDO", label: "Lima Prima Solusindo" }]} defaultValue={f.penyelenggara} onChange={(v) => set("penyelenggara", v)} /></div>
        <div className="col-span-2"><Label className={lbl}>Lokasi</Label><Input value={f.lokasi} onChange={(e) => set("lokasi", e.target.value)} /></div>
        <div className="col-span-3">
          <Label className={lbl}>Tanggal sesi * <span className="text-gray-500">({f.sesi.length} sesi)</span></Label>
          <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
            <label className="flex items-center gap-1.5"><input type="radio" name="mode-sesi" checked={mode === "single"} onChange={() => setMode("single")} className="accent-brand-500" />Satu hari</label>
            <label className="flex items-center gap-1.5"><input type="radio" name="mode-sesi" checked={mode === "range"} onChange={() => setMode("range")} className="accent-brand-500" />Rentang tanggal</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={skipWeekend} onChange={(e) => setSkipWeekend(e.target.checked)} className="accent-brand-500" />Lewati Sabtu–Minggu</label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-48"><DatePickerInput value={tgl} onChange={setTgl} placeholder={mode === "range" ? "Tanggal awal" : "Pilih tanggal sesi"} /></div>
            {mode === "range" && <><span className="text-xs text-gray-500">sampai</span><div className="w-48"><DatePickerInput value={akhir} onChange={setAkhir} placeholder="Tanggal akhir" /></div></>}
            <Button size="sm" onClick={tambahSesi}>Tambah sesi</Button>
          </div>
          {skipWeekend && <p className="mt-1 text-xs text-gray-500">Berlaku untuk tanggal yang akan ditambahkan.</p>}
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{formatSesi(f.sesi)}</p>
          <div className="mt-1 flex max-h-24 flex-wrap items-center gap-1 overflow-y-auto">{f.sesi.map((d) => <button key={d} type="button" aria-label={`Hapus sesi ${formatSesi([d])}`} title={`Hapus ${formatSesi([d])}`} onClick={() => set("sesi", f.sesi.filter((x) => x !== d))}><Badge size="sm" color="light">{formatSesi([d])} ✕</Badge></button>)}</div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2"><Button size="sm" variant="outline" onClick={onClose}>Batal</Button><Button size="sm" onClick={simpan}>Simpan</Button></div>
    </Modal>
  );
}

function Kelola({ p, onClose }: { p: Permohonan; onClose: () => void }) {
  const { rows, update, pilihPeserta, keluarkan } = useStore();
  const { notify } = useToast();
  const [pilih, setPilih] = useState<string[]>([]);
  const [out, setOut] = useState<Pendaftaran | null>(null);
  const [ganti, setGanti] = useState<{ id: string; dok: Dok } | null>(null);
  const peserta = rows.filter((r) => r.permohonanId === p.id);
  const antrean = rows.filter((r) => r.status === "SIAP");
  const unggah = (r: Pendaftaran, f?: File) => {
    if (!f) return;
    const err = cekFile(f); if (err) return notify("error", "File ditolak", err);
    const dok = { nama: f.name, url: URL.createObjectURL(f), mime: f.type };
    if (r.sertifikat) setGanti({ id: r.id, dok }); else { update(r.id, { sertifikat: dok }); notify("success", "Berhasil", "Sertifikat tersimpan."); }
  };
  return (
    <Modal isOpen onClose={onClose} className="max-w-[920px] p-5">
      <h3 className="pr-10 text-base font-semibold text-gray-800 dark:text-white/90">{p.training} · {p.kelas}</h3>
      <p className="mb-3 text-xs text-gray-500">{formatSesi(p.sesi)} · {p.lokasi || "-"}</p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div>
          <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Peserta ({peserta.length})</p>
          <ul className="max-h-[360px] divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 dark:divide-white/5 dark:border-white/10">
            {peserta.length === 0 && <li className="p-4 text-center text-sm text-gray-500">Belum ada peserta. Pilih dari antrean.</li>}
            {peserta.map((r) => (
              <li key={r.id} className="grid grid-cols-[1fr_150px_auto] items-center gap-2 px-3 py-1.5">
                <div className="min-w-0"><p className="truncate text-sm text-gray-800 dark:text-white/90">{r.nama}</p><p className="truncate text-xs text-gray-500">{label(r)}</p></div>
                <Select key={r.id + r.hasil} options={HASIL} placeholder="Hasil" defaultValue={r.hasil ?? ""} onChange={(v) => update(r.id, { hasil: v as Hasil })} />
                <div className="flex items-center gap-2">
                  {r.sertifikat && <DokumenChips dok={{ SURAT_KERJA: r.sertifikat }} tampil={["SURAT_KERJA"]} nama={{ SURAT_KERJA: "Sertifikat" }} />}
                  {r.hasil === "LULUS" && (
                    <label className={`${actionButtonClass(r.sertifikat ? "warning" : "success")} cursor-pointer`}>
                      <span className="flex size-4 items-center justify-center [&_svg]:size-4">{r.sertifikat ? <FileEdit /> : <FileUpload />}</span>
                      {r.sertifikat ? "Ganti sertifikat" : "Upload sertifikat"}
                      <input type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden" onChange={(e) => { unggah(r, e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                  )}
                  <ActionButton tone="error" icon={<CloseLineIcon />} onClick={() => setOut(r)}>Keluarkan</ActionButton>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Antrean siap ({antrean.length})</p>
          <ul className="max-h-[300px] divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 dark:divide-white/5 dark:border-white/10">
            {antrean.length === 0 && <li className="p-4 text-center text-sm text-gray-500">Antrean kosong.</li>}
            {antrean.map((r) => (
              <li key={r.id}><label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-white/5">
                <input type="checkbox" className="h-4 w-4 accent-brand-500" checked={pilih.includes(r.id)} onChange={(e) => setPilih((s) => e.target.checked ? [...s, r.id] : s.filter((x) => x !== r.id))} />
                <span className="min-w-0"><span className="block truncate text-sm text-gray-800 dark:text-white/90">{r.nama}</span><span className="block truncate text-xs text-gray-500">{label(r)}</span></span>
              </label></li>
            ))}
          </ul>
          <div className="mt-2 flex justify-end"><Button size="sm" startIcon={<PlusIcon className="size-4" />} disabled={!pilih.length} onClick={() => { pilihPeserta(p.id, pilih); notify("success", "Berhasil", `${pilih.length} peserta ditambahkan.`); setPilih([]); }}>Tambahkan terpilih</Button></div>
        </div>
      </div>
      <ConfirmDialog isOpen={!!out} onClose={() => setOut(null)} variant="warning" title="Keluarkan peserta?" message={`${out?.nama} kembali ke antrean dan hasilnya dikosongkan.`} confirmLabel="Ya, keluarkan" onConfirm={() => { keluarkan(out!.id); setOut(null); notify("success", "Berhasil", "Peserta kembali ke antrean."); }} />
      <ConfirmDialog isOpen={!!ganti} onClose={() => setGanti(null)} variant="warning" title="Ganti sertifikat?" message="Scan sertifikat lama akan dihapus dan digantikan file baru." confirmLabel="Ya, ganti" onConfirm={() => { update(ganti!.id, { sertifikat: ganti!.dok }); setGanti(null); notify("success", "Berhasil", "Sertifikat diganti."); }} />
    </Modal>
  );
}

export default function PermohonanView() {
  const { permohonan, rows, batalkan } = useStore();
  const { notify } = useToast();
  const [q, setQ] = useState("");
  const [buat, setBuat] = useState(false);
  const sp = useSearchParams();
  const [kelola, setKelola] = useState<string | null>(sp.get("kelola"));
  const [batal, setBatal] = useState<Permohonan | null>(null);
  const data = permohonan.filter((p) => `${p.training} ${p.kelas} ${p.no} ${p.lokasi}`.toLowerCase().includes(q.toLowerCase()));
  const aktif = permohonan.find((p) => p.id === kelola);
  return (
    <>
      <PageHeader title="Permohonan" description="Pilih peserta dari antrean, unduh dokumen, dan catat hasil" primaryAction={{ label: "Buat permohonan", onClick: () => setBuat(true), icon: <PlusIcon className="size-4" /> }} />
      <DataTable<Permohonan> data={data} totalItems={data.length} totalPages={1} currentPage={1} onPageChange={() => {}} onSearch={setQ} searchPlaceholder="Cari pelatihan, kelas, nomor..."
        columns={[
          { header: "Pelatihan", cell: (p) => <div><div className="text-sm font-medium text-gray-800 dark:text-white/90">{p.training}</div><div className="text-xs text-gray-500">{p.kelas}</div></div> },
          { header: "Sesi", cell: (p) => <span className="text-sm text-gray-700 dark:text-gray-300">{formatSesi(p.sesi)}</span> },
          { header: "No. permohonan", cell: (p) => <span className="text-sm text-gray-700 dark:text-gray-300">{p.no || "-"}</span> },
          { header: "Peserta", cell: (p) => <span className="text-sm">{rows.filter((r) => r.permohonanId === p.id).length}</span> },
          { header: "Status", cell: (p) => { const s = statusJadwal(p); return <Badge size="sm" color={s.c}>{s.t}</Badge>; } },
          { header: "Aksi", cell: (p) => (
            <div className="flex flex-wrap gap-2">
              <ActionButton icon={<Manage />} onClick={() => setKelola(p.id)}>Kelola</ActionButton>
              <ActionButton tone="info" icon={<Zip />} onClick={() => notify("info", "Unduh ZIP", `${p.training}, ${formatSesi(p.sesi)}.zip aktif setelah terhubung ke Supabase Storage.`)}>Unduh</ActionButton>
              {p.status !== "DIBATALKAN" && <ActionButton tone="error" icon={<CloseLineIcon />} onClick={() => setBatal(p)}>Batalkan</ActionButton>}
            </div>) },
        ]} />
      {buat && <Buat onClose={() => setBuat(false)} />}
      {aktif && <Kelola p={aktif} onClose={() => setKelola(null)} />}
      <ConfirmDialog isOpen={!!batal} onClose={() => setBatal(null)} title="Batalkan permohonan?" message="Semua peserta di permohonan ini kembali ke antrean." confirmLabel="Ya, batalkan" onConfirm={() => { batalkan(batal!.id); setBatal(null); notify("success", "Berhasil", "Permohonan dibatalkan."); }} />
    </>
  );
}
