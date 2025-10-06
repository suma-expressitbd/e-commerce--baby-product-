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
import Logo from "../atoms/logo";

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
              : "bg-white text-black dark:bg-black dark:text-white"
          } ${className || ""}`}
      >
       

{/* Mobile Bottom Navigation Bar */}
{/* <div className="md:hidden flex justify-between items-center px-1 sm:px-2 py-2">
      <div className="flex justify-between items-center px-4 py-3">
            {!isDesktop && <SidebarToggler />}

           <div className="absolute left-1/2 top-1/2 -translate-x-[100%]  -translate-y-1/2">
            <Link href="/">
              <Logo />
            </Link>
           </div>
            
          </div>
          <div className="flex items-center justify-end space-x-6 text-gray-600 dark:text-gray-300 pr-4 pt-2">
            <CartSheet />
            <WishlistSheet />
            <ThemeToggler />
          </div>
        </div>
 */}




{/* new mobile view */}

{/* Mobile Layout - Better Solution */}
<div className="md:hidden">
  {/* Top Row - Logo, Cart, Wishlist, Theme */}
  <div className="flex justify-between items-center px-4 py-3">
    {/* Left - Sidebar Toggler */}
    <div className="flex items-center w-1/3 justify-start">
      {!isDesktop && <SidebarToggler />}
    </div>

    {/* Center - Logo - FLEX SOLUTION */}
    <div className="flex items-center justify-center w-1/2 mr-8">
      <Link href="/">
        <Logo />
      </Link>
    </div>

    {/* Right - Icons */}
    <div className="flex items-center justify-end gap-4 w-1/3">
      <CartSheet />
      <WishlistSheet />
      <ThemeToggler />
    </div>
  </div>

  {/* Bottom Row - Search Bar */}
  <div className="px-4 ">
    <div className="relative">
      <AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        onFocus={() => setShowSearchBar(true)}
        placeholder="Search"
        className="
          w-full h-11 rounded-full
          pl-11 pr-4
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/70
          text-[14px] text-black dark:text-white
          placeholder-gray-500
        "
      />
    </div>
  </div>
</div>

      


            <AnimatePresence>
        {(showSearchBar || showMobileSearch) && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="
              absolute left-0 z-50 top-[calc(100%+8px)] z-50
             w-[18rem] lg:w-[22rem] xl:w-[24rem]
              bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
              rounded-xl shadow-xl p-2
            "
          >
            <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100/60 dark:divide-gray-700/60">
              {suggestions.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <Link
                    href={item.url}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-md text-sm"
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
                          width={28}
                          height={28}
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
                        <span className="truncate text-black dark:text-white">{item.name}</span>
                        <span className="ml-auto text-gray-500">Category</span>
                      </>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>




      
        {/* Desktop Full Header */}
      {/* Desktop Full Header */}
{/* Desktop Full Header */}
<div className="relative z-50 overflow-visible">
<div
  className={`hidden md:grid grid-cols-[auto_1fr_auto] items-center
    md:px-3 lg:px-6 xl:px-8 md:py-3 lg:py-3
    w-full
    overflow-visible       /* ✅ fix added */
    md:max-w-full lg:max-w-[1140px] xl:max-w-[1320px] 2xl:max-w-[1440px] mx-auto
    ${isScrolled ? "text-gray-900" : "text-black dark:text-white"}`}
>

  
  {/* LEFT: Logo */}
<div className="flex-shrink-0 md:ml-2 lg:ml-4 xl:ml-6 min-w-[100px]">

    <Link href="/">
     <Image
  src="/assets/logo5.png"
  alt="Logo"
  width={160}
  height={60}
  priority
  className="h-11 md:h-12 lg:h-14 xl:h-16 object-contain"
/>
    </Link>
  </div>

  {/* CENTER: Main Nav */}
<nav className="justify-self-center w-full px-2 md:px-4 lg:px-10 xl:pl-24 xl:pr-20 overflow-visible">

    <ul
      className="
        flex items-center justify-center
        md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8
        text-[15px] font-semibold
      "
    >
      <li>
        <Link href="/" className="hover:text-pink-500 transition-colors">
          Home
        </Link>
      </li>

      <li className="flex items-center gap-1">
        <Link href="/products" className="hover:text-pink-500 transition-colors">
          Shop
        </Link>
        <span className="text-xs opacity-70 md:hidden lg:inline">▾</span>
      </li>

      
      <li className="relative">
        <span className="absolute -top-3 left-1 text-[10px] px-2 py-[2px] rounded-full bg-violet-600 text-white shadow">
          NEW
        </span>
        <Link
          href="/category/accessories"
          className="hover:text-pink-500 transition-colors"
        >
          Accessories
        </Link>
      </li>

      
    </ul>
  </nav>

  {/* RIGHT: Cart • Search • Wishlist • Login */}
  <div
    className="
      flex items-center
      md:gap-4 lg:gap-5 xl:gap-6
      md:pr-3 lg:pr-6 xl:pr-10
      justify-self-end
    "
  >
    {/* Cart */}
    <div className="relative">
      <CartSheet />
    </div>

    {/* Search */}
    <div className="relative" ref={searchRef}>
      <div className="w-[14rem] lg:w-[18rem] xl:w-[20rem]"> {/* md=56 lg=72 xl=80 */}
        <div className="relative">
          <AiOutlineSearch className="absolute left-4 top-1/2  -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setShowSearchBar(true)}
            placeholder="Search"
            className="
              w-full h-11 lg:h-12 rounded-full
              pl-11 pr-4
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700
              shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/70
              text-[14px] lg:text-[15px] text-black dark:text-white
            "
          />
        </div>
      </div>

      {/* Suggestions (width match at xl) */}
      <AnimatePresence>
        {(showSearchBar || showMobileSearch) && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="
              absolute left-0 z-50 top-[calc(100%+8px)] z-50
             w-[18rem] lg:w-[22rem] xl:w-[24rem]
              bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
              rounded-xl shadow-xl p-2
            "
          >
            <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100/60 dark:divide-gray-700/60">
              {suggestions.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <Link
                    href={item.url}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-md text-sm"
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
                          width={28}
                          height={28}
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
                        <span className="truncate text-black dark:text-white">{item.name}</span>
                        <span className="ml-auto text-gray-500">Category</span>
                      </>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Wishlist */}
    <WishlistSheet />

    <ThemeToggler />
    

    {/* Login */}
    <Link
      href="/login"
      className="grid place-items-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      title="Login"
      aria-label="Login"
    >
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        className="w-6 h-6 text-black dark:text-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10 17v-3H3v-4h7V7l5 5-5 5z"></path>
        <path d="M20 19h-8v-2h8V7h-8V5h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z"></path>
      </svg>
    </Link>
  </div>
</div>
</div>



        <MenuSidebar />
      </div>
    </>
  );
};

export default Navbar;