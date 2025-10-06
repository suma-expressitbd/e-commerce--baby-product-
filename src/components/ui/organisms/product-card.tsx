"use client";

import { useRouter } from "next/navigation";
import Image from "@/components/ui/atoms/image";
import Link from "next/link";
import React, { useState, useMemo, useEffect } from "react";
import { FiHeart } from "react-icons/fi";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { usePreorderCart } from "@/hooks/usePreorderCart";
import type { TPreorderCartItem } from "@/lib/features/preOrderCartSlice/preOrderCartSlice";
import VariantSelectModal from "@/app/(public)/product/_component/VariantSelectModal";
import QuickViewModal from "../molecules/QuickViewModal";

interface ProductCardProps {
  product: Product;
  isAboveFold?: boolean;
}

export default function ProductCard({
  product,
  isAboveFold = false,
}: ProductCardProps) {
  const router = useRouter();
  const { addItem: addCartItem, openCart, items: cartItems } = useCart();
  const { addItem: addPreorderItem, item: preorderItem, clearCart: clearPreorderCart } = usePreorderCart();
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
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { productLink, variant, priceData, isOutOfStock, isPreOrder } = useMemo(() => {
    const slugify = (name: string) =>
      name
        .toLowerCase()
        .replace(/[অ-হ]/g, (c) => {
          const m: Record<string, string> = {
            অ: "o", আ: "a", ই: "i", ঈ: "i", উ: "u", ঊ: "u", ঋ: "ri",
            এ: "e", ঐ: "oi", ও: "o", ঔ: "ou", ক: "k", খ: "kh", গ: "g", ঘ: "gh",
          };
          return m[c] || c;
        })
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+|-+$/g, "");

    const productLink = `/product/${slugify(product.name)}?id=${product._id}`;
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

    return {
      productLink,
      variant,
      priceData: { sell, offer, display, pct, isOffer },
      isOutOfStock: outOfStock,
      isPreOrder,
    };
  }, [product]);

  useEffect(() => {
    if (variant) {
      const hasVariants = product.hasVariants && product.variantsId.length > 0;
      const wishlistedId = hasVariants ? variant._id : product._id;
      setIsWishlisted(wishlistItems.some((item) => item._id === wishlistedId));
    }
  }, [wishlistItems, variant, product]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 640;
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const addVariantToCart = (selectedVariant: any, quantity: number = 1) => {
    if (isPreOrder) {
      // Check if regular cart has items
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
        image: `${process.env.NEXT_PUBLIC_IMAGE_URL}${selectedVariant.image?.alterImage?.secure_url ?? product.images[0]?.alterImage?.secure_url}`,
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
    } else {
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

      const cartItem = {
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
        ...(selectedVariant.variants_values && selectedVariant.variants_values.length > 0 && {
          variantLabel: selectedVariant.variants_values.join(" / "),
        }),
      };
      addCartItem(cartItem);
      openCart();
      toast.success("কার্টে যোগ করা হয়েছে!");
    }
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
    if (modalAction === "cart") {
      addVariantToCart(selectedVariant, quantity);
    } else if (modalAction === "wishlist") {
      const hasVariants = product.hasVariants && product.variantsId.length > 0;
      const wishlistId = hasVariants ? selectedVariant._id : product._id;
      const wishlistVariantId = hasVariants ? selectedVariant._id : undefined;

      const isAlreadyWishlisted = wishlistItems.some((item) => item._id === wishlistId);

      if (isAlreadyWishlisted) {
        removeWishlistItem(wishlistId);
        toast.success("Removed from wishlist!");
      } else {
        const wishlistItem = {
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
        };

        addWishlistItem(wishlistItem);
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

      const wishlistItem = {
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
      };

      addWishlistItem(wishlistItem);
      toast.success("Added to wishlist!");
    }
    openWishlist();
  };

  const img =
    product.images?.[0]?.alterImage?.secure_url ||
    product.images?.[0]?.image.secure_url ||
    "/placeholder.png";
  const blur =
    product.images?.[0]?.image.secure_url?.replace(
      "/upload/",
      "/upload/e_blur:300/"
    ) || "/placeholder.png";

  return (
    <div
      className="group relative py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      <Link
        href={productLink}
        className="block relative"
        aria-label={`View ${product.name} details`}
        prefetch={false}
      >
        <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-black shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
          {priceData.isOffer && (
            <span className="absolute top-3 left-3 z-20 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              -{priceData.pct}%
            </span>
          )}
          <div className="relative w-full aspect-[3/5] sm:aspect-[3/4] bg-pink-50 dark:bg-black overflow-hidden rounded-xl">
            <Image
              src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${img}`}
              alt={product.name}
              fill
              priority={isAboveFold}
              className={`transition-transform duration-500 ${isHovered ? "scale-[1.3] rotate-1" : "scale-100"}`}
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
              placeholder="blur"
              blurDataURL={blur}
              fallbackSrc="/assets/falback.jpg"
              objectFit="cover"
            />
            <button
              type="button"
              onClick={handleWishlistClick}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`absolute top-2 right-2 p-2 rounded-full border ${isWishlisted
                ? "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-500"
                : "border-pink-200 bg-white dark:bg-gray-700 text-[#C43882]"
                } hover:shadow-md z-10 transition-colors ${isPreOrder ? "cursor-not-allowed opacity-50" : ""}`}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              disabled={isPreOrder}
            >
              <FiHeart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
            </button>

          </div>
          <div className="p-3 sm:p-4 bg-pink-50/40 dark:bg-black">
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white line-clamp-1">
              {product.name}
            </h3>
            <div className="flex justify-between items-baseline">
              <span className="md:text-xl text-[14px] font-semibold text-primary">
                {"৳"}{priceData.display.toFixed()}
              </span>
              {priceData.isOffer && (
                <span className="line-through text-gray-400 md:text-xl">
                  {"৳"}{priceData.sell.toFixed()}

                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 px-1 py-1 w-full">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`inline-block text-white font-bold rounded-lg text-xs md:text-lg p-1 md:p-2 hover:shadow-md disabled:opacity-60  text-nowrap ${isPreOrder
                ? "bg-gradient-to-r from-orange-500 to-red-500"
                : "bg-primary dark:bg-primary"
                }`}
            >
              {isPreOrder ? "প্রি-অর্ডার করুন" : "অর্ডার করুন"}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="inline-block text-[#C43882] border border-[#C43882] text-xs md:text-lg p-1 md:p-2 font-bold rounded-lg hover:bg-[#C43882] hover:text-white transition-colors text-nowrap"
            >
              Quick View
            </button>
          </div>
        </div>
      </Link>
      {product.variantsId && (
        <VariantSelectModal
          isOpen={isModalOpen}
          variants={product.variantsId}
          onSelect={handleVariantSelect}
          onClose={() => {
            setIsModalOpen(false);
            setModalAction(null);
          }}
          product={product}
          isWishlistModal={modalAction === "wishlist"}
          variantsGroup={product.variantsGroup}
        />
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
}