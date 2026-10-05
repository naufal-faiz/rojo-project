import PageHeader from "@/components/main/common/PageHeader";
import ComponentCard from "@/components/main/common/ComponentCard";

export const metadata = {
  title: "Invoice | Rojo Safety Admin",
  description: "Modul invoice dan pengiriman akan tersedia setelah analisis e-billing.",
};

export default function InvoicePage() {
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Invoice"
        description="Modul invoice dan pengiriman belum dikerjakan pada fase ini."
      />

      <ComponentCard
        title="Segera Hadir"
        desc="Halaman ini masih placeholder."
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Invoice per perusahaan dan per peserta mandiri akan tersedia setelah analisis
          sheet EBILLING PEMBINAAN KEMNAKER selesai. Untuk saat ini tidak ada data invoice
          yang bisa dikelola di sini.
        </p>
      </ComponentCard>
    </div>
  );
}
