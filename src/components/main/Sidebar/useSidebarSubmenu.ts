/* eslint-disable react-hooks/set-state-in-effect */
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

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    const sections: Array<{ type: "main" | "others"; items: typeof navigationData }> = [
      { type: "main", items: navigationData },
      { type: "others", items: othersItems },
    ];

    sections.forEach(({ items }) => {
      items.forEach((nav) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched && openSubmenu !== null) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, openSubmenu]);

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
      prev && prev.type === menuType && prev.index === index
        ? null
        : { type: menuType, index }
    );
  };

  const registerSubmenu = useCallback((key: string, element: HTMLDivElement | null) => {
    subMenuRefs.current[key] = element;
  }, []);

  return {
    openSubmenu,
    subMenuHeight,
    registerSubmenu,
    handleSubmenuToggle,
    isActive,
  };
}
