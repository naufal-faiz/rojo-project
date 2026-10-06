"use client";
import React, { useState } from "react";
import PageHeader from "@/components/main/common/PageHeader";
import ComponentCard from "@/components/main/common/ComponentCard";
import FlashAlert from "@/components/main/common/FlashAlert";
import useFlash from "@/components/main/common/useFlash";
import StatusBadge from "@/components/main/common/StatusBadge";
import { labelTingkatan } from "@/components/main/common/enumLabels";
import { formatDaftarSesi } from "@/components/main/common/formatTanggal";
import { PencilIcon } from "@/icons/index";
import type { getPesertaById } from "@/lib/data/get/getPeserta";
import PesertaForm from "./PesertaForm";

export type PesertaDetailData = NonNullable<Awaited<ReturnType<typeof getPesertaById>>>;

interface PesertaDetailProps {
  /** Detail peserta beserta riwayat kegiatannya. */
  data: PesertaDetailData;
}

const dataLabel = "text-gray-500 dark:text-gray-400";
const dataValue = "font-medium text-gray-800 dark:text-gray-200";

const PesertaDetail: React.FC<PesertaDetailProps> = ({ data }) => {
  const flash = useFlash();
  const [editing, setEditing] = useState(false);

  return (
    <div className="p-4 text-gray-700 dark:text-gray-300 sm:p-6">
      <PageHeader title={data.nama} backHref="/master/peserta"
        description="Detail data peserta dan riwayat kegiatan."
        primaryAction={{ label: "Ubah", icon: <PencilIcon className="size-4" />, onClick: () => setEditing(true) }} />
      <FlashAlert flash={flash.flash} onClose={flash.clear} />
      <div className="space-y-6">
        <ComponentCard title="Informasi Peserta">
          {editing ? (
            <PesertaForm editData={data} flash={flash} onClose={() => setEditing(false)} />
          ) : (
            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className={dataLabel}>Nama</dt>
                <dd className={dataValue}>{data.nama}</dd>
              </div>
              <div>
                <dt className={dataLabel}>Perusahaan</dt>
                <dd className={dataValue}>{data.cabang?.perusahaan.nama ?? "-"}</dd>
              </div>
              <div>
                <dt className={dataLabel}>Cabang</dt>
                <dd className={dataValue}>{data.cabang?.nama ?? "-"}</dd>
              </div>
            </dl>
          )}
        </ComponentCard>

        <ComponentCard title="Riwayat Kegiatan"
          desc="Kegiatan yang pernah diikuti peserta, termasuk sebagai peserta mandiri.">
          {data.pesertaPelaksanaan.length === 0 ? (
            <p className="text-sm italic text-gray-500 dark:text-gray-400">Belum ada riwayat kegiatan.</p>
          ) : (
            <div className="space-y-3">
              {data.pesertaPelaksanaan.map((item) => (
                <div key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 p-3 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {labelTingkatan(item.pelaksanaan.tingkatan)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDaftarSesi(item.pelaksanaan.sesi)} •{" "}
                      {item.pendaftaranPerusahaan?.perusahaan.nama ?? "Peserta mandiri"}
                    </p>
                  </div>
                  {item.status ? (
                    <StatusBadge status={item.status} size="sm" />
                  ) : (
                    <span className="text-xs italic text-gray-400 dark:text-gray-500">Belum ada hasil</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
};

export default PesertaDetail;
