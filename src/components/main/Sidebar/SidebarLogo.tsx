"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSidebar } from "@/lib/context/SidebarContext";

const SidebarLogo: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const isFullView = isExpanded || isHovered || isMobileOpen;

  return (
    <div className="py-3 flex justify-start lg:py-8">
      <Link href="/admin" className="hidden lg:block">
        {isFullView ? (
          <>
            <Image
              className="dark:hidden"
              src="/images/logo/logo-banner.png"
              alt="Logo"
              width={200}
              height={40}
            />
            <Image
              className="hidden dark:block"
              src="/images/logo/logo-banner-dark.png"
              alt="Logo"
              width={200}
              height={40}
            />
          </>
        ) : (
          <Image
            src="/images/logo/logo-image.png"
            alt="Logo"
            width={50}
            height={50}
          />
        )}
      </Link>
    </div>
  );
};

export default SidebarLogo;
