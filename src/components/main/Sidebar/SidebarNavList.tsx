"use client";

import React from "react";
import { NavigationData } from "./navigationData";
import SidebarNavItem from "./SidebarNavItem";

interface SidebarNavListProps {
  items: NavigationData[];
  menuType: "main" | "others";
  openSubmenu: { type: "main" | "others"; index: number } | null;
  subMenuHeight: Record<string, number>;
  subMenuRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
  onSubmenuToggle: (index: number, menuType: "main" | "others") => void;
  isActive: (path: string) => boolean;
}

const SidebarNavList: React.FC<SidebarNavListProps> = ({
  items,
  menuType,
  openSubmenu,
  subMenuHeight,
  subMenuRefs,
  onSubmenuToggle,
  isActive,
}) => {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const isSubmenuOpen =
          openSubmenu?.type === menuType && openSubmenu?.index === index;
        const subMenuKey = `${menuType}-${index}`;

        return (
          <SidebarNavItem
            key={nav.name}
            nav={nav}
            index={index}
            menuType={menuType}
            isSubmenuOpen={isSubmenuOpen}
            subMenuHeight={subMenuHeight[subMenuKey] || 0}
            subMenuRefs={subMenuRefs}
            onSubmenuToggle={onSubmenuToggle}
            isActive={isActive}
          />
        );
      })}
    </ul>
  );
};

export default SidebarNavList;
