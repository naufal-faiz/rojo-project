import { DropdownItem } from "../Dropdown/DropdownItem";
import Image from "next/image";
import { Notification } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  closeDropdown: () => void;
}

const NotificationItem = ({ notification, closeDropdown }: NotificationItemProps) => {
  const { name, action, item, type, time, avatar } = notification;

  const formatTime = (timeMs: number) => {
    const mins = Math.floor(timeMs / 60000);
    if (mins < 60) return `${mins} mnt lalu`;
    const hrs = Math.floor(mins / 60);
    return `${hrs} jam lalu`;
  };

  return (
    <li>
      <DropdownItem
        onItemClick={closeDropdown}
        className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 transition-colors"
      >
        <span className="relative block w-full h-10 rounded-full z-1 max-w-10 flex-shrink-0">
          <Image
            width={40}
            height={40}
            src={avatar || "/images/user/user-01.png"}
            alt={name}
            className="w-full h-full overflow-hidden rounded-full object-cover"
          />
          <span className="absolute bottom-0 right-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900"></span>
        </span>

        <span className="block text-left">
          <span className="mb-1.5 space-x-1 block text-theme-sm text-gray-500 dark:text-gray-400 leading-snug">
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {name}
            </span>{" "}
            <span>{action}</span>{" "}
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {item}
            </span>
          </span>

          <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
            <span className="font-medium text-brand-600 dark:text-brand-400">{type}</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>{formatTime(time)}</span>
          </span>
        </span>
      </DropdownItem>
    </li>
  );
};

export default NotificationItem;
