"use client";
import React, { useState } from "react";
import DataTable, { Column } from "@/components/main/common/DataTable";
import ComponentCard from "@/components/main/common/ComponentCard";
import RowActions from "@/components/main/common/RowActions";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons/index";
import { deletePerusahaanPeserta } from "@/lib/data/action/perusahaanPesertaAction";
import { CabangOption, companySelectClass, PerusahaanDetailData, PerusahaanPanelProps, PesertaData } from "./perusahaanTypes";
import PerusahaanPesertaForm from "./PerusahaanPesertaForm";
import usePerusahaanQuery from "./usePerusahaanQuery";

interface PerusahaanPesertaListProps extends PerusahaanPanelProps {
  /** Halaman peserta dan pilihan cabang aktif. */
  peserta: PerusahaanDetailData["peserta"];
  cabang: CabangOption[];
}
const PerusahaanPesertaList: React.FC<PerusahaanPesertaListProps> = ({ peserta, cabang, ...panel }) => {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { params, change } = usePerusahaanQuery();
  const remove = async (id: string) => {
    setBusy(true);
    try {
      const result = await deletePerusahaanPeserta(panel.perusahaanId, id);
      if (result.success) { panel.setConfirmId(null); panel.flash.showSuccess("Peserta dihapus."); }
      else panel.flash.showError(result.error ?? "Gagal menghapus peserta.");
    } catch { panel.flash.showError("Gagal menghapus peserta."); }
    finally { setBusy(false); }
  };
  const columns: Column<PesertaData>[] = [
    { header: "Nama", accessor: "nama" },
    { header: "Cabang", cell: (row) => row.cabang?.nama ?? "-" },
    { header: "Kegiatan", cell: (row) => row._count.pesertaPelaksanaan },
    { header: "Aksi", cell: (row) => <RowActions detailHref={`/master/peserta/${row.id}`} disabled={busy}
      onEdit={() => { setEditing(row.id); panel.setConfirmId(null); }}
      onDelete={() => { panel.setConfirmId(`peserta:${row.id}`); setEditing(null); }} /> },
  ];
  return (
    <ComponentCard title="Peserta" className="lg:col-span-7">
      <Button size="sm" onClick={() => setAdding(true)} startIcon={<PlusIcon className="size-4" />}>Tambah Peserta</Button>
      {adding && <PerusahaanPesertaForm {...panel} cabang={cabang} onClose={() => setAdding(false)} />}
      <label className="block">Filter cabang
        <select className={companySelectClass} value={params.get("cabangId") ?? ""} onChange={(e) => change("cabangId", e.target.value, "pesertaPage")}>
          <option value="">Semua cabang</option>{cabang.map((row) => <option key={row.id} value={row.id}>{row.nama}</option>)}
        </select>
      </label>
      <DataTable data={peserta.data} columns={columns} currentPage={peserta.page} totalItems={peserta.totalItems} totalPages={peserta.totalPages}
        searchValue={params.get("pesertaSearch") ?? ""} searchPlaceholder="Cari nama peserta..."
        onSearch={(value) => change("pesertaSearch", value, "pesertaPage")} onPageChange={(page) => change("pesertaPage", String(page), "pesertaPage")}
        renderExpandedRow={(row) => panel.confirmId === `peserta:${row.id}` ?
          <InlineConfirm message={`Hapus peserta ${row.nama}?`} onConfirm={() => remove(row.id)} onCancel={() => panel.setConfirmId(null)} loading={busy} /> :
          editing === row.id ? <PerusahaanPesertaForm key={row.id} {...panel} cabang={cabang} editData={row} onClose={() => setEditing(null)} /> : null} />
    </ComponentCard>
  );
};
export default PerusahaanPesertaList;
