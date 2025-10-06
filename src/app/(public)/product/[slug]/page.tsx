// Optimized ProductPage.tsx (src/app/product/[slug]/page.tsx)
import { publicApi } from "@/lib/api/publicApi";
import { store } from "@/lib/store";
import { stripHtml } from "@/utils/stripHTML";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import ProductDetail from "./product-details";
import ProductPageSkeleton from "@/components/ui/skeleton/ProductPageSkeleton";

async function getProductById(id: string) {
  const res = await store.dispatch(publicApi.endpoints.getProducts.initiate({ _id: id }));
  return res.data?.[0];
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[অ-হ]/g, (char) => {
      const banglaToLatin: Record<string, string> = {
        'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'i', 'উ': 'u', 'ঊ': 'u',
        'ঋ': 'ri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou',
        'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
        'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'ny',
        'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
        'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
        'প': 'p', 'ফ': 'ph', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
        'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh',
        'স': 's', 'হ': 'h', 'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y',
        'ৎ': 't', 'ং': 'ng', 'ঃ': 'h', 'ঁ': ''
      };
      return banglaToLatin[char] || char;
    })
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  if (!resolvedSearchParams.id) {
    return {
      title: "পণ্য পাওয়া যায়নি",
      description: "কোনো পণ্য পাওয়া যায়নি।"
    };
  }

  const product = await getProductById(resolvedSearchParams.id);
  if (!product) {
    return {
      title: "পণ্য পাওয়া যায়নি",
      description: "কোনো পণ্য পাওয়া যায়নি।"
    };
  }

  const siteImageUrl = process.env.NEXT_PUBLIC_IMAGE_URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://glorebd.com";
  const canonicalUrl = `${baseUrl}/product/${resolvedParams.slug}?id=${product._id}`;

  const rawDescription = product.short_description || "পণ্যের বিস্তারিত বিবরণ দেখুন";
  const cleanedDescription = stripHtml(rawDescription);

  const firstImg = `${siteImageUrl}${product.images?.[0]?.alterImage?.secure_url}`;
  const imageUrl = firstImg ? firstImg : `${siteImageUrl}/assets/falback.jpg`;

  return {
    title: `${product.name} | G'Lore`,
    description: cleanedDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      url: canonicalUrl,
      title: product.name,
      description: cleanedDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        }
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: baseUrl?.replace(/^https?:\/\//, ""),
      title: product.name,
      description: cleanedDescription,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  if (!resolvedSearchParams.id) return notFound();

  const product = await getProductById(resolvedSearchParams.id);
  if (!product) return notFound();

  const expectedSlug = generateSlug(product.name);
  if (resolvedParams.slug !== expectedSlug) {
    redirect(`/product/${expectedSlug}?id=${product._id}`);
  }

  return (
    <div className="bg-secondary dark:bg-secondary">
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductDetail product={product} key={product._id} />
      </Suspense>
    </div>
  );
}