"use client";
import React, { useState } from "react";
import DataTable, { Column } from "@/components/main/common/DataTable";
import ComponentCard from "@/components/main/common/ComponentCard";
import RowActions from "@/components/main/common/RowActions";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { CloseLineIcon, PlusIcon } from "@/icons/index";
import { TipePic } from "@/lib/generated/prisma/enums";
import { deletePic, unlinkPic } from "@/lib/data/action/picAction";
import PicForm from "./PicForm";
import usePerusahaanQuery from "./usePerusahaanQuery";
import { PerusahaanDetailData, PerusahaanPanelProps, PicRow } from "./perusahaanTypes";

interface PicManagerProps extends PerusahaanPanelProps {
  /** Halaman PIC hasil pencarian server. */
  pic: PerusahaanDetailData["pic"];
}

const tipeLabel = (tipe: TipePic) =>
  tipe === TipePic.INTERNAL ? "Internal" : tipe === TipePic.DINAS ? "Dinas" : "Mitra";

const PicManager: React.FC<PicManagerProps> = ({ pic, ...panel }) => {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { params, change } = usePerusahaanQuery();

  const remove = async (id: string, unlink: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = unlink ? await unlinkPic(panel.perusahaanId, id) : await deletePic(id);
      if (result.success) { panel.setConfirmId(null); panel.flash.showSuccess(unlink ? "PIC dilepas dari perusahaan." : "PIC dihapus."); }
      else panel.flash.showError(result.error ?? "Gagal menghapus PIC.");
    } catch { panel.flash.showError("Gagal menyimpan perubahan PIC."); }
    finally { setBusy(false); }
  };

  const columns: Column<PicRow>[] = [
    { header: "Nama", cell: (row) => row.pic.nama },
    { header: "Telepon", cell: (row) => row.pic.noTelp || "-" },
    { header: "Tipe", cell: (row) => <Badge>{tipeLabel(row.pic.tipe)}</Badge> },
    {
      header: "Aksi",
      cell: (row) => (
        <div className="flex items-center">
          <RowActions disabled={busy}
            onEdit={() => { setEditing(row.pic.id); panel.setConfirmId(null); }}
            onDelete={() => { setEditing(null); panel.setConfirmId(`pic:${row.pic.id}`); }} />
          <button type="button" disabled={busy} title="Lepas dari perusahaan" aria-label="Lepas dari perusahaan"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
            onClick={() => { setEditing(null); panel.setConfirmId(`lepas:${row.pic.id}`); }}>
            <CloseLineIcon className="size-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ComponentCard title="PIC" className="lg:col-span-3">
      <Button size="sm" onClick={() => setAdding(true)} startIcon={<PlusIcon className="size-4" />}>Tambah PIC</Button>
      {adding && <PicForm {...panel} onClose={() => setAdding(false)} />}
      <DataTable data={pic.data} columns={columns}
        currentPage={pic.page} totalPages={pic.totalPages} totalItems={pic.totalItems}
        searchValue={params.get("picSearch") ?? ""} searchPlaceholder="Cari nama PIC..."
        onSearch={(value) => change("picSearch", value, "picPage")}
        onPageChange={(page) => change("picPage", String(page), "picPage")}
        emptyText="Belum ada PIC."
        renderExpandedRow={(row) => {
          const unlink = panel.confirmId === `lepas:${row.pic.id}`;
          const deleting = panel.confirmId === `pic:${row.pic.id}`;
          if (unlink || deleting) return <InlineConfirm
            message={unlink ? `Lepas ${row.pic.nama} dari perusahaan ini?` : `Hapus PIC ${row.pic.nama}? PIC juga akan hilang dari perusahaan lain yang terhubung.`}
            confirmLabel={unlink ? "Ya, Lepas" : "Ya, Hapus"} onConfirm={() => remove(row.pic.id, unlink)}
            onCancel={() => panel.setConfirmId(null)} loading={busy} />;
          if (editing === row.pic.id) return <PicForm key={row.pic.id} {...panel} editData={row.pic} onClose={() => setEditing(null)} />;
          return null;
        }} />
    </ComponentCard>
  );
};

export default PicManager;
