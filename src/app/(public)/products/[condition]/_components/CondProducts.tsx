"use client";
import React, { useState } from "react";
import { Product } from "@/types/product";
import { useRouter, useParams } from "next/navigation";
import ConditionTabBar from "./ConditionTabBar";
import ProductGrid from "./ProductGrid";

interface ConditionProductsProps {
  initialProducts: Product[];
}

const productConditionOptions: { value: string; label: string }[] = [
  { value: "best", label: "Best" },
  { value: "best selling", label: "Best Selling" },
  { value: "exclusive", label: "Exclusive" },
  { value: "featured", label: "Featured" },
  { value: "hot", label: "Hot" },
  { value: "latest", label: "Latest" },
  { value: "limited", label: "Limited" },
  { value: "luxury", label: "Luxury" },
  { value: "new", label: "New" },
  { value: "new arrival", label: "New Arrival" },
  { value: "popular", label: "Popular" },
  { value: "pre order", label: "Pre Order" },
  { value: "sale", label: "Sale" },
  { value: "top", label: "Top" },
  { value: "trending", label: "Trending" },
  { value: "upcoming", label: "Upcoming" },
];

export default function ConditionProducts({
  initialProducts,
}: ConditionProductsProps) {
  const router = useRouter();
  const params = useParams();
  const search = (params?.condition as string) || "all";
  const [selected, setSelected] = useState<string>(search);

  const handleTabChange = (tab: string) => {
    setSelected(tab);
    router.replace(`/products/${tab}`, { scroll: false });
  };

  return (
    <div className="md:px-4 px-1">
      <ConditionTabBar
        options={productConditionOptions}
        selected={selected}
        onTabChange={handleTabChange}
      />
      <ProductGrid products={initialProducts} />
    </div>
  );
}





