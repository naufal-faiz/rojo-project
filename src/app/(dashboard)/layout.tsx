"use client";

import { useSidebar } from "@/lib/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    // Dynamic class for main content margin based on sidebar state
    const mainContentMargin = isMobileOpen
        ? "ml-0"
        : isExpanded || isHovered
            ? "lg:ml-[290px]"
            : "lg:ml-[90px]";

    return (
        <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            {/* Sidebar and Backdrop */}
            <AppSidebar />
            <Backdrop />
            {/* Main Content Area */}
            <div
                className={`flex-1 min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
                {/* Header */}
                <AppHeader />
                {/* Page Content */}
                <main className="flex-1 p-4 mx-auto w-full max-w-(--breakpoint-2xl) md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
