import { GridIcon, TimeIcon, UserCircleIcon, Application, SafetyHelmet, GroupIcon } from "@/icons/index";

export type NavigationData = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

const dashboardNavigation: NavigationData[] = [{ icon: <GridIcon />, name: "Dashboard", path: "/" }];

const navigationData: NavigationData[] = [
  {
    name: "Permohonan",
    icon: <UserCircleIcon />,
    subItems: [
      { name: "Pendaftaran", path: "/pendaftaran" },
      { name: "Antrean", path: "/antrean" },
      { name: "Daftar Permohonan", path: "/permohonan" },
    ],
  },
];

const othersItems: NavigationData[] = [
  { name: "Pelatihan", icon: <SafetyHelmet />, path: "/master/training" },
  { name: "Peserta", icon: <GroupIcon />, path: "/master/peserta" },
  { name: "Riwayat Kegiatan", icon: <TimeIcon />, path: "/master/riwayat-kegiatan" },
];

export { dashboardNavigation, navigationData, othersItems };
