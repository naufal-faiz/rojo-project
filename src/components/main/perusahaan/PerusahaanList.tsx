"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/main/common/PageHeader";
import DataTable from "@/components/main/common/DataTable";
import ComponentCard from "@/components/main/common/ComponentCard";
import FilterBar from "@/components/main/common/FilterBar";
import FlashAlert from "@/components/main/common/FlashAlert";
import useFlash from "@/components/main/common/useFlash";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import { PlusIcon } from "@/icons/index";
import { deletePerusahaan } from "@/lib/data/action/perusahaanAction";
import PerusahaanForm from "./PerusahaanForm";
import { getPerusahaanColumns, PerusahaanRow } from "./PerusahaanColumns";
import usePerusahaanQuery from "./usePerusahaanQuery";

interface PerusahaanListProps {
  /** Halaman perusahaan aktif sesuai parameter URL. */
  initialData: PerusahaanRow[];
  pagination: { page: number; totalItems: number; totalPages: number };
}
const PerusahaanList: React.FC<PerusahaanListProps> = ({ initialData, pagination }) => {
  const router = useRouter();
  const { params, change } = usePerusahaanQuery();
  const flash = useFlash(params.get("deleted") === "1" ? { variant: "success", message: "Perusahaan dihapus." } : null);
  const [adding, setAdding] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (params.has("deleted")) {
      const next = new URLSearchParams(params.toString());
      next.delete("deleted");
      router.replace(`?${next}`, { scroll: false });
    }
  }, [params, router]);
  const remove = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await deletePerusahaan(id);
      if (result.success) { setConfirmId(null); flash.showSuccess("Perusahaan dihapus."); }
      else flash.showError(result.error ?? "Gagal menghapus perusahaan.");
    } catch { flash.showError("Gagal menghapus perusahaan."); }
    finally { setBusy(false); }
  };
  return (
    <div className="text-gray-700 dark:text-gray-300">
      <PageHeader title="Master Perusahaan" description="Kelola informasi perusahaan, cabang, PIC, dan peserta."
        primaryAction={{ label: "Tambah Perusahaan", onClick: () => setAdding(true), icon: <PlusIcon className="size-4" /> }} />
      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      {adding && <ComponentCard title="Tambah Perusahaan" className="mb-4"><PerusahaanForm flash={flash} onClose={() => setAdding(false)} /></ComponentCard>}
      <FilterBar filters={[{ key: "filter", label: "Kelengkapan data", options: [{ value: "tanpaPic", label: "Tanpa PIC" }, { value: "tanpaPeserta", label: "Tanpa peserta" }] }]} />
      <DataTable data={initialData} columns={getPerusahaanColumns(setConfirmId, busy)}
        currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.totalItems}
        searchValue={params.get("search") ?? ""} searchPlaceholder="Cari nama perusahaan..."
        onSearch={(value) => change("search", value, "page")} onPageChange={(page) => change("page", String(page), "page")}
        renderExpandedRow={(row) => confirmId === row.id ? <InlineConfirm message={`Hapus perusahaan ${row.nama}?`}
          onConfirm={() => remove(row.id)} onCancel={() => setConfirmId(null)} loading={busy} /> : null} />
    </div>
  );
};
export default PerusahaanList;
