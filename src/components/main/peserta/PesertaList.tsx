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
import SearchableSelect, { SearchOption } from "@/components/main/common/SearchableSelect";
import { PlusIcon } from "@/icons/index";
import { searchPerusahaanOptions } from "@/lib/data/action/searchOptionsAction";
import { deletePeserta } from "@/lib/data/action/pesertaAction";
import PesertaForm from "./PesertaForm";
import { getPesertaColumns, PesertaRow } from "./PesertaColumns";
import usePesertaQuery from "./usePesertaQuery";

interface PesertaListProps {
  /** Halaman peserta aktif sesuai parameter URL. */
  initialData: PesertaRow[];
  pagination: { page: number; totalItems: number; totalPages: number };
  /** Perusahaan yang sedang menjadi filter, bila ada. */
  filterPerusahaan: SearchOption | null;
}

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300";

const PesertaList: React.FC<PesertaListProps> = ({ initialData, pagination, filterPerusahaan }) => {
  const router = useRouter();
  const { params, navigate } = usePesertaQuery();
  const flash = useFlash(params.get("deleted") === "1" ? { variant: "success", message: "Peserta dihapus." } : null);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
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
      const result = await deletePeserta(id);
      if (result.success) { setConfirmId(null); flash.showSuccess("Peserta dihapus."); }
      else flash.showError(result.error ?? "Gagal menghapus peserta.");
    } catch { flash.showError("Gagal menghapus peserta."); }
    finally { setBusy(false); }
  };

  const columns = getPesertaColumns(
    (id) => { setEditId(id); setConfirmId(null); },
    (id) => { setConfirmId(id); setEditId(null); },
    busy,
  );

  return (
    <div className="text-gray-700 dark:text-gray-300">
      <PageHeader title="Master Peserta" description="Kelola data peserta, dengan atau tanpa perusahaan."
        primaryAction={{ label: "Tambah Peserta", onClick: () => setAdding(true), icon: <PlusIcon className="size-4" /> }} />
      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      {adding && <ComponentCard title="Tambah Peserta" className="mb-4"><PesertaForm flash={flash} onClose={() => setAdding(false)} /></ComponentCard>}
      <FilterBar filters={[]}>
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          <span className="mb-1 block">Perusahaan</span>
          <SearchableSelect search={searchPerusahaanOptions} value={filterPerusahaan}
            onChange={(value) => {
              const option = Array.isArray(value) ? value[0] ?? null : value;
              navigate([["perusahaan", option?.id ?? null], ["filter", null]]);
            }} placeholder="Cari perusahaan..." />
        </label>
        <label className="block text-sm text-gray-700 dark:text-gray-300">
          <span className="mb-1 block">Kelengkapan data</span>
          <select value={params.get("filter") ?? ""} className={selectClass}
            onChange={(event) => navigate([["filter", event.target.value || null], ["perusahaan", null]])}>
            <option value="">Semua</option>
            <option value="tanpaPerusahaan">Tanpa perusahaan</option>
          </select>
        </label>
      </FilterBar>
      <DataTable data={initialData} columns={columns}
        currentPage={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.totalItems}
        searchValue={params.get("search") ?? ""} searchPlaceholder="Cari nama peserta..."
        onSearch={(value) => navigate([["search", value]])}
        onPageChange={(page) => navigate([["page", String(page)]])}
        renderExpandedRow={(row) => confirmId === row.id
          ? <InlineConfirm message={`Hapus peserta ${row.nama}? Peserta hanya bisa dihapus bila tidak ada pendaftaran aktif.`}
              onConfirm={() => remove(row.id)} onCancel={() => setConfirmId(null)} loading={busy} />
          : editId === row.id
            ? <PesertaForm key={row.id} editData={row} flash={flash} onClose={() => setEditId(null)} />
            : null} />
    </div>
  );
};

export default PesertaList;
