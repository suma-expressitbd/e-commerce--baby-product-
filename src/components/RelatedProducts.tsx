"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import type { Product, Variant } from "@/types/product";
import ProductCard from "./ui/organisms/product-card";
import { useGetProductsQuery } from "@/lib/api/publicApi";
import {
  buildGtmItem,
  trackViewRelatedItemList,
} from "@/utils/gtm";
import { LoadingSpinner } from "./ui/atoms/loading-spinner";


interface RelatedProductsProps {
  currentProductId: string;
  subCategoryId: string;
}

export default function RelatedProducts({
  currentProductId,
  subCategoryId,
}: RelatedProductsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasPrefetched, setHasPrefetched] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for prefetching
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasPrefetched) {
          setHasPrefetched(true);
          setIsVisible(true);
        }
      },
      {
        rootMargin: '200px', // Start prefetching 200px before the section comes into view
        threshold: 0.1,
      }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasPrefetched]);

  // Only fetch when user is about to see the section
  const {
    data: allProducts = [],
    isLoading,
    isError,
  } = useGetProductsQuery(
    { limit: 10 },
    {
      skip: !hasPrefetched, // Don't fetch until intersection observer triggers
      refetchOnMountOrArgChange: false, // Keep data cached after first fetch
    }
  );

  const related = useMemo(
    () =>
      allProducts.filter(
        (p: Product) =>
          p._id !== currentProductId &&
          p.sub_category.some((sc) => sc._id === subCategoryId)
      ),
    [allProducts, currentProductId, subCategoryId]
  );

  useEffect(() => {
    if (related.length === 0) return;

    const productsForTracking = related.slice(0, 4).map((p: Product, idx) => {
      const firstVariant = p.variantsId?.[0];
      return buildGtmItem(
        p,
        firstVariant,
        1,
        "Related Products",
        subCategoryId,
        idx + 1
      );
    });

    trackViewRelatedItemList(productsForTracking, subCategoryId);
  }, [related, subCategoryId]);


  // Show placeholder until intersection observer triggers data fetch
  if (!isVisible) {
    return (
      <section ref={sectionRef}>
        <div className="py-2 text-3xl text-center mb-4">
          <div className="inline-flex gap-2 items-center">
            <p className="text-gray-500 dark:text-white">RELATED<span className="text-gray-700 dark:text-white font-medium">PRODUCTS</span></p>
            <p className="w-8 sm:w-12 h-0.5 bg-gray-700 dark:bg-white"></p>
          </div>
        </div>
        {/* Keep same height to prevent layout shift */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-10 opacity-30">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  /* 🌀 Loading spinner while fetching */
  if (isLoading) {
    return (
      <section ref={sectionRef}>
        <div className="py-2 text-3xl text-center mb-4">
          <div className="inline-flex gap-2 items-center">
            <p className="text-gray-500 dark:text-white">RELATED<span className="text-gray-700 dark:text-white font-medium">PRODUCTS</span></p>
            <p className="w-8 sm:w-12 h-0.5 bg-gray-700 dark:bg-white"></p>
          </div>
        </div>
        <div className="flex justify-center items-center min-h-[160px]">
          <LoadingSpinner size="lg" color="red" />
        </div>
      </section>
    );
  }

  if (isError || related.length === 0) return null;

  return (
    <section ref={sectionRef}>
      <div className="py-2 text-3xl text-center mb-4">
        <div className="inline-flex gap-2 items-center">
          <p className="text-gray-500 dark:text-white">RELATED<span className="text-gray-700 dark:text-white font-medium">PRODUCTS</span></p>
          <p className="w-8 sm:w-12 h-0.5 bg-gray-700 dark:bg-white"></p>
        </div>
      </div>

      {/* product grid with smooth fade-in */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-10 animate-in fade-in duration-500">
        {related.map((product: Product, idx: number) => {
          if (idx >= 4) return null;
          const visibility = idx <= 3 ? "" : "hidden lg:block";
          return (
            <div key={product._id} className={visibility}>
              <ProductCard product={product} />
            </div>
          );
        })}
      </div>
    </section>
  );
}