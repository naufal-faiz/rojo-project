"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import DatePickerInput from "@/components/main/common/DatePickerInput";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import ConfirmDialog from "@/components/main/common/ConfirmDialog";
import ActionButton, { actionButtonClass } from "@/components/main/common/ActionButton";
import DokumenChips from "@/components/main/pendaftaran/DokumenChips";
import { EyeIcon, FileEdit, FileUpload } from "@/icons";
import { cekFile } from "@/components/main/permohonan/PermohonanView";
import { useToast } from "@/lib/context/ToastContext";
import { useStore, Permohonan, Pendaftaran, Dok, HASIL, formatSesi, statusJadwal, label } from "@/lib/mock/store";

export default function RiwayatView() {
  const { permohonan, rows, update } = useStore();
  const { notify } = useToast();
  const [q, setQ] = useState("");
  const [aktif, setAktif] = useState<string | null>(null);
  const [ganti, setGanti] = useState<{ id: string; dok: Dok } | null>(null);
  const riwayat = permohonan.filter((p) => ["Selesai", "Dibatalkan"].includes(statusJadwal(p).t) && `${p.training} ${p.kelas} ${p.no}`.toLowerCase().includes(q.toLowerCase()));
  const dari = (id: string) => rows.filter((r) => r.permohonanId === id);
  const p = permohonan.find((x) => x.id === aktif);
  const unggah = (r: Pendaftaran, f?: File) => {
    if (!f) return;
    const err = cekFile(f); if (err) return notify("error", "File ditolak", err);
    const dok = { nama: f.name, url: URL.createObjectURL(f), mime: f.type };
    if (r.sertifikat) setGanti({ id: r.id, dok }); else { update(r.id, { sertifikat: dok }); notify("success", "Berhasil", "Scan sertifikat tersimpan."); }
  };
  return (
    <>
      <PageHeader title="Riwayat Kegiatan" description="Permohonan yang sudah selesai atau dibatalkan, beserta hasil dan sertifikat peserta" />
      <DataTable<Permohonan> data={riwayat} totalItems={riwayat.length} totalPages={1} currentPage={1} onPageChange={() => {}} onSearch={setQ} searchPlaceholder="Cari pelatihan, kelas, nomor..."
        columns={[
          { header: "Pelatihan", cell: (x) => <div><div className="text-sm font-medium text-gray-800 dark:text-white/90">{x.training}</div><div className="text-xs text-gray-500">{x.kelas}</div></div> },
          { header: "Sesi", cell: (x) => <span className="text-sm text-gray-700 dark:text-gray-300">{formatSesi(x.sesi)}</span> },
          { header: "Peserta", cell: (x) => <span className="text-sm">{dari(x.id).length}</span> },
          { header: "Lulus", cell: (x) => <span className="text-sm">{dari(x.id).filter((r) => r.hasil === "LULUS").length}</span> },
          { header: "Scan sertifikat", cell: (x) => { const l = dari(x.id).filter((r) => r.hasil === "LULUS"); const s = l.filter((r) => r.sertifikat).length; return l.length ? <Badge size="sm" color={s === l.length ? "success" : "warning"}>{s}/{l.length}</Badge> : <span className="text-xs text-gray-400">-</span>; } },
          { header: "Status", cell: (x) => { const s = statusJadwal(x); return <Badge size="sm" color={s.c}>{s.t}</Badge>; } },
          { header: "Aksi", cell: (x) => <ActionButton icon={<EyeIcon />} onClick={() => setAktif(x.id)}>Detail</ActionButton> },
        ]} />
      {p && (
        <Modal isOpen onClose={() => setAktif(null)} className="max-w-[940px] p-5">
          <h3 className="pr-10 text-base font-semibold text-gray-800 dark:text-white/90">{p.training} · {p.kelas}</h3>
          <p className="mb-3 text-xs text-gray-500">{formatSesi(p.sesi)} · {p.lokasi || "-"}</p>
          <div className="grid grid-cols-[1.4fr_90px_1fr_140px_150px] gap-2 px-1 pb-1 text-xs font-medium text-gray-500"><span>Peserta</span><span>Hasil</span><span>No. sertifikat</span><span>Masa berlaku</span><span>Scan</span></div>
          <ul className="max-h-[380px] divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200 dark:divide-white/5 dark:border-white/10">
            {dari(p.id).length === 0 && <li className="p-4 text-center text-sm text-gray-500">Tidak ada peserta.</li>}
            {dari(p.id).map((r) => (
              <li key={r.id} className="grid grid-cols-[1.4fr_90px_1fr_140px_150px] items-center gap-2 px-2 py-1.5">
                <div className="min-w-0"><p className="truncate text-sm text-gray-800 dark:text-white/90">{r.nama}</p><p className="truncate text-xs text-gray-500">{label(r)}</p></div>
                <Badge size="sm" color={r.hasil === "LULUS" ? "success" : "warning"}>{HASIL.find((h) => h.value === r.hasil)?.label ?? "-"}</Badge>
                {r.hasil === "LULUS" ? (
                  <>
                    <Input value={r.noSertifikat ?? ""} onChange={(e) => update(r.id, { noSertifikat: e.target.value })} placeholder="Nomor" />
                    <DatePickerInput value={r.masaBerlaku ?? ""} onChange={(v) => update(r.id, { masaBerlaku: v })} />
                    <div className="flex items-center gap-2">
                      {r.sertifikat && <DokumenChips dok={{ SURAT_KERJA: r.sertifikat }} tampil={["SURAT_KERJA"]} nama={{ SURAT_KERJA: "Sertifikat" }} />}
                      <label className={`${actionButtonClass(r.sertifikat ? "warning" : "success")} cursor-pointer`}>
                        <span className="flex size-4 items-center justify-center [&_svg]:size-4">{r.sertifikat ? <FileEdit /> : <FileUpload />}</span>
                        {r.sertifikat ? "Ganti" : "Upload"}
                        <input type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden" onChange={(e) => { unggah(r, e.target.files?.[0]); e.target.value = ""; }} />
                      </label>
                    </div>
                  </>
                ) : <span className="col-span-3 text-xs text-gray-400">-</span>}
              </li>))}
          </ul>
        </Modal>
      )}
      <ConfirmDialog isOpen={!!ganti} onClose={() => setGanti(null)} variant="warning" title="Ganti sertifikat?" message="Scan sertifikat lama akan dihapus dan digantikan file baru." confirmLabel="Ya, ganti" onConfirm={() => { update(ganti!.id, { sertifikat: ganti!.dok }); setGanti(null); notify("success", "Berhasil", "Sertifikat diganti."); }} />
    </>
  );
}
