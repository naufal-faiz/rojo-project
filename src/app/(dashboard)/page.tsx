import Image from "next/image";
import Link from "next/link";

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Total Training",
      value: "24",
      change: "+12%",
      isPositive: true,
      description: "Program aktif",
    },
    {
      title: "Pendaftaran Baru",
      value: "158",
      change: "+28%",
      isPositive: true,
      description: "Bulan ini",
    },
    {
      title: "Artikel Diterbitkan",
      value: "42",
      change: "+5%",
      isPositive: true,
      description: "Edukasi K3",
    },
    {
      title: "Peserta Lulus",
      value: "1,240",
      change: "+18%",
      isPositive: true,
      description: "Sertifikasi resmi",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="relative flex-shrink-0 w-20 h-20 overflow-hidden border-2 border-brand-500/20 rounded-full dark:border-brand-500/40">
              <Image
                width={80}
                height={80}
                src="/images/user/user-01.png"
                alt="user"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  Selamat Datang, Admin Rojo Safety 🖐️
                </h3>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Kelola jadwal training K3, pendaftaran peserta, serta publikasi artikel edukasi kesehatan dan keselamatan kerja.
              </p>
            </div>
          </div>
          <Link
            href="/admin/training/jadwal"
            className="flex-shrink-0 px-4 py-2.5 text-xs font-semibold text-white bg-brand-500 rounded-xl hover:bg-brand-600 transition-colors shadow-theme-xs"
          >
            + Tambah Jadwal Training
          </Link>
        </div>
      </div>

      {/* Summary Statistics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 bg-white border border-gray-200 rounded-2xl shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 transition-all hover:shadow-theme-md"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {stat.title}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  stat.isPositive
                    ? "bg-success-50 text-success-700 dark:bg-success-950/50 dark:text-success-400"
                    : "bg-error-50 text-error-700 dark:bg-error-950/50 dark:text-error-400"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Quick Overview Card */}
        <div className="col-span-12 p-6 bg-white border border-gray-200 rounded-2xl shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 xl:col-span-7">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white">
              Jadwal Training K3 Mendatang
            </h4>
            <Link
              href="/admin/training/jadwal"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {[
              {
                title: "Training K3 Umum Sertifikasi Kemnaker RI",
                date: "12 - 24 Oktober 2026",
                quota: "20 / 30 Peserta",
                status: "Aktif",
              },
              {
                title: "Pelatihan Ahli K3 Konstruksi Muda",
                date: "01 - 05 November 2026",
                quota: "15 / 25 Peserta",
                status: "Aktif",
              },
              {
                title: "Training Petugas Pemadam Kebakaran Class D",
                date: "18 - 20 November 2026",
                quota: "8 / 20 Peserta",
                status: "Pendaftaran Buka",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 dark:border-gray-800/60 dark:bg-gray-800/40 gap-2"
              >
                <div>
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {item.title}
                  </h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.date} • {item.quota}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 self-start sm:self-center">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="col-span-12 p-6 bg-white border border-gray-200 rounded-2xl shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 xl:col-span-5">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
            <h4 className="text-base font-semibold text-gray-800 dark:text-white">
              Aktivitas Pendaftaran Terbaru
            </h4>
          </div>
          <ul className="space-y-4">
            {[
              {
                name: "PT Mitra Sejahtera K3",
                action: "Mendaftarkan 5 peserta untuk Training K3 Umum",
                time: "10 menit yang lalu",
              },
              {
                name: "Rian Hidayat",
                action: "Mengunggah berkas sertifikasi K3 Konstruksi",
                time: "45 menit yang lalu",
              },
              {
                name: "PT Nusantara Karya",
                action: "Melakukan konfirmasi pembayaran pelatihan",
                time: "2 jam yang lalu",
              },
            ].map((activity, idx) => (
              <li key={idx} className="flex gap-3 text-xs">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {activity.name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {activity.action}
                  </p>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    {activity.time}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
