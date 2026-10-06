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

interface TrainingListProps {
  /** Hasil pencarian dan paginasi server. */
  initialData: TrainingData[];
  pagination: { page: number; totalItems: number; totalPages: number };
}

const TrainingList: React.FC<TrainingListProps> = ({ initialData, pagination }) => {
  const router = useRouter();
  const params = useSearchParams();
  const flash = useFlash();
  const [adding, setAdding] = useState(false);
  const [edit, setEdit] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setEdit(null);
    setExpanded(null);
    setConfirm(null);
    router.push(`?${next}`, { scroll: false });
  };
  const remove = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await deleteTraining(id);
      if (result.success) {
        setConfirm(null);
        flash.showSuccess("Pelatihan dihapus.");
      } else flash.showError(result.error ?? "Gagal menghapus.");
    } catch {
      flash.showError("Gagal menghapus pelatihan.");
    } finally {
      setBusy(false);
    }
  };
  const columns = getTrainingColumns(
    (row) => { setExpanded(expanded === row.id ? null : row.id); setEdit(null); setConfirm(null); },
    (row) => { setEdit(row.id); setExpanded(null); setConfirm(null); },
    (id) => { setConfirm(id); setEdit(null); },
    expanded,
    busy,
  );
  const formProps = { onSuccess: flash.showSuccess, onError: flash.showError };
  const renderPanel = (row: TrainingData) => {
    if (confirm === row.id) return <InlineConfirm message="Hapus pelatihan ini? Hapus tingkatan aktif terlebih dahulu."
      onConfirm={() => remove(row.id)} onCancel={() => setConfirm(null)} loading={busy} />;
    if (edit === row.id) return <TrainingForm key={row.id} editData={row} onClose={() => setEdit(null)} {...formProps} />;
    if (expanded === row.id) return <TingkatanManager trainingId={row.id} tingkatan={row.tingkatan}
      confirmId={confirm} setConfirmId={setConfirm} {...formProps} />;
    return null;
  };
  return (
    <>
      <PageHeader title="Master Pelatihan" description="Kelola pelatihan dan tingkatan."
        primaryAction={{ label: "Tambah Training", onClick: () => setAdding(true), icon: <PlusIcon className="size-4" /> }} />
      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      {adding && (
        <ComponentCard title="Tambah Training" className="mb-4">
          <TrainingForm onClose={() => setAdding(false)} {...formProps} />
        </ComponentCard>
      )}
      <FilterBar filters={[{ key: "tingkatan", label: "Tingkatan", options: [
        { value: "ada", label: "Punya tingkatan" }, { value: "tanpa", label: "Tanpa tingkatan" },
      ] }]} />
      <DataTable data={initialData} columns={columns} totalPages={pagination.totalPages}
        currentPage={pagination.page} totalItems={pagination.totalItems}
        onPageChange={(page) => navigate("page", String(page))} onSearch={(query) => navigate("search", query)}
        searchValue={params.get("search") ?? ""} searchPlaceholder="Cari nama pelatihan..." renderExpandedRow={renderPanel} />
    </>
  );
};
export default TrainingList;
