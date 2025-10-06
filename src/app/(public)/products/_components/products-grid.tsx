// components/shop-all-products/products-grid.tsx
"use client";
import React, { useMemo } from "react";
import { Product } from "@/types/product";
import ProductCard from "@/components/ui/organisms/product-card";
import PoweredByBar from "@/components/PoweredByBar";

interface ShopProductsGridProps {
    productsContainerRef: React.RefObject<HTMLDivElement>;
    filteredAndSorted: Product[];
    initialProducts: Product[];
    clearAllFilters: () => void;
    containerWidth?: number;
}

export default function ShopProductsGrid({
    productsContainerRef,
    filteredAndSorted,
    clearAllFilters,
    containerWidth,
}: ShopProductsGridProps) {
    const columns = useMemo(() => {
        if (!containerWidth) return 2;
        if (containerWidth < 600) return 2;
        if (containerWidth < 1030) return 2;
        return 4;
    }, [containerWidth]);

    return (
        <div ref={productsContainerRef} className="p-1 md:p-4 md:mt-0  ">
            {filteredAndSorted.length > 0 ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 max-[345px]:grid-cols-1 max-[1030px]:grid-cols-2 xl:grid-cols-${columns} gap-4 `}>
                    {filteredAndSorted.map((product, i) => (
                        <ProductCard key={`${product._id}-${i}`} product={product} isAboveFold={i < 8} />
                    ))}
                </div>
            ) : (
                <div className="py-16 text-center text-gray-600 dark:text-white">
                    No products matched your filters.
                </div>
            )}
            <PoweredByBar />
        </div>
    );
}