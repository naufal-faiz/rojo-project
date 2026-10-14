import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { navigationData, othersItems } from "./navigationData";

export function useSidebarSubmenu() {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const registerSubMenuRef = useCallback((key: string, el: HTMLDivElement | null) => {
    subMenuRefs.current[key] = el;
  }, []);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Buka submenu yang cocok dengan halaman aktif hanya saat pindah halaman. Jangan menutup submenu yang dibuka manual.
  useEffect(() => {
    const sections = [
      { type: "main" as const, items: navigationData },
      { type: "others" as const, items: othersItems },
    ];
    sections.forEach(({ type, items }) =>
      items.forEach((nav, index) => {
        if (nav.subItems?.some((sub) => isActive(sub.path))) setOpenSubmenu({ type, index });
      }),
    );
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) =>
      prev && prev.type === menuType && prev.index === index ? null : { type: menuType, index },
    );
  };

  return {
    openSubmenu,
    subMenuHeight,
    registerSubMenuRef,
    handleSubmenuToggle,
    isActive,
  };
}
