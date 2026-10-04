import { Notification } from "@/types/notification";

export const notificationData: Notification[] = [
  {
    id: 1,
    name: "Terry Franci",
    action: "Melakukan permintaan untuk mengubah",
    item: "Project - Rojo App",
    type: "Project",
    time: 300000, // 5 min ago in ms
    avatar: "/images/user/user-01.png",
  },
  {
    id: 2,
    name: "Alena Franci",
    action: "Melakukan permintaan untuk mengubah",
    item: "Kegiatan - Training K3",
    type: "Kegiatan",
    time: 480000, // 8 min ago in ms
    avatar: "/images/user/user-02.png",
  },
  {
    id: 3,
    name: "Jocelyn Kenter",
    action: "Menambahkan artikel baru di",
    item: "Kategori Artikel",
    type: "Artikel",
    time: 900000, // 15 min ago in ms
    avatar: "/images/user/user-01.png",
  },
  {
    id: 4,
    name: "Brandon Philips",
    action: "Memperbarui jadwal training pada",
    item: "Jadwal Training K3",
    type: "Training",
    time: 3600000, // 1 hr ago in ms
    avatar: "/images/user/user-02.png",
  },
];