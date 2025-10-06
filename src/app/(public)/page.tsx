import React, { Suspense } from "react";
import { publicApi } from "@/lib/api/publicApi";
import type { Product } from "@/types/product";
import { makeStore } from "@/lib/store"; // Updated to use makeStore
import ServicePolicyStrip from "@/components/ui/organisms/ServicePolicyStrip";
import { lazy } from 'react';
import { ProductsGridSkeleton } from '@/components/ui/SimpleLoadingSkeleton';
import ClientNewProducts from "@/components/ClientNewProducts";
import ScrollToTopButton from "@/components/ui/molecules/ScrollToTopButton";
import DurgaPujaBanner from "@/components/DurgaPujaBanner";
import DynamicFlashdeal from "@/components/DynamicFlashdeal";
import BannerSlider from "@/components/BannerSlider";

// Lazy load heavy components to improve initial page load
const ClientAllProducts = lazy(() => import("@/components/ClientAllProducts"));
const DynamicCategorySections = lazy(() => import("@/components/DynamicCategorySections"));
const ProductVideosSlider = lazy(() => import("@/components/VedioSection"));

type SearchParams = {
  search?: string;
  sort?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
};

export async function generateMetadata() {
  return {
    title: "G'Lore - Best Online Shopping Platform",
    description: "Discover amazing deals and shop for your favorite products on G'Lore.",
    openGraph: {
      title: "G'Lore - Best Online Shopping Platform",
      description: "Discover amazing deals and shop for your favorite products on G'Lore.",
      url: "/",
      type: "website",
    },
  } as const;
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    search = "",
    sort,
    brand,
    minPrice,
    maxPrice,
    condition,
  } = await searchParams ?? {};

  const store = makeStore(); // Create fresh store per request
  const allProducts: Product[] = [];
  let page = 1;
  const limit = 1000; // Increased from 12 to fetch more products
  const maxPages = 100; // Increased from 2 to cover more pages

  try {
    while (page <= maxPages) {
      const res = await store.dispatch(
        publicApi.endpoints.getProducts.initiate({
          page,
          limit,
          ...(search && { search }),
          ...(sort && { sort }),
          ...(brand && { brand }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          ...(condition && { condition }),
        })
      );

      // Handle API errors
      if (res.error) {
        console.error("API Error:", res.error);
        break;
      }

      const products: Product[] = res.data ?? [];
      if (products.length === 0) break;

      allProducts.push(...products);
      page += 1;
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  // Remove proxies / RTK-serializable values
  const initialProducts = JSON.parse(JSON.stringify(allProducts));

  return (
    <div>
      {/* <DurgaPujaBanner /> */}
      <BannerSlider/>

      {/* <HeroSection /> */}
      <ClientNewProducts initialProducts={initialProducts} />
      <DynamicFlashdeal initialProducts={initialProducts} />
      {/* Products Section - Critical content */}
      <div className="mt-0 md:mt-0 mb-0">
        <Suspense fallback={<ProductsGridSkeleton />}>
          <ClientAllProducts initialProducts={initialProducts} />
        </Suspense>
      </div>

      {/* Video Section - Lowest priority, load last */}
      <Suspense
        fallback={
          <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading content...</div>
          </div>
        }
      >
        <ProductVideosSlider products={initialProducts} />
      </Suspense>
      {/* Category Sections - Load next priority */}
      <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse rounded-lg"></div>}>
        <DynamicCategorySections initialProducts={initialProducts} />
      </Suspense>
      {/* Footer content - Always visible */}
      <ServicePolicyStrip />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}