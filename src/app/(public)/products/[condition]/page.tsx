"use server";
// app/products/condition/[condition]/page.tsx
import { publicApi } from "@/lib/api/publicApi";
import { makeStore } from "@/lib/store";
import { Product } from "@/types/product";
import ConditionProducts from "./_components/CondProducts";

// Type alias for clarity
interface PageParams {
  condition: string;
}

// Dynamic SEO metadata
export async function generateMetadata({ params }: { params: Promise<{ condition: string }> }) {
  const resolvedParams = await params;
  const condition = resolvedParams.condition ? resolvedParams.condition.replace(/-/g, ' ') : 'Products';
  const title = `${condition.charAt(0).toUpperCase() + condition.slice(1)} | G'Lore`;
  const description = `Browse our ${condition} collection and find the best deals on G'Lore.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/products/${resolvedParams.condition}`,
      type: 'website',
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = await params;
  //console.log("Resolved params:", resolvedParams);
  const store = makeStore();

  if (!resolvedParams.condition) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center text-red-500">
        No condition specified.
      </div>
    );
  }

  try {
    const res = await store.dispatch(
      publicApi.endpoints.getProducts.initiate({
        page: 1,
        limit: 1000,
        search: resolvedParams.condition,
      })
    );
    //console.log("Fetched products:", res);
    const products: Product[] = res.data || [];
    //console.log("Parsed products:", products);
    return (
      <div className="md:max-w-6xl mx-auto md:p-4 p-1">
        <ConditionProducts initialProducts={products} />
      </div>
    );
  } catch {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center text-red-500">
        Failed to load products. Please try again later.
      </div>
    );
  }
}

// parent (I need search params) >> children (I have) >> parent (paichi >> api call>> send result to children) >> children






