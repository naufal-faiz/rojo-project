import {
  CalenderIcon,
  GridIcon,
  ListIcon,
  PageIcon,
  TimeIcon,
  UserCircleIcon,
  VideoIcon,
  ShootingStarIcon,
  Certificate,
  Application,
  DocsIcon,
  UserIcon,
  Enterprise,
  Gear,
  SafetyVest,
  GroupIcon,
} from "@/icons/index";

export type NavigationData = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const dashboardNavigation: NavigationData[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
];

const navigationData: NavigationData[] = [
  {
    name: "Permohonan",
    icon: <Application />,
    path: "/permohonan",
  },
  {
    name: "Pendaftaran",
    icon: <UserCircleIcon />,
    path: "/pendaftaran",
  },
  {
    name: "Invoice",
    icon: <DocsIcon />,
    path: "/invoice"
  },
  {
    name: "Sertifikat",
    icon: <Certificate />,
    path: "/sertifikat"
  },
];

const othersItems: NavigationData[] = [
  {
    name: "Pelatihan",
    icon: <SafetyVest />,
    path: "/master/training",
  },
  {
    name: "Peserta",
    icon: <GroupIcon />,
    path: "/master/peserta",
  },
  {
    name: "Perusahaan",
    icon: <Enterprise />,
    path: "/master/perusahaan",
  },
  {
    name: "Riwayat Kegiatan",
    icon: <TimeIcon />,
    path: "/master/riwayat-kegiatan",
  },
];

export { dashboardNavigation, navigationData, othersItems };
