"use client";
import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Category } from "@/types/business";
import { Product } from "@/types/product";
import { AiOutlineSearch } from "react-icons/ai";
import CategoryTree from "./category-tree";
import RangePriceFilter from "./rangeSlider";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import Link from "next/link";

interface FilterContentProps {
  categories: Category[];
  selectedCats: string[];
  setSelectedCats: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSizes: string[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  minPrice: number;
  maxPrice: number;
  initialProducts: Product[];
  filteredProductsCount?: number;
  clearAllFilters?: () => void;
  isMobile: boolean;
  isMobileFiltersOpen: boolean;
  setIsMobileFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

export default function FilterContent({
  categories,
  selectedCats,
  setSelectedCats,
  selectedSizes,
  setSelectedSizes,
  priceRange,
  setPriceRange,
  minPrice,
  maxPrice,
  initialProducts,
  isMobile = false,
  search,
  setSearch,
}: FilterContentProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null); // Ref for the search input container

  // Sync local input with parent search state
  useEffect(() => {
    setSearch(localSearch);
  }, [localSearch, setSearch]);

  // Handle clicks outside the search input to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false); // Close search input if clicked outside
      }
    };

    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearch]);

  // Toggle function for categories and sizes
  const toggle = useCallback(
    (
      list: string[],
      setList: React.Dispatch<React.SetStateAction<string[]>>,
      value: string
    ) => {
      setList((prev) =>
        prev.includes(value)
          ? prev.filter((x) => x !== value)
          : [...prev, value]
      );
    },
    []
  );

  // Extract sizes from products
  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    initialProducts.forEach((p) => {
      p.variantsId?.forEach((v) => {
        v.variants_values?.forEach((size) => {
          if (size && size.trim()) sizes.add(size.trim());
        });
      });
    });
    return Array.from(sizes).sort((a, b) => {
      const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
      const aIndex = sizeOrder.indexOf(a.toUpperCase());
      const bIndex = sizeOrder.indexOf(b.toUpperCase());
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [initialProducts]);

  return (
    <div className="space-y-12">
      {/* Mobile Filters Toggle */}
      {isMobile && (
        <div className="space-y-2">
          {/* Mobile Filter Button */}
          <div className="flex items-center justify-between px-2 sm:px-0 sm:hidden">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-1 text-gray-900 dark:text-white font-semibold mt-2 mb-1"
            >
              <span>FILTERS</span>
              {showFilters ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {/* Mobile Logo */}
            <Link href="/">
              <img
                src="/assets/logo.webp"
                alt="G' Lore Logo"
                className="h-9 md:h-12 object-contain"
              />
            </Link>

            {/* Search Button */}
            <button
              onClick={() => setShowSearch((prev) => !prev)}
              className="p-2 block md:hidden"
              aria-label="Search"
            >
              <AiOutlineSearch className="text-gray-800 dark:text-white" size={20} />
            </button>
          </div>

          {/* Search Input */}
          {showSearch && (
            <div ref={searchRef} className="px-2 mt-2">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-600"
              />
            </div>
          )}

          {/* Filter Section */}
          {showFilters && (
            <div className="h-full space-y-4 p-4 rounded-md bg-[#ffd7db] dark:bg-gray-700 border border-gray-200 transition-all ease-in-out duration-300">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-white mb-3">
                  Filter by Category
                </h3>
                <CategoryTree
                  categories={categories}
                  selectedCats={selectedCats}
                  setSelectedCats={setSelectedCats}
                  initialProducts={initialProducts}
                />
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                  Filter by Price
                </h3>
                <RangePriceFilter
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                  Filter by Size
                </h3>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar mt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-pink-600 w-4 h-4 rounded"
                      checked={selectedSizes.length === 0}
                      onChange={() => setSelectedSizes([])}
                    />
                    <span className="text-gray-700 dark:text-white">All Sizes</span>
                  </label>
                  {allSizes.map((size) => (
                    <label key={size} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-pink-600 w-4 h-4 rounded"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggle(selectedSizes, setSelectedSizes, size)}
                      />
                      <span className="text-gray-700 dark:text-white">{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop Filters (unchanged) */}
      {!isMobile && (
        <aside className="mt-14 translate-x-32 hidden md:block">
          <div className="sticky top-24">
            <div className="rounded-md bg-[#ffd7db] dark:bg-gray-700 border border-gray-300 p-3 w-[240px]">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                Filter by Category
              </h3>
              <div className="space-y-2 max-h-48 overflow-auto pr-1 no-scrollbar">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-pink-700 w-4 h-4 rounded"
                    checked={selectedCats.length === 0}
                    onChange={() => setSelectedCats([])}
                  />
                  <span className="text-gray-600 dark:text-white">All Categories</span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    ({initialProducts.length})
                  </span>
                </label>
                <CategoryTree
                  categories={categories}
                  selectedCats={selectedCats}
                  setSelectedCats={setSelectedCats}
                  initialProducts={initialProducts}
                />
              </div>

              {/* Price Filter */}
              <div className="mt-8">
                <RangePriceFilter
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </div>

              {/* Size Filter */}
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mt-8 mb-8 ml-2">
                Filter by Size
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar mt-6 ml-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-pink-600 w-4 h-4 rounded"
                    checked={selectedSizes.length === 0}
                    onChange={() => setSelectedSizes([])}
                  />
                  <span className="text-gray-700 dark:text-white">All Sizes</span>
                </label>
                {allSizes.map((size) => (
                  <label key={size} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-pink-600 w-4 h-4 rounded"
                      checked={selectedSizes.includes(size)}
                      onChange={() => toggle(selectedSizes, setSelectedSizes, size)}
                    />
                    <span className="text-gray-700 dark:text-white">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}