"use client";
import React from "react";
import { Product } from "@/types/product";
import ProductCard from "@/components/ui/organisms/product-card";
// import { useParams } from "next/navigation";

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  // const params = useParams();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 md:gap-4 gap-2">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
