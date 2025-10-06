/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Navigation,
  Autoplay,
  FreeMode,
  Pagination,
  EffectCoverflow,
} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import { Product } from '@/types/product';
import ProductCard from '@/components/ui/organisms/product-card';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { FlashDealTimeCounter } from './ui/atoms/FlashDealTimeCounter';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
const getCategoryName = (p: Product) =>
  p.sub_category?.[0]?.name ?? 'Uncategorised';

const toNumber = (v: string | number | undefined | null) =>
  v === undefined || v === null ? 0 : Number(v);

interface FlashDealsProps {
  initialProducts: Product[];
}

function FlashDeals({ initialProducts }: FlashDealsProps) {
  const router = useRouter();

  /* ───────── State ───────── */
  const [swiper, setSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [sortBy, setSortBy] = useState<'discount' | 'time' | 'price'>('discount');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showExpired, setShowExpired] = useState(false);
  const [dealStats, setDealStats] = useState({
    total: 0,
    active: 0,
    expiring: 0,
  });
  const [isMobile, setIsMobile] = useState(false);

  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const [showNav, setShowNav] = useState({ prev: false, next: false });

  /* ───────── Memoized Functions ───────── */
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const updateVisibleCount = useCallback(() => {
    const w = window.innerWidth;
    if (w >= 1680) {
      setVisibleCount(8);
    } else if (w >= 1280) {
      setVisibleCount(8);
    } else if (w >= 1024) {
      setVisibleCount(8);
    } else if (w >= 640) {
      setVisibleCount(6);
    } else {
      setVisibleCount(4);
    }
  }, []);

  /* ───────── Responsive Handling ───────── */
  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  /* ───────── Derived Data ───────── */
  const { deals, categories } = useMemo(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    let filteredDeals = initialProducts.filter((p) => {
      const v = p.variantsId?.[0];
      const end = v?.discount_end_date;
      const start = v?.discount_start_date;
      const discountPercent = toNumber(v?.discount_percent);

      if (!end || discountPercent <= 0) return false;

      const endTime = new Date(end).getTime();
      const startTime = start ? new Date(start).getTime() : 0;

      const isActive = now >= startTime && now <= endTime;
      const isExpired = now > endTime;

      return showExpired ? isActive || isExpired : isActive;
    });

    if (filterCategory !== 'all') {
      filteredDeals = filteredDeals.filter(
        (p) => getCategoryName(p).toLowerCase() === filterCategory.toLowerCase(),
      );
    }

    filteredDeals.sort((a, b) => {
      const va = a.variantsId?.[0];
      const vb = b.variantsId?.[0];

      switch (sortBy) {
        case 'discount': {
          const da = toNumber(va?.discount_percent);
          const db = toNumber(vb?.discount_percent);
          return db - da;
        }
        case 'time': {
          const ea = new Date(va?.discount_end_date ?? 0).getTime();
          const eb = new Date(vb?.discount_end_date ?? 0).getTime();
          return ea - eb;
        }
        case 'price': {
          const pa = toNumber(va?.offer_price) || toNumber(va?.selling_price) || 0;
          const pb = toNumber(vb?.offer_price) || toNumber(vb?.selling_price) || 0;
          return pa - pb;
        }
        default:
          return 0;
      }
    });

    const uniqueCategories = [...new Set(initialProducts.map(getCategoryName))];

    return { deals: filteredDeals, categories: uniqueCategories };
  }, [initialProducts, filterCategory, sortBy, showExpired]);

  /* ───────── Memoized Functions ───────── */
  const updateNav = useCallback(() => {
    if (!swiper) return;
    setShowNav({ prev: !swiper.isBeginning, next: !swiper.isEnd });
  }, [swiper, deals]);

  const handleMouseEnter = useCallback(() => {
    setIsAutoplayPaused(true);
    swiper?.autoplay?.stop();
  }, [swiper]);

  const handleMouseLeave = useCallback(() => {
    setIsAutoplayPaused(false);
    swiper?.autoplay?.start();
  }, [swiper]);

  const handleShowMore = useCallback(() => setShowAll((v) => !v), []);

  /* ───────── Deal stats ───────── */
  useEffect(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    const stats = initialProducts.reduce(
      (acc, p) => {
        const v = p.variantsId?.[0];
        const discountPercent = toNumber(v?.discount_percent);

        if (!v?.discount_end_date || discountPercent <= 0) return acc;

        const end = new Date(v.discount_end_date).getTime();
        const start = v.discount_start_date
          ? new Date(v.discount_start_date).getTime()
          : 0;

        acc.total += 1;
        if (now >= start && now <= end) {
          acc.active += 1;
          if (end - now <= oneHour) acc.expiring += 1;
        }
        return acc;
      },
      { total: 0, active: 0, expiring: 0 },
    );

    setDealStats(stats);
  }, [initialProducts]);

  /* ───────── Swiper nav visibility ───────── */
  useEffect(updateNav, [updateNav]);

  /* ───────── Hover pause ───────── */

  /* ───────── Discount progress ───────── */
  const getDiscountProgress = (p: Product) => {
    const v = p.variantsId?.[0];
    if (!v?.discount_start_date || !v?.discount_end_date) return 0;

    const now = Date.now();
    const start = new Date(v.discount_start_date).getTime();
    const end = new Date(v.discount_end_date).getTime();
    const total = end - start;
    return Math.max(0, Math.min(100, ((now - start) / total) * 100));
  };

  /* ───────── Visible count ───────── */
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, [updateVisibleCount]);

  /* ───────── Random four products ───────── */
  const randomFourProducts = useMemo(() => {
    if (!initialProducts?.length) return [];
    const copy = [...initialProducts];
    copy.sort(() => 0.5 - Math.random());
    return copy.slice(0, 4);
  }, [initialProducts]);

  /* ───────── Show all / visible deals ───────── */
  const [showAll, setShowAll] = useState(false);
  const visibleDeals = showAll ? deals : deals.slice(0, visibleCount);

  /* ───────── JSX ───────── */
  return (
    <div className="py-4 space-y-6">
      <section className="group/section py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 container mx-auto">
          <div className="col-span-12 relative md:px-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary dark:text-gray-100 capitalize flex items-center justify-between">
              Flash Deals
              {/* Custom Swiper Nav Buttons */}
              <div className="flex gap-2 ml-4">
                {showNav.prev && (
                  <div
                    ref={prevRef}
                    className="p-2 rounded-full bg-secondary dark:bg-primary shadow dark:hover:bg-pink-100 hover:bg-pink-50 transition"
                  >
                    <HiOutlineChevronLeft className="h-5 w-5 text-gray-700" />
                  </div>
                )}
                {showNav.next && (
                  <div
                    ref={nextRef}
                    className="p-2 rounded-full bg-secondary dark:bg-primary shadow hover:bg-pink-50 dark:hover:bg-pink-100 transition"
                  >
                    <HiOutlineChevronRight className="h-5 w-5 text-gray-700" />
                  </div>
                )}

                <button
                  onClick={() => router.push('/flashdeals')}
                  className="px-2 py-2 text-sm bg-secondary dark:bg-primary text-gray-700 rounded shadow hover:bg-pink-50 dark:hover:bg-pink-100 transition"
                >
                  See More
                </button>
              </div>
            </h2>

            <div className="mt-4">
              <Swiper
                modules={[Navigation, Autoplay, FreeMode, Pagination, EffectCoverflow]}
                spaceBetween={16}
                slidesPerView={2}
                breakpoints={{
                  768: {
                    slidesPerView: 3,
                  },
                  1024: {
                    slidesPerView: 4,
                  },
                }}
                navigation={{
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                }}
                loop={false}
                autoplay={!isAutoplayPaused ? { delay: 4000 } : false}
                onSwiper={setSwiper}
                onSlideChange={updateNav}
                className="py-8"
              >
                {deals.map((deal) => (
                  <SwiperSlide key={deal._id} className="relative">
                    <div className="transform  transition-transform relative">
                      <div
                        className="
                        flex absolute bottom-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/3 items-center justify-center
                         
                          z-10
                        "
                      >
                        <FlashDealTimeCounter endDate={deal.variantsId?.[0]?.discount_end_date ?? ''} />
                      </div>
                      <ProductCard product={deal} isAboveFold={false} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}

export default memo(FlashDeals);