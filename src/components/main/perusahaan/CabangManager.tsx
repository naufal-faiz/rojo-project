"use client";
import React, { useState } from "react";
import ComponentCard from "@/components/main/common/ComponentCard";
import RowActions from "@/components/main/common/RowActions";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import Input from "@/components/form/input/InputField";
import Pagination from "@/components/main/tables/Pagination";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { PlusIcon } from "@/icons/index";
import { deleteCabang } from "@/lib/data/action/cabangAction";
import { companySelectClass, PerusahaanDetailData, PerusahaanPanelProps } from "./perusahaanTypes";
import CabangForm from "./CabangForm";
import usePerusahaanQuery from "./usePerusahaanQuery";

interface CabangManagerProps extends PerusahaanPanelProps {
  /** Halaman cabang hasil filter server dan total sebelum filter. */
  cabang: PerusahaanDetailData["cabang"];
  totalCabang: number;
}
const CabangManager: React.FC<CabangManagerProps> = ({ cabang, totalCabang, ...panel }) => {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { params, change } = usePerusahaanQuery();
  const searchValue = params.get("cabangSearch") ?? "";
  const [search, setSearch] = useState(searchValue);
  const [previousSearch, setPreviousSearch] = useState(searchValue);
  if (previousSearch !== searchValue) {
    setPreviousSearch(searchValue);
    setSearch(searchValue);
  }
  const remove = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await deleteCabang(id);
      if (result.success) { panel.setConfirmId(null); panel.flash.showSuccess("Cabang dihapus."); }
      else panel.flash.showError(result.error ?? "Gagal menghapus cabang.");
    } catch { panel.flash.showError("Gagal menghapus cabang."); }
    finally { setBusy(false); }
  };
  return (
    <ComponentCard title="Cabang" className="lg:col-span-2">
      <Button size="sm" onClick={() => setAdding(true)} startIcon={<PlusIcon className="size-4" />}>Tambah Cabang</Button>
      {adding && <CabangForm {...panel} onClose={() => setAdding(false)} />}
      {(totalCabang > 5 || params.get("cabangSearch")) && <label className="block">Cari cabang
        <Input value={search} onChange={(e) => { setSearch(e.target.value); change("cabangSearch", e.target.value, "cabangPage"); }} placeholder="Nama cabang..." />
      </label>}
      <label className="block">Filter tipe<select className={companySelectClass} value={params.get("tipeCabang") ?? ""} onChange={(e) => change("tipeCabang", e.target.value, "cabangPage")}>
        <option value="">Semua</option><option value="HQ">HQ</option><option value="CABANG">Cabang</option><option value="DEPOT">Depot</option>
      </select></label>
      {!cabang.data.length && <p>Tidak ada cabang yang sesuai.</p>}
      {cabang.data.map((row) => <div key={row.id} className="border-t border-gray-200 py-3 dark:border-gray-700">
        {panel.confirmId === `cabang:${row.id}` ? <InlineConfirm message={`Hapus cabang ${row.nama}?`} onConfirm={() => remove(row.id)} onCancel={() => panel.setConfirmId(null)} loading={busy} /> :
          editing === row.id ? <CabangForm {...panel} editData={row} onClose={() => setEditing(null)} /> : <>
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium">{row.nama}</span><Badge>{row.tipe === "HQ" ? "HQ" : row.tipe === "CABANG" ? "Cabang" : "Depot"}</Badge></div>
            <p className="text-sm">{row.alamat || "-"}</p>
            <RowActions disabled={busy} onEdit={() => { setEditing(row.id); panel.setConfirmId(null); }}
              onDelete={row.tipe === "HQ" ? undefined : () => { setEditing(null); panel.setConfirmId(`cabang:${row.id}`); }} />
          </>}
      </div>)}
      {cabang.totalPages > 1 && <Pagination currentPage={cabang.page} totalPages={cabang.totalPages} onPageChange={(page) => change("cabangPage", String(page), "cabangPage")} />}
    </ComponentCard>
  );
};
export default CabangManager;
