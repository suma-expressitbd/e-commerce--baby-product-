


"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useMemo, useEffect } from "react";
import { FiHeart, FiShoppingCart, FiEye, FiStar } from "react-icons/fi";
import { toast } from "sonner";

import Image from "@/components/ui/atoms/image";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { usePreorderCart } from "@/hooks/usePreorderCart";
import type { TPreorderCartItem } from "@/lib/features/preOrderCartSlice/preOrderCartSlice";
import VariantSelectModal from "@/app/(public)/product/_component/VariantSelectModal";

/* --------------------------------- utils --------------------------------- */
const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[অ-হ]/g, (c) => {
      const m: Record<string, string> = {
        অ: "o",
        আ: "a",
        ই: "i",
        ঈ: "i",
        উ: "u",
        ঊ: "u",
        ঋ: "ri",
        এ: "e",
        ঐ: "oi",
        ও: "o",
        ঔ: "ou",
        ক: "k",
        খ: "kh",
        গ: "g",
        ঘ: "gh",
      };
      return m[c] || c;
    })
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ef4444",
  blue: "#2563eb",
  green: "#10b981",
  yellow: "#f59e0b",
  purple: "#7c3aed",
  pink: "#ec4899",
  navy: "#1e2a44",
  brown: "#8b5e3c",
  beige: "#e9dcc5",
};

/* --------------------------------- types --------------------------------- */
interface ProductCardProps {
  product: Product;
  isAboveFold?: boolean;
}

/* -------------------------------- component ------------------------------- */
export default function ProductCard1({ product, isAboveFold = false }: ProductCardProps) {
  const router = useRouter();
  const { addItem: addCartItem, openCart, items: cartItems } = useCart();
  const { addItem: addPreorderItem, item: preorderItem, clearCart: clearPreorderCart } =
    usePreorderCart();
  const {
    items: wishlistItems,
    addItem: addWishlistItem,
    removeItem: removeWishlistItem,
    openWishlist,
  } = useWishlist();

  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"cart" | "wishlist" | null>(null);

  const {
    productLink,
    variant,
    priceData,
    badges,
    isOutOfStock,
    isPreOrder,
    condition,
    img,
    blur,
  } = useMemo(() => {
    const link = `/product/${slugify(product.name)}?id=${product._id}`;

    const variant =
      product.variantsId?.find((v) => v.variants_stock > 0) ??
      product.variantsId?.[0] ??
      null;




      
    const sell = variant ? +variant.selling_price : 0;
    const offer = variant ? +variant.offer_price : sell;
    const now = Date.now();
    const start = variant?.discount_start_date
      ? new Date(variant.discount_start_date).getTime()
      : 0;
    const end = variant?.discount_end_date
      ? new Date(variant.discount_end_date).getTime()
      : 0;

    const isOffer = variant && offer < sell && now >= start && now <= end;
    const display = isOffer ? offer : sell;
    const pct = isOffer ? Math.round(((sell - offer) / sell) * 100) : 0;

    const outOfStock =
      !product.isPublish ||
      (variant ? variant.variants_stock <= 0 : product.total_stock <= 0);

    const isPreOrder =
      product.isPreOrder ||
      (product.hasVariants ? (variant?.isPreOrder ?? false) : (product.variantsId?.[0]?.isPreOrder ?? false));

    const currentImage = product.images?.[0];
    const img =
      currentImage?.alterImage?.secure_url ||
      currentImage?.image.secure_url ||
      "/placeholder.png";
    const blur =
      currentImage?.image.secure_url?.replace("/upload/", "/upload/e_blur:300/") ||
      "/placeholder.png";

    const condition = variant?.condition ?? "";

    return {
      productLink: link,
      variant,
      priceData: { sell, offer, display, pct, isOffer },
          badges: { condition, hasVariant: product.hasVariants },
      isOutOfStock: outOfStock,
      isPreOrder,
      condition,
      img,
      blur,
    };
  }, [product]);

  /* wishlist state */
  useEffect(() => {
    if (!variant) return;
    const hasVariants = product.hasVariants && product.variantsId.length > 0;
    const wishlistedId = hasVariants ? variant._id : product._id;
    setIsWishlisted(wishlistItems.some((item) => item._id === wishlistedId));
  }, [wishlistItems, variant, product]);

  /* derive size + color chips (best-effort) */
  const sizes = useMemo(() => {
    const vals: string[] = [];
    product?.variantsId?.forEach((v) =>
      v?.variants_values?.forEach((val) => {
        if (/^(XS|S|M|L|XL|2XL|3XL|\d{2})$/i.test(val)) vals.push(val.toUpperCase());
      })
    );
    return Array.from(new Set(vals)).slice(0, 3);
  }, [product]);

  const colors = useMemo(() => {
    const vals: string[] = [];
    product?.variantsId?.forEach((v) =>
      v?.variants_values?.forEach((val) => {
        const k = val.toLowerCase();
        if (COLOR_MAP[k]) vals.push(k);
      })
    );
    return Array.from(new Set(vals)).slice(0, 4);
  }, [product]);

  /* ---------------------------- actions (existing) --------------------------- */
  const addVariantToCart = (selectedVariant: any, quantity: number = 1) => {
    if (isPreOrder) {
      if (cartItems.length > 0) {
        toast.error("আপনার রেগুলার কার্টে প্রোডাক্ট আছে। প্রি-অর্ডার করতে হলে রেগুলার কার্ট ক্লিয়ার করুন।", {
          description: "চেকআউট পেজে গিয়ে রেগুলার কার্ট ক্লিয়ার করুন।",
          duration: 5000,
        });
        return;
      }
      const preOrderItem: TPreorderCartItem = {
        _id: selectedVariant._id,
        name: product.name,
        price: priceData.display,
        image: `${process.env.NEXT_PUBLIC_IMAGE_URL}${
          selectedVariant.image?.alterImage?.secure_url ?? product.images[0]?.alterImage?.secure_url
        }`,
        quantity,
        maxStock: selectedVariant.variants_stock ?? product.total_stock,
        variantValues: selectedVariant.variants_values ?? [],
        variantGroups: product.variantsGroup ?? [],
        variantId: selectedVariant._id,
        isPreOrder: true,
        currency: product.currency || "BDT",
      };
      addPreorderItem(preOrderItem);
      toast.success("Pre-order item added to cart!");
      return;
    }

    if (preorderItem) {
      toast.error("আপনার চেকআউটে ইতিমধ্যে একটা প্রি-অর্ডার প্রোডাক্ট আছে!", {
        description: "চেকআউট ক্লিয়ার করে রেগুলার প্রোডাক্ট যোগ করতে চান?",
        duration: 10000,
        action: {
          label: "চেকআউট ক্লিয়ার করুন",
          onClick: () => {
            clearPreorderCart();
            toast.success("✅ চেকআউট ক্লিয়ার হয়েছে!", {
              description: "এখন আপনি রেগুলার প্রোডাক্ট কার্টে যোগ করতে পারবেন",
              duration: 5000,
            });
          },
        },
      });
      return;
    }

    const hasVariants = product.hasVariants && product.variantsId.length > 0;
    const cartId = hasVariants ? selectedVariant._id : product.variantsId[0]._id;
    const cartVariantId = hasVariants ? selectedVariant._id : undefined;

    addCartItem({
      _id: cartId,
      variantId: cartVariantId,
      name: product.name,
      price: priceData.display,
      image:
        selectedVariant.image?.alterImage?.secure_url ||
        product.images?.[0]?.alterImage?.secure_url ||
        "/placeholder.png",
      quantity,
      maxStock: selectedVariant.variants_stock || product.total_stock,
      variantValues: selectedVariant.variants_values ?? [],
      variantGroups: product.variantsGroup ?? [],
      sellingPrice: Number(priceData.sell),
      currency: product.currency || "BDT",
      isWithinOffer: priceData.isOffer,
      ...(selectedVariant.variants_values &&
        selectedVariant.variants_values.length > 0 && {
          variantLabel: selectedVariant.variants_values.join(" / "),
        }),
    });
    openCart();
    toast.success("কার্টে যোগ করা হয়েছে!");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || !variant) {
      toast.error("Out of stock");
      return;
    }
    if (product.hasVariants) {
      setModalAction("cart");
      setIsModalOpen(true);
      return;
    }
    addVariantToCart(variant);
  };

  const handleVariantSelect = (selectedVariant: any, quantity: number) => {
    if (modalAction === "cart") addVariantToCart(selectedVariant, quantity);
    else if (modalAction === "wishlist") {
      const hasVariants = product.hasVariants && product.variantsId.length > 0;
      const wishlistId = hasVariants ? selectedVariant._id : product._id;
      const wishlistVariantId = hasVariants ? selectedVariant._id : undefined;

      const already = wishlistItems.some((i) => i._id === wishlistId);
      if (already) {
        removeWishlistItem(wishlistId);
        toast.success("Removed from wishlist!");
      } else {
        addWishlistItem({
          _id: wishlistId,
          productId: product._id,
          variantId: wishlistVariantId,
          name: product.name,
          price: Number(priceData.display),
          sellingPrice: Number(priceData.sell),
          isWithinOffer: priceData.isOffer,
          currency: product.currency || "BDT",
          image:
            selectedVariant.image?.alterImage?.secure_url ||
            product.images?.[0]?.alterImage?.secure_url ||
            "/placeholder.png",
          variantValues: selectedVariant.variants_values ?? [],
          variantGroups: product.variantsGroup ?? [],
        });
        toast.success("Added to wishlist!");
      }
      openWishlist();
    }
    setIsModalOpen(false);
    setModalAction(null);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPreOrder) {
      toast.error("Pre-order items cannot be added to wishlist");
      return;
    }
    if (!variant) {
      toast.error("Unavailable");
      return;
    }
    if (product.hasVariants) {
      setModalAction("wishlist");
      setIsModalOpen(true);
      return;
    }

    const hasVariants = product.hasVariants && product.variantsId.length > 0;
    const wishlistedId = hasVariants ? variant._id : product._id;

    if (isWishlisted) {
      removeWishlistItem(wishlistedId);
      toast.success("Removed from wishlist!");
    } else {
      const wishlistId = hasVariants ? variant._id : product._id;
      const wishlistVariantId = hasVariants ? variant._id : undefined;

      addWishlistItem({
        _id: wishlistId,
        productId: product._id,
        variantId: wishlistVariantId,
        name: product.name,
        price: Number(priceData.display),
        sellingPrice: Number(priceData.sell),
        isWithinOffer: priceData.isOffer,
        currency: product.currency || "BDT",
        image:
          variant.image?.alterImage?.secure_url ||
          product.images?.[0]?.alterImage?.secure_url ||
          "/placeholder.png",
        variantValues: variant.variants_values ?? [],
        variantGroups: product.variantsGroup ?? [],
      });
      toast.success("Added to wishlist!");
    }
    openWishlist();
  };

  /* --------------------------------- render -------------------------------- */
  return (
    <div
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={productLink} className="block" aria-label={`View ${product.name} details`} prefetch={false}>
        {/* Outer card */}
        <div className="relative flex flex-col rounded-[28px] overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100 bg-white">
          {/* image area */}
          <div className="relative bg-[#F2F4F7] w-full h-80 sm:h-88 grid place-items-center">
            {/* sale badge (left-top) */}
            {/* {priceData.isOffer && (
              <span className="absolute left-3 top-3 z-20 px-3 py-1.5 rounded-full text-[12px] font-bold text-white shadow-md
                               bg-gradient-to-r from-indigo-500 to-violet-500">
                Sale
              </span>
            )} */}



<div className="absolute top-0 left-0 z-20">
            <span
              className={`absolute left-3 top-3 z-20 px-3 py-1.5 rounded-full text-[12px] font-bold text-white shadow-md
                ${
                  badges.condition === "hot"
                    ? "bg-pink-500"
                    : badges.condition === "best selling"
                    ? "bg-sky-400"
                    : badges.condition === "new"
                    ? "bg-[#5644E6]"
                    : "bg-gray-400"
                }`}
            >
              {badges.condition
                ? badges.condition[0].toUpperCase() + badges.condition.slice(1)
                : "N/A"}
            </span>
          </div>
            {/* right-top: New! text + ghost actions */}
            <div className="absolute right-3 top-3 z-20 flex flex-col items-center gap-2">
              {condition?.toLowerCase() === "new" && (
                <span className="text-xs font-semibold text-slate-500">New!</span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(productLink);
                }}
                className="p-2 rounded-full bg-white/70 backdrop-blur border border-white/60 shadow-sm text-slate-500 hover:text-slate-700 hover:bg-white transition"
                aria-label="Quick view"
              >
                <FiEye className="w-4 h-4" />
              </button>
              <button
                onClick={handleWishlistClick}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`p-2 rounded-full border shadow-sm transition
                            ${isWishlisted ? "text-rose-500 bg-white" : "text-slate-500 bg-white/70 hover:text-rose-500"}
                            border-white/60 backdrop-blur`}
              >
                <FiHeart className="w-4 h-4" />
              </button>
            </div>

            {/* product image */}
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${img}`}
              alt={product.name}
              fill
              priority={isAboveFold}
              className={`object-contain transition-transform duration-500 ${isHovered ? "scale-[1.04]" : "scale-100"}`}
              sizes="(max-width:640px) 80vw, (max-width:1024px) 40vw, 320px"
              placeholder="blur"
              blurDataURL={blur}
              fallbackSrc="/assets/falback.jpg"
            />

            {/* big rounded 'Add to cart' inside image bottom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-5 grid place-items-center">
              <button
  onClick={handleAddToCart}
  disabled={isOutOfStock}
  className={`pointer-events-auto w-[75%] sm:w-4/5 text-center rounded-2xl py-3 font-semibold shadow-md
             ${isOutOfStock
               ? "bg-violet-200 text-white/80 cursor-not-allowed"
               : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500"}
             transition opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0`}
>
  Add To Cart +
</button>
            </div>
          </div>

          {/* details area */}
          <div className="px-3 sm:px-4 pt-3 pb-4">
            {/* title */}
            <h3 className="text-[15px] sm:text-[16px] font-semibold text-slate-800 hover:text-indigo-600 transition line-clamp-2">
              {product.name}
            </h3>

            {/* price + crossed old price + rating */}
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-[18px] sm:text-[20px] font-extrabold text-indigo-600">
                ৳{priceData.display.toFixed()}
              </span>
              {priceData.isOffer && (
                <span className="text-slate-400 line-through text-[13px] sm:text-[14px]">
                  ৳{priceData.sell.toFixed()}
                </span>
              )}

              {/* rating chip (if available) */}
              {(product as any)?.ratingAvg ? (
                <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[12px] font-semibold">
                  <FiStar className="w-3.5 h-3.5" />
                  {(product as any).ratingAvg.toFixed(1)}
                </span>
              ) : null}
              {(product as any)?.reviewsCount ? (
                <span className="text-slate-500 text-[12px]">({(product as any).reviewsCount})</span>
              ) : null}
            </div>

            {/* size chips + color dots */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex gap-1.5">
                {sizes.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md border text-[12px] font-semibold text-slate-700 border-slate-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
              {colors.length > 0 && (
                <div className="flex items-center gap-2">
                  {colors.slice(0, 3).map((c) => (
                    <span
                      key={c}
                      className="inline-block w-3.5 h-3.5 rounded-full border border-slate-200"
                      style={{ backgroundColor: COLOR_MAP[c] }}
                      aria-label={c}
                      title={c}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Variant modal (existing logic kept) */}
      {product.variantsId && (
        <VariantSelectModal
          isOpen={isModalOpen}
          variants={product.variantsId}
          onSelect={(v, qty) => handleVariantSelect(v, qty ?? 1)}
          onClose={() => {
            setIsModalOpen(false);
            setModalAction(null);
          }}
          product={product}
          isWishlistModal={modalAction === "wishlist"}
          variantsGroup={product.variantsGroup}
        />
      )}
    </div>
  );
}
