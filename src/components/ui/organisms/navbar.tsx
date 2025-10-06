"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AiOutlineSearch } from "react-icons/ai";
import { useSidebar } from "@/hooks/useSidebar";
import { navbarRef } from "@/lib/refs";
import { SidebarToggler } from "../molecules/sidebarToggler";
import ThemeToggler from "../molecules/themeToggler";
import { CartSheet } from "../organisms/cart-sheet";
import { useBusiness } from "@/hooks/useBusiness";
import { MenuSidebar } from "../molecules/menusidebar";
import { useRouter, usePathname } from "next/navigation";
import { useWishlist } from "@/hooks/useWishlist";
import { WishlistSheet } from "./WishlistSheet";
import { AnimatePresence, motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";
import Image from "next/image";

export interface NavbarProps {
  className?: string;
  setShowSearch?: (val: boolean) => void;
}

interface SearchResultItem {
  type: "product" | "category";
  id: string;
  name: string;
  url: string;
  image?: string;
}

const DEFAULT_IMAGE = "/assets/placeholder.webp";

export const Navbar = ({ className, setShowSearch }: NavbarProps) => {
  const { toggle } = useSidebar(); // ✅ useSidebar provides toggle function
  const router = useRouter();
  const pathname = usePathname();
  const { isDesktop } = useSidebar();
  const { businessData } = useBusiness();
  const { products } = useProducts();
  const { openWishlist, itemCount } = useWishlist();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const CATEGORIES = businessData?.categories || [];
  const isProductsPage = pathname?.startsWith("/products");
  const isCategoryPage = pathname?.startsWith("/category/");

  // Slug generator
  const generateSlug = (name: string): string => {
    const BANGLA_TO_LATIN: Record<string, string> = {
      "অ": "o", "আ": "a", "ই": "i", "ঈ": "i", "উ": "u", "ঊ": "u", "ঋ": "ri",
      "এ": "e", "ঐ": "oi", "ও": "o", "ঔ": "ou", "ক": "k", "খ": "kh", "গ": "g",
      "ঘ": "gh", "ঙ": "ng", "চ": "ch", "ছ": "chh", "জ": "j", "ঝ": "jh", "ঞ": "ny",
      "ট": "t", "ঠ": "th", "ড": "d", "ঢ": "dh", "ণ": "n", "ত": "t", "থ": "th",
      "দ": "d", "ধ": "dh", "ন": "n", "প": "p", "ফ": "ph", "ব": "b", "ভ": "bh",
      "ম": "m", "য": "j", "র": "r", "ল": "l", "শ": "sh", "ষ": "sh", "স": "s",
      "হ": "h", "ড়": "r", "ঢ়": "rh", "য়": "y", "ৎ": "t", "ং": "ng", "ঃ": "h", "ঁ": "",
    };
    return name
      ? name
        .toLowerCase()
        .replace(/[অ-হ]/g, (char) => BANGLA_TO_LATIN[char] || char)
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "")
      : "";
  };

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile search by outside click
  useEffect(() => {
    if (!showMobileSearch && !showSearchBar) return;
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowMobileSearch(false);
        setShowSearchBar(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMobileSearch, showSearchBar]);

  // Search suggestions
  const suggestions: SearchResultItem[] = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];

    const categoryMatches = CATEGORIES.filter((cat: any) =>
      cat.name?.toLowerCase().includes(term)
    ).map((cat: any) => ({
      type: "category" as const,
      id: cat._id,
      name: cat.name || "Unnamed Category",
      url: `/products?category=${cat._id}&name=${encodeURIComponent(cat.name?.toLowerCase() || "")}`,
      image: cat.image?.optimizeUrl || DEFAULT_IMAGE,
    }));

    const productMatches = (products || []).filter(
      (product: any) =>
        product.name?.toLowerCase().includes(term) ||
        product.short_description?.toLowerCase().includes(term)
    ).map((product: any) => {
      const imageUrl = product.images?.[0]?.image?.secure_url
        ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${product.images[0].alterImage?.secure_url || product.images[0].image.secure_url}`
        : DEFAULT_IMAGE;
      return {
        type: "product" as const,
        id: product._id,
        name: product.name || "Unnamed Product",
        url: `/product/${generateSlug(product.name || "")}?id=${product._id}`,
        image: imageUrl,
      };
    });

    return [...categoryMatches, ...productMatches].slice(0, 8);
  }, [searchTerm, CATEGORIES, products]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
      setShowSearchBar(false);
      setShowMobileSearch(false);
      setSearchTerm("");
    }
  };

  const handleSearchClick = () => {
    if (pathname === "/products") {
      return;
    }
    if (isProductsPage && typeof setShowSearch === "function") {
      setShowSearch(true);
    } else {
      setShowSearchBar((s) => !s);
      setShowMobileSearch((s) => !s);
    }
  };






  return (
    <>
      {/* Floating Mobile Cart/Wishlist Icons */}
      <div className="md:hidden fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        <div className="max-w-[30px] bg-secondary p-1.5 rounded-full aspect-square">
          <CartSheet />
        </div>
        <div className="max-w-[30px] bg-secondary p-1.5 rounded-full aspect-square">
          <WishlistSheet />
        </div>
      </div>

      <div
        ref={navbarRef}
        className={`w-full z-[100] sticky top-0 transition-all duration-300
          ${isScrolled
            ? "bg-white border-xl border-gray-200 shadow-sm dark:bg-black dark:border-gray-800 dark:shadow-none dark:text-white"
            : isCategoryPage || isProductsPage
              ? "bg-secondary text-black dark:bg-black dark:text-white"
              : "bg-tertiary text-black dark:bg-black dark:text-white"
          } ${className || ""}`}
      >
        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t flex justify-around items-center h-16 shadow-lg">
          <div className="flex flex-col items-center text-xs ml-4">
            <SidebarToggler />
            <span>Menu</span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="flex flex-col items-center text-xs text-black dark:text-white"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 16 16"
              className="text-lg"
              height="1.5em"
              width="1.5em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4z"></path>
            </svg>
            <span className="group-hover:text-default text-xs transition-all duration-500 ease-in-out text-black dark:text-white">
              Shop
            </span>
          </button>
          <a
            className="left-1/2 absolute flex justify-center items-center border-2 border-gray-200 bg-gray-100 hover:bg-gray-200 shadow-lg hover:shadow-xl rounded-full w-16 h-16 transform transition -translate-x-1/2 -translate-y-1/2 duration-300 ease-in-out active"
            href="/"
            aria-current="page"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 576 512"
              className="group-hover:text-default w-7 h-7 text-default transition duration-200 ease-in-out text-pink-400"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"></path>
            </svg>
          </a>
          <a className="flex flex-col items-center ml-10 group" href="/about">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              className="group-hover:text-default w-7 h-7 transition duration-200 ease-in-out text-black dark:text-white"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 11C14.7614 11 17 13.2386 17 16V22H15V16C15 14.4023 13.7511 13.0963 12.1763 13.0051L12 13C10.4023 13 9.09634 14.2489 9.00509 15.8237L9 16V22H7V16C7 13.2386 9.23858 11 12 11ZM5.5 14C5.77885 14 6.05009 14.0326 6.3101 14.0942C6.14202 14.594 6.03873 15.122 6.00896 15.6693L6 16L6.0007 16.0856C5.88757 16.0456 5.76821 16.0187 5.64446 16.0069L5.5 16C4.7203 16 4.07955 16.5949 4.00687 17.3555L4 17.5V22H2V17.5C2 15.567 3.567 14 5.5 14ZM18.5 14C20.433 14 22 15.567 22 17.5V22H20V17.5C20 16.7203 19.4051 16.0796 18.6445 16.0069L18.5 16C18.3248 16 18.1566 16.03 18.0003 16.0852L18 16C18 15.3343 17.8916 14.694 17.6915 14.0956C17.9499 14.0326 18.2211 14 18.5 14ZM5.5 8C6.88071 8 8 9.11929 8 10.5C8 11.8807 6.88071 13 5.5 13C4.11929 13 3 11.8807 3 10.5C3 9.11929 4.11929 8 5.5 8ZM18.5 8C19.8807 8 21 9.11929 21 10.5C21 11.8807 19.8807 13 18.5 13C17.1193 13 16 11.8807 16 10.5C16 9.11929 17.1193 8 18.5 8ZM5.5 10C5.22386 10 5 10.2239 5 10.5C5 10.7761 5.22386 11 5.5 11C5.77614 11 6 10.7761 6 10.5C6 10.2239 6 10 5.5 10ZM18.5 10C18.2239 10 18 10.2239 18 10.5C18 10.7761 18.2239 11 18.5 11C18.7761 11 19 10.7761 19 10.5C19 10.2239 19 10 18.5 10ZM12 2C14.2091 2 16 3.79086 16 6C16 8.20914 14.2091 10 12 10C9.79086 10 8 8.20914 8 6C8 3.79086 9.79086 2 12 2ZM12 4C10.8954 4 10 4.89543 10 6C10 7.10457 10.8954 8 12 8C13.1046 8 14 7.10457 14 6C14 4.89543 13.1046 4 12 4Z"></path>
            </svg>
            <span className="group-hover:text-default text-xs transition-all duration-500 ease-in-out text-black dark:text-white">
              About US
            </span>
          </a>
          <ThemeToggler />
        </div>

        {/* Desktop Full Header */}
        <div
          className={`hidden md:flex items-center justify-between px-6 py-3
            ${isScrolled ? "text-gray-900" : "text-black dark:text-white"}`}
        >
          {/* Left: Menu + Search */}
          <div className="flex items-center gap-6 text-sm font-semibold ml-16">
            <div className="flex items-center gap-1 cursor-pointer text-black dark:text-white">
              <SidebarToggler />
              <span
                className="cursor-pointer px-3 py-2"
                onClick={toggle} // ✅ call toggle from useSidebar hook
              >
                Menu
              </span>
            </div>



            {/* Conditionally render the search button */}
            {!isProductsPage && (
              <div className="relative" ref={searchRef}>
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="flex items-center gap-1 cursor-pointer text-black dark:text-white hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
                >
                  <AiOutlineSearch className="text-lg" />
                  <span>Search</span>
                </button>
                <AnimatePresence>
                  {(showSearchBar || showMobileSearch) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-12 left-0 z-50 w-[90vw] md:w-[300px] lg:w-[400px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3"
                    >
                      <div className="relative">
                        <AiOutlineSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={handleSearchKeyDown}
                          placeholder="Search products..."
                          className="w-full pl-10 pr-8 py-2 rounded-md bg-gray-50 dark:bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                          autoFocus
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      {suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                        >
                          <ul>
                            {suggestions.map((item) => (
                              <li key={`${item.type}-${item.id}`}>
                                <Link
                                  href={item.url}
                                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                  onClick={() => {
                                    setSearchTerm("");
                                    setShowSearchBar(false);
                                    setShowMobileSearch(false);
                                  }}
                                >
                                  {item.type === "product" ? (
                                    <>
                                      <Image
                                        src={item.image || DEFAULT_IMAGE}
                                        alt={item.name}
                                        width={24}
                                        height={24}
                                        className="object-cover rounded"
                                        unoptimized
                                      />
                                      <span className="truncate text-black dark:text-white">{item.name}</span>
                                      <span className="ml-auto text-gray-500">Product</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg
                                        className="w-5 h-5 text-pink-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                                      </svg>
                                      <span className="truncate">{item.name}</span>
                                      <span className="ml-auto text-gray-500">Category</span>
                                    </>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Center: Logo */}
          <div>
            <Link href="/">
              <Image
                src="/assets/logo.png"
                alt="G' Lore Logo"
                width={120}
                height={48}
                priority={true}
                className="h-10 md:h-12 object-contain"
              />
            </Link>
          </div>

          {/* Right: Shop + Cart + Wishlist trigger */}
          <div className="flex items-center gap-6 text-sm font-semibold">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="flex flex-col items-center text-xs text-black dark:text-white"
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 16 16"
                className="text-lg text-black dark:text-white"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4z"></path>
              </svg>
            </button>
            <CartSheet />
            <WishlistSheet />
            <ThemeToggler />
          </div>
        </div>

        <MenuSidebar />
      </div>
    </>
  );
};

export default Navbar;