"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import FilterBar from "@/components/main/common/FilterBar";
import ComponentCard from "@/components/main/common/ComponentCard";
import FlashAlert from "@/components/main/common/FlashAlert";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import useFlash from "@/components/main/common/useFlash";
import { PlusIcon } from "@/icons/index";
import { deleteTraining } from "@/lib/data/action/trainingAction";
import TrainingForm from "./TrainingForm";
import TingkatanManager from "./TingkatanManager";
import { getTrainingColumns, TrainingData } from "./TrainingColumns";
interface Props { initialData: TrainingData[]; pagination: { page: number; totalItems: number; totalPages: number } }
const TrainingList: React.FC<Props> = ({ initialData, pagination }) => {
  const router = useRouter(); const params = useSearchParams(); const flash = useFlash();
  const [adding, setAdding] = useState(false); const [edit, setEdit] = useState<string | null>(null); const [expanded, setExpanded] = useState<string | null>(null); const [confirm, setConfirm] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const navigate = (key: string, value: string) => { const next = new URLSearchParams(params.toString()); if (value) next.set(key, value); else next.delete(key); if (key !== "page") next.set("page", "1"); router.push(`?${next}`, { scroll: false }); };
  const remove = async (id: string) => { setBusy(true); try { const result = await deleteTraining(id); if (result.success) { setConfirm(null); flash.showSuccess("Pelatihan dihapus."); } else flash.showError(result.error ?? "Gagal menghapus."); } catch { flash.showError("Gagal menghapus pelatihan."); } finally { setBusy(false); } };
  return <><PageHeader title="Master Pelatihan" description="Kelola pelatihan dan tingkatan." primaryAction={{ label: "Tambah Training", onClick: () => setAdding(true), icon: <PlusIcon className="size-4" /> }} /><FlashAlert flash={flash.flash} onClose={flash.clear} />
    {adding && <ComponentCard title="Tambah Training" className="mb-4"><TrainingForm onClose={() => setAdding(false)} onSuccess={flash.showSuccess} onError={flash.showError} /></ComponentCard>}
    <FilterBar filters={[{ key: "tingkatan", label: "Tingkatan", options: [{ value: "ada", label: "Punya tingkatan" }, { value: "tanpa", label: "Tanpa tingkatan" }] }]} />
    <DataTable data={initialData} columns={getTrainingColumns((row) => setExpanded(expanded === row.id ? null : row.id), (row) => { setEdit(row.id); setConfirm(null); }, setConfirm)} totalPages={pagination.totalPages} currentPage={pagination.page} totalItems={pagination.totalItems} onPageChange={(page) => navigate("page", String(page))} onSearch={(query) => navigate("search", query)} searchValue={params.get("search") ?? ""} searchPlaceholder="Cari nama pelatihan..." renderExpandedRow={(row) => confirm === row.id ? <InlineConfirm message="Hapus pelatihan ini? Hapus tingkatan aktif terlebih dahulu." onConfirm={() => remove(row.id)} onCancel={() => setConfirm(null)} loading={busy} /> : edit === row.id ? <TrainingForm editData={row} onClose={() => setEdit(null)} onSuccess={flash.showSuccess} onError={flash.showError} /> : expanded === row.id ? <TingkatanManager trainingId={row.id} tingkatan={row.tingkatan} confirmId={confirm} setConfirmId={setConfirm} onSuccess={flash.showSuccess} onError={flash.showError} /> : null} />
  </>;
};
export default TrainingList;
