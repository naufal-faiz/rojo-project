"use client";
import React, { useRef, useState } from "react";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import RowActions from "@/components/main/common/RowActions";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import { CheckLineIcon, CloseLineIcon, PlusIcon } from "@/icons/index";
import { createTingkatan, updateTingkatan, deleteTingkatan } from "@/lib/data/action/trainingAction";
import { KELAS_UMUM } from "@/lib/tingkatan";
interface Props { trainingId: string; tingkatan: { id: string; kelas: string }[]; confirmId: string | null; setConfirmId: (id: string | null) => void; onSuccess: (message: string) => void; onError: (message: string) => void }
const TingkatanManager: React.FC<Props> = ({ trainingId, tingkatan, confirmId, setConfirmId, onSuccess, onError }) => {
  const [editId, setEditId] = useState<string | null>(null); const [kelas, setKelas] = useState(""); const [busy, setBusy] = useState(false); const input = useRef<HTMLInputElement>(null);
  const save = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); try { const result = editId ? await updateTingkatan(editId, kelas) : await createTingkatan(trainingId, kelas); if (!result.success) { onError(result.error ?? "Gagal menyimpan tingkatan."); return; } setEditId(null); setKelas(""); input.current?.focus(); onSuccess("Tingkatan disimpan."); } catch { onError("Gagal menyimpan tingkatan."); } finally { setBusy(false); } };
  const remove = async (id: string) => { setBusy(true); try { const result = await deleteTingkatan(id); if (result.success) { setConfirmId(null); onSuccess("Tingkatan dihapus."); } else onError(result.error ?? "Gagal menghapus."); } catch { onError("Gagal menghapus tingkatan."); } finally { setBusy(false); } };
  return <div className="space-y-3">{tingkatan.map((item) => <div key={item.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">{confirmId === item.id ? <InlineConfirm message="Hapus tingkatan ini? Tingkatan yang dipakai permohonan aktif tidak dapat dihapus." onConfirm={() => remove(item.id)} onCancel={() => setConfirmId(null)} loading={busy} /> : <div className="flex items-center justify-between gap-2"><span>{item.kelas === KELAS_UMUM ? "Tanpa tingkatan" : item.kelas}</span><RowActions onEdit={() => { setEditId(item.id); setKelas(item.kelas); input.current?.focus(); }} onDelete={() => setConfirmId(item.id)} /></div>}</div>)}<form onSubmit={save} className="flex flex-wrap items-center gap-2"><Input inputRef={input} required value={kelas} placeholder={editId ? "Ubah tingkatan" : "Tingkatan baru"} onChange={(event) => setKelas(event.target.value)} /><Button type="submit" size="sm" isLoading={busy} startIcon={editId ? <CheckLineIcon className="size-4" /> : <PlusIcon className="size-4" />}>{editId ? "Simpan" : "Tambah Tingkatan"}</Button>{editId && <Button size="sm" variant="outline" onClick={() => { setEditId(null); setKelas(""); }} startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>}</form></div>;
};
export default TingkatanManager;
