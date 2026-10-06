"use client";
import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import ComponentCard from "@/components/main/common/ComponentCard";
import FlashAlert from "@/components/main/common/FlashAlert";
import InlineConfirm from "@/components/main/common/InlineConfirm";
import useFlash from "@/components/main/common/useFlash";
import { PlusIcon } from "@/icons/index";
import { deletePendaftaran } from "@/lib/data/action/pendaftaranPerusahaanAction";
import { removePesertaPendaftaran } from "@/lib/data/action/pesertaPelaksanaanAction";
import PendaftaranForm from "./PendaftaranForm";
import PendaftaranPicForm from "./PendaftaranPicForm";
import TambahPesertaPanel from "./TambahPesertaPanel";
import PendaftaranPerusahaanItem from "./PendaftaranPerusahaanItem";
import type { PendaftaranItemData, PesertaItemData } from "./pendaftaranTypes";

interface PendaftaranPerusahaanPanelProps {
  /** Permohonan yang sedang dikelola. */
  pelaksanaanId: string;
  /** Pendaftaran perusahaan aktif. */
  pendaftaranList: PendaftaranItemData[];
}

type Aktif = { id: string; jenis: "peserta" | "pic" | "hapus" } | null;

const PendaftaranPerusahaanPanel: React.FC<PendaftaranPerusahaanPanelProps> = ({ pelaksanaanId, pendaftaranList }) => {
  const flash = useFlash();
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aktif, setAktif] = useState<Aktif>(null);
  const [removeTarget, setRemoveTarget] = useState<PesertaItemData | null>(null);
  const [busy, setBusy] = useState(false);

  const fokus = (id: string, jenis: "peserta" | "pic" | "hapus") => {
    setExpandedId(id);
    setAktif({ id, jenis });
    setRemoveTarget(null);
  };

  const toggle = (id: string) => {
    setAktif(null);
    setRemoveTarget(null);
    setExpandedId((current) => (current === id ? null : id));
  };

  const hapusPendaftaran = async (id: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await deletePendaftaran(id);
      if (result.success) { setAktif(null); flash.showSuccess("Pendaftaran perusahaan dihapus."); }
      else flash.showError(result.error ?? "Gagal menghapus pendaftaran.");
    } catch { flash.showError("Gagal menghapus pendaftaran."); }
    finally { setBusy(false); }
  };

  const hapusPeserta = async () => {
    if (!removeTarget || busy) return;
    setBusy(true);
    try {
      const result = await removePesertaPendaftaran(removeTarget.id);
      if (result.success) { setRemoveTarget(null); flash.showSuccess("Peserta dihapus dari pendaftaran."); }
      else flash.showError(result.error ?? "Gagal menghapus peserta.");
    } catch { flash.showError("Gagal menghapus peserta."); }
    finally { setBusy(false); }
  };

  const panel = (item: PendaftaranItemData) => {
    if (aktif?.id !== item.id) return null;
    if (aktif.jenis === "peserta") return (
      <TambahPesertaPanel key={`peserta-${item.id}`} pelaksanaanId={pelaksanaanId}
        pendaftaranPerusahaanId={item.id} perusahaanId={item.perusahaan.id} flash={flash}
        onClose={() => setAktif(null)} />
    );
    if (aktif.jenis === "pic") return (
      <PendaftaranPicForm key={`pic-${item.id}`} pendaftaranId={item.id} perusahaanId={item.perusahaan.id}
        picId={item.pic?.id ?? null} flash={flash} onClose={() => setAktif(null)} />
    );
    return (
      <InlineConfirm message={`Hapus pendaftaran ${item.perusahaan.nama}? Pendaftaran hanya bisa dihapus bila tidak ada peserta aktif.`}
        onConfirm={() => hapusPendaftaran(item.id)} onCancel={() => setAktif(null)} loading={busy} />
    );
  };

  return (
    <ComponentCard title="Pendaftaran Perusahaan"
      desc="Satu pendaftaran per perusahaan, dengan PIC penerima sertifikat opsional.">
      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setAdding(true); setAktif(null); }}
          startIcon={<PlusIcon className="size-4" />}>Tambah Pendaftaran</Button>
      </div>
      {adding && <PendaftaranForm pelaksanaanId={pelaksanaanId} flash={flash} onClose={() => setAdding(false)} />}
      {pendaftaranList.length === 0 ? (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">Belum ada perusahaan yang mendaftar.</p>
      ) : (
        <div className="space-y-3">
          {pendaftaranList.map((item) => (
            <PendaftaranPerusahaanItem key={item.id} pendaftaran={item}
              expanded={expandedId === item.id || aktif?.id === item.id}
              onToggle={() => toggle(item.id)}
              onAddPeserta={() => fokus(item.id, "peserta")}
              onEditPic={() => fokus(item.id, "pic")}
              onDelete={() => fokus(item.id, "hapus")}
              confirmPesertaId={removeTarget?.id ?? null}
              removing={busy}
              onRemovePeserta={(peserta) => { setRemoveTarget(peserta); setAktif(null); }}
              onConfirmRemove={hapusPeserta}
              onCancelRemove={() => setRemoveTarget(null)}>
              {panel(item)}
            </PendaftaranPerusahaanItem>
          ))}
        </div>
      )}
    </ComponentCard>
  );
};

export default PendaftaranPerusahaanPanel;
