// "use client";

// import { useRouter } from "next/navigation";
// import Image from "@/components/ui/atoms/image";
// import Link from "next/link";
// import React, { useState, useMemo, useEffect } from "react";
// import { FiEye, FiHeart } from "react-icons/fi";
// import { toast } from "sonner";
// import { Product } from "@/types/product";
// import { useCart } from "@/hooks/useCart";
// import { useWishlist } from "@/hooks/useWishlist";
// import { usePreorderCart } from "@/hooks/usePreorderCart";
// import type { TPreorderCartItem } from "@/lib/features/preOrderCartSlice/preOrderCartSlice";
// import VariantSelectModal from "@/app/(public)/product/_component/VariantSelectModal";
// import QuickViewModal from "../molecules/QuickViewModal";
// import { FlashDealTimeCounter } from "../atoms/FlashDealTimeCounter";

// interface ProductCardProps {
//   product: Product;
//   isAboveFold?: boolean;
// }

// export default function ProductCard({
//   product,
//   isAboveFold = false,
// }: ProductCardProps) {
//   const router = useRouter();
//   const { addItem: addCartItem, openCart, items: cartItems } = useCart();
//   const { addItem: addPreorderItem, item: preorderItem, clearCart: clearPreorderCart } = usePreorderCart();
//   const {
//     items: wishlistItems,
//     addItem: addWishlistItem,
//     removeItem: removeWishlistItem,
//     openWishlist,
//   } = useWishlist();

//   const [isHovered, setIsHovered] = useState(false);
//   const [isWishlisted, setIsWishlisted] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalAction, setModalAction] = useState<"cart" | "wishlist" | null>(null);
//   const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);

//   const { productLink, variant, priceData, isOutOfStock, isPreOrder } = useMemo(() => {
//     const slugify = (name: string) =>
//       name
//         .toLowerCase()
//         .replace(/[অ-হ]/g, (c) => {
//           const m: Record<string, string> = {
//             অ: "o", আ: "a", ই: "i", ঈ: "i", উ: "u", ঊ: "u", ঋ: "ri",
//             এ: "e", ঐ: "oi", ও: "o", ঔ: "ou", ক: "k", খ: "kh", গ: "g", ঘ: "gh",
//           };
//           return m[c] || c;
//         })
//         .replace(/\s+/g, "-")
//         .replace(/[^\w-]+/g, "")
//         .replace(/--+/g, "-")
//         .replace(/^-+|-+$/g, "");

//     const productLink = `/product/${slugify(product.name)}?id=${product._id}`;
//     const variant =
//       product.variantsId?.find((v) => v.variants_stock > 0) ??
//       product.variantsId?.[0] ??
//       null;

//     const sell = variant ? +variant.selling_price : 0;
//     const offer = variant ? +variant.offer_price : sell;
//     const now = Date.now();
//     const start = variant?.discount_start_date
//       ? new Date(variant.discount_start_date).getTime()
//       : 0;
//     const end = variant?.discount_end_date
//       ? new Date(variant.discount_end_date).getTime()
//       : 0;

//     const isOffer = variant && offer < sell && now >= start && now <= end;
//     const display = isOffer ? offer : sell;
//     const pct = isOffer ? Math.round(((sell - offer) / sell) * 100) : 0;

//     const outOfStock =
//       !product.isPublish ||
//       (variant ? variant.variants_stock <= 0 : product.total_stock <= 0);

//     const isPreOrder =
//       product.isPreOrder ||
//       (product.hasVariants ? (variant?.isPreOrder ?? false) : (product.variantsId?.[0]?.isPreOrder ?? false));

//     return {
//       productLink,
//       variant,
//       priceData: { sell, offer, display, pct, isOffer },
//       isOutOfStock: outOfStock,
//       isPreOrder,
//     };
//   }, [product]);

//   useEffect(() => {
//     if (variant) {
//       const hasVariants = product.hasVariants && product.variantsId.length > 0;
//       const wishlistedId = hasVariants ? variant._id : product._id;
//       setIsWishlisted(wishlistItems.some((item) => item._id === wishlistedId));
//     }
//   }, [wishlistItems, variant, product]);

//   useEffect(() => {
//     const checkMobile = () => {
//       const isMobileDevice = window.innerWidth <= 640;
//       setIsMobile(isMobileDevice);
//     };
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   const addVariantToCart = (selectedVariant: any, quantity: number = 1) => {
//     if (isPreOrder) {
//       // Check if regular cart has items
//       if (cartItems.length > 0) {
//         toast.error("আপনার রেগুলার কার্টে প্রোডাক্ট আছে। প্রি-অর্ডার করতে হলে রেগুলার কার্ট ক্লিয়ার করুন।", {
//           description: "চেকআউট পেজে গিয়ে রেগুলার কার্ট ক্লিয়ার করুন।",
//           duration: 5000,
//         });
//         return;
//       }

//       const preOrderItem: TPreorderCartItem = {
//         _id: selectedVariant._id,
//         name: product.name,
//         price: priceData.display,
//         image: `${process.env.NEXT_PUBLIC_IMAGE_URL}${selectedVariant.image?.alterImage?.secure_url ?? product.images[0]?.alterImage?.secure_url}`,
//         quantity,
//         maxStock: selectedVariant.variants_stock ?? product.total_stock,
//         variantValues: selectedVariant.variants_values ?? [],
//         variantGroups: product.variantsGroup ?? [],
//         variantId: selectedVariant._id,
//         isPreOrder: true,
//         currency: product.currency || "BDT",
//       };
//       addPreorderItem(preOrderItem);
//       toast.success("Pre-order item added to cart!");
//     } else {
//       if (preorderItem) {
//         toast.error("আপনার চেকআউটে ইতিমধ্যে একটা প্রি-অর্ডার প্রোডাক্ট আছে!", {
//           description: "চেকআউট ক্লিয়ার করে রেগুলার প্রোডাক্ট যোগ করতে চান?",
//           duration: 10000,
//           action: {
//             label: "চেকআউট ক্লিয়ার করুন",
//             onClick: () => {
//               clearPreorderCart();
//               toast.success("✅ চেকআউট ক্লিয়ার হয়েছে!", {
//                 description: "এখন আপনি রেগুলার প্রোডাক্ট কার্টে যোগ করতে পারবেন",
//                 duration: 5000,
//               });
//             },
//           },
//         });
//         return;
//       }

//       const hasVariants = product.hasVariants && product.variantsId.length > 0;
//       const cartId = hasVariants ? selectedVariant._id : product.variantsId[0]._id;
//       const cartVariantId = hasVariants ? selectedVariant._id : undefined;

//       const cartItem = {
//         _id: cartId,
//         variantId: cartVariantId,
//         name: product.name,
//         price: priceData.display,
//         image:
//           selectedVariant.image?.alterImage?.secure_url ||
//           product.images?.[0]?.alterImage?.secure_url ||
//           "/placeholder.png",
//         quantity,
//         maxStock: selectedVariant.variants_stock || product.total_stock,
//         variantValues: selectedVariant.variants_values ?? [],
//         variantGroups: product.variantsGroup ?? [],
//         sellingPrice: Number(priceData.sell),
//         currency: product.currency || "BDT",
//         isWithinOffer: priceData.isOffer,
//         ...(selectedVariant.variants_values && selectedVariant.variants_values.length > 0 && {
//           variantLabel: selectedVariant.variants_values.join(" / "),
//         }),
//       };
//       addCartItem(cartItem);
//       openCart();
//       toast.success("কার্টে যোগ করা হয়েছে!");
//     }
//   };

//   const handleAddToCart = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (isOutOfStock || !variant) {
//       toast.error("Out of stock");
//       return;
//     }

//     if (product.hasVariants) {
//       setModalAction("cart");
//       setIsModalOpen(true);
//       return;
//     }

//     addVariantToCart(variant);
//   };

//   const handleVariantSelect = (selectedVariant: any, quantity: number) => {
//     if (modalAction === "cart") {
//       addVariantToCart(selectedVariant, quantity);
//     } else if (modalAction === "wishlist") {
//       const hasVariants = product.hasVariants && product.variantsId.length > 0;
//       const wishlistId = hasVariants ? selectedVariant._id : product._id;
//       const wishlistVariantId = hasVariants ? selectedVariant._id : undefined;

//       const isAlreadyWishlisted = wishlistItems.some((item) => item._id === wishlistId);

//       if (isAlreadyWishlisted) {
//         removeWishlistItem(wishlistId);
//         toast.success("Removed from wishlist!");
//       } else {
//         const wishlistItem = {
//           _id: wishlistId,
//           productId: product._id,
//           variantId: wishlistVariantId,
//           name: product.name,
//           price: Number(priceData.display),
//           sellingPrice: Number(priceData.sell),
//           isWithinOffer: priceData.isOffer,
//           currency: product.currency || "BDT",
//           image:
//             selectedVariant.image?.alterImage?.secure_url ||
//             product.images?.[0]?.alterImage?.secure_url ||
//             "/placeholder.png",
//           variantValues: selectedVariant.variants_values ?? [],
//           variantGroups: product.variantsGroup ?? [],
//         };

//         addWishlistItem(wishlistItem);
//         toast.success("Added to wishlist!");
//       }
//       openWishlist();
//     }

//     setIsModalOpen(false);
//     setModalAction(null);
//   };

//   const handleWishlistClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (isPreOrder) {
//       toast.error("Pre-order items cannot be added to wishlist");
//       return;
//     }

//     if (!variant) {
//       toast.error("Unavailable");
//       return;
//     }

//     if (product.hasVariants) {
//       setModalAction("wishlist");
//       setIsModalOpen(true);
//       return;
//     }

//     const hasVariants = product.hasVariants && product.variantsId.length > 0;
//     const wishlistedId = hasVariants ? variant._id : product._id;

//     if (isWishlisted) {
//       removeWishlistItem(wishlistedId);
//       toast.success("Removed from wishlist!");
//     } else {
//       const wishlistId = hasVariants ? variant._id : product._id;
//       const wishlistVariantId = hasVariants ? variant._id : undefined;

//       const wishlistItem = {
//         _id: wishlistId,
//         productId: product._id,
//         variantId: wishlistVariantId,
//         name: product.name,
//         price: Number(priceData.display),
//         sellingPrice: Number(priceData.sell),
//         isWithinOffer: priceData.isOffer,
//         currency: product.currency || "BDT",
//         image:
//           variant.image?.alterImage?.secure_url ||
//           product.images?.[0]?.alterImage?.secure_url ||
//           "/placeholder.png",
//         variantValues: variant.variants_values ?? [],
//         variantGroups: product.variantsGroup ?? [],
//       };

//       addWishlistItem(wishlistItem);
//       toast.success("Added to wishlist!");
//     }
//     openWishlist();
//   };

//   const img =
//     product.images?.[0]?.alterImage?.secure_url ||
//     product.images?.[0]?.image.secure_url ||
//     "/placeholder.png";
//   const blur =
//     product.images?.[0]?.image.secure_url?.replace(
//       "/upload/",
//       "/upload/e_blur:300/"
//     ) || "/placeholder.png";

//   return (
//     <div
//       className="group relative py-2"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
// <Link
//   href={productLink}
//   className="block"
//   aria-label={`View ${product.name} details`}
//   prefetch={false}
// >
//   {/* Outer card */}
// <div className="relative mx-auto w-full max-w-[800px] h-[420px] md:h-[460px] ">

//     {/* 2 columns like mockup */}
//     <div className="grid grid-cols-12 items-stretch gap-0">
//       {/* LEFT PANEL */}
//  <div className="col-span-12 md:col-span-6 py-8 md:py-10 px-6 md:px-8]">

//         {/* title (truncate like “Premium Off Shou…”) */}
//         <h3 className="text-xl md:text-[32px] font-extrabold leading-tight tracking-tight text-[#0F265C] dark:text-white w-[90%] md:w-[85%] truncate">
//           {product.name}
//         </h3>

//         {/* short description (2 lines) */}
//         {product?.short_description && (
//           <p className="mt-3 text-[14px] md:text-[15px] leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-2">
//             {product.short_description}
//           </p>
//         )}

//         {/* rating row */}
//         <div className="mt-4 flex items-center gap-2 text-[13px] md:text-[14px]">
//           <span className="text-amber-500">★</span>
//           <span className="text-gray-700 dark:text-gray-300">
//             {(product.rating ?? 4).toFixed(1)} / 5.0
//           </span>
//           <span className="text-gray-400">( {product.reviewsCount ?? 2} )</span>
//         </div>

//         {/* price row */}
//         <div className="mt-3 flex items-end gap-3">
//           <span className="text-[28px] md:text-[32px] font-extrabold text-[#5B21D3]">
//             ৳{priceData.display.toFixed()}
//           </span>
//           {priceData.isOffer && (
//             <span className="text-[15px] md:text-[16px] line-through text-gray-400">
//               ৳{priceData.sell.toFixed()}
//             </span>
//           )}
//         </div>

//         {/* size pills (ডেমো – চাইলে ডায়নামিক করবে) */}
//         <div className="mt-4 flex items-center gap-2">
//           <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-700">
//             M
//           </span>
//           <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-sm font-semibold text-gray-700">
//             L
//           </span>
//         </div>

//         {/* countdown like mockup */}
//         <div className="mt-5">
         
//           {/* তোমার রিয়েল টাইমার চাইলে আগের কম্পোনেন্টটাকেও রাখতে পারো */}
//           <div className="mt-3">
//             <FlashDealTimeCounter endDate={(variant?.discount_end_date as string) ?? ''} />
//           </div>
//         </div>

//         {/* actions row */}
//         <div className="mt-6 flex items-center gap-3">
//           <button
//             onClick={handleAddToCart}
//             className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 md:px-7 py-3 text-white text-[15px] font-semibold shadow-[0_14px_30px_rgba(79,70,229,0.35)] hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
//           >
//             Add To Cart +
//           </button>

//           {/* view */}
//           <button
//             onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsQuickViewOpen(true); }}
//             className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 hover:scale-[1.03] transition"
//             aria-label="Quick view"
//           >
//             <FiEye className="text-[18px]" />
//           </button>

//           {/* wishlist */}
//           <button
//             onClick={handleWishlistClick}
//             className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 hover:scale-[1.03] transition"
//             aria-label="Add to wishlist"
//           >
//             <FiHeart className="text-[18px]" />
//           </button>
//         </div>

//         {/* cute emoji decorations like mockup */}
//         <span className="absolute left-6 top-[56%] hidden md:block select-none">🌼</span>
//         <span className="absolute left-[44%] top-[55%] hidden md:block rotate-12 select-none">🦋</span>
//       </div>

    
// {/* RIGHT PANEL (image) */}
// <div className="col-span-12 md:col-span-6 p-6 md:p-8 relative z-10">
//   {/* কার্ডের height ফিক্সড: বাইরের কার্ডে যোগ করো h-[420px] md:h-[460px] */}
//  <div className="relative h-full min-h-[395px] w-full rounded-[36px] bg-gray-100 dark:bg-white/5 overflow-visible">
//     {/* ভেতরের ক্যানভাসটাকে parent-এর চেয়ে একটু বড় করলাম */}
//     <div className="absolute inset-x-0 top-[-24px] bottom-[-24px] md:top-[-32px] md:bottom-[-32px]">
//       <Image
//         src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${img}`}
//         alt={product.name}
//         fill
//         priority={isAboveFold}
//         className="object-contain"
//         sizes="(max-width: 768px) 100vw, 50vw"
//         placeholder="blur"
//         blurDataURL={blur}
//       />
//     </div>

//     {/* small vertical dots */}
//     <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 pointer-events-none">
//       <span className="h-2 w-2 rounded-full bg-black/10 dark:bg-white/30" />
//       <span className="h-2 w-2 rounded-full bg-black/60 dark:bg-white" />
//       <span className="h-2 w-2 rounded-full bg-black/10 dark:bg-white/30" />
//     </div>
//   </div>
// </div>


      
//     </div>
//   </div>
// </Link>


//       {product.variantsId && (
//         <VariantSelectModal
//           isOpen={isModalOpen}
//           variants={product.variantsId}
//           onSelect={handleVariantSelect}
//           onClose={() => {
//             setIsModalOpen(false);
//             setModalAction(null);
//           }}
//           product={product}
//           isWishlistModal={modalAction === "wishlist"}
//           variantsGroup={product.variantsGroup}
//         />
//       )}

//       {/* Quick View Modal */}
//       <QuickViewModal
//         product={product}
//         isOpen={isQuickViewOpen}
//         onClose={() => setIsQuickViewOpen(false)}
//       />
//     </div>
//   );
// }









"use client";

import { useRouter } from "next/navigation";
import Image from "@/components/ui/atoms/image";
import Link from "next/link";
import React, { useState, useMemo, useEffect } from "react";
import { FiEye, FiHeart } from "react-icons/fi";
import { toast } from "sonner";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { usePreorderCart } from "@/hooks/usePreorderCart";
import type { TPreorderCartItem } from "@/lib/features/preOrderCartSlice/preOrderCartSlice";
import VariantSelectModal from "@/app/(public)/product/_component/VariantSelectModal";
import QuickViewModal from "../molecules/QuickViewModal";
import { FlashDealTimeCounter } from "../atoms/FlashDealTimeCounter";

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
        className="block"
        aria-label={`View ${product.name} details`}
        prefetch={false}
      >
        {/* Outer Card - Mobile responsive */}
        <div className="flex flex-col md:flex-row h-auto md:h-[460px] w-full max-w-[300px] md:max-w-[800px] rounded-[26px] overflow-hidden">
          
          {/* Mobile: Image First, Desktop: Text First */}
          {/* IMAGE PANEL - Mobile: Full width, Desktop: Right side */}
          <div className="relative w-full   md:w-[50%] h-[350px]  md:h-full md:-ml-6 z-10 order-1 md:order-2 -mb-4">
            <div className="relative h-full w-full rounded-[26px] overflow-hidden bg-gray-100 dark:bg-white/5">
              <Image
                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${img}`}
                alt={product.name}
                fill
                className="object-cover rounded-[26px]"
                sizes="(max-width: 768px) 100vw, 50vw"
                placeholder="blur"
                blurDataURL={blur}
              />
            </div>

            {/* dots - Hidden on mobile */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 pointer-events-none">
              <span className="h-2 w-2 rounded-full bg-black/10 dark:bg-white/30" />
              <span className="h-2 w-2 rounded-full bg-black/60 dark:bg-white" />
              <span className="h-2 w-2 rounded-full bg-black/10 dark:bg-white/30" />
            </div>
          </div>

          {/* TEXT INFO PANEL - Mobile: Full width, Desktop: Left side */}
          <div className="w-full md:w-[55%] h-auto md:h-[380px] flex flex-col justify-center px-4 md:px-6 lg:px-8 py-6 md:py-8 bg-transparent shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-2 rounded-2xl self-center order-2 md:order-1 mt-4 md:mt-0">
            <h3 className="text-lg md:text-xl lg:text-[32px] font-extrabold leading-tight tracking-tight text-[#0F265C] dark:text-white w-full md:w-[90%] truncate">
              {product.name}
            </h3>

            {product?.short_description && (
              <p className="mt-2 md:mt-3 text-sm md:text-[14px] lg:text-[15px] leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-2">
                {product.short_description}
              </p>
            )}

            {/* rating */}
            <div className="mt-3 md:mt-4 flex items-center gap-2 text-xs md:text-[13px] lg:text-[14px]">
              <span className="text-amber-500">★</span>
              <span className="text-gray-700 dark:text-gray-300">
                {(product.rating ?? 4).toFixed(1)} / 5.0
              </span>
              <span className="text-gray-400">( {product.reviewsCount ?? 2} )</span>
            </div>

            {/* price */}
            <div className="mt-2 md:mt-3 flex items-end gap-3">
              <span className="text-xl md:text-[28px] lg:text-[32px] font-extrabold text-[#5B21D3]">
                ৳{priceData.display.toFixed()}
              </span>
              {priceData.isOffer && (
                <span className="text-sm md:text-[15px] lg:text-[16px] line-through text-gray-400">
                  ৳{priceData.sell.toFixed()}
                </span>
              )}
            </div>

            {/* buttons - Mobile: Stacked, Desktop: Inline */}
            <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleAddToCart}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 md:px-6 lg:px-7 py-3 text-white text-sm md:text-[15px] font-semibold shadow-[0_14px_30px_rgba(79,70,229,0.35)] hover:bg-indigo-700"
              >
                Add To Cart +
              </button>

              <div className="flex gap-2 w-full sm:w-auto justify-center">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsQuickViewOpen(true); }}
                  className="inline-flex h-10 md:h-12 w-10 md:w-12 items-center justify-center rounded-2xl bg-white text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 hover:scale-[1.03] transition"
                  aria-label="Quick view"
                >
                  <FiEye className="text-base md:text-[18px]" />
                </button>

                <button
                  onClick={handleWishlistClick}
                  className="inline-flex h-10 md:h-12 w-10 md:w-12 items-center justify-center rounded-2xl bg-white text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 hover:scale-[1.03] transition"
                  aria-label="Add to wishlist"
                >
                  <FiHeart className="text-base md:text-[18px]" />
                </button>
              </div>
            </div>

            {/* Emoji Decorations - Hidden on mobile */}
            <span className="absolute left-4 md:left-6 top-[40%] hidden md:block select-none">🌼</span>
            <span className="absolute left-[45%] top-[50%] hidden md:block rotate-12 select-none">🦋</span>
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





