/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiHeart } from "react-icons/fi";
import { toast } from "sonner";
import type { Product, Variant } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { usePreorderCart } from "@/hooks/usePreorderCart";
import { useWishlist } from "@/hooks/useWishlist";
import ProductPricing from "../_component/ProductPricing";
import QuantityControls from "../_component/QuantityControls";
import ProductTabs from "../_component/ProductTabs";
import RelatedProducts from "@/components/RelatedProducts";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import MediaGallery, { MediaItem } from "../_component/MediaGallery";
import { CartSheet } from "@/components/ui/organisms/cart-sheet";
import { WishlistSheet } from "@/components/ui/organisms/WishlistSheet";
import VariantSelectModal from "../_component/VariantSelectModal";
import { trackProductView } from "@/utils/gtm";
import { TCartItem } from "@/lib/features/cart/cartSlice";
import { FaHome } from "react-icons/fa";
import Link from "next/link";
import { Button } from "@/components/ui/atoms/button";
import { WishlistItem } from '@/lib/features/wishlist/wishlistSlice';
import Modal from "@/components/ui/molecules/modal";
import { addProduct } from "@/lib/features/recentlyViewedSlice";
import { BkashCashbackModal } from "@/components/bkashCashbackModal";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { addItem, openCart, items: cartItems, clearCart: clearRegularCart } = useCart();
  const { addItem: addPreorderItem, item: preorderItem, clearCart: clearPreorderCart } = usePreorderCart();
  const { items: wishlistItems, addItem: addWishlistItem, removeItem: removeWishlistItem } = useWishlist();

  const hasVariants = product.hasVariants;
  const variants = product.variantsId;
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [variantPicked, setVariantPicked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [variantError, setVariantError] = useState(false);
  const [activeTab, setActiveTab] = useState<"Short-Description" | "Long-Description" | "specs" | "shipping" | string>("Short-Description");
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [wishlistVariantModalOpen, setWishlistVariantModalOpen] = useState(false);
  const [isPreorderConflictModalOpen, setIsPreorderConflictModalOpen] = useState(false);
  const [isRegularCartConflictModalOpen, setIsRegularCartConflictModalOpen] = useState(false);
  const variantSelectRef = useRef<HTMLSelectElement>(null);
  const fallbackImage = "/assets/falback.jpg";

  // Select a default variant
  const defaultVariant = useMemo(() => variants.find((v) => v.variants_stock > 0) || variants[0], [variants]);

  // Memoized calculations for media
  const allMedia = useMemo<MediaItem[]>(() => {
    const media: MediaItem[] = [];

    // Add video if available
    if (product.video?.[0]?.video) {
      const videoUrl = product.video[0].alterVideo?.secure_url || product.video[0].video.secure_url;
      if (videoUrl) {
        media.push({
          type: "video",
          url: `${process.env.NEXT_PUBLIC_VIDEO_URL}${videoUrl}`,
          public_id: product.video[0].video.public_id,
          _id: product.video[0]._id,
        });
      }
    }

    // Add product images
    const images = product.images.map((img) => {
      const imageUrl = img.alterImage?.optimizeUrl || img.alterImage?.secure_url;
      return {
        type: "image" as const,
        url: imageUrl ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${imageUrl}` : fallbackImage,
        public_id: img.image.public_id,
        _id: img._id,
      };
    });

    // Add selected variant's image if available
    if (selectedVariant?.image) {
      const vUrl = `${process.env.NEXT_PUBLIC_IMAGE_URL}${selectedVariant.image.alterImage.optimizeUrl || selectedVariant.image.alterImage.secure_url}`;
      const idx = images.findIndex((i) => i.url === vUrl);
      const vItem: MediaItem =
        idx > -1
          ? (images.splice(idx, 1)[0] as MediaItem)
          : {
            type: "image",
            url: vUrl,
            public_id: selectedVariant.image.alterImage.public_id,
            _id: `${selectedVariant._id}-img`,
          };
      media.splice(media.length ? 1 : 0, 0, vItem);
    }

    media.push(...images);
    return media;
  }, [product.images, product.video, selectedVariant, fallbackImage]);

  // Compute selectedMediaUrl for the variant
  const selectedMediaUrl = useMemo(() => {
    if (variantPicked && selectedVariant?.image) {
      return `${process.env.NEXT_PUBLIC_IMAGE_URL}${selectedVariant.image.alterImage.optimizeUrl || selectedVariant.image.alterImage.secure_url}`;
    }
    return undefined;
  }, [variantPicked, selectedVariant]);

  const stock = useMemo(() => selectedVariant ? selectedVariant.variants_stock : product.total_stock, [selectedVariant, product.total_stock]);

  const sellingPrice = useMemo(() => {
    const v = selectedVariant || defaultVariant;
    return Number(v?.selling_price ?? product.selling_price ?? 0);
  }, [selectedVariant, defaultVariant, product.selling_price]);

  const offerPrice = useMemo(() => {
    const v = selectedVariant || defaultVariant;
    return Number(v?.offer_price ?? v?.selling_price ?? product.selling_price ?? 0);
  }, [selectedVariant, defaultVariant, product.selling_price]);

  const discountStartDate = useMemo(() => {
    const v = selectedVariant || defaultVariant;
    return v?.discount_start_date ?? undefined;
  }, [selectedVariant, defaultVariant]);

  const discountEndDate = useMemo(() => {
    const v = selectedVariant || defaultVariant;
    return v?.discount_end_date ?? undefined;
  }, [selectedVariant, defaultVariant]);

  const isWithinOffer = useMemo(() => {
    const v = selectedVariant || defaultVariant;
    const now = Date.now();
    const offerStart = v?.discount_start_date ? new Date(v.discount_start_date).getTime() : 0;
    const offerEnd = v?.discount_end_date ? new Date(v.discount_end_date).getTime() : Infinity;
    const currentOfferPrice = Number(v?.offer_price ?? product.selling_price ?? 0);
    const currentSellingPrice = Number(v?.selling_price ?? product.selling_price ?? 0);
    return currentOfferPrice < currentSellingPrice && now >= offerStart && now <= offerEnd;
  }, [selectedVariant, defaultVariant, product.selling_price]);

  const isPreOrder = useMemo(() => {
    const v = selectedVariant || defaultVariant;
    const result = product.isPreOrder ||
      (product.hasVariants ? (v?.isPreOrder ?? false) : (product.variantsId?.[0]?.isPreOrder ?? false));
    return result;
  }, [selectedVariant, defaultVariant, product]);

  const discountPercent = useMemo(() => {
    if (isWithinOffer) {
      return Math.round(((sellingPrice - offerPrice) / sellingPrice) * 100);
    }
    return 0;
  }, [isWithinOffer, offerPrice, sellingPrice]);
  const discount_amount = isWithinOffer ? (sellingPrice - offerPrice).toFixed() : '0';
  const isWishlisted = useMemo(() => {
    const currentVariantId = hasVariants ? selectedVariant?._id || defaultVariant?._id : product._id;
    return wishlistItems.some((i) => i._id === currentVariantId);
  }, [wishlistItems, hasVariants, selectedVariant, defaultVariant, product._id]);

  // Analytics and recently viewed tracking
  useEffect(() => {
    trackProductView(product, selectedVariant || defaultVariant);
    dispatch(addProduct(product));
  }, [product._id, dispatch]);

  // Handlers
  const handleQtyChange = useCallback((val: number) => {
    setQuantity(Math.min(Math.max(1, val), stock));
  }, [stock]);

  const addToCartOrPreOrder = useCallback((variant: Variant | null, modalQty?: number) => {
    const price = isWithinOffer ? offerPrice : sellingPrice;

    if (isPreOrder) {
      if (preorderItem) {
        setIsPreorderConflictModalOpen(true);
        return false;
      }

      // Check if regular cart has items
      if (cartItems.length > 0) {
        setIsRegularCartConflictModalOpen(true);
        return false;
      }

      const now = Date.now();
      const offerStart = variant?.discount_start_date ? new Date(variant.discount_start_date).getTime() : 0;
      const offerEnd = variant?.discount_end_date ? new Date(variant.discount_end_date).getTime() : 0;
      const variantSellingPrice = variant ? Number(variant.selling_price) : Number(product.selling_price ?? 0);
      const variantOfferPrice = variant ? Number(variant.offer_price) : Number(product.selling_price ?? 0);
      const isWithinOfferPre = variantOfferPrice < variantSellingPrice && now >= offerStart && now <= offerEnd;

      const finalPrice = isWithinOfferPre ? variantOfferPrice : variantSellingPrice;

      const preorderCartItem = {
        _id: variant?._id ?? product._id,
        name: product.name,
        price: finalPrice,
        image: `${process.env.NEXT_PUBLIC_IMAGE_URL}${variant?.image?.alterImage?.secure_url ?? product.images[0]?.alterImage?.secure_url}`,
        quantity: modalQty ?? quantity,
        maxStock: variant?.variants_stock ?? product.total_stock,
        variantValues: variant?.variants_values ?? [],
        variantId: variant?._id,
        isPreOrder: true,
        currency: product.currency || "BDT",
      };
      addPreorderItem(preorderCartItem);
      toast.success("প্রি-অর্ডার কার্টে যোগ করা হয়েছে");
      router.push("/checkout");
    } else {
      const hasVariants = product.hasVariants && product.variantsId.length > 0;
      const cartId = hasVariants && variant ? variant._id : product.variantsId[0]._id;
      const cartVariantId = hasVariants && variant ? variant._id : undefined;

      const cartItem: TCartItem = {
        _id: cartId,
        variantId: cartVariantId,
        name: product.name,
        price,
        sellingPrice,
        image: `${process.env.NEXT_PUBLIC_IMAGE_URL}${variant?.image?.alterImage?.secure_url || product.images[0]?.alterImage?.secure_url || fallbackImage}`,
        quantity: modalQty ?? quantity,
        maxStock: variant?.variants_stock ?? product.total_stock,
        variantValues: variant?.variants_values ?? [],
        variantGroups: product.variantsGroup,
        currency: product.currency || "BDT",
        isWithinOffer,
      };
      addItem(cartItem);
      openCart();
      toast.success("পণ্য কার্টে যোগ করা হয়েছে");
    }

    // Only reset variant if necessary
    if (!hasVariants || variants.length <= 1) {
      setSelectedVariant(null);
      setVariantPicked(false);
    }
    setQuantity(1); // Reset quantity for next addition
    return true;
  }, [addItem, openCart, product, hasVariants, isWithinOffer, offerPrice, sellingPrice, quantity, fallbackImage, isPreOrder, preorderItem, addPreorderItem]);

  const handleClearPreorderAndProceed = useCallback(() => {
    clearPreorderCart();
    setIsPreorderConflictModalOpen(false);
    // Now proceed with adding the preorder item
    addToCartOrPreOrder(selectedVariant);
  }, [clearPreorderCart, addToCartOrPreOrder, selectedVariant]);

  const handleGoToCheckoutFromPreorder = useCallback(() => {
    setIsPreorderConflictModalOpen(false);
    router.push("/checkout");
  }, [router]);

  const handleClearRegularCartAndProceed = useCallback(() => {
    clearRegularCart();
    setIsRegularCartConflictModalOpen(false);
    // Now proceed with adding the preorder item
    addToCartOrPreOrder(selectedVariant);
  }, [clearRegularCart, addToCartOrPreOrder, selectedVariant]);

  const handleGoToCheckoutFromRegular = useCallback(() => {
    setIsRegularCartConflictModalOpen(false);
    router.push("/checkout");
  }, [router]);

  const handleAddToCart = useCallback(() => {
    console.log('handleAddToCart called', {
      hasVariants,
      variantsLength: variants.length,
      selectedVariant: selectedVariant ? selectedVariant._id : null,
      isVariantModalOpen
    });
    if (hasVariants && variants.length > 1) {
      console.log('Opening variant modal');
      setIsVariantModalOpen(true);
      setVariantError(true);
      return false;
    }
    const variantToUse = hasVariants && variants.length > 1 ? selectedVariant : defaultVariant;
    if (variantToUse && variantToUse.variants_stock <= 0) {
      toast.error("এই ভ্যারিয়েন্ট স্টকে নেই, অন্যটি বাছাই করুন");
      return false;
    }
    console.log('Proceeding to add to cart', { variantToUse: variantToUse ? variantToUse._id : null });
    return addToCartOrPreOrder(variantToUse);
  }, [hasVariants, selectedVariant, defaultVariant, addToCartOrPreOrder, variants.length, isVariantModalOpen]);

  const addWishlistVariant = useCallback((v: Variant | null) => {
    const price = isWithinOffer ? offerPrice : sellingPrice;
    const variantProduct = product.hasVariants && product.variantsId.length > 0;

    const wishlistId = variantProduct && v ? v._id : product._id;
    const wishlistVariantId = variantProduct && v ? v._id : undefined;

    const itemToAdd: WishlistItem = {
      _id: wishlistId,
      productId: product._id,
      variantId: wishlistVariantId,
      name: product.name,
      price,
      sellingPrice,
      image: `${process.env.NEXT_PUBLIC_IMAGE_URL}${v?.image?.alterImage?.secure_url || selectedVariant?.image?.alterImage?.secure_url || product.images[0]?.alterImage?.secure_url || fallbackImage}`,
      variantValues: v?.variants_values || selectedVariant?.variants_values || [],
      variantGroups: product.variantsGroup,
      isWithinOffer,
    };

    addWishlistItem(itemToAdd);
    toast.success("পণ্য উইশলিস্টে যোগ করা হয়েছে");
    setSelectedVariant(null);
    setVariantPicked(false);
  }, [addWishlistItem, product, isWithinOffer, offerPrice, sellingPrice, fallbackImage]);

  const handleWishlistToggle = useCallback(() => {
    if (isPreOrder) {
      toast.error("Pre-order items cannot be added to wishlist");
      return;
    }

    const currentVariantId = hasVariants ? selectedVariant?._id || defaultVariant?._id : product._id;
    if (isWishlisted) {
      const itemToRemove = wishlistItems.find(item => item._id === currentVariantId);
      if (itemToRemove) {
        removeWishlistItem(itemToRemove._id);
        toast.success("উইশলিস্ট থেকে সরানো হয়েছে");
      }
      return;
    }
    if (hasVariants && variants.length > 1 && !selectedVariant) {
      setWishlistVariantModalOpen(true);
      setVariantError(true);
      toast.error("দয়া করে একটি পছন্দ নির্বাচন করুন");
      return;
    }
    const variantToUse = hasVariants ? (selectedVariant || defaultVariant) : null;
    if (variantToUse && variantToUse.variants_stock <= 0) {
      toast.error("এই ভ্যারিয়েন্ট স্টকে নেই, অন্যটি বাছাই করুন");
      return;
    }
    addWishlistVariant(variantToUse);
  }, [hasVariants, selectedVariant, defaultVariant, isWishlisted, wishlistItems, removeWishlistItem, addWishlistVariant, product._id]);

  const getVariantLabel = (values: string[]) => {
    if (!values?.length || !product.variantsGroup?.length) return values?.join(", ") ?? "";
    return values.map((val, idx) => {
      const groupName = product.variantsGroup[idx]?.variantName || "";
      return groupName ? `${groupName}: ${val}` : val;
    }).join(", ");
  };

  useEffect(() => {
    setSelectedVariant(null);
    setVariantPicked(false);
    setVariantError(false);
    setQuantity(1);
  }, [product._id]);

  useEffect(() => {
    console.log('isVariantModalOpen changed to:', isVariantModalOpen);
  }, [isVariantModalOpen]);

  return (
    <div>
      <VariantSelectModal
        isOpen={isVariantModalOpen}
        variants={variants}
        selectedId={selectedVariant ? selectedVariant._id : undefined}
        onSelect={(v, qty) => {
          setSelectedVariant(v);
          setQuantity(qty);
          setVariantPicked(true);
          addToCartOrPreOrder(v, qty);
          setIsVariantModalOpen(false);
        }}
        onClose={() => setIsVariantModalOpen(false)}
        variantsGroup={product.variantsGroup}
        product={product}
      />
      <VariantSelectModal
        isOpen={wishlistVariantModalOpen}
        variants={variants}
        selectedId={selectedVariant ? selectedVariant._id : undefined}
        onSelect={(v, qty) => {
          setSelectedVariant(v);
          setQuantity(qty);
          addWishlistVariant(v);
          setWishlistVariantModalOpen(false);
        }}
        onClose={() => setWishlistVariantModalOpen(false)}
        variantsGroup={product.variantsGroup}
        product={product}
        isWishlistModal={true}
      />

      <BkashCashbackModal pageType="productDetails" />

      <div className="container max-w-7xl mx-auto md:mt-10 md:pb-0 pb-16">
        <div className="flex flex-row">
          <article className="relative grid grid-cols-1 lg:grid-cols-12 md:gap-10 items-start w-full">
            <div className={`lg:col-span-7 ${allMedia.length >= 4 ? "" : "md:sticky md:top-24 md:self-start md:h-fit"}`}>
              <MediaGallery
                media={allMedia}
                productName={product.name}
                stock={stock}
                selectedMediaUrl={selectedMediaUrl}
              />
            </div>
            <div className={`w-full lg:max-w-[700px] lg:w-full px-2 md:px-4 lg:col-span-5 ${allMedia.length === 2 ? "" : "md:sticky md:top-24 md:self-start md:h-fit"}`}>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mt-6 break-all">
                {product.name}
              </h1>
              <ProductPricing
                sellingPrice={sellingPrice}
                offerPrice={offerPrice}
                stock={stock}
                discountPercent={discountPercent}
                discountStartDate={discountStartDate}
                discountEndDate={discountEndDate}
              />
              <div className="md:pb-2">
                <QuantityControls
                  quantity={quantity}
                  stock={stock}
                  onQuantityChange={handleQtyChange}
                  product={product}
                  variant={selectedVariant}
                  isWithinOffer={isWithinOffer}
                  offerPrice={offerPrice}
                  sellingPrice={sellingPrice}
                  onAddToCart={handleAddToCart}
                  onVariantMissing={() => {
                    setVariantError(true);
                    setIsVariantModalOpen(true);
                    return false;
                  }}
                  buttonText={isPreOrder ? "প্রি-অর্ডার করুন" : "অর্ডার করুন"}
                  buttonTitle={isPreOrder ? "Pre-order product" : "Add to Cart"}
                />
              </div>
              <ProductTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                shortDescription={product.short_description}
                longDescription={product.long_description}
                stock={stock}
                variantsCount={variants.length}
              />
            </div>
          </article>
        </div>
        <div>
          <div className="fixed bottom-16 left-2 z-50 lg:hidden max-w-[50px] bg-primary p-2 rounded-full">
            <Link href="/">
              <FaHome className="h-6 w-6 text-white" />
            </Link>
          </div>
          {(!isPreOrder && wishlistItems.length > 0) && (
            <div className="fixed bottom-16 right-2 z-50 lg:hidden flex flex-col gap-2 items-end max-w-[50px] bg-secondary p-2 rounded-full">
              <WishlistSheet />
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t shadow-xl lg:hidden z-50">
            <div className="flex items-center justify-between p-1 gap-6">
              {!isPreOrder && (
                <div className="pl-2">
                  <button
                    onClick={handleWishlistToggle}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`p-1 rounded-md border ${isWishlisted ? "text-red-500 border-red-400 bg-red-50" : "text-gray-500 border-gray-300 bg-white"}`}
                  >
                    <FiHeart size={20} fill={isWishlisted ? "#ef4444" : "none"} />
                  </button>
                </div>
              )}
              <Button
                title={isPreOrder ? "Pre-order product" : "Add to Cart"}
                className={isPreOrder ? "bg-primary dark:bg-primary w-full h-12 flex-1" : "flex-1"}
                variant={isPreOrder ? "default" : "custom"}
                onClick={handleAddToCart}
                size="md"
              >
                {isPreOrder ? "প্রি-অর্ডার করুন" : "অর্ডার করুন"}
              </Button>
              {!isPreOrder && cartItems.length > 0 && (
                <div className="pr-4 mt-2">
                  <CartSheet />
                </div>
              )}
            </div>
          </div>
        </div>
        {product.sub_category[0]?._id && (
          <div className="py-4">
            <RelatedProducts
              currentProductId={product._id}
              subCategoryId={product.sub_category[0]._id}
            />
          </div>
        )}
        <div className="py-4 md:py-8">
          <RecentlyViewedProducts currentProductId={product._id} />
        </div>
      </div>
      <div className="w-full bg-black text-center py-1 md:py-2 flex items-center justify-center mb-12 md:static md:bottom-0 md:left-0 md:mb-0">
        <p className="flex flex-row gap-2 text-sm">
          <span className="text-gray-400">Powered by:</span>
          <a
            href="https://calquick.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80"
          >
            <Image
              height={100}
              width={100}
              src="https://calquick.app/images/logo/logo-white.png"
              className="h-6 w-auto object-contain"
              alt="calquick-logo"
              onError={() => console.error("Failed to load footer logo")}
            />
          </a>
        </p>
      </div>

      <Modal
        isModalOpen={isPreorderConflictModalOpen}
        onClose={() => setIsPreorderConflictModalOpen(false)}
        title="প্রি-অর্ডার কনফ্লিক্ট"
        className="max-w-md"
      >
        <p className="text-gray-700 dark:text-gray-300">
          আপনার চেকআউটে ইতিমধ্যে একটা প্রি-অর্ডার প্রোডাক্ট আছে। এই নতুন প্রোডাক্ট যোগ করতে হলে প্রি-অর্ডার কার্ট ক্লিয়ার করা লাগবে।
        </p>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          কি করতে চান?
        </p>
        <div className="flex gap-3 mt-4">
          <Button
            title="Clear preorder cart and add new item"
            onClick={handleClearPreorderAndProceed}
            className="flex-1"
          >
            কার্ট ক্লিয়ার করে প্রসিড করুন
          </Button>
          <Button
            title="Go to checkout to complete current preorder"
            onClick={handleGoToCheckoutFromPreorder}
            variant="outline"
            className="flex-1"
          >
            চেকআউটে যান
          </Button>
        </div>
      </Modal>

      <Modal
        isModalOpen={isRegularCartConflictModalOpen}
        onClose={() => setIsRegularCartConflictModalOpen(false)}
        title="কার্ট কনফ্লিক্ট"
        className="max-w-md"
      >
        <p className="text-gray-700 dark:text-gray-300">
          আপনার রেগুলার কার্টে {cartItems.length} টি প্রোডাক্ট আছে। প্রি-অর্ডার করতে হলে রেগুলার কার্ট ক্লিয়ার করা লাগবে।
        </p>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          কন্টিনিউ করলে আপনার রেগুলার কার্টের সব প্রোডাক্ট মুছে যাবে। কি করতে চান?
        </p>
        <div className="flex gap-3 mt-4">
          <Button
            title="Clear regular cart and proceed with preorder"
            onClick={handleClearRegularCartAndProceed}
            className="flex-1"
          >
            কার্ট ক্লিয়ার করে প্রসিড করুন
          </Button>
          <Button
            title="Go to checkout to manage regular cart"
            onClick={handleGoToCheckoutFromRegular}
            variant="outline"
            className="flex-1"
          >
            চেকআউটে যান
          </Button>
        </div>
      </Modal>
    </div>
  );
}