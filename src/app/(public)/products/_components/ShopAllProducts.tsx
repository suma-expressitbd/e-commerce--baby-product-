"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { Product } from "@/types/product";
import { useBusiness } from "@/hooks/useBusiness";
import { Category } from "@/types/business";
import Filters from "./filters";
import ShopDesktopHeader from "./desktop-header";
import ShopProductsGrid from "./products-grid";

interface ShopAllProductsProps {
  initialProducts: Product[];
  minPrice?: number;
  maxPrice?: number;

  // Client-controlled search state (from parent)
  showSearch: boolean;
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}

export default function ShopAllProducts({
  initialProducts,
  minPrice: initialMinPrice,
  maxPrice: initialMaxPrice,
  showSearch,
  setShowSearch,
  search,
  setSearch,
}: ShopAllProductsProps) {
  const { businessData } = useBusiness();
  const categories: Category[] = businessData?.categories || [];

  const sidebarRef = useRef<HTMLDivElement>(null);
  const productsContainerRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [sortBy, setSortBy] = useState<
    "name" | "price-low" | "price-high" | "newest"
  >("newest");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sidebar width
  useEffect(() => {
    const updateWidth = () => {
      if (sidebarRef.current) setSidebarWidth(sidebarRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Price calculation
  const { minPrice, maxPrice } = useMemo(() => {
    if (initialMinPrice !== undefined && initialMaxPrice !== undefined)
      return { minPrice: initialMinPrice, maxPrice: initialMaxPrice };
    if (initialProducts.length === 0) return { minPrice: 0, maxPrice: 10000 };
    const prices = initialProducts
      .map((p) => {
        const v =
          p.variantsId?.find((x) => Number(x.variants_stock) > 0) ??
          p.variantsId?.[0];
        if (!v) return 0;
        const sell = Number(v.selling_price || 0);
        const offer = Number(v.offer_price || sell);
        const start = v.discount_start_date
          ? new Date(v.discount_start_date).getTime()
          : 0;
        const end = v.discount_end_date
          ? new Date(v.discount_end_date).getTime()
          : 0;
        const now = Date.now();
        const isOffer = offer < sell && now >= start && now <= end;
        return isOffer ? offer : sell;
      })
      .filter((n) => !Number.isNaN(n));
    return {
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 10000,
    };
  }, [initialProducts, initialMinPrice, initialMaxPrice]);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice,
    maxPrice,
  ]);

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const filteredAndSorted = useMemo(() => {
    return initialProducts
      .filter((product) => {
        const price = (() => {
          const v =
            product.variantsId?.find((x) => Number(x.variants_stock) > 0) ??
            product.variantsId?.[0];
          if (!v) return 0;
          const sell = Number(v.selling_price || 0);
          const offer = Number(v.offer_price || sell);
          const start = v.discount_start_date
            ? new Date(v.discount_start_date).getTime()
            : 0;
          const end = v.discount_end_date
            ? new Date(v.discount_end_date).getTime()
            : 0;
          const now = Date.now();
          const isOffer = offer < sell && now >= start && now <= end;
          return isOffer ? offer : sell;
        })();
        if (price < priceRange[0] || price > priceRange[1]) return false;

        // 🔎 Use shared search state
        if (search.trim()) {
          const query = search.toLowerCase();
          const searchIn = [
            product.name?.toLowerCase() || "",
            ...(product.sub_category?.map((cat) => cat.name?.toLowerCase()) ||
              []),
            ...(product.variantsId?.map((v) => v.condition?.toLowerCase()) ||
              []),
          ].join(" ");
          if (!searchIn.includes(query)) return false;
        }

        if (selectedCats.length > 0) {
          const prodCatIds = (product.sub_category || []).map((cat) => cat._id);
          if (!prodCatIds.some((id) => selectedCats.includes(id))) return false;
        }

        if (selectedSizes.length > 0) {
          const prodSizes =
            product.variantsId?.flatMap((v) => v.variants_values || []) ?? [];
          if (!prodSizes.some((sz) => selectedSizes.includes(sz))) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const getPrice = (p: Product) => {
          const v =
            p.variantsId?.find((x) => Number(x.variants_stock) > 0) ??
            p.variantsId?.[0];
          if (!v) return 0;
          const sell = Number(v.selling_price || 0);
          const offer = Number(v.offer_price || sell);
          const start = v.discount_start_date
            ? new Date(v.discount_start_date).getTime()
            : 0;
          const end = v.discount_end_date
            ? new Date(v.discount_end_date).getTime()
            : 0;
          const now = Date.now();
          const isOffer = offer < sell && now >= start && now <= end;
          return isOffer ? offer : sell;
        };
        switch (sortBy) {
          case "name":
            return (a.name || "").localeCompare(b.name || "");
          case "price-low":
            return getPrice(a) - getPrice(b);
          case "price-high":
            return getPrice(b) - getPrice(a);
          case "newest":
          default:
            return (b._id || "").localeCompare(a._id || "");
        }
      });
  }, [
    initialProducts,
    selectedCats,
    selectedSizes,
    priceRange,
    search,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedCats([]);
    setSelectedSizes([]);
    setPriceRange([minPrice, maxPrice]);
    setSearch(""); // ✅ clear shared search too
  };

  return (
    <div className="min-h-screen bg-secondary dark:bg-secondary">
      <div className="mx-auto max-w-[1800px] px-2 md:px-4 lg:px-6 py-6 h-full">
        <div className="h-full grid grid-cols-1 md:[grid-template-columns:390px_minmax(0,1fr)] gap-x-3">
          <div className="h-full pb-8" ref={sidebarRef}>
            <div className="sticky top-20">
              <Filters
                categories={categories}
                selectedCats={selectedCats}
                setSelectedCats={setSelectedCats}
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                search={search}          // ✅ fixed
                setSearch={setSearch}   // ✅ fixed


                minPrice={minPrice}
                maxPrice={maxPrice}
                initialProducts={initialProducts}
                filteredProductsCount={filteredAndSorted.length}
                clearAllFilters={clearAllFilters}
                isMobile={isMobile}
                isMobileFiltersOpen={isMobileFiltersOpen}
                setIsMobileFiltersOpen={setIsMobileFiltersOpen}
              />
            </div>
          </div>

          <main className="h-full flex-1 md:-mt-0 overflow-y-auto">   {/* 👈 overflow সরানো */}
            <div className="overflow-y-auto scrollbar-hide h-full"> {/* 👈 scroll container শুধু main এ */}
              <ShopDesktopHeader
                filteredAndSorted={filteredAndSorted}
                initialProducts={initialProducts}
                sortBy={sortBy}
                setSortBy={setSortBy}
                isMobile={isMobile} // Pass isMobile state here

                //new add

                showSearch={showSearch}
                setShowSearch={setShowSearch}
                search={search}
                setSearch={setSearch}


              />
              <ShopProductsGrid
                filteredAndSorted={filteredAndSorted}
                productsContainerRef={productsContainerRef as React.RefObject<HTMLDivElement>}
                initialProducts={initialProducts}
                clearAllFilters={clearAllFilters}
                containerWidth={
                  typeof window !== "undefined"
                    ? window.innerWidth - sidebarWidth
                    : undefined
                }
              />
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
