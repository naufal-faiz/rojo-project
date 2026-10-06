"use client";
import React, { useId, useRef, useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { CheckLineIcon, CloseLineIcon, PlusIcon } from "@/icons/index";
import { createTingkatan, updateTingkatan } from "@/lib/data/action/trainingAction";

interface TingkatanFormProps {
  /** Parent aktif yang memiliki tingkatan. */
  trainingId: string;
  editData?: { id: string; kelas: string };
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const TingkatanForm: React.FC<TingkatanFormProps> = ({ trainingId, editData, onClose, onSuccess, onError }) => {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [kelas, setKelas] = useState(editData?.kelas ?? "");
  const [busy, setBusy] = useState(false);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const result = editData ? await updateTingkatan(editData.id, kelas) : await createTingkatan(trainingId, kelas);
      if (!result.success) {
        onError(result.error ?? "Gagal menyimpan tingkatan.");
        return;
      }
      onSuccess("Tingkatan disimpan.");
      if (editData) onClose();
      else {
        setKelas("");
        input.current?.focus();
      }
    } catch {
      onError("Gagal menyimpan tingkatan.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={save} className="space-y-3" aria-busy={busy}>
      <Label htmlFor={id}>{editData ? "Ubah tingkatan" : "Tingkatan baru"}</Label>
      <Input id={id} inputRef={input} autoFocus required value={kelas} onChange={(event) => setKelas(event.target.value)} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" isLoading={busy}
          startIcon={editData ? <CheckLineIcon className="size-4" /> : <PlusIcon className="size-4" />}>
          {editData ? "Simpan" : "Tambah Tingkatan"}
        </Button>
        {editData && <Button size="sm" variant="outline" onClick={onClose} disabled={busy}
          startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>}
      </div>
    </form>
  );
};
export default TingkatanForm;
