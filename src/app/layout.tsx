// app/layout.tsx

"use client";

import { storeUtmParams, trackPageView } from "@/utils/gtm";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
    storeUtmParams();
  }, [pathname]);

  return (
    <>
      {children}
      {/* Sticky Social Icons */}
      <div className="hidden lg:block">
        <div className=" fixed md:right-4 right-1 md:bottom-12 transform -translate-y-1/2 flex flex-col gap-2 z-50">
          <Link
            href="https://wa.me/+8801907349009
"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-green-500 to-green-700 p-2  rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 ease-in-out"
            aria-label="WhatsApp"
          >
            <FaWhatsapp className="h-8 w-8 text-white" />
          </Link>

        </div>
      </div>
      <div className="block lg:hidden">
        <div className="fixed md:right-4 right-2 bottom-52 transform -translate-y-1/2 flex flex-col gap-2 z-20">
          <Link
            href="https://wa.me/+8801907349009"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-green-500 to-green-700 p-1.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 ease-in-out"
            aria-label="WhatsApp"
          >
            <FaWhatsapp className="h-6 w-6 text-white" />
          </Link>

        </div>
      </div >
      {/* <ConsentManager /> */}
    </>
  );
}
