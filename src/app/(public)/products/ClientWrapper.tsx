"use client";

import React, { useState } from "react";
import ShopAllProducts from "./_components/ShopAllProducts";
import { Product } from "@/types/product";

interface ClientWrapperProps {
  initialProducts: Product[];
  minPrice?: number;
  maxPrice?: number;
}

export default function ClientWrapper({
  initialProducts,
  minPrice,
  maxPrice,
}: ClientWrapperProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  return (
    
    <ShopAllProducts
      initialProducts={initialProducts}
      minPrice={minPrice}
      maxPrice={maxPrice}
      showSearch={showSearch}
      setShowSearch={setShowSearch}
      search={search}
      setSearch={setSearch}
    />
  );
}
