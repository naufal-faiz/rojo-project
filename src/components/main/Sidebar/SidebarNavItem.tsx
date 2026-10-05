"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@/icons/index";
import { useSidebar } from "@/lib/context/SidebarContext";
import { NavigationData } from "./navigationData";

// eslint-disable-next-line react-hooks/immutability, react-compiler/react-compiler
interface SidebarNavigationDataProps {
  nav: NavigationData;
  index: number;
  menuType: "main" | "others";
  isSubmenuOpen: boolean;
  subMenuHeight: number;
  subMenuRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
  onSubmenuToggle: (index: number, menuType: "main" | "others") => void;
  isActive: (path: string) => boolean;
}

const SidebarNavigationData: React.FC<SidebarNavigationDataProps> = ({
  nav,
  index,
  menuType,
  isSubmenuOpen,
  subMenuHeight,
  subMenuRefs,
  onSubmenuToggle,
  isActive,
}) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const isFullView = isExpanded || isHovered || isMobileOpen;
  const subMenuKey = `${menuType}-${index}`;

  const setSubMenuRef = useCallback((el: HTMLDivElement | null) => {
    if (subMenuRefs.current && el) {
      subMenuRefs.current[subMenuKey] = el;
    }
  }, [subMenuKey, subMenuRefs]);

  return (
    <li>
      {nav.subItems ? (
        <button
          onClick={() => onSubmenuToggle(index, menuType)}
          className={`menu-item group cursor-pointer ${
            isSubmenuOpen ? "menu-item-active" : "menu-item-inactive"
          } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
        >
          <span className={isSubmenuOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
            {nav.icon}
          </span>
          {isFullView && <span className="menu-item-text">{nav.name}</span>}
          {isFullView && (
            <ChevronDownIcon
              className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                isSubmenuOpen ? "rotate-180 text-brand-500" : ""
              }`}
            />
          )}
        </button>
      ) : (
        nav.path && (
          <Link
            href={nav.path}
            className={`menu-item group ${
              isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
            }`}
          >
            <span className={isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}>
              {nav.icon}
            </span>
            {isFullView && <span className="menu-item-text">{nav.name}</span>}
          </Link>
        )
      )}

      {nav.subItems && isFullView && (
        <div
          ref={setSubMenuRef}
          className="overflow-hidden transition-all duration-300"
          style={{ height: isSubmenuOpen ? `${subMenuHeight}px` : "0px" }}
        >
          <ul className="mt-2 space-y-1 ml-9">
            {nav.subItems.map((subItem) => {
              const active = isActive(subItem.path);
              return (
                <li key={subItem.name}>
                  <Link
                    href={subItem.path}
                    className={`menu-dropdown-item ${active ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                  >
                    {subItem.name}
                    {(subItem.new || subItem.pro) && (
                      <span className={`ml-auto ${active ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`}>
                        {subItem.new ? "new" : "pro"}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
};

export default SidebarNavigationData;
