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
import CategorySlider from "@/components/CategorySlider";
import HeroShowcase from "@/components/HeroShowcase";
import FeaturesBar from "@/components/FeaturesBar";

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

          <CategorySlider />

      {/* <HeroSection /> */}
      <ClientNewProducts initialProducts={initialProducts} />


     <HeroShowcase/>
     <FeaturesBar/>


      <DynamicFlashdeal initialProducts={initialProducts} />
      
      <ServicePolicyStrip />

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}