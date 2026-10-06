"use client";
import React, { useState } from "react";
import DataTable, { Column } from "@/components/main/common/DataTable";
import ComponentCard from "@/components/main/common/ComponentCard";
import RowActions from "@/components/main/common/RowActions";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { PlusIcon } from "@/icons/index";
import { TipeCabang } from "@/lib/generated/prisma/enums";
import { deleteCabang } from "@/lib/data/action/cabangAction";
import { CabangData, companySelectClass, PerusahaanDetailData, PerusahaanPanelProps } from "./perusahaanTypes";
import CabangForm from "./CabangForm";
import usePerusahaanQuery from "./usePerusahaanQuery";

interface CabangManagerProps extends PerusahaanPanelProps {
  /** Halaman cabang hasil filter server. */
  cabang: PerusahaanDetailData["cabang"];
}

const tipeLabel = (tipe: TipeCabang) =>
  tipe === TipeCabang.HQ ? "HQ" : tipe === TipeCabang.CABANG ? "Cabang" : "Depot";

const CabangManager: React.FC<CabangManagerProps> = ({ cabang, ...panel }) => {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { params, change } = usePerusahaanQuery();

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

  const columns: Column<CabangData>[] = [
    { header: "Nama", accessor: "nama" },
    { header: "Tipe", cell: (row) => <Badge>{tipeLabel(row.tipe)}</Badge> },
    { header: "Alamat", cell: (row) => row.alamat || "-" },
    {
      header: "Aksi",
      cell: (row) => (
        <RowActions disabled={busy}
          onEdit={() => { setEditing(row.id); panel.setConfirmId(null); }}
          onDelete={row.tipe === TipeCabang.HQ ? undefined : () => { setEditing(null); panel.setConfirmId(`cabang:${row.id}`); }} />
      ),
    },
  ];

  return (
    <ComponentCard title="Cabang" className="lg:col-span-2">
      <Button size="sm" onClick={() => setAdding(true)} startIcon={<PlusIcon className="size-4" />}>Tambah Cabang</Button>
      {adding && <CabangForm {...panel} onClose={() => setAdding(false)} />}
      <label className="block">Filter tipe
        <select className={companySelectClass} value={params.get("tipeCabang") ?? ""} onChange={(event) => change("tipeCabang", event.target.value, "cabangPage")}>
          <option value="">Semua</option><option value="HQ">HQ</option><option value="CABANG">Cabang</option><option value="DEPOT">Depot</option>
        </select>
      </label>
      <DataTable data={cabang.data} columns={columns}
        currentPage={cabang.page} totalPages={cabang.totalPages} totalItems={cabang.totalItems}
        searchValue={params.get("cabangSearch") ?? ""} searchPlaceholder="Cari nama cabang..."
        onSearch={(value) => change("cabangSearch", value, "cabangPage")}
        onPageChange={(page) => change("cabangPage", String(page), "cabangPage")}
        emptyText="Tidak ada cabang yang sesuai."
        renderExpandedRow={(row) => panel.confirmId === `cabang:${row.id}`
          ? <InlineConfirm message={`Hapus cabang ${row.nama}?`} onConfirm={() => remove(row.id)} onCancel={() => panel.setConfirmId(null)} loading={busy} />
          : editing === row.id
            ? <CabangForm key={row.id} {...panel} editData={row} onClose={() => setEditing(null)} />
            : null} />
    </ComponentCard>
  );
};

export default CabangManager;
