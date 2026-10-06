import PermohonanForm from "@/components/main/permohonan/PermohonanForm";

export const metadata = { title: "Buat Permohonan | Rojo Safety Admin" };

export default function PermohonanBaruPage() {
  return (
    <div className="p-4 sm:p-6">
      <PermohonanForm />
    </div>
  );
}
