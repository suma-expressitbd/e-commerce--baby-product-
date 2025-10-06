"use server";
import React from "react";
import { publicApi } from "@/lib/api/publicApi";
import { makeStore } from "@/lib/store";
import type { Product } from "@/types/product";
import ClientWrapper from "./ClientWrapper"; // import the client wrapper

type SearchParams = {
  search?: string;
  sort?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
};

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const {
    search = "",
    sort,
    brand,
    minPrice,
    maxPrice,
    condition,
  } = await searchParams ?? {};

  const store = makeStore();
  const allProducts: Product[] = [];

  let page = 1;
  const limit = 1000;
  const maxPages = 100;

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

    const products: Product[] = res.data ?? [];
    if (products.length === 0) break;

    allProducts.push(...products);
    page += 1;
  }

  const initialProducts = JSON.parse(JSON.stringify(allProducts));

  // Render client wrapper
  return (
    <ClientWrapper
      initialProducts={initialProducts}
      minPrice={minPrice ? Number(minPrice) : undefined}
      maxPrice={maxPrice ? Number(maxPrice) : undefined}
    />
  );
}
