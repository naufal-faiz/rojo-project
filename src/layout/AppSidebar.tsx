"use client";

import React from "react";
import { useSidebar } from "@/lib/context/SidebarContext";
import { HorizontaLDots } from "@/icons/index";
import { dashboardNavigation ,navigationData, othersItems } from "../components/main/Sidebar/navigationData";
import { useSidebarSubmenu } from "../components/main/Sidebar/useSidebarSubmenu";
import SidebarNavList from "../components/main/Sidebar/SidebarNavList";
import SidebarLogo from "../components/main/Sidebar/SidebarLogo";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const {
    openSubmenu,
    subMenuHeight,
    registerSubmenu,
    handleSubmenuToggle,
    isActive,
  } = useSidebarSubmenu();

  const isFullView = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isFullView ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <SidebarLogo />

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
              <SidebarNavList
                items={dashboardNavigation}
                menuType="main"
                openSubmenu={openSubmenu}
                subMenuHeight={subMenuHeight}
                registerSubmenu={registerSubmenu}
                onSubmenuToggle={handleSubmenuToggle}
                isActive={isActive}
              />
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isFullView ? "Kegiatan" : <HorizontaLDots />}
              </h2>
              <SidebarNavList
                items={navigationData}
                menuType="main"
                openSubmenu={openSubmenu}
                subMenuHeight={subMenuHeight}
                registerSubmenu={registerSubmenu}
                onSubmenuToggle={handleSubmenuToggle}
                isActive={isActive}
              />
            </div>

            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isFullView ? "Master Data" : <HorizontaLDots />}
              </h2>
              <SidebarNavList
                items={othersItems}
                menuType="others"
                openSubmenu={openSubmenu}
                subMenuHeight={subMenuHeight}
                registerSubmenu={registerSubmenu}
                onSubmenuToggle={handleSubmenuToggle}
                isActive={isActive}
              />
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
