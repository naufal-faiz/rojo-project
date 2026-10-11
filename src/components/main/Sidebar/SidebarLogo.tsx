"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSidebar } from "@/lib/context/SidebarContext";

const SidebarLogo: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const isFullView = isExpanded || isHovered || isMobileOpen;

  return (
    <div className="flex h-14 items-center justify-start lg:-mx-3 lg:h-[57px] lg:border-b lg:border-gray-200 lg:px-3 dark:lg:border-gray-800">
      <Link href="/admin" className="hidden lg:block">
        {isFullView ? (
          <>
            <Image
              className="dark:hidden"
              src="/images/logo/logo-banner.png"
              alt="Logo"
              width={168}
              height={34}
            />
            <Image
              className="hidden dark:block"
              src="/images/logo/logo-banner-dark.png"
              alt="Logo"
              width={168}
              height={34}
            />
          </>
        ) : (
          <Image
            src="/images/logo/logo-image.png"
            alt="Logo"
            width={36}
            height={36}
          />
        )}
      </Link>
    </div>
  );
};

export default SidebarLogo;
