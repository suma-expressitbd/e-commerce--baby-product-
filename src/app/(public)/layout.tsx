"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/hooks/useSidebar";
import { sidebarRef } from "@/lib/refs";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PublicLayoutProps {
  children: React.ReactNode;
  hideHeaderOnMobile?: boolean;
  hideFooter?: boolean;
}

export default function PublicLayout({
  children,
  hideHeaderOnMobile = false,
  hideFooter = false,
}: PublicLayoutProps) {
  const pathname = usePathname();
  const { isSidebarOpen, isDesktop } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fallback for SSR
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const transitionConfig = {
    ease: "easeInOut", // Changed to string
    duration: 0.3,
  };

  // Check for specific pages
  const isProductDetailPage = pathname?.startsWith("/product/");
  const isCheckOutPage = pathname?.startsWith("/checkout");
  const isAuthPage = pathname?.startsWith("/auth");
  const isShopPage = pathname?.startsWith("/products");

  // Determine if header should be hidden
  const shouldHideHeader = (hideHeaderOnMobile || isProductDetailPage || isCheckOutPage) && isMobile;

  // Determine if footer should be hidden
  const shouldHideFooter = (hideFooter || isCheckOutPage || isAuthPage || isShopPage || isProductDetailPage);

  if (!mounted) return null;

  return (
    <div className="relative min-h-dvh bg-white dark:bg-gray-800 flex flex-col">
      {/* Mobile sidebar */}
      {isMobile && (
        <motion.div
          ref={sidebarRef}
          initial={{ x: "-100%" }}
          animate={{ x: isSidebarOpen ? 0 : "-100%" }}
          transition={transitionConfig}
          className="fixed inset-0 left-0 z-[40] bg-transparent"
        >
        </motion.div>
      )}

      {/* Header - will show on desktop (lg and up) for all pages */}
      {!shouldHideHeader && (
        <header className="fixed top-0 left-0 right-0 z-50">
          <Header />
        </header>
      )}

      {/* Content container with responsive padding */}
      <div className={`flex-grow ${!shouldHideHeader ? " lg:pt-8" : ""}`}>
        {children}
      </div>

      {/* Footer - hidden on specific pages */}
      {!shouldHideFooter && <Footer />}
    </div>
  );
}