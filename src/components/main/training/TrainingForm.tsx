"use client";
import React, { useId, useRef, useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { CheckLineIcon, CloseLineIcon } from "@/icons/index";
import { createTraining, updateTraining } from "@/lib/data/action/trainingAction";

interface TrainingFormProps {
  /** Data awal untuk mode ubah. */
  editData?: { id: string; nama: string };
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const TrainingForm: React.FC<TrainingFormProps> = ({ editData, onClose, onSuccess, onError }) => {
  const id = useId();
  const [nama, setNama] = useState(editData?.nama ?? "");
  const [kelas, setKelas] = useState("");
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const result = editData ? await updateTraining(editData.id, nama) : await createTraining(nama, kelas);
      if (!result.success) {
        onError(result.error ?? "Gagal menyimpan pelatihan.");
        return;
      }
      onSuccess(editData ? "Pelatihan diperbarui." : "Pelatihan ditambahkan.");
      if (editData) onClose();
      else {
        setNama("");
        setKelas("");
        input.current?.focus();
      }
    } catch {
      onError("Gagal menyimpan pelatihan.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4" aria-busy={loading}>
      <div>
        <Label htmlFor={`${id}-nama`}>Nama pelatihan</Label>
        <Input id={`${id}-nama`} inputRef={input} autoFocus required value={nama}
          onChange={(event) => setNama(event.target.value)} />
      </div>
      {!editData && (
        <div>
          <Label htmlFor={`${id}-kelas`}>Tingkatan awal (opsional)</Label>
          <Input id={`${id}-kelas`} value={kelas} onChange={(event) => setKelas(event.target.value)}
            placeholder="Kosongkan bila tanpa tingkatan" />
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" isLoading={loading} startIcon={<CheckLineIcon className="size-4" />}>Simpan</Button>
        <Button size="sm" variant="outline" onClick={onClose} disabled={loading} startIcon={<CloseLineIcon className="size-4" />}>Batal</Button>
      </div>
    </form>
  );
};
export default TrainingForm;
