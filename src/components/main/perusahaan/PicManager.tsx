"use client";
import React, { useState } from "react";
import ComponentCard from "@/components/main/common/ComponentCard";
import RowActions from "@/components/main/common/RowActions";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { CloseLineIcon, PlusIcon } from "@/icons/index";
import { deletePic, unlinkPic } from "@/lib/data/action/picAction";
import PicForm from "./PicForm";
import { PerusahaanPanelProps, PicData } from "./perusahaanTypes";

interface PicManagerProps extends PerusahaanPanelProps {
  /** PIC aktif yang terhubung ke perusahaan ini. */
  picList: { pic: PicData }[];
}
const PicManager: React.FC<PicManagerProps> = ({ picList, ...panel }) => {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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
  return (
    <ComponentCard title="PIC" className="lg:col-span-3">
      <Button size="sm" onClick={() => setAdding(true)} startIcon={<PlusIcon className="size-4" />}>Tambah PIC</Button>
      {adding && <PicForm {...panel} onClose={() => setAdding(false)} />}
      {!picList.length && <p>Belum ada PIC.</p>}
      {picList.map(({ pic }) => {
        const unlink = panel.confirmId === `lepas:${pic.id}`;
        const deleting = panel.confirmId === `pic:${pic.id}`;
        return <div key={pic.id} className="border-t border-gray-200 py-3 dark:border-gray-700">
          {unlink || deleting ? <InlineConfirm
            message={unlink ? `Lepas ${pic.nama} dari perusahaan ini?` : `Hapus PIC ${pic.nama}? PIC juga akan hilang dari perusahaan lain yang terhubung.`}
            confirmLabel={unlink ? "Ya, Lepas" : "Ya, Hapus"} onConfirm={() => remove(pic.id, unlink)} onCancel={() => panel.setConfirmId(null)} loading={busy} /> :
            editing === pic.id ? <PicForm {...panel} editData={pic} onClose={() => setEditing(null)} /> : <>
              <p className="font-medium">{pic.nama}</p><p className="text-sm">{pic.noTelp || "-"}</p>
              <Badge>{pic.tipe === "INTERNAL" ? "Internal" : pic.tipe === "DINAS" ? "Dinas" : "Mitra"}</Badge>
              <div className="flex items-center">
                <RowActions disabled={busy} onEdit={() => { setEditing(pic.id); panel.setConfirmId(null); }} onDelete={() => { setEditing(null); panel.setConfirmId(`pic:${pic.id}`); }} />
                <button type="button" disabled={busy} title="Lepas dari perusahaan" aria-label="Lepas dari perusahaan"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  onClick={() => { setEditing(null); panel.setConfirmId(`lepas:${pic.id}`); }}><CloseLineIcon className="size-5" /></button>
              </div>
            </>}
        </div>;
      })}
    </ComponentCard>
  );
};
export default PicManager;
